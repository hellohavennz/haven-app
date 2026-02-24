/**
 * Haven App — Database Seed Script
 *
 * Reads all lesson JSON files and upserts content into Supabase.
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env (service role bypasses RLS).
 *
 * Usage:
 *   npm run db:seed
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ---------------------------------------------------------------------------
// Load .env
// ---------------------------------------------------------------------------
function loadEnv(): void {
  const envPath = path.join(ROOT, '.env');
  if (!fs.existsSync(envPath)) {
    console.error('❌  .env file not found at project root');
    process.exit(1);
  }
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    if (key && !process.env[key]) process.env[key] = val;
  }
}

loadEnv();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    '❌  Missing required env vars.\n' +
    '    VITE_SUPABASE_URL         — found in Supabase project settings\n' +
    '    SUPABASE_SERVICE_ROLE_KEY — found in Supabase project settings → API'
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

// ---------------------------------------------------------------------------
// Types (mirrors LessonJSON from src/types.ts)
// ---------------------------------------------------------------------------
interface StudySection {
  heading: string;
  content: string;
}

interface Question {
  prompt: string;
  options: string[];
  correct_index: number;
  explanation?: string;
}

interface LessonJSON {
  id: string;
  title: string;
  module_slug: string;
  overview?: string;
  study_sections?: StudySection[];
  key_facts?: string[];
  memory_hook?: string;
  questions?: Question[];
  flashcards?: [string, string][];
  supportive_messages?: {
    high_score?: string;
    medium_score?: string;
    low_score?: string;
  };
  isPremium?: boolean;
}

interface LessonIndex {
  modules: Array<{
    slug: string;
    title: string;
    lessons: string[];
  }>;
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const FREE_MODULES = new Set(['values-and-principles', 'what-is-uk']);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T;
}

function ok(label: string): void {
  console.log(`  ✓  ${label}`);
}

function fail(label: string, message: string): void {
  console.error(`  ✗  ${label}: ${message}`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main(): Promise<void> {
  console.log('🌱  Haven seed starting…\n');

  // Load lesson index for ordering
  const indexPath = path.join(ROOT, 'src/content/lesson-index.json');
  const lessonIndex = readJson<LessonIndex>(indexPath);

  // ── 1. MODULES ────────────────────────────────────────────────────────────
  console.log('📦  Seeding modules…');

  for (let i = 0; i < lessonIndex.modules.length; i++) {
    const mod = lessonIndex.modules[i];

    const { error } = await supabase.from('modules').upsert(
      {
        slug: mod.slug,
        title: mod.title,
        is_free: FREE_MODULES.has(mod.slug),
        order_index: i,
      },
      { onConflict: 'slug' }
    );

    if (error) fail(mod.slug, error.message);
    else ok(mod.title);
  }

  // Fetch module slug → UUID map
  const { data: modulesData, error: modFetchErr } = await supabase
    .from('modules')
    .select('id, slug');

  if (modFetchErr || !modulesData) {
    console.error('❌  Could not fetch module IDs:', modFetchErr?.message);
    process.exit(1);
  }

  const moduleIdBySlug: Record<string, string> = {};
  for (const m of modulesData) {
    moduleIdBySlug[m.slug] = m.id;
  }

  // ── 2. LESSONS + CHILD CONTENT ────────────────────────────────────────────
  console.log('\n📖  Seeding lessons…');

  let totalQuestions = 0;
  let totalFlashcards = 0;

  for (const mod of lessonIndex.modules) {
    const moduleId = moduleIdBySlug[mod.slug];
    if (!moduleId) {
      fail(mod.slug, 'module UUID not found — skipping');
      continue;
    }

    console.log(`\n  [${mod.title}]`);

    for (let i = 0; i < mod.lessons.length; i++) {
      const lessonId = mod.lessons[i];
      const jsonPath = path.join(ROOT, `src/content/lessons/${lessonId}.json`);

      if (!fs.existsSync(jsonPath)) {
        fail(lessonId, 'JSON file not found');
        continue;
      }

      const lesson = readJson<LessonJSON>(jsonPath);

      // Upsert lesson row
      const { error: lessonErr } = await supabase.from('lessons').upsert(
        {
          id: lessonId,
          module_id: moduleId,
          title: lesson.title,
          overview: lesson.overview ?? null,
          key_facts: lesson.key_facts ?? null,
          memory_hook: lesson.memory_hook ?? null,
          supportive_messages: lesson.supportive_messages ?? null,
          order_index: i,
        },
        { onConflict: 'id' }
      );

      if (lessonErr) {
        fail(lessonId, lessonErr.message);
        continue;
      }

      // Study sections — delete + re-insert for clean ordering
      if (lesson.study_sections?.length) {
        await supabase.from('study_sections').delete().eq('lesson_id', lessonId);

        const { error: ssErr } = await supabase.from('study_sections').insert(
          lesson.study_sections.map((s, j) => ({
            lesson_id: lessonId,
            heading: s.heading,
            content: s.content,
            order_index: j,
          }))
        );
        if (ssErr) fail(`study_sections:${lessonId}`, ssErr.message);
      }

      // Questions — delete + re-insert
      const qCount = lesson.questions?.length ?? 0;
      if (qCount > 0) {
        await supabase.from('questions').delete().eq('lesson_id', lessonId);

        const { error: qErr } = await supabase.from('questions').insert(
          lesson.questions!.map((q, j) => ({
            lesson_id: lessonId,
            prompt: q.prompt,
            options: q.options,
            correct_index: q.correct_index,
            explanation: q.explanation ?? null,
            order_index: j,
          }))
        );
        if (qErr) fail(`questions:${lessonId}`, qErr.message);
        else totalQuestions += qCount;
      }

      // Flashcards — delete + re-insert
      const fcCount = lesson.flashcards?.length ?? 0;
      if (fcCount > 0) {
        await supabase.from('flashcards').delete().eq('lesson_id', lessonId);

        const { error: fcErr } = await supabase.from('flashcards').insert(
          lesson.flashcards!.map(([front, back], j) => ({
            lesson_id: lessonId,
            front,
            back,
            order_index: j,
          }))
        );
        if (fcErr) fail(`flashcards:${lessonId}`, fcErr.message);
        else totalFlashcards += fcCount;
      }

      ok(`${lesson.title}  (${qCount}Q / ${fcCount}FC)`);
    }
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('\n─────────────────────────────────');
  console.log(`✅  Seed complete`);
  console.log(`    Modules:    ${lessonIndex.modules.length}`);
  console.log(
    `    Lessons:    ${lessonIndex.modules.reduce((n, m) => n + m.lessons.length, 0)}`
  );
  console.log(`    Questions:  ${totalQuestions}`);
  console.log(`    Flashcards: ${totalFlashcards}`);
  console.log('─────────────────────────────────\n');
}

main().catch(err => {
  console.error('\n❌  Fatal error:', err);
  process.exit(1);
});
