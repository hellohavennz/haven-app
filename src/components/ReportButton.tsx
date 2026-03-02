import { useState } from 'react';
import { Flag, X, Send } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getCurrentUser } from '../lib/auth';

type ContentType = 'lesson' | 'flashcard' | 'question' | 'exam';

type Props = {
  lessonId: string;
  contentType: ContentType;
  contentRef?: string;
};

export default function ReportButton({ lessonId, contentType, contentRef }: Props) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit() {
    if (!message.trim()) return;
    setSubmitting(true);

    try {
      const user = await getCurrentUser();
      if (!user) {
        // Silently skip if not logged in
        setDone(true);
        return;
      }

      await supabase.from('content_reports').insert({
        user_id: user.id,
        lesson_id: lessonId,
        content_type: contentType,
        content_ref: contentRef ?? null,
        message: message.trim(),
      });

      setDone(true);
    } catch {
      // Best-effort — don't block the user
      setDone(true);
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    setOpen(false);
    setMessage('');
    setDone(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-500 transition-colors dark:text-slate-500 dark:hover:text-red-400"
        title="Report an issue with this content"
      >
        <Flag size={13} />
        Report issue
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/40 px-4 pb-4 sm:pb-0">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 shadow-2xl p-6 space-y-4">
            {done ? (
              <div className="text-center space-y-3 py-4">
                <div className="text-3xl">✅</div>
                <p className="font-semibold text-slate-900 dark:text-gray-100">Thanks for the report!</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">We'll review this soon.</p>
                <button
                  onClick={handleClose}
                  className="mt-2 px-6 py-2 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900 dark:text-gray-100 flex items-center gap-2">
                    <Flag size={16} className="text-red-500" />
                    Report an issue
                  </h3>
                  <button
                    onClick={handleClose}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X size={18} />
                  </button>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Found an error or something unclear? Let us know.
                </p>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Describe the issue…"
                  rows={4}
                  className="w-full rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm text-slate-900 dark:text-gray-100 placeholder-gray-400 focus:border-teal-400 focus:outline-none resize-none"
                  autoFocus
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleClose}
                    className="flex-1 rounded-xl border-2 border-slate-200 dark:border-slate-700 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!message.trim() || submitting}
                    className="flex-1 rounded-xl bg-teal-600 py-3 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    <Send size={14} />
                    {submitting ? 'Sending…' : 'Send Report'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
