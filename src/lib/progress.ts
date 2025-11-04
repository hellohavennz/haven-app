import { supabase } from './supabase';

export interface UserProgress {
  user_id: string;
  lesson_id: string;
  completed: boolean;
  score: number;
  attempts: number;
  last_attempt_date: string;
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

export async function recordAttempt(
  userId: string,
  lessonId: string,
  score: number,
  completed: boolean
): Promise<void> {
  try {
    // First, try to get existing progress
    const existing = await getUserProgress(userId, lessonId);

    if (existing) {
      // Update existing record
      const { error } = await supabase
        .from('user_progress')
        .update({
          score: Math.max(existing.score, score),
          attempts: existing.attempts + 1,
          completed: completed || existing.completed,
          last_attempt_date: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('lesson_id', lessonId);

      if (error) {
        console.error('Error updating attempt:', error);
      }
    } else {
      // Insert new record
      const { error } = await supabase
        .from('user_progress')
        .insert({
          user_id: userId,
          lesson_id: lessonId,
          score,
          attempts: 1,
          completed,
          last_attempt_date: new Date().toISOString(),
        });

      if (error) {
        console.error('Error inserting attempt:', error);
      }
    }
  } catch (error) {
    console.error('Error recording attempt:', error);
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
  const stored = localStorage.getItem('lesson-progress');
  return stored ? JSON.parse(stored) : {};
}
