import type { LessonJSON } from "../types";
import { supabase } from "./supabase";

// ── Types ────────────────────────────────────────────────────────

type CachedModule = {
  id: string;
  slug: string;
  title: string;
  is_free: boolean;
  lessonIds: string[]; // ordered
};

// ── Module-level cache ───────────────────────────────────────────

let _lessons: LessonJSON[] = [];
let _modules: CachedModule[] = [];
let _loadPromise: Promise<void> | null = null;

// ── Offline snapshot (localStorage) ─────────────────────────────
// Saved after every successful network load so content is available
// even when both the network and the service worker cache are cold.

const SNAPSHOT_KEY = 'content-snapshot-v1';

function saveSnapshot(): void {
  try {
    localStorage.setItem(SNAPSHOT_KEY, JSON.stringify({ lessons: _lessons, modules: _modules }));
  } catch { /* quota exceeded or unavailable — silently skip */ }
}

function loadSnapshot(): boolean {
  try {
    const raw = localStorage.getItem(SNAPSHOT_KEY);
    if (!raw) return false;
    const snap = JSON.parse(raw) as { lessons: LessonJSON[]; modules: CachedModule[] };
    if (!snap.lessons?.length) return false;
    _lessons = snap.lessons;
    _modules = snap.modules ?? [];
    return true;
  } catch { return false; }
}

// ── Fetch from Supabase ──────────────────────────────────────────

export async function preloadContent(): Promise<void> {
  if (_lessons.length > 0) return;   // already loaded
  if (_loadPromise) return _loadPromise; // in-flight

  _loadPromise = (async () => {
    try {
      const [
        { data: modules,    error: modErr },
        { data: lessons,    error: lesErr },
        { data: sections,   error: secErr },
        { data: questions,  error: qErr  },
        { data: flashcards, error: fcErr },
      ] = await Promise.all([
        supabase.from('modules').select('id, slug, title, is_free, order_index').order('order_index'),
        supabase.from('lessons').select('id, module_id, title, overview, key_facts, memory_hook, supportive_messages, order_index').order('order_index'),
        supabase.from('study_sections').select('lesson_id, heading, content, order_index').order('order_index'),
        supabase.from('questions').select('lesson_id, prompt, options, correct_index, explanation, order_index').order('order_index'),
        supabase.from('flashcards').select('lesson_id, front, back, order_index').order('order_index'),
      ]);

      if (modErr) throw new Error(`Failed to load modules: ${modErr.message}`);
      if (lesErr) throw new Error(`Failed to load lessons: ${lesErr.message}`);
      if (secErr) throw new Error(`Failed to load study sections: ${secErr.message}`);
      if (qErr)   throw new Error(`Failed to load questions: ${qErr.message}`);
      if (fcErr)  throw new Error(`Failed to load flashcards: ${fcErr.message}`);

      const moduleById = new Map((modules ?? []).map(m => [m.id, m]));

      // Group child records by lesson_id for O(1) lookup
      const sectionsByLesson   = groupBy(sections   ?? [], s  => s.lesson_id);
      const questionsByLesson  = groupBy(questions  ?? [], q  => q.lesson_id);
      const flashcardsByLesson = groupBy(flashcards ?? [], fc => fc.lesson_id);

      // Build LessonJSON array — sort by module order first, then by lesson
      // order_index within the module. Without this, per-module order_index
      // values (1,2,3 per module) would interleave lessons across chapters.
      const sortedLessons = [...(lessons ?? [])].sort((a, b) => {
        const modA = moduleById.get(a.module_id);
        const modB = moduleById.get(b.module_id);
        const modOrderA = modA?.order_index ?? 0;
        const modOrderB = modB?.order_index ?? 0;
        if (modOrderA !== modOrderB) return modOrderA - modOrderB;
        return a.order_index - b.order_index;
      });

      _lessons = sortedLessons.map(lesson => {
        const mod = moduleById.get(lesson.module_id);

        return {
          id:           lesson.id,
          title:        lesson.title,
          module_slug:  mod?.slug ?? '',
          isPremium:    !(mod?.is_free ?? false),
          overview:     lesson.overview ?? undefined,
          key_facts:    lesson.key_facts ?? undefined,
          memory_hook:  lesson.memory_hook ?? undefined,
          supportive_messages: lesson.supportive_messages ?? undefined,

          study_sections: (sectionsByLesson.get(lesson.id) ?? [])
            .sort((a, b) => a.order_index - b.order_index)
            .map(s => ({ heading: s.heading, content: s.content })),

          questions: (questionsByLesson.get(lesson.id) ?? [])
            .sort((a, b) => a.order_index - b.order_index)
            .map(q => ({
              prompt:        q.prompt,
              options:       q.options as string[],
              correct_index: q.correct_index,
              explanation:   q.explanation ?? undefined,
            })),

          flashcards: (flashcardsByLesson.get(lesson.id) ?? [])
            .sort((a, b) => a.order_index - b.order_index)
            .map(fc => [fc.front, fc.back] as [string, string]),
        };
      });

      // Build module index (ordered, with lesson ID lists)
      _modules = (modules ?? []).map(mod => ({
        id:       mod.id,
        slug:     mod.slug,
        title:    mod.title,
        is_free:  mod.is_free,
        lessonIds: sortedLessons
          .filter(l => l.module_id === mod.id)
          .map(l => l.id),
      }));

      // Persist to localStorage so content is available on future offline visits
      saveSnapshot();
    } catch (err) {
      // Network / Supabase unavailable — try the localStorage snapshot.
      // The service worker cache handles this transparently on subsequent visits;
      // the snapshot is a second safety net for the very first offline session.
      if (loadSnapshot()) return;
      throw err;
    }
  })();

  return _loadPromise;
}

function groupBy<T>(arr: T[], key: (item: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of arr) {
    const k = key(item);
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(item);
  }
  return map;
}

// ── Public API (synchronous — reads from populated cache) ────────

export function getAllLessons(): LessonJSON[] {
  return _lessons;
}

export function getLessonById(id: string): LessonJSON | null {
  return _lessons.find(l => l.id === id) ?? null;
}

export function getModules() {
  return _modules.map((mod, order) => ({
    slug:  mod.slug,
    title: mod.title,
    count: mod.lessonIds.length,
    order,
  }));
}

export function getLessonsForModule(slug: string): LessonJSON[] {
  const mod = _modules.find(m => m.slug === slug);
  if (!mod) return _lessons.filter(l => l.module_slug === slug);
  const ids = new Set(mod.lessonIds);
  return _lessons.filter(l => ids.has(l.id));
}
