import { supabase } from './supabase';

const PROGRESS_STORAGE_KEY = 'lesson-progress';

export interface UserProgress {
  user_id: string;
  lesson_id: string;
  completed: boolean;
  score: number;
  attempts: number;
  last_attempt_date: string;
}

export interface LessonProgress {
  attempted: number;
  correct: number;
  flashcardsReviewed?: number;
  completed?: boolean;
  lastPracticedAt?: string;
}

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

function isBrowserEnvironment() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readProgressFromStorage(): Record<string, LessonProgress> {
  if (!isBrowserEnvironment()) {
    return {};
  }

  const stored = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
  return stored ? JSON.parse(stored) : {};
}

function writeProgressToStorage(progress: Record<string, LessonProgress>) {
  if (!isBrowserEnvironment()) {
    return;
  }

  window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
}

export async function getUserProgress(userId: string, lessonId: string): Promise<UserProgress | null> {
  try {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('lesson_id', lessonId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching progress:', error);
      return null;
    }

    return data;
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

    return data || [];
  } catch (error) {
    console.error('Error in getAllUserProgress:', error);
    return [];
  }
}

export function getAllProgress(): Record<string, LessonProgress> {
  return readProgressFromStorage();
}

export async function getAllProgressFromDB(): Promise<Record<string, LessonProgress> | null> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) {
      console.error('Supabase user_progress error', userError);
      return null;
    }

    if (!user) {
      return null;
    }

    const { data, error } = await supabase
      .from('user_progress')
      .select('lesson_id, attempts, correct, questions_attempted, questions_correct, flashcards_reviewed, completed, last_practiced_at')
      .eq('user_id', user.id);

    if (error) {
      console.error('Supabase user_progress error', error);
      return null;
    }

    const mapped: Record<string, LessonProgress> = {};
    (data ?? []).forEach((row: UserProgressRow) => {
      const attempted = row.questions_attempted ?? row.attempts ?? 0;
      const correct = row.questions_correct ?? row.correct ?? 0;

      mapped[row.lesson_id] = {
        attempted,
        correct,
        flashcardsReviewed: row.flashcards_reviewed ?? undefined,
        completed: row.completed ?? undefined,
        lastPracticedAt: row.last_practiced_at ?? undefined,
      };
    });

    writeProgressToStorage(mapped);

    return mapped;
  } catch (error) {
    console.error('Supabase user_progress error', error);
    return null;
  }
}

export function recordAttempt(lessonId: string, isCorrect: boolean): void {
  const allProgress = readProgressFromStorage();
  const existingProgress: LessonProgress = allProgress[lessonId] ?? { attempted: 0, correct: 0 };

  const updated: LessonProgress = {
    ...existingProgress,
    attempted: existingProgress.attempted + 1,
    correct: existingProgress.correct + (isCorrect ? 1 : 0),
    lastPracticedAt: new Date().toISOString(),
  };

  allProgress[lessonId] = updated;
  writeProgressToStorage(allProgress);

  void saveLessonProgressToDB(lessonId, updated);
}

async function saveLessonProgressToDB(lessonId: string, progress: LessonProgress) {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

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
      questions_attempted: progress.attempted ?? 0,
      questions_correct: progress.correct ?? 0,
      attempts: progress.attempted ?? 0,
      correct: progress.correct ?? 0,
      flashcards_reviewed: progress.flashcardsReviewed ?? null,
      completed: progress.completed ?? false,
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
