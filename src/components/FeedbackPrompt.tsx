import { useState } from 'react';
import { Star, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

const STORAGE_DONE    = 'haven-feedback-done';
const STORAGE_SNOOZED = 'haven-feedback-snoozed';
const SNOOZE_MS       = 7 * 24 * 60 * 60 * 1000; // 7 days

function shouldShow(userId: string | undefined, accountAgeDays: number): boolean {
  if (!userId) return false;
  if (accountAgeDays < 3) return false;
  try {
    if (localStorage.getItem(STORAGE_DONE) === '1') return false;
    const snoozed = localStorage.getItem(STORAGE_SNOOZED);
    if (snoozed && Date.now() - Number(snoozed) < SNOOZE_MS) return false;
  } catch { /* localStorage blocked */ }
  return true;
}

export default function FeedbackPrompt({
  userId,
  accountCreatedAt,
}: {
  userId: string | undefined;
  accountCreatedAt: string | undefined;
}) {
  const accountAgeDays = accountCreatedAt
    ? Math.floor((Date.now() - new Date(accountCreatedAt).getTime()) / 86400000)
    : 0;

  const [visible, setVisible] = useState(() => shouldShow(userId, accountAgeDays));
  const [rating, setRating]   = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone]       = useState(false);

  if (!visible) return null;

  function dismiss() {
    try { localStorage.setItem(STORAGE_SNOOZED, String(Date.now())); } catch { /* */ }
    setVisible(false);
  }

  async function submit() {
    if (!rating || !userId) return;
    setSubmitting(true);
    try {
      await supabase.from('feedback').insert({
        user_id: userId,
        rating,
        comment: comment.trim() || null,
      });
      try { localStorage.setItem(STORAGE_DONE, '1'); } catch { /* */ }
      setDone(true);
      setTimeout(() => setVisible(false), 2500);
    } catch {
      // Fail silently — don't disrupt the user's session
      setVisible(false);
    } finally {
      setSubmitting(false);
    }
  }

  const starLabel = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
      {done ? (
        <div className="flex items-center gap-3 text-teal-700 dark:text-teal-300">
          <Star className="h-5 w-5 fill-current" />
          <p className="font-semibold">Thank you! Your feedback really helps.</p>
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">How are you finding Haven so far?</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Takes 10 seconds. Genuinely helps us improve.</p>
            </div>
            <button
              onClick={dismiss}
              className="flex-shrink-0 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 mt-0.5"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Stars */}
          <div className="flex items-center gap-1 mb-1">
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                onClick={() => setRating(n)}
                onMouseEnter={() => setHovered(n)}
                onMouseLeave={() => setHovered(0)}
                aria-label={`${n} star${n !== 1 ? 's' : ''}`}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star
                  className={`h-7 w-7 transition-colors ${
                    n <= (hovered || rating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-200 dark:text-slate-700'
                  }`}
                />
              </button>
            ))}
            {(hovered || rating) > 0 && (
              <span className="ml-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                {starLabel[hovered || rating]}
              </span>
            )}
          </div>

          {/* Comment + submit — appear once a star is selected */}
          {rating > 0 && (
            <div className="mt-3 space-y-3">
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Anything you'd like to share? (optional)"
                rows={2}
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:border-teal-400 focus:outline-none focus:ring-0 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-500"
              />
              <button
                onClick={submit}
                disabled={submitting}
                className="rounded-xl bg-teal-600 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50 transition-colors"
              >
                {submitting ? 'Sending…' : 'Send feedback'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
