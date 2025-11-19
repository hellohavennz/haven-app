import { supabase } from './supabase';

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
  const stored = localStorage.getItem('lesson-progress');
  return stored ? JSON.parse(stored) : {};
}

export function recordAttempt(lessonId: string, isCorrect: boolean): void {
  const progressKey = 'lesson-progress';
  const stored = localStorage.getItem(progressKey);
  const allProgress: Record<string, LessonProgress> = stored ? JSON.parse(stored) : {};
  
  if (!allProgress[lessonId]) {
    allProgress[lessonId] = { attempted: 0, correct: 0 };
  }
  
  allProgress[lessonId].attempted += 1;
  if (isCorrect) {
    allProgress[lessonId].correct += 1;
  }
  
  localStorage.setItem(progressKey, JSON.stringify(allProgress));
}
