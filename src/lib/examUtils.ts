import { getAllLessons } from './content';
import { supabase } from './supabase';
import { getCurrentUser } from './auth';
import type { ExamQuestion, ExamAttempt } from '../types';

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

  for (const [mod, count] of Object.entries(MODULE_WEIGHTS)) {
    const pool = byModule[mod] ?? [];
    const shuffled = shuffle(pool);
    // Take as many as available up to the target count
    selected.push(...shuffled.slice(0, Math.min(count, shuffled.length)));
  }

  // If we're short (unlikely but safe), pad from any remaining questions
  if (selected.length < TOTAL_QUESTIONS) {
    const usedIds = new Set(selected.map(q => q.prompt));
    const extras: ExamQuestion[] = [];
    for (const lesson of allLessons) {
      for (const q of lesson.questions ?? []) {
        if (!usedIds.has(q.prompt)) {
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

export function getExamHistory(): ExamAttempt[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ExamAttempt[];
  } catch {
    return [];
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
