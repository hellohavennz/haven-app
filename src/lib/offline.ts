import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { getCurrentUser } from './auth';
import { getAllProgress } from './progress';

/** Reactively tracks navigator.onLine. Updates on browser online/offline events. */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline  = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online',  handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online',  handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

/**
 * Batch-upserts all localStorage progress to Supabase.
 * Called when the browser comes back online to flush any writes that
 * failed silently while the user was studying offline.
 */
export async function syncProgressOnReconnect(): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;

  const progress = getAllProgress();
  const rows = Object.entries(progress).map(([lessonId, p]) => ({
    user_id:          user.id,
    lesson_id:        lessonId,
    attempts:         p.attempted,
    correct_answers:  p.correct,
    score:            p.attempted > 0 ? Math.round((p.correct / p.attempted) * 100) : 0,
    completed:        p.attempted > 0 && p.correct / p.attempted >= 0.8,
    last_attempt_date: new Date().toISOString(),
  }));

  if (rows.length === 0) return;

  await supabase
    .from('user_progress')
    .upsert(rows, { onConflict: 'user_id,lesson_id' });
}
