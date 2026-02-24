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

// ── Fetch from Supabase ──────────────────────────────────────────

export async function preloadContent(): Promise<void> {
  if (_lessons.length > 0) return;   // already loaded
  if (_loadPromise) return _loadPromise; // in-flight

  _loadPromise = (async () => {
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
    const sectionsByLesson  = groupBy(sections   ?? [], s  => s.lesson_id);
    const questionsByLesson = groupBy(questions  ?? [], q  => q.lesson_id);
    const flashcardsByLesson = groupBy(flashcards ?? [], fc => fc.lesson_id);

    // Build LessonJSON array (already ordered by order_index from DB)
    _lessons = (lessons ?? []).map(lesson => {
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
      lessonIds: (lessons ?? [])
        .filter(l => l.module_id === mod.id)
        .map(l => l.id),
    }));
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
