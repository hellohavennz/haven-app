import { supabase } from './supabase';
import { getCurrentUser } from './auth';

const STORAGE_KEY = 'onboarding';

export type StudyGoal = 'light' | 'regular' | 'intensive';

export type OnboardingData = {
  examDate: string | null; // ISO date string (YYYY-MM-DD) or null
  studyGoal: StudyGoal;
  completedAt: string;
};

export function isOnboardingComplete(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    return !!(JSON.parse(raw) as OnboardingData).completedAt;
  } catch {
    return false;
  }
}

export function getOnboardingData(): OnboardingData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as OnboardingData) : null;
  } catch {
    return null;
  }
}

/** Returns days until exam, or null if no date set or date has passed. */
export function getDaysUntilExam(): number | null {
  const data = getOnboardingData();
  if (!data?.examDate) return null;
  const diff = Math.ceil(
    (new Date(data.examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  return diff > 0 ? diff : null;
}

export async function saveOnboarding(
  examDate: string | null,
  studyGoal: StudyGoal
): Promise<void> {
  const data: OnboardingData = {
    examDate,
    studyGoal,
    completedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch { /* ignore */ }

  // Best-effort Supabase sync — requires profiles table to have these columns
  try {
    const user = await getCurrentUser();
    if (user) {
      await supabase.from('profiles').upsert(
        { id: user.id, exam_date: examDate, study_goal: studyGoal, onboarding_complete: true },
        { onConflict: 'id' }
      );
    }
  } catch { /* ignore */ }
}
