type LessonProgress = { attempted: number; correct: number };
const k = (id: string) => `progress:${id}`;

export function getProgress(lessonId: string): LessonProgress {
  try { return JSON.parse(localStorage.getItem(k(lessonId)) || "{}"); } catch { return {} as any; }
}
export function recordAttempt(lessonId: string, correct: boolean) {
  const p = getProgress(lessonId);
  const next: LessonProgress = {
    attempted: (p.attempted || 0) + 1,
    correct: (p.correct || 0) + (correct ? 1 : 0),
  };
  localStorage.setItem(k(lessonId), JSON.stringify(next));
  return next;
}
export function resetProgress(lessonId: string) {
  localStorage.removeItem(k(lessonId));
}
