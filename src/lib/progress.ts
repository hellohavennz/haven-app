import { supabase } from './supabase';

const PROGRESS_STORAGE_KEY = 'lesson-progress';

export interface UserProgress {
  id?: string;
  user_id: string;
  lesson_id: string;
  attempts: number;
  correct: number;
  questions_attempted: number;
  questions_correct: number;
  flashcards_reviewed: number;
  completed: boolean;
  last_practiced_at: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface LessonProgress {
  attempted: number;
  correct: number;
  flashcardsReviewed: number;
  completed: boolean;
  lastPracticedAt?: string;
}

type LessonProgressRecord = Record<string, LessonProgress>;

type UserProgressRow = {
  lesson_id: string;
  attempts?: number | null;
  correct?: number | null;
  questions_attempted?: number | null;
  questions_correct?: number | null;
  flashcards_reviewed?: number | null;
  completed?: boolean | null;
  last_practiced_at?: string | null;
};

const DEFAULT_PROGRESS: LessonProgress = {
  attempted: 0,
  correct: 0,
  flashcardsReviewed: 0,
  completed: false,
};

function isBrowserEnvironment() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function sanitizeLessonProgress(progress?: Partial<LessonProgress>): LessonProgress {
  return {
    attempted: progress?.attempted ?? 0,
    correct: progress?.correct ?? 0,
    flashcardsReviewed: progress?.flashcardsReviewed ?? 0,
    completed: progress?.completed ?? false,
    lastPracticedAt: progress?.lastPracticedAt,
  };
}

function readProgressFromStorage(): LessonProgressRecord {
  if (!isBrowserEnvironment()) {
    return {};
  }

  try {
    const stored = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!stored) {
      return {};
    }

    const parsed = JSON.parse(stored) as LessonProgressRecord;
    return Object.entries(parsed).reduce<LessonProgressRecord>((acc, [lessonId, progress]) => {
      acc[lessonId] = sanitizeLessonProgress(progress);
      return acc;
    }, {});
  } catch (error) {
    console.error('Failed to parse lesson progress', error);
    return {};
  }
}

function writeProgressToStorage(progress: LessonProgressRecord) {
  if (!isBrowserEnvironment()) {
    return;
  }

  window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
}

function updateLocalProgress(lessonId: string, updater: (progress: LessonProgress) => LessonProgress) {
  const allProgress = readProgressFromStorage();
  const existing = allProgress[lessonId] ?? DEFAULT_PROGRESS;
  const updated = sanitizeLessonProgress(updater(existing));

  allProgress[lessonId] = updated;
  writeProgressToStorage(allProgress);

  void syncLessonProgressWithDB(lessonId, updated);

  return updated;
}

export async function getUserProgress(userId: string, lessonId: string): Promise<UserProgress | null> {
  try {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('lesson_id', lessonId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching progress:', error);
      return null;
    }

    return data as UserProgress | null;
  } catch (error) {
    console.error('Error in getUserProgress:', error);
    return null;
  }
}

export async function getAllUserProgress(userId: string): Promise<UserProgress[]> {
  try {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching all progress:', error);
      return [];
    }

    return (data as UserProgress[]) ?? [];
  } catch (error) {
    console.error('Error in getAllUserProgress:', error);
    return [];
  }
}

export function getAllProgress(): LessonProgressRecord {
  return readProgressFromStorage();
}

export async function getAllProgressFromDB(): Promise<LessonProgressRecord> {
  const fallback = getAllProgress();

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error('Supabase user_progress error', userError);
      return fallback;
    }

    if (!user) {
      return fallback;
    }

    const { data, error } = await supabase
      .from('user_progress')
      .select('lesson_id, attempts, correct, questions_attempted, questions_correct, flashcards_reviewed, completed, last_practiced_at')
      .eq('user_id', user.id);

    if (error) {
      console.error('Supabase user_progress error', error);
      return fallback;
    }

    const mapped: LessonProgressRecord = {};

    (data ?? []).forEach((row: UserProgressRow) => {
      const attempted = row.questions_attempted ?? row.attempts ?? 0;
      const correct = row.questions_correct ?? row.correct ?? 0;
      mapped[row.lesson_id] = sanitizeLessonProgress({
        attempted,
        correct,
        flashcardsReviewed: row.flashcards_reviewed ?? 0,
        completed: row.completed ?? false,
        lastPracticedAt: row.last_practiced_at ?? undefined,
      });
    });

    writeProgressToStorage(mapped);

    return mapped;
  } catch (error) {
    console.error('Supabase user_progress error', error);
    return fallback;
  }
}

export function recordQuestionAttempt(lessonId: string, isCorrect: boolean): LessonProgress {
  const timestamp = new Date().toISOString();
  return updateLocalProgress(lessonId, (existing) => ({
    ...existing,
    attempted: existing.attempted + 1,
    correct: existing.correct + (isCorrect ? 1 : 0),
    lastPracticedAt: timestamp,
  }));
}

export function recordFlashcardReview(lessonId: string, count = 1): LessonProgress {
  if (count <= 0) {
    return getAllProgress()[lessonId] ?? DEFAULT_PROGRESS;
  }

  const timestamp = new Date().toISOString();
  return updateLocalProgress(lessonId, (existing) => ({
    ...existing,
    flashcardsReviewed: existing.flashcardsReviewed + count,
    lastPracticedAt: timestamp,
  }));
}

export function markLessonComplete(lessonId: string): LessonProgress {
  const timestamp = new Date().toISOString();
  return updateLocalProgress(lessonId, (existing) => ({
    ...existing,
    completed: true,
    lastPracticedAt: existing.lastPracticedAt ?? timestamp,
  }));
}

export async function migrateLocalStorageToDatabase(): Promise<void> {
  const allProgress = readProgressFromStorage();

  await Promise.all(
    Object.entries(allProgress).map(([lessonId, progress]) =>
      syncLessonProgressWithDB(lessonId, progress)
    )
  );
}

async function syncLessonProgressWithDB(lessonId: string, progress: LessonProgress) {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error('Supabase user_progress error', userError);
      return;
    }

    if (!user) {
      return;
    }

    const timestamp = progress.lastPracticedAt ?? new Date().toISOString();
    const payload = {
      user_id: user.id,
      lesson_id: lessonId,
      attempts: progress.attempted,
      correct: progress.correct,
      questions_attempted: progress.attempted,
      questions_correct: progress.correct,
      flashcards_reviewed: progress.flashcardsReviewed,
      completed: progress.completed,
      last_practiced_at: timestamp,
    };

    const { error } = await supabase
      .from('user_progress')
      .upsert(payload, { onConflict: 'user_id,lesson_id' });

    if (error) {
      console.error('Supabase user_progress error', error);
    }
  } catch (error) {
    console.error('Supabase user_progress error', error);
  }
}

export { recordQuestionAttempt as recordAttempt };
