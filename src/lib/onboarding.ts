import { supabase } from './supabase';
import { getCurrentUser } from './auth';

const STORAGE_KEY = 'onboarding';

export type StudyGoal = 'light' | 'regular' | 'intensive';

export type OnboardingData = {
  examDate: string | null; // ISO date string (YYYY-MM-DD) or null
  studyGoal?: StudyGoal;   // optional — kept for backward-compat with existing localStorage data
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

/** Hydrates localStorage from Supabase if the user has completed onboarding but localStorage is empty. */
export async function preloadOnboarding(): Promise<void> {
  if (isOnboardingComplete()) return; // already in localStorage

  try {
    const user = await getCurrentUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_complete, exam_date')
      .eq('id', user.id)
      .single();

    if (profile?.onboarding_complete) {
      const data: OnboardingData = {
        examDate: profile.exam_date ?? null,
        completedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  } catch { /* ignore */ }
}

export async function saveOnboarding(examDate: string | null): Promise<void> {
  const data: OnboardingData = {
    examDate,
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
        {
          id: user.id,
          exam_date: examDate,
          onboarding_complete: true,
          // Reset reminder flags so new reminders fire for the updated date
          exam_reminder_7d_sent: false,
          exam_reminder_1d_sent: false,
        },
        { onConflict: 'id' }
      );
    }
  } catch { /* ignore */ }
}
