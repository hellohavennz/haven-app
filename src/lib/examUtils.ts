import { getAllLessons } from './content';
import { getAllProgress } from './progress';
import { supabase } from './supabase';
import { getCurrentUser } from './auth';
import type { ExamQuestion, ExamAttempt } from '../types';

export const MODULE_LABELS: Record<string, string> = {
  'values-and-principles': 'Values & Principles',
  'what-is-uk': 'What is the UK?',
  'history': 'History',
  'modern-society': 'Modern Society',
  'government-law-role': 'Government, Law & Role',
};

// Module weighting mirrors the real Life in the UK test distribution
const MODULE_WEIGHTS: Record<string, number> = {
  'values-and-principles': 2,
  'what-is-uk': 2,
  'history': 10,
  'modern-society': 6,
  'government-law-role': 4,
};

const TOTAL_QUESTIONS = 24;
const STORAGE_KEY = 'exam-history';
const MAX_HISTORY = 20;

export function shuffle<T>(arr: T[]): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Selects 24 random questions weighted by module.
 * Also shuffles the options within each question and tracks the new correct index.
 */
export function selectExamQuestions(): ExamQuestion[] {
  const allLessons = getAllLessons();

  // Group questions by module
  const byModule: Record<string, ExamQuestion[]> = {};
  for (const lesson of allLessons) {
    if (!lesson.questions?.length) continue;
    const mod = lesson.module_slug;
    if (!byModule[mod]) byModule[mod] = [];
    for (const q of lesson.questions) {
      byModule[mod].push({
        ...q,
        lessonId: lesson.id,
        moduleSlug: mod,
      });
    }
  }

  const selected: ExamQuestion[] = [];
  const usedPrompts = new Set<string>();

  for (const [mod, count] of Object.entries(MODULE_WEIGHTS)) {
    const pool = byModule[mod] ?? [];
    const shuffled = shuffle(pool);
    let added = 0;
    for (const q of shuffled) {
      if (added >= count) break;
      if (!usedPrompts.has(q.prompt)) {
        selected.push(q);
        usedPrompts.add(q.prompt);
        added++;
      }
    }
  }

  // If we're short (unlikely but safe), pad from any remaining questions
  if (selected.length < TOTAL_QUESTIONS) {
    const extras: ExamQuestion[] = [];
    for (const lesson of allLessons) {
      for (const q of lesson.questions ?? []) {
        if (!usedPrompts.has(q.prompt)) {
          extras.push({ ...q, lessonId: lesson.id, moduleSlug: lesson.module_slug });
        }
      }
    }
    const remaining = shuffle(extras).slice(0, TOTAL_QUESTIONS - selected.length);
    selected.push(...remaining);
  }

  // Shuffle the order of questions themselves
  const finalQuestions = shuffle(selected).slice(0, TOTAL_QUESTIONS);

  // Shuffle options within each question, keeping track of correct answer
  return finalQuestions.map(q => {
    const indices = q.options.map((_, i) => i);
    const shuffledIndices = shuffle(indices);
    const shuffledOptions = shuffledIndices.map(i => q.options[i]);
    const correctAnswerText = q.options[q.correct_index];
    const newCorrectIndex = shuffledOptions.indexOf(correctAnswerText);
    return {
      ...q,
      options: shuffledOptions,
      correct_index: newCorrectIndex,
    };
  });
}

// ── Seeded PRNG (mulberry32) ─────────────────────────────────────────────────
// Returns a deterministic pseudo-random function for a given seed.
function mulberry32(seed: number): () => number {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(arr: T[], rng: () => number): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Selects 24 questions using a deterministic seed based on exam number + current
 * year/month, so the same questions appear for all users within a given month but
 * rotate to a new (randomised) set when the month rolls over.
 * Options within each question are NOT reshuffled — they stay in original order
 * so the correct_index is always stable.
 */
export function selectStaticExamQuestions(examNumber: 1 | 2): ExamQuestion[] {
  const now = new Date();
  const monthSeed = examNumber * 100000 + now.getFullYear() * 12 + now.getMonth();
  const rng = mulberry32(monthSeed);
  const allLessons = getAllLessons();

  const byModule: Record<string, ExamQuestion[]> = {};
  for (const lesson of allLessons) {
    if (!lesson.questions?.length) continue;
    const mod = lesson.module_slug;
    if (!byModule[mod]) byModule[mod] = [];
    for (const q of lesson.questions) {
      byModule[mod].push({ ...q, lessonId: lesson.id, moduleSlug: mod });
    }
  }

  const selected: ExamQuestion[] = [];
  const usedPrompts = new Set<string>();

  for (const [mod, count] of Object.entries(MODULE_WEIGHTS)) {
    const pool = byModule[mod] ?? [];
    const shuffled = seededShuffle(pool, rng);
    let added = 0;
    for (const q of shuffled) {
      if (added >= count) break;
      if (!usedPrompts.has(q.prompt)) {
        selected.push(q);
        usedPrompts.add(q.prompt);
        added++;
      }
    }
  }

  // Pad if short (unlikely)
  if (selected.length < TOTAL_QUESTIONS) {
    const extras: ExamQuestion[] = [];
    for (const lesson of allLessons) {
      for (const q of lesson.questions ?? []) {
        if (!usedPrompts.has(q.prompt)) {
          extras.push({ ...q, lessonId: lesson.id, moduleSlug: lesson.module_slug });
        }
      }
    }
    selected.push(...seededShuffle(extras, rng).slice(0, TOTAL_QUESTIONS - selected.length));
  }

  // Deterministic question order
  return seededShuffle(selected, rng).slice(0, TOTAL_QUESTIONS);
}

/**
 * Selects 24 questions for the Dynamic Exam, weighted toward the user's weak areas.
 * Lessons with low accuracy (or never attempted) contribute more questions to the pool,
 * so the exam focuses on what the user needs to practise most.
 *
 * Module distribution still mirrors the real test (MODULE_WEIGHTS) so the balance
 * of topics is realistic. Within each module, weak-lesson questions are overrepresented.
 *
 * Weakness weights per lesson:
 *   - never attempted  → weight 2 (unseen content is worth practising)
 *   - accuracy < 60%   → weight 3 (heavily prioritised)
 *   - accuracy 60–79%  → weight 2 (needs more work)
 *   - accuracy ≥ 80%   → weight 1 (already solid, included normally)
 */
export function selectDynamicExamQuestions(): ExamQuestion[] {
  const progress = getAllProgress();
  const allLessons = getAllLessons();

  const getWeight = (lessonId: string): number => {
    const p = progress[lessonId];
    if (!p || p.attempted === 0) return 2;
    const accuracy = p.correct / p.attempted;
    if (accuracy < 0.6) return 3;
    if (accuracy < 0.8) return 2;
    return 1;
  };

  // Build weighted pools per module (repeat weak-lesson questions by their weight)
  const byModule: Record<string, ExamQuestion[]> = {};
  for (const lesson of allLessons) {
    if (!lesson.questions?.length) continue;
    const mod = lesson.module_slug;
    if (!byModule[mod]) byModule[mod] = [];
    const weight = getWeight(lesson.id);
    for (const q of lesson.questions) {
      const eq: ExamQuestion = { ...q, lessonId: lesson.id, moduleSlug: mod };
      for (let w = 0; w < weight; w++) {
        byModule[mod].push(eq);
      }
    }
  }

  const selected: ExamQuestion[] = [];
  const usedPrompts = new Set<string>();

  for (const [mod, count] of Object.entries(MODULE_WEIGHTS)) {
    const pool = shuffle(byModule[mod] ?? []);
    let added = 0;
    for (const q of pool) {
      if (added >= count) break;
      if (!usedPrompts.has(q.prompt)) {
        selected.push(q);
        usedPrompts.add(q.prompt);
        added++;
      }
    }
  }

  // Pad from any remaining questions if short
  if (selected.length < TOTAL_QUESTIONS) {
    const extras: ExamQuestion[] = [];
    for (const lesson of allLessons) {
      for (const q of lesson.questions ?? []) {
        if (!usedPrompts.has(q.prompt)) {
          extras.push({ ...q, lessonId: lesson.id, moduleSlug: lesson.module_slug });
        }
      }
    }
    selected.push(...shuffle(extras).slice(0, TOTAL_QUESTIONS - selected.length));
  }

  // Shuffle question order and options within each question
  const finalQuestions = shuffle(selected).slice(0, TOTAL_QUESTIONS);

  return finalQuestions.map(q => {
    const indices = q.options.map((_, i) => i);
    const shuffledIndices = shuffle(indices);
    const shuffledOptions = shuffledIndices.map(i => q.options[i]);
    const correctAnswerText = q.options[q.correct_index];
    const newCorrectIndex = shuffledOptions.indexOf(correctAnswerText);
    return {
      ...q,
      options: shuffledOptions,
      correct_index: newCorrectIndex,
    };
  });
}

export function getExamHistory(): ExamAttempt[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ExamAttempt[];
  } catch {
    return [];
  }
}

/**
 * Fetches exam history from Supabase, merges with localStorage (dedup by id),
 * writes the merged result back to localStorage, and returns it.
 * Safe to call on mount — falls back to localStorage if unauthenticated or offline.
 */
export async function syncExamHistory(): Promise<ExamAttempt[]> {
  const user = await getCurrentUser();
  if (!user) return getExamHistory();

  try {
    const { data, error } = await supabase
      .from('exam_attempts')
      .select('id, completed_at, correct, total, passed, duration_seconds, module_scores')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false })
      .limit(MAX_HISTORY);

    if (error || !data) return getExamHistory();

    const remote: ExamAttempt[] = data.map(row => ({
      id: row.id,
      completedAt: row.completed_at,
      correct: row.correct,
      total: row.total,
      passed: row.passed,
      durationSeconds: row.duration_seconds ?? 0,
      moduleScores: row.module_scores ?? {},
    }));

    // Merge: start with remote, append any local-only entries not in remote
    const local = getExamHistory();
    const remoteIds = new Set(remote.map(a => a.id));
    const localOnly = local.filter(a => !remoteIds.has(a.id));
    const merged = [...remote, ...localOnly]
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
      .slice(0, MAX_HISTORY);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    } catch { /* ignore */ }

    return merged;
  } catch {
    return getExamHistory();
  }
}

export function saveExamAttempt(attempt: ExamAttempt): void {
  try {
    const history = getExamHistory();
    // Prepend newest first, cap at max
    const updated = [attempt, ...history].slice(0, MAX_HISTORY);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // localStorage might be unavailable — silently ignore
  }

  // Fire-and-forget Supabase sync
  persistExamToSupabase(attempt).catch(() => {
    // Best-effort; ignore failures
  });
}

export async function persistExamToSupabase(attempt: ExamAttempt): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;

  await supabase.from('exam_attempts').insert({
    id: attempt.id,
    user_id: user.id,
    completed_at: attempt.completedAt,
    correct: attempt.correct,
    total: attempt.total,
    passed: attempt.passed,
    duration_seconds: attempt.durationSeconds,
    module_scores: attempt.moduleScores,
  });
}

export type ReadinessStatus = {
  ready: boolean;
  passedCount: number;
  totalRecent: number;
  weakModules: string[];
};

export function getExamsThisMonth(history: ExamAttempt[]): number {
  const now = new Date();
  return history.filter(a => {
    const d = new Date(a.completedAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
}

export function getReadinessStatus(history: ExamAttempt[]): ReadinessStatus {
  const last5 = history.slice(0, 5);
  const passedCount = last5.filter(a => a.passed).length;
  const ready = last5.length >= 3 && passedCount >= 3;

  // Weak modules: avg score < 60% across last 3 exams
  const last3 = history.slice(0, 3);
  const weakModules: string[] = [];

  if (last3.length > 0) {
    const allModules = Object.keys(MODULE_WEIGHTS);
    for (const mod of allModules) {
      let totalCorrect = 0;
      let totalPossible = 0;
      for (const attempt of last3) {
        const score = attempt.moduleScores[mod];
        if (score) {
          totalCorrect += score.correct;
          totalPossible += score.total;
        }
      }
      if (totalPossible > 0 && totalCorrect / totalPossible < 0.6) {
        weakModules.push(mod);
      }
    }
  }

  return { ready, passedCount, totalRecent: last5.length, weakModules };
}
