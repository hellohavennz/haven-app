import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Zap, BookOpen, Flame, ArrowRight, CheckCircle2 } from 'lucide-react';
import { saveOnboarding, type StudyGoal } from '../lib/onboarding';

const STUDY_GOALS: { value: StudyGoal; label: string; detail: string; icon: React.ReactNode }[] = [
  {
    value: 'light',
    label: 'Light',
    detail: '~15 min a day',
    icon: <BookOpen className="h-6 w-6" />,
  },
  {
    value: 'regular',
    label: 'Regular',
    detail: '~30 min a day',
    icon: <Zap className="h-6 w-6" />,
  },
  {
    value: 'intensive',
    label: 'Intensive',
    detail: '1+ hour a day',
    icon: <Flame className="h-6 w-6" />,
  },
];

export default function Welcome() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [examDate, setExamDate] = useState('');
  const [skipDate, setSkipDate] = useState(false);
  const [studyGoal, setStudyGoal] = useState<StudyGoal | null>(null);
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  async function finish() {
    if (!studyGoal) return;
    setSaving(true);
    await saveOnboarding(skipDate ? null : examDate || null, studyGoal);
    navigate('/dashboard', { replace: true });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-teal-50 to-emerald-50 px-4 py-12 dark:from-gray-950 dark:to-gray-900">
      <div className="w-full max-w-lg space-y-8">
        {/* Progress */}
        <div className="flex items-center gap-3">
          <div className="h-1.5 flex-1 rounded-full bg-teal-500" />
          <div className={`h-1.5 flex-1 rounded-full transition-all ${step === 2 ? 'bg-teal-500' : 'bg-gray-200 dark:bg-gray-800'}`} />
        </div>

        {step === 1 && (
          <div className="space-y-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-teal-100 px-4 py-1.5 text-sm font-semibold text-teal-700 dark:bg-teal-900/40 dark:text-teal-300">
                Step 1 of 2
              </div>
              <h1 className="font-semibold text-gray-900 dark:text-white">
                When's your exam?
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                We'll count down the days and help you pace your study.
              </p>
            </div>

            <div className="space-y-4">
              <div
                className={`rounded-2xl border-2 bg-white p-6 transition-all dark:bg-gray-900 ${
                  !skipDate
                    ? 'border-teal-500'
                    : 'border-gray-200 dark:border-gray-800'
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                  <span className="font-semibold text-gray-900 dark:text-white">
                    Choose a date
                  </span>
                </div>
                <input
                  type="date"
                  min={today}
                  value={examDate}
                  onChange={e => { setExamDate(e.target.value); setSkipDate(false); }}
                  className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:border-teal-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <button
                onClick={() => { setSkipDate(true); setExamDate(''); }}
                className={`w-full rounded-2xl border-2 bg-white p-4 text-left transition-all dark:bg-gray-900 ${
                  skipDate
                    ? 'border-teal-500'
                    : 'border-gray-200 hover:border-gray-300 dark:border-gray-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700 dark:text-gray-200">
                    I haven't booked my exam yet
                  </span>
                  {skipDate && <CheckCircle2 className="h-5 w-5 text-teal-600" />}
                </div>
              </button>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!examDate && !skipDate}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 py-4 font-semibold text-white transition-all hover:shadow-lg disabled:opacity-40"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-teal-100 px-4 py-1.5 text-sm font-semibold text-teal-700 dark:bg-teal-900/40 dark:text-teal-300">
                Step 2 of 2
              </div>
              <h1 className="font-semibold text-gray-900 dark:text-white">
                How much time can you study?
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Be honest — a little every day beats cramming.
              </p>
            </div>

            <div className="space-y-3">
              {STUDY_GOALS.map(goal => (
                <button
                  key={goal.value}
                  onClick={() => setStudyGoal(goal.value)}
                  className={`flex w-full items-center gap-4 rounded-2xl border-2 bg-white p-5 text-left transition-all dark:bg-gray-900 ${
                    studyGoal === goal.value
                      ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                      : 'border-gray-200 hover:border-teal-300 dark:border-gray-800'
                  }`}
                >
                  <div
                    className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${
                      studyGoal === goal.value
                        ? 'bg-teal-600 text-white'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                    }`}
                  >
                    {goal.icon}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {goal.label}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {goal.detail}
                    </div>
                  </div>
                  {studyGoal === goal.value && (
                    <CheckCircle2 className="ml-auto h-5 w-5 flex-shrink-0 text-teal-600" />
                  )}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="rounded-xl border-2 border-gray-200 px-6 py-4 font-semibold text-gray-700 transition-all hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200"
              >
                Back
              </button>
              <button
                onClick={finish}
                disabled={!studyGoal || saving}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 py-4 font-semibold text-white transition-all hover:shadow-lg disabled:opacity-40"
              >
                {saving ? 'Saving…' : "Let's go"}
                {!saving && <ArrowRight className="h-4 w-4" />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
