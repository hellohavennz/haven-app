type LessonProgress = { attempted: number; correct: number };

const getStorageKey = (id: string) => `haven_progress_${id}`;

export function getProgress(lessonId: string): LessonProgress {
  try {
    const data = localStorage.getItem(getStorageKey(lessonId));
    return data ? JSON.parse(data) : { attempted: 0, correct: 0 };
  } catch (error) {
    console.error('Error reading progress:', error);
    return { attempted: 0, correct: 0 };
  }
}

export function recordAttempt(lessonId: string, correct: boolean) {
  const progress = getProgress(lessonId);
  const updated: LessonProgress = {
    attempted: progress.attempted + 1,
    correct: progress.correct + (correct ? 1 : 0),
  };
  
  try {
    localStorage.setItem(getStorageKey(lessonId), JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving progress:', error);
  }
  
  return updated;
}

export function resetProgress(lessonId: string) {
  try {
    localStorage.removeItem(getStorageKey(lessonId));
  } catch (error) {
    console.error('Error resetting progress:', error);
  }
}

export function getAllProgress(): Record<string, LessonProgress> {
  const allProgress: Record<string, LessonProgress> = {};
  
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('haven_progress_')) {
        const lessonId = key.replace('haven_progress_', '');
        allProgress[lessonId] = getProgress(lessonId);
      }
    }
  } catch (error) {
    console.error('Error reading all progress:', error);
  }
  
  return allProgress;
}
