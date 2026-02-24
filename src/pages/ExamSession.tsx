import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  RotateCcw,
  Trophy,
  ChevronDown,
  ChevronUp,
  Dumbbell,
} from "lucide-react";
import {
  selectExamQuestions,
  saveExamAttempt,
  getExamHistory,
  syncExamHistory,
  getReadinessStatus,
} from "../lib/examUtils";
import { useSubscription } from "../lib/subscription";
import type { ExamQuestion, ExamAttempt } from "../types";

const TOTAL_QUESTIONS = 24;
const PASS_THRESHOLD = 18;
const EXAM_DURATION = 45 * 60; // 45 minutes in seconds
const WARN_AT = 5 * 60;       // warn when 5 minutes remain

type Phase = "ready" | "in-progress" | "results";
type ExamMode = "strict" | "relaxed";

const MODULE_LABELS: Record<string, string> = {
  "values-and-principles": "Values & Principles",
  "what-is-uk": "What is the UK?",
  history: "History",
  "modern-society": "Modern Society",
  "government-law-role": "Government, Law & Role",
};

const MODULE_LESSON_MAP: Record<string, string> = {
  "values-and-principles": "lesson-1.3-values-principles",
  "what-is-uk": "lesson-2.2-what-is-uk",
  history: "lesson-3.5-middle-ages",
  "modern-society": "lesson-4.2-arts-culture",
  "government-law-role": "lesson-5.2-democracy-constitution",
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function ExamSession() {
  const navigate = useNavigate();
  const { tier, isLoading: subLoading } = useSubscription();
  const hasAccess = tier === "plus" || tier === "premium";

  const [phase, setPhase] = useState<Phase>("ready");
  const [mode, setMode] = useState<ExamMode>("strict");
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(
    Array(TOTAL_QUESTIONS).fill(null)
  );
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION);
  const [startTime, setStartTime] = useState<number>(0);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [timesUp, setTimesUp] = useState(false);
  const [attempt, setAttempt] = useState<ExamAttempt | null>(null);
  const [finalQuestions, setFinalQuestions] = useState<ExamQuestion[]>([]);
  const [finalAnswers, setFinalAnswers] = useState<(number | null)[]>([]);
  const [history, setHistory] = useState<ExamAttempt[]>([]);
  const [showReview, setShowReview] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Seed from localStorage immediately, then merge with Supabase
    setHistory(getExamHistory());
    syncExamHistory().then(setHistory).catch(() => {});
  }, []);

  // Scroll to top on question change or phase change
  useEffect(() => {
    if (scrollRef.current) {
      const main = scrollRef.current.closest("main");
      if (main) main.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentIdx, phase]);

  // Timer
  useEffect(() => {
    if (phase !== "in-progress") return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          if (mode === "strict") {
            handleSubmit(true);
          } else {
            setTimesUp(true);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, mode]);

  function startExam() {
    const qs = selectExamQuestions();
    setQuestions(qs);
    setAnswers(Array(qs.length).fill(null));
    setCurrentIdx(0);
    setTimeLeft(EXAM_DURATION);
    setTimesUp(false);
    setStartTime(Date.now());
    setShowReview(false);
    setPhase("in-progress");
  }

  function selectAnswer(idx: number) {
    setAnswers(prev => {
      const updated = [...prev];
      updated[currentIdx] = idx;
      return updated;
    });
  }

  function handleSubmit(auto = false) {
    if (timerRef.current) clearInterval(timerRef.current);

    const unanswered = answers.filter(a => a === null).length;
    if (!auto && unanswered > 0 && !showSubmitDialog) {
      setShowSubmitDialog(true);
      return;
    }

    setShowSubmitDialog(false);
    finishExam();
  }

  function finishExam() {
    const durationSeconds = Math.round((Date.now() - startTime) / 1000);

    const moduleScores: Record<string, { correct: number; total: number }> = {};
    questions.forEach((q, i) => {
      const mod = q.moduleSlug;
      if (!moduleScores[mod]) moduleScores[mod] = { correct: 0, total: 0 };
      moduleScores[mod].total++;
      if (answers[i] === q.correct_index) moduleScores[mod].correct++;
    });

    const correct = questions.filter((q, i) => answers[i] === q.correct_index).length;
    const passed = correct >= PASS_THRESHOLD;

    const newAttempt: ExamAttempt = {
      id: crypto.randomUUID(),
      completedAt: new Date().toISOString(),
      correct,
      total: TOTAL_QUESTIONS,
      passed,
      durationSeconds,
      moduleScores,
    };

    // Snapshot questions+answers so review is stable even after re-exam
    setFinalQuestions([...questions]);
    setFinalAnswers([...answers]);
    saveExamAttempt(newAttempt);
    setAttempt(newAttempt);
    setHistory(prev => [newAttempt, ...prev]);
    setPhase("results");
  }

  const answeredCount = answers.filter(a => a !== null).length;
  const unansweredCount = TOTAL_QUESTIONS - answeredCount;
  const isWarning = timeLeft <= WARN_AT && timeLeft > 0;
  const currentQ = questions[currentIdx];

  // ── PAYWALL ──────────────────────────────────────────────────────────────
  if (!subLoading && !hasAccess) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center space-y-6">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/40">
          <Trophy className="h-10 w-10 text-purple-600 dark:text-purple-300" />
        </div>
        <h1 className="font-semibold text-gray-900 dark:text-white">
          Unlock Mock Exams
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Full mock exams are available on Plus and Premium plans. Upgrade to
          simulate the real Life in the UK test with timed, weighted questions.
        </p>
        <Link
          to="/paywall"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 px-8 py-4 font-semibold text-white transition-all hover:shadow-lg"
        >
          Upgrade to Unlock
        </Link>
        <div>
          <button
            onClick={() => navigate("/exam")}
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ← Back to Exams
          </button>
        </div>
      </div>
    );
  }

  // ── READY SCREEN ─────────────────────────────────────────────────────────
  if (phase === "ready") {
    return (
      <div ref={scrollRef} className="mx-auto max-w-2xl space-y-8 px-4 py-10">
        <div className="space-y-3 text-center">
          <h1 className="font-semibold text-gray-900 dark:text-white">Mock Exam</h1>
          <p className="text-gray-600 dark:text-gray-300">
            24 questions · 45 minutes · 75% to pass (18/24)
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          {[
            { label: "Questions", value: "24" },
            { label: "Time Limit", value: "45 min" },
            { label: "Pass Mark", value: "75%" },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {value}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
            </div>
          ))}
        </div>

        {/* Mode selection */}
        <div className="space-y-3">
          <p className="font-semibold text-gray-900 dark:text-white">Choose exam mode</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <button
              onClick={() => setMode("strict")}
              className={`rounded-xl border-2 p-5 text-left transition-all ${
                mode === "strict"
                  ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                  : "border-gray-200 bg-white hover:border-purple-300 dark:border-gray-700 dark:bg-gray-900"
              }`}
            >
              <div className="mb-1 font-semibold text-gray-900 dark:text-white">
                Strict Mode
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Auto-submits when 45 minutes expires. Real exam simulation.
              </p>
            </button>
            <button
              onClick={() => setMode("relaxed")}
              className={`rounded-xl border-2 p-5 text-left transition-all ${
                mode === "relaxed"
                  ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20"
                  : "border-gray-200 bg-white hover:border-teal-300 dark:border-gray-700 dark:bg-gray-900"
              }`}
            >
              <div className="mb-1 font-semibold text-gray-900 dark:text-white">
                Relaxed Mode
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Warns when 5 minutes remain but never auto-submits. Finish at
                your own pace.
              </p>
            </button>
          </div>
        </div>

        <button
          onClick={startExam}
          className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 py-4 font-semibold text-white transition-all hover:shadow-lg"
        >
          Start Exam
        </button>

        <div className="text-center">
          <button
            onClick={() => navigate("/exam")}
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ← Back to Exams
          </button>
        </div>
      </div>
    );
  }

  // ── IN-PROGRESS SCREEN ───────────────────────────────────────────────────
  if (phase === "in-progress" && currentQ) {
    const selectedAnswer = answers[currentIdx];

    return (
      <div ref={scrollRef} className="mx-auto max-w-2xl space-y-6 px-4 py-6">
        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Question {currentIdx + 1} of {questions.length}
            </span>
            {/* Timer */}
            <div
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${
                timesUp
                  ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                  : isWarning
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                  : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200"
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              {timesUp ? "Time's up" : formatTime(timeLeft)}
            </div>
          </div>

          {/* Time's up banner (relaxed mode) */}
          {timesUp && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300">
              Time's up — finish when ready and click Submit.
            </div>
          )}

          {/* Warning banner */}
          {isWarning && !timesUp && (
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300">
              <AlertTriangle className="inline h-4 w-4 mr-1" />
              Under 5 minutes remaining!
            </div>
          )}

          {/* Progress dots */}
          <div className="flex flex-wrap gap-1.5">
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIdx(i)}
                className={`h-3 w-3 rounded-full transition-all ${
                  i === currentIdx ? "ring-2 ring-purple-500 ring-offset-1" : ""
                } ${
                  answers[i] !== null
                    ? "bg-purple-500"
                    : "bg-gray-200 dark:bg-gray-700"
                }`}
                title={`Question ${i + 1}${answers[i] !== null ? " (answered)" : ""}`}
              />
            ))}
          </div>
        </div>

        {/* Question card */}
        <div className="rounded-2xl border-2 border-gray-200 bg-white p-6 space-y-5 dark:border-gray-800 dark:bg-gray-900">
          <p className="leading-relaxed text-gray-900 dark:text-gray-100">
            {currentQ.prompt}
          </p>
          <ul className="space-y-3">
            {currentQ.options.map((opt, i) => (
              <li key={i}>
                <button
                  onClick={() => selectAnswer(i)}
                  className={`w-full rounded-xl border-2 p-4 text-left font-medium transition-all ${
                    selectedAnswer === i
                      ? "border-purple-500 bg-purple-50 text-purple-900 dark:bg-purple-900/20 dark:text-purple-100"
                      : "border-gray-200 hover:border-purple-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                  }`}
                >
                  {opt}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentIdx(i => Math.max(0, i - 1))}
            disabled={currentIdx === 0}
            className="flex items-center gap-1 rounded-xl border-2 border-gray-200 px-4 py-3 font-semibold text-gray-700 transition-all hover:bg-gray-50 disabled:opacity-40 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            <ChevronLeft className="h-4 w-4" />
            Prev
          </button>

          {currentIdx < questions.length - 1 ? (
            <button
              onClick={() => setCurrentIdx(i => Math.min(questions.length - 1, i + 1))}
              className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-gray-900 px-4 py-3 font-semibold text-white transition-all hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={() => handleSubmit(false)}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-3 font-semibold text-white transition-all hover:shadow-lg"
            >
              Submit Exam
            </button>
          )}

          {currentIdx < questions.length - 1 && (
            <button
              onClick={() => handleSubmit(false)}
              className="rounded-xl border-2 border-purple-300 px-4 py-3 text-sm font-semibold text-purple-700 transition-all hover:bg-purple-50 dark:border-purple-700 dark:text-purple-300 dark:hover:bg-purple-900/20"
            >
              Submit
            </button>
          )}
        </div>

        {/* Progress stat */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          {answeredCount} of {questions.length} answered
        </p>

        {/* Submit confirmation dialog */}
        {showSubmitDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 space-y-4 shadow-2xl dark:bg-gray-900">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-amber-500 flex-shrink-0" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {unansweredCount} question{unansweredCount !== 1 ? "s" : ""} unanswered
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                You have {unansweredCount} unanswered question
                {unansweredCount !== 1 ? "s" : ""}. Unanswered questions will be
                marked incorrect.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSubmitDialog(false)}
                  className="flex-1 rounded-xl border-2 border-gray-200 py-3 font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200"
                >
                  Go Back
                </button>
                <button
                  onClick={() => finishExam()}
                  className="flex-1 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 py-3 font-semibold text-white hover:shadow-md"
                >
                  Submit Anyway
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── RESULTS SCREEN ───────────────────────────────────────────────────────
  if (phase === "results" && attempt) {
    const pct = Math.round((attempt.correct / attempt.total) * 100);
    const readiness = getReadinessStatus(history);
    const mins = Math.floor(attempt.durationSeconds / 60);
    const secs = attempt.durationSeconds % 60;

    return (
      <div ref={scrollRef} className="mx-auto max-w-2xl space-y-8 px-4 py-10">
        {/* Score circle */}
        <div className="text-center space-y-4">
          <div
            className={`mx-auto flex h-28 w-28 items-center justify-center rounded-full border-4 ${
              attempt.passed
                ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                : "border-red-400 bg-red-50 dark:bg-red-900/20"
            }`}
          >
            <div>
              <div
                className={`text-3xl font-bold ${
                  attempt.passed
                    ? "text-green-700 dark:text-green-300"
                    : "text-red-600 dark:text-red-300"
                }`}
              >
                {attempt.correct}/{attempt.total}
              </div>
              <div
                className={`text-sm font-semibold ${
                  attempt.passed ? "text-green-600" : "text-red-500"
                }`}
              >
                {pct}%
              </div>
            </div>
          </div>

          <div
            className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-lg font-bold ${
              attempt.passed
                ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200"
                : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200"
            }`}
          >
            {attempt.passed ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <XCircle className="h-5 w-5" />
            )}
            {attempt.passed ? "PASS" : "FAIL"}
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Time taken: {mins}m {secs.toString().padStart(2, "0")}s
          </p>
        </div>

        {/* Readiness message */}
        {readiness.totalRecent >= 1 && (
          <div
            className={`rounded-xl p-4 text-sm ${
              readiness.ready
                ? "bg-green-50 border border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300"
                : "bg-amber-50 border border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300"
            }`}
          >
            {readiness.ready
              ? `You've passed ${readiness.passedCount} of your last ${readiness.totalRecent} exams — you're ready for the real test!`
              : `${readiness.passedCount} of your last ${readiness.totalRecent} exam${readiness.totalRecent !== 1 ? "s" : ""} passed. Keep practising to build confidence.`}
          </div>
        )}

        {/* Module breakdown */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-4 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            Module Breakdown
          </h2>
          <div className="space-y-3">
            {Object.entries(attempt.moduleScores).map(([mod, score]) => {
              const modPct = Math.round((score.correct / score.total) * 100);
              const isWeak = modPct < 60;
              return (
                <div key={mod} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-200">
                      {MODULE_LABELS[mod] ?? mod}
                    </span>
                    <span
                      className={`font-semibold ${
                        modPct >= 75
                          ? "text-green-600 dark:text-green-400"
                          : isWeak
                          ? "text-red-600 dark:text-red-400"
                          : "text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {score.correct}/{score.total} ({modPct}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div
                      className={`h-2 rounded-full ${
                        modPct >= 75
                          ? "bg-green-500"
                          : isWeak
                          ? "bg-red-400"
                          : "bg-amber-400"
                      }`}
                      style={{ width: `${modPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Weak areas */}
        {readiness.weakModules.length > 0 && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 space-y-3 dark:border-amber-800 dark:bg-amber-900/10">
            <h2 className="font-semibold text-amber-900 dark:text-amber-300">
              Weak Areas to Study
            </h2>
            <p className="text-sm text-amber-800 dark:text-amber-400">
              You're averaging below 60% in these modules across recent exams:
            </p>
            <ul className="space-y-2">
              {readiness.weakModules.map(mod => (
                <li key={mod} className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-amber-900 dark:text-amber-300 min-w-0">
                    {MODULE_LABELS[mod] ?? mod}
                  </span>
                  <Link
                    to={`/content/${MODULE_LESSON_MAP[mod] ?? ""}`}
                    className="rounded-lg bg-white border border-amber-300 px-3 py-1 text-xs font-semibold text-amber-800 hover:bg-amber-50 dark:bg-gray-900 dark:border-amber-700 dark:text-amber-300"
                  >
                    <BookOpen className="inline h-3 w-3 mr-1" />
                    Study
                  </Link>
                  <Link
                    to={`/practice/${MODULE_LESSON_MAP[mod] ?? ""}/questions`}
                    className="rounded-lg bg-white border border-amber-300 px-3 py-1 text-xs font-semibold text-amber-800 hover:bg-amber-50 dark:bg-gray-900 dark:border-amber-700 dark:text-amber-300"
                  >
                    Practice
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Question review */}
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
          <button
            onClick={() => setShowReview(v => !v)}
            className="flex w-full items-center justify-between p-6 text-left"
          >
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">
                Review All Answers
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {attempt.correct} correct · {attempt.total - attempt.correct} incorrect
              </p>
            </div>
            {showReview ? (
              <ChevronUp className="h-5 w-5 text-gray-400 flex-shrink-0" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
            )}
          </button>

          {showReview && (
            <div className="border-t border-gray-100 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
              {finalQuestions.map((q, qi) => {
                const userAnswer = finalAnswers[qi];
                const isCorrect = userAnswer === q.correct_index;
                const wasSkipped = userAnswer === null;

                return (
                  <div key={qi} className="p-5 space-y-3">
                    {/* Question header */}
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          wasSkipped
                            ? "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                            : isCorrect
                            ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                            : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                        }`}
                      >
                        {qi + 1}
                      </div>
                      <p className="text-sm leading-relaxed text-gray-900 dark:text-gray-100">
                        {q.prompt}
                      </p>
                    </div>

                    {/* Options */}
                    <div className="ml-9 space-y-2">
                      {q.options.map((opt, oi) => {
                        const isCorrectOpt = oi === q.correct_index;
                        const isUserPick = oi === userAnswer;
                        return (
                          <div
                            key={oi}
                            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                              isCorrectOpt
                                ? "bg-green-50 text-green-900 border border-green-200 dark:bg-green-900/20 dark:text-green-200 dark:border-green-800"
                                : isUserPick && !isCorrectOpt
                                ? "bg-red-50 text-red-900 border border-red-200 dark:bg-red-900/20 dark:text-red-200 dark:border-red-800"
                                : "text-gray-600 dark:text-gray-400"
                            }`}
                          >
                            {isCorrectOpt ? (
                              <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400" />
                            ) : isUserPick ? (
                              <XCircle className="h-4 w-4 flex-shrink-0 text-red-500" />
                            ) : (
                              <span className="h-4 w-4 flex-shrink-0" />
                            )}
                            {opt}
                            {isCorrectOpt && isUserPick && (
                              <span className="ml-auto text-xs font-semibold text-green-700 dark:text-green-400">
                                Your answer ✓
                              </span>
                            )}
                            {isUserPick && !isCorrectOpt && (
                              <span className="ml-auto text-xs font-semibold text-red-600 dark:text-red-400">
                                Your answer
                              </span>
                            )}
                          </div>
                        );
                      })}

                      {wasSkipped && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 italic">
                          Not answered
                        </p>
                      )}

                      {/* Explanation */}
                      {q.explanation && (
                        <div className="mt-1 rounded-lg bg-blue-50 border border-blue-100 px-3 py-2 text-xs leading-relaxed text-blue-900 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200">
                          <span className="font-semibold">Explanation: </span>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* History strip */}
        <HistoryStrip history={history} />

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={() => {
              setPhase("ready");
              setAttempt(null);
            }}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 py-4 font-semibold text-white transition-all hover:shadow-lg"
          >
            <RotateCcw className="h-5 w-5" />
            Take Another Exam
          </button>
          {finalQuestions.filter((q, i) => finalAnswers[i] !== q.correct_index).length > 0 && (
            <button
              onClick={() => {
                const wrongQuestions = finalQuestions.filter(
                  (q, i) => finalAnswers[i] !== q.correct_index
                );
                navigate("/exam/drill", { state: { questions: wrongQuestions } });
              }}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-purple-400 bg-white py-4 font-semibold text-purple-700 transition-all hover:bg-purple-50 dark:bg-transparent dark:text-purple-300 dark:border-purple-700"
            >
              <Dumbbell className="h-5 w-5" />
              Drill Wrong Answers ({finalQuestions.filter((q, i) => finalAnswers[i] !== q.correct_index).length})
            </button>
          )}
          {readiness.weakModules.length > 0 && (
            <Link
              to={`/content/${MODULE_LESSON_MAP[readiness.weakModules[0]] ?? ""}`}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-amber-400 bg-white py-4 font-semibold text-amber-800 transition-all hover:bg-amber-50 dark:bg-transparent dark:text-amber-300 dark:border-amber-700"
            >
              <BookOpen className="h-5 w-5" />
              Study Weak Areas
            </Link>
          )}
        </div>
      </div>
    );
  }

  return null;
}

// ── History strip component ───────────────────────────────────────────────
function HistoryStrip({ history }: { history: ExamAttempt[] }) {
  const recent = history.slice(0, 5);
  if (recent.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
        Recent Exams
      </p>
      <div className="flex flex-wrap gap-2">
        {recent.map(a => {
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
  );
}
