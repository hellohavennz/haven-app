import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Clock,
  FileCheck,
  Trophy,
  Target,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Shuffle,
  Lock,
} from "lucide-react";
import { getCurrentUser } from "../lib/auth";
import { useSubscription } from "../lib/subscription";
import { getExamHistory, getReadinessStatus, getExamsThisMonth, MODULE_LABELS } from "../lib/examUtils";
import type { ExamAttempt } from "../types";
import { usePageTitle } from '../hooks/usePageTitle';

export default function Exam() {
  usePageTitle('Mock Exam', 'Take a full 24-question mock Life in the UK test. Timed, randomised, with instant detailed results.');
  const [user, setUser] = useState<any>(null);
  const { tier } = useSubscription();
  const [history, setHistory] = useState<ExamAttempt[]>([]);

  useEffect(() => {
    getCurrentUser().then(setUser);
    setHistory(getExamHistory());
  }, []);

  const hasPlus = user && (tier === "plus" || tier === "premium");
  const hasPremium = user && tier === "premium";
  const examsThisMonth = getExamsThisMonth(history);
  const plusLimitReached = hasPlus && !hasPremium && examsThisMonth >= 2;
  const readiness = getReadinessStatus(history);
  const recentHistory = history.slice(0, 5);

  return (
    <div className="mx-auto max-w-4xl space-y-12 px-4 py-8">
      <div className="space-y-4 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-2 text-sm font-semibold text-purple-700 dark:bg-purple-900/40 dark:text-purple-200">
          <Trophy className="h-4 w-4" />
          Test Your Knowledge
        </div>

        <h1 className="font-semibold text-slate-900 dark:text-white">
          Practice Exams
        </h1>

        <p className="text-slate-600 dark:text-slate-200">
          Simulate the real Life in the UK test with full-length practice exams.
          Get instant results and detailed explanations for every question.
        </p>
      </div>

      {/* Readiness banner */}
      {history.length >= 1 && (
        <div
          className={`rounded-2xl border px-6 py-4 text-sm ${
            readiness.ready
              ? "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300"
              : "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300"
          }`}
        >
          {readiness.ready ? (
            <p className="font-semibold">
              You're consistently passing — you look ready for the real test!
            </p>
          ) : (
            <p>
              <span className="font-semibold">Keep going!</span> You've passed{" "}
              {readiness.passedCount} of your last {readiness.totalRecent} exam
              {readiness.totalRecent !== 1 ? "s" : ""}.
              {readiness.weakModules.length > 0 &&
                ` Focus on: ${readiness.weakModules.map(m => MODULE_LABELS[m] ?? m).join(", ")}.`}
            </p>
          )}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {/* Mock Exam 1 — Plus + Premium */}
        <ExamCard
          title="Mock Exam 1"
          description="Full practice test covering all topics. Same 24 questions every time — great for revision."
          hasAccess={hasPlus}
          examLink="/exam/take?type=static-1"
          badge={null}
          limitReached={plusLimitReached}
          examsThisMonth={examsThisMonth}
        />

        {/* Mock Exam 2 — Plus + Premium */}
        <ExamCard
          title="Mock Exam 2"
          description="A second fixed set of 24 questions. Perfect for checking your coverage after Exam 1."
          hasAccess={hasPlus}
          examLink="/exam/take?type=static-2"
          badge={null}
          limitReached={plusLimitReached}
          examsThisMonth={examsThisMonth}
        />

        {/* Dynamic Exam — Premium only */}
        <ExamCard
          title="Dynamic Exam"
          description="Unlimited randomised exams — different questions every time. Ideal for ongoing practice."
          hasAccess={hasPremium}
          examLink="/exam/take?type=dynamic"
          badge="Premium"
          lockedLabel="Premium only"
        />
      </div>

      {/* History strip */}
      {recentHistory.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Your Recent Exams
          </h2>
          <div className="flex flex-wrap gap-2">
            {recentHistory.map(a => {
              const pct = Math.round((a.correct / a.total) * 100);
              return (
                <div
                  key={a.id}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                    a.passed
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                  }`}
                  title={new Date(a.completedAt).toLocaleDateString()}
                >
                  {a.passed ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5" />
                  )}
                  {a.correct}/{a.total} · {pct}%
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-teal-50 to-teal-100 p-8 dark:border-slate-800 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-950">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Not ready for a full exam yet?
            </h3>
            <p className="text-slate-600 dark:text-slate-200">
              Keep practicing individual lessons and build your confidence first.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to="/content"
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-teal-600 bg-white px-6 py-3 font-semibold text-teal-700 transition-all hover:bg-teal-50 dark:border-teal-400 dark:bg-transparent dark:text-teal-100"
            >
              Study Lessons
            </Link>
            <Link
              to="/practice"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 px-6 py-3 font-semibold text-white transition-all hover:shadow-lg"
            >
              Practice Questions
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 font-semibold text-slate-900 dark:text-white">About the Exam</h2>

        <div className="space-y-4 text-slate-700 dark:text-slate-200">
          <p>
            The Life in the UK test consists of 24 multiple-choice questions about British
            traditions, history, and everyday life. You'll have 45 minutes to complete the test,
            and you need to answer at least 18 questions correctly (75%) to pass.
          </p>

          <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
            <h3 className="mb-2 font-semibold text-slate-900 dark:text-white">What to Expect:</h3>
            <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
              <li className="flex items-start gap-2">
                <span className="text-teal-600">•</span>
                <span>Mock Exam 1 and 2 use fixed question sets — same questions every time</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-600">•</span>
                <span>No negative marking — wrong answers don't reduce your score</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-600">•</span>
                <span>You can skip questions and come back to them later</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-600">•</span>
                <span>Instant results with detailed explanations for all questions</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExamCard({
  title,
  description,
  hasAccess,
  examLink,
  badge,
  lockedLabel,
  limitReached,
  examsThisMonth,
}: {
  title: string;
  description: string;
  hasAccess: boolean | null;
  examLink: string;
  badge: string | null;
  lockedLabel?: string;
  limitReached?: boolean;
  examsThisMonth?: number;
}) {
  const isDynamic = examLink.includes("dynamic");

  return (
    <div className="group relative overflow-hidden rounded-2xl border-2 border-slate-200 bg-white p-8 transition-all hover:border-purple-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 flex flex-col">
      {badge && !hasAccess && (
        <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-900/30 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
          <Lock className="h-3 w-3" />
          {badge}
        </div>
      )}

      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-400">
        {isDynamic ? (
          <Shuffle className="h-7 w-7 text-white" />
        ) : (
          <FileCheck className="h-7 w-7 text-white" />
        )}
      </div>

      <h3 className="mb-2 font-semibold text-slate-900 dark:text-white">{title}</h3>
      <p className="mb-6 text-sm text-slate-600 dark:text-slate-300 flex-1">{description}</p>

      <div className="mb-6 space-y-2 rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
        <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
          <Clock className="h-4 w-4 text-slate-500 dark:text-slate-300" />
          <span>45 minutes time limit</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
          <Target className="h-4 w-4 text-slate-500 dark:text-slate-300" />
          <span>18/24 questions needed to pass</span>
        </div>
      </div>

      {hasAccess && limitReached ? (
        <div className="mt-auto space-y-2">
          <div className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 px-6 py-3 font-semibold text-slate-400 dark:text-slate-500 cursor-not-allowed">
            {examsThisMonth}/2 used this month
          </div>
          <p className="text-center text-xs text-slate-400 dark:text-slate-500">
            Resets 1st of next month · <Link to="/paywall" className="text-teal-600 hover:underline dark:text-teal-400">Upgrade for unlimited</Link>
          </p>
        </div>
      ) : hasAccess ? (
        <Link
          to={examLink}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-500 hover:bg-purple-600 px-6 py-3 font-semibold text-white transition-all hover:shadow-lg mt-auto"
        >
          Start Exam
          <ArrowRight className="h-4 w-4" />
        </Link>
      ) : (
        <Link
          to="/paywall"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white transition-all hover:bg-slate-800 mt-auto dark:bg-gray-700 dark:hover:bg-gray-600"
        >
          {lockedLabel ? `Upgrade to unlock` : "Sign up to unlock"}
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
