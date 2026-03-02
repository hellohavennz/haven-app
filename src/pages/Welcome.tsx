import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, BookOpen, ArrowRight, CheckCircle2, Target } from 'lucide-react';
import { saveOnboarding } from '../lib/onboarding';
import { getCurrentUser } from '../lib/auth';
import { getAllLessons } from '../lib/content';
import { usePageTitle } from '../hooks/usePageTitle';


export default function Welcome() {
  usePageTitle('Welcome');
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [examDate, setExamDate] = useState('');
  const [skipDate, setSkipDate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userName, setUserName] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const firstLesson = getAllLessons()[0] ?? null;

  useEffect(() => {
    getCurrentUser().then(u => setUserName(u?.user_metadata?.full_name || ''));
  }, []);

  const daysUntilExam = examDate && !skipDate
    ? Math.ceil((new Date(examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const formattedExamDate = examDate && !skipDate
    ? new Date(examDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  async function finish() {
    setSaving(true);
    await saveOnboarding(skipDate ? null : examDate || null);
    setSaving(false);
    setStep(2);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-teal-50 to-emerald-50 px-4 py-12 dark:from-gray-950 dark:to-gray-900">
      <div className="w-full max-w-lg space-y-8">
        {/* Progress bar */}
        <div className="flex items-center gap-3">
          <div className="h-1.5 flex-1 rounded-full bg-teal-500" />
          <div className={`h-1.5 flex-1 rounded-full transition-all ${step === 2 ? 'bg-teal-500' : 'bg-slate-200 dark:bg-slate-800'}`} />
        </div>

        {/* Step 1 — Exam date */}
        {step === 1 && (
          <div className="space-y-8">
            <div className="space-y-3">
              <h1 className="font-semibold text-slate-900 dark:text-white">
                When's your exam?
              </h1>
              <p className="text-slate-600 dark:text-slate-300">
                We'll count down the days and keep you on pace.
              </p>
            </div>

            <div className="space-y-4">
              <div
                className={`overflow-hidden rounded-2xl border-2 bg-white p-6 transition-all dark:bg-slate-900 ${
                  !skipDate
                    ? 'border-teal-500'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                  <span className="font-semibold text-slate-900 dark:text-white">
                    Choose a date
                  </span>
                </div>
                <input
                  type="date"
                  min={today}
                  value={examDate}
                  onChange={e => { setExamDate(e.target.value); setSkipDate(false); }}
                  className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
                />
              </div>

              <button
                onClick={() => { setSkipDate(true); setExamDate(''); }}
                className={`w-full rounded-2xl border-2 bg-white p-4 text-left transition-all dark:bg-slate-900 ${
                  skipDate
                    ? 'border-teal-500'
                    : 'border-slate-200 hover:border-slate-300 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    I haven't booked my exam yet
                  </span>
                  {skipDate && <CheckCircle2 className="h-5 w-5 text-teal-600" />}
                </div>
              </button>
            </div>

            <button
              onClick={finish}
              disabled={(!examDate && !skipDate) || saving}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 py-4 font-semibold text-white transition-all hover:shadow-lg disabled:opacity-40"
            >
              {saving ? 'Saving…' : 'Continue'}
              {!saving && <ArrowRight className="h-4 w-4" />}
            </button>
          </div>
        )}

        {/* Step 2 — You're all set */}
        {step === 2 && (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h1 className="font-semibold text-slate-900 dark:text-white">
                You're all set{userName ? `, ${userName}` : ''}!
              </h1>
              <p className="text-slate-600 dark:text-slate-300">
                You're ready to start. Good luck!
              </p>
            </div>

            {/* Summary cards */}
            <div className="space-y-3">
              <div className="flex items-center gap-4 rounded-2xl border-2 border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-teal-100 dark:bg-teal-900/40">
                  <Calendar className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Exam date</p>
                  {formattedExamDate ? (
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {formattedExamDate}
                      {daysUntilExam !== null && (
                        <span className="ml-2 text-sm font-normal text-teal-600 dark:text-teal-400">
                          ({daysUntilExam} day{daysUntilExam !== 1 ? 's' : ''} away)
                        </span>
                      )}
                    </p>
                  ) : (
                    <p className="font-semibold text-slate-900 dark:text-white">Not booked yet</p>
                  )}
                </div>
              </div>

            </div>

            {/* CTAs */}
            <div className="space-y-3">
              {firstLesson ? (
                <Link
                  to={`/content/${firstLesson.id}`}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 py-4 font-semibold text-white transition-all hover:shadow-lg"
                >
                  <BookOpen className="h-5 w-5" />
                  Start Lesson 1
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <Link
                  to="/content"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 py-4 font-semibold text-white transition-all hover:shadow-lg"
                >
                  <BookOpen className="h-5 w-5" />
                  Browse Lessons
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}

              <button
                onClick={() => navigate('/dashboard', { replace: true })}
                className="w-full rounded-xl border-2 border-slate-200 py-3 font-semibold text-slate-600 transition-all hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Go to Dashboard
              </button>
            </div>

            {/* Study steps hint */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              {[
                { icon: <BookOpen className="h-5 w-5" />, label: 'Study', detail: 'Read each lesson' },
                { icon: <Target className="h-5 w-5" />, label: 'Practice', detail: 'Answer questions' },
                { icon: <CheckCircle2 className="h-5 w-5" />, label: 'Exam', detail: 'Test yourself' },
              ].map(({ icon, label, detail }) => (
                <div key={label} className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 text-center">
                  <div className="flex justify-center mb-1.5 text-teal-600 dark:text-teal-400">{icon}</div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{label}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{detail}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
