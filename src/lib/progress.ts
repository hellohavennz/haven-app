import { supabase } from './supabase';
import { getCurrentUser } from './auth';

type LessonProgress = { attempted: number; correct: number };

// Fallback to localStorage for non-authenticated users
const getStorageKey = (id: string) => `haven_progress_${id}`;

export async function getProgress(lessonId: string): Promise<LessonProgress> {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      // Not logged in - use localStorage
      const data = localStorage.getItem(getStorageKey(lessonId));
      return data ? JSON.parse(data) : { attempted: 0, correct: 0 };
    }
    
    // Logged in - use Supabase
    const { data, error } = await supabase
      .from('user_progress')
      .select('attempted, correct')
      .eq('user_id', user.id)
      .eq('lesson_id', lessonId)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
      console.error('Error fetching progress:', error);
    }
    
    return data || { attempted: 0, correct: 0 };
  } catch (error) {
    console.error('Error in getProgress:', error);
    return { attempted: 0, correct: 0 };
  }
}

export async function recordAttempt(lessonId: string, correct: boolean): Promise<LessonProgress> {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      // Not logged in - use localStorage
      const progress = await getProgress(lessonId);
      const updated: LessonProgress = {
        attempted: progress.attempted + 1,
        correct: progress.correct + (correct ? 1 : 0),
      };
      localStorage.setItem(getStorageKey(lessonId), JSON.stringify(updated));
      return updated;
    }
    
    // Logged in - use Supabase
    const currentProgress = await getProgress(lessonId);
    const updated: LessonProgress = {
      attempted: currentProgress.attempted + 1,
      correct: currentProgress.correct + (correct ? 1 : 0),
    };
    
    const { error } = await supabase
      .from('user_progress')
      .upsert({
        user_id: user.id,
        lesson_id: lessonId,
        attempted: updated.attempted,
        correct: updated.correct,
        last_practiced_at: new Date().toISOString(),
      });
    
    if (error) {
      console.error('Error recording attempt:', error);
    }
    
    return updated;
  } catch (error) {
    console.error('Error in recordAttempt:', error);
    return { attempted: 0, correct: 0 };
  }
}

export async function resetProgress(lessonId: string): Promise<void> {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      localStorage.removeItem(getStorageKey(lessonId));
      return;
    }
    
    const { error } = await supabase
      .from('user_progress')
      .delete()
      .eq('user_id', user.id)
      .eq('lesson_id', lessonId);
    
    if (error) {
      console.error('Error resetting progress:', error);
    }
  } catch (error) {
    console.error('Error in resetProgress:', error);
  }
}

export async function getAllProgress(): Promise<Record<string, LessonProgress>> {
  const allProgress: Record<string, LessonProgress> = {};
  
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      // Use localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('haven_progress_')) {
          const lessonId = key.replace('haven_progress_', '');
          allProgress[lessonId] = await getProgress(lessonId);
        }
      }
    } else {
      // Use Supabase
      const { data, error } = await supabase
        .from('user_progress')
        .select('lesson_id, attempted, correct')
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error fetching all progress:', error);
      } else if (data) {
        data.forEach(row => {
          allProgress[row.lesson_id] = {
            attempted: row.attempted,
            correct: row.correct,
          };
        });
      }
    }
  } catch (error) {
    console.error('Error in getAllProgress:', error);
  }
  
  return allProgress;
}
