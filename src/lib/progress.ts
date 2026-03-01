import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { getCurrentUser } from './auth';

export interface UserProgress {
  user_id: string;
  lesson_id: string;
  completed: boolean;
  score: number;
  attempts: number;
  correct_answers: number;
  last_attempt_date: string;
  lesson_read: boolean;
}

export interface LessonProgress {
  attempted: number;
  correct: number;
  read?: boolean;
}

const PROGRESS_KEY = 'lesson-progress';

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
  const stored = localStorage.getItem(PROGRESS_KEY);
  return stored ? JSON.parse(stored) : {};
}

// ── Persist helpers ───────────────────────────────────────────────────────────

// Upsert the current localStorage state for one lesson to Supabase.
async function persistToSupabase(lessonId: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;

  const p = getAllProgress()[lessonId];
  if (!p) return;

  const score = p.attempted > 0 ? Math.round((p.correct / p.attempted) * 100) : 0;

  await supabase.from('user_progress').upsert(
    {
      user_id: user.id,
      lesson_id: lessonId,
      attempts: p.attempted,
      correct_answers: p.correct,
      score,
      completed: score >= 80,
      lesson_read: p.read ?? false,
      last_attempt_date: new Date().toISOString(),
    },
    { onConflict: 'user_id,lesson_id' }
  );
}

// ── Public write API ──────────────────────────────────────────────────────────

export function recordAttempt(lessonId: string, isCorrect: boolean): void {
  const stored = localStorage.getItem(PROGRESS_KEY);
  const allProgress: Record<string, LessonProgress> = stored ? JSON.parse(stored) : {};

  if (!allProgress[lessonId]) {
    allProgress[lessonId] = { attempted: 0, correct: 0 };
  }

  allProgress[lessonId].attempted += 1;
  if (isCorrect) {
    allProgress[lessonId].correct += 1;
  }

  localStorage.setItem(PROGRESS_KEY, JSON.stringify(allProgress));
  window.dispatchEvent(new StorageEvent('storage', { key: PROGRESS_KEY }));
  persistToSupabase(lessonId).catch(console.error);
}

/**
 * Toggle the "read" flag for a lesson. Persists to localStorage immediately
 * and syncs to Supabase in the background.
 */
export function markLessonRead(lessonId: string, read: boolean): void {
  const stored = localStorage.getItem(PROGRESS_KEY);
  const allProgress: Record<string, LessonProgress> = stored ? JSON.parse(stored) : {};

  if (!allProgress[lessonId]) {
    allProgress[lessonId] = { attempted: 0, correct: 0 };
  }
  allProgress[lessonId].read = read;

  localStorage.setItem(PROGRESS_KEY, JSON.stringify(allProgress));
  window.dispatchEvent(new StorageEvent('storage', { key: PROGRESS_KEY }));
  persistToSupabase(lessonId).catch(console.error);
}

// ── useProgress hook ──────────────────────────────────────────────────────────

/**
 * Hook that returns progress for all lessons.
 *
 * On mount (when userId is known):
 * - Fetches from Supabase; Supabase wins over localStorage
 * - If Supabase is empty, migrates any existing localStorage data up
 *
 * Stays in sync with localStorage for same-tab and cross-tab updates.
 */
export function useProgress(userId?: string): Record<string, LessonProgress> {
  const [progressData, setProgressData] = useState<Record<string, LessonProgress>>(getAllProgress);

  useEffect(() => {
    if (!userId) return;

    getAllUserProgress(userId)
      .then(rows => {
        const local = getAllProgress();

        if (rows.length === 0) {
          // No Supabase data yet — migrate localStorage → Supabase
          const migrations = Object.entries(local).map(([lessonId, p]) => ({
            user_id: userId,
            lesson_id: lessonId,
            attempts: p.attempted,
            correct_answers: p.correct,
            score: p.attempted > 0 ? Math.round((p.correct / p.attempted) * 100) : 0,
            completed: p.attempted > 0 && p.correct / p.attempted >= 0.8,
            lesson_read: p.read ?? false,
            last_attempt_date: new Date().toISOString(),
          }));

          if (migrations.length > 0) {
            supabase
              .from('user_progress')
              .upsert(migrations, { onConflict: 'user_id,lesson_id' })
              .catch(console.error);
          }
          return;
        }

        // Supabase has data — merge into localStorage (Supabase wins)
        const merged = { ...local };
        rows.forEach(row => {
          merged[row.lesson_id] = {
            attempted: row.attempts,
            correct: row.correct_answers,
            read: row.lesson_read ?? false,
          };
        });

        localStorage.setItem(PROGRESS_KEY, JSON.stringify(merged));
        setProgressData(merged);
      })
      .catch(console.error);
  }, [userId]);

  // Stay in sync with localStorage (same-tab via dispatchEvent, cross-tab via storage)
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === PROGRESS_KEY) {
        setProgressData(getAllProgress());
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  return progressData;
}
