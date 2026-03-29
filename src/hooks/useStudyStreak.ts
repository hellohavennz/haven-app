import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Calculates the user's current study streak from login_events.
 * A streak is consecutive days ending today or yesterday (so sleeping
 * through midnight doesn't break it).
 */
export function useStudyStreak(userId: string | undefined): number {
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (!userId) return;

    supabase
      .from('login_events')
      .select('date')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(90)
      .then(({ data }) => {
        if (!data?.length) { setStreak(0); return; }

        const dateSet = new Set(data.map(d => d.date));

        function toISO(d: Date) {
          return d.toISOString().split('T')[0];
        }

        const today     = new Date();
        const todayStr  = toISO(today);
        const yestStr   = toISO(new Date(today.getTime() - 86400000));

        // Streak must include today or yesterday
        if (!dateSet.has(todayStr) && !dateSet.has(yestStr)) {
          setStreak(0);
          return;
        }

        // Walk back from today (or yesterday if not logged in today yet)
        let cursor = dateSet.has(todayStr) ? today : new Date(today.getTime() - 86400000);
        let count = 0;

        while (dateSet.has(toISO(cursor))) {
          count++;
          cursor = new Date(cursor.getTime() - 86400000);
        }

        setStreak(count);
      });
  }, [userId]);

  return streak;
}
