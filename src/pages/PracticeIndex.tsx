import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Brain,
  CheckCircle2,
  Lock,
  Target,
  Zap,
} from "lucide-react";

import { getCurrentUser } from "../lib/auth";
import { hasAccessToModuleSync } from "../lib/access";
import { useSubscription } from "../lib/subscription";

import {
  getAllLessons,
  getLessonsForModule,
  getModules,
} from "../lib/content";
import { useProgress } from "../lib/progress";
import { usePageTitle } from '../hooks/usePageTitle';

type ProgressRecord = Record<string, { attempted: number; correct: number }>;

function getAccuracy(progress?: { attempted: number; correct: number }) {
  if (!progress || progress.attempted === 0) {
    return null;
  }

  return progress.correct / progress.attempted;
}

export default function PracticeIndex() {
  usePageTitle('Practice', 'Practice Life in the UK test questions lesson by lesson. Track your scores and improve your weakest topics.');
  const modules = useMemo(() => getModules(), []);
  const allLessons = useMemo(() => getAllLessons(), []);
  const [user, setUser] = useState<any>(null);
  const { tier } = useSubscription();

  useEffect(() => {
    getCurrentUser().then(setUser);
  }, []);

  const progressData = useProgress(user?.id);

  const lessonsWithQuestions = useMemo(
    () => allLessons.filter((lesson) => (lesson.questions?.length ?? 0) > 0),
    [allLessons]
  );

  const totalQuestions = lessonsWithQuestions.reduce(
    (sum, lesson) => sum + (lesson.questions?.length ?? 0),
    0
  );
  const attemptedQuestions = lessonsWithQuestions.reduce(
    (sum, lesson) => sum + (progressData[lesson.id]?.attempted ?? 0),
    0
  );
  const correctAnswers = lessonsWithQuestions.reduce(
    (sum, lesson) => sum + (progressData[lesson.id]?.correct ?? 0),
    0
  );

  const startedLessons = useMemo(
    () =>
      lessonsWithQuestions.filter((lesson) => {
        const progress = progressData[lesson.id];
        return progress && progress.attempted > 0;
      }).length,
    [lessonsWithQuestions, progressData]
  );

  const masteredLessons = useMemo(
    () =>
      lessonsWithQuestions.filter((lesson) => {
        const accuracy = getAccuracy(progressData[lesson.id]);
        return accuracy !== null && accuracy >= 0.8;
      }).length,
    [lessonsWithQuestions, progressData]
  );

  const questionCoveragePercent =
    totalQuestions > 0 ? Math.round((attemptedQuestions / totalQuestions) * 100) : 0;
  const overallAccuracyPercent =
    attemptedQuestions > 0 ? Math.round((correctAnswers / attemptedQuestions) * 100) : null;

  const nextLesson = useMemo(() => {
    if (lessonsWithQuestions.length === 0) {
      return null;
    }

    return (
      lessonsWithQuestions.find((lesson) => {
        const accuracy = getAccuracy(progressData[lesson.id]);
        if (accuracy === null) {
          return true;
        }
        return accuracy < 0.8;
      }) ?? lessonsWithQuestions[0]
    );
  }, [lessonsWithQuestions, progressData]);

  const moduleSummaries = useMemo(() => {
    return modules.map((module) => {
      const lessons = getLessonsForModule(module.slug);
      const lessonsWithPractice = lessons.filter(
        (lesson) => (lesson.questions?.length ?? 0) > 0
      );

      const hasPractice = lessonsWithPractice.length > 0;

      const started = lessonsWithPractice.filter((lesson) => {
        const progress = progressData[lesson.id];
        return progress && progress.attempted > 0;
      });

      const mastered = lessonsWithPractice.filter((lesson) => {
        const accuracy = getAccuracy(progressData[lesson.id]);
        return accuracy !== null && accuracy >= 0.8;
      });

      const totalModuleQuestions = lessonsWithPractice.reduce(
        (sum, lesson) => sum + (lesson.questions?.length ?? 0),
        0
      );
      const attemptedInModule = lessonsWithPractice.reduce(
        (sum, lesson) => sum + (progressData[lesson.id]?.attempted ?? 0),
        0
      );
      const correctInModule = lessonsWithPractice.reduce(
        (sum, lesson) => sum + (progressData[lesson.id]?.correct ?? 0),
        0
      );

      const coveragePercent =
        totalModuleQuestions > 0
          ? Math.round((attemptedInModule / totalModuleQuestions) * 100)
          : 0;
      const accuracyPercent =
        attemptedInModule > 0
          ? Math.round((correctInModule / attemptedInModule) * 100)
          : null;

      const nextUpLesson = lessonsWithPractice.find((lesson) => {
        const accuracy = getAccuracy(progressData[lesson.id]);
        if (accuracy === null) {
          return true;
        }
        return accuracy < 0.8;
      });

      let callToActionLabel: string | null = null;
      if (nextUpLesson) {
        const accuracy = getAccuracy(progressData[nextUpLesson.id]);
        callToActionLabel = accuracy === null ? "Begin practice" : "Continue practice";
      }

      return {
        module,
        lessons: lessonsWithPractice,
        hasPractice,
        startedCount: started.length,
        masteredCount: mastered.length,
        coveragePercent,
        accuracyPercent,
        nextUpLesson,
        totalQuestions: totalModuleQuestions,
        callToActionLabel,
      };
    });
  }, [modules, progressData]);

  return (
    <div className="min-h-screen bg-blue-50 pb-16 dark:bg-slate-950">
      <div className="mx-auto w-full max-w-6xl px-4 pt-10 sm:px-6 lg:px-8">
        <header className="rounded-3xl bg-blue-600 p-8 text-white shadow-lg">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.35em] text-blue-100">
                Practice dashboard
              </p>
              <h1 className="font-semibold">
                Track your quiz mastery across every module
              </h1>
              <p className="max-w-xl text-sm text-blue-50/90 md:text-base">
                See how many questions you&apos;ve attempted, where you&apos;re mastering the material,
                and jump straight into the next lesson that needs review.
              </p>
            </div>

            {nextLesson && (
              <Link
                to={`/practice/${nextLesson.id}/questions`}
                className="group inline-flex items-center gap-3 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-blue-700 shadow-md transition hover:text-blue-900"
              >
                <Brain className="h-5 w-5 text-blue-500" />
                <span>
                  Continue practice: <span className="font-semibold">{nextLesson.title}</span>
                </span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            )}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-white/15 p-5">
              <div className="flex items-center justify-between text-sm uppercase tracking-wider text-blue-100">
                <span>Questions attempted</span>
                <span>{attemptedQuestions}</span>
              </div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/30">
                <div
                  className="h-2 rounded-full bg-white"
                  style={{ width: `${questionCoveragePercent}%` }}
                />
              </div>
              <p className="mt-2 text-small text-sky-50/80">
                {totalQuestions} total questions available
              </p>
            </div>

            <div className="rounded-2xl bg-white/15 p-5">
              <div className="flex items-center justify-between text-sm uppercase tracking-wider text-blue-100">
                <span>Accuracy</span>
                <span>{overallAccuracyPercent !== null ? `${overallAccuracyPercent}%` : "—"}</span>
              </div>
              <div className="mt-3 flex items-center gap-2 text-small text-sky-50/80">
                <Target className="h-4 w-4" />
                <span>{correctAnswers} correct answers logged</span>
              </div>
            </div>

            <div className="rounded-2xl bg-white/15 p-5">
              <div className="flex items-center justify-between text-sm uppercase tracking-wider text-blue-100">
                <span>Lessons mastered</span>
                <span>
                  {masteredLessons}/{lessonsWithQuestions.length}
                </span>
              </div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/30">
                <div
                  className="h-2 rounded-full bg-white"
                  style={{
                    width:
                      lessonsWithQuestions.length > 0
                        ? `${Math.round((masteredLessons / lessonsWithQuestions.length) * 100)}%`
                        : "0%",
                  }}
                />
              </div>
              <p className="mt-2 text-small text-sky-50/80">Mastery is 80%+ accuracy</p>
            </div>
          </div>
        </header>

        <section className="mt-10 space-y-6">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <h2 className="font-semibold text-blue-900 dark:text-blue-100">Module progress</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {moduleSummaries.map((summary) => {
              const {
                module,
                coveragePercent,
                accuracyPercent,
                nextUpLesson,
                hasPractice,
              } = summary;

              const hasAccess = hasAccessToModuleSync(module.slug, user, tier);
              const isLocked = !hasAccess;

              return (
                <article
                  key={module.slug}
                  className={`group relative overflow-hidden rounded-3xl border bg-white p-6 shadow-sm transition hover:shadow-lg dark:bg-slate-900 dark:border-slate-800 dark:hover:shadow-gray-900/40 ${isLocked ? 'border-slate-200 opacity-75 dark:border-slate-800/70' : 'border-blue-100'}`}
                >
                  <div className={`absolute inset-x-0 top-0 h-1.5 ${isLocked ? 'bg-slate-300' : 'bg-blue-400'}`} />
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-small uppercase tracking-[0.35em] text-blue-400">
                            Module
                          </p>
                        </div>
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100">{module.title}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-300">
                          {hasPractice
                            ? `${summary.lessons.length} lessons · ${summary.totalQuestions} questions`
                            : "Practice questions coming soon"}
                        </p>
                      </div>
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${isLocked ? 'bg-slate-100 text-slate-400 dark:bg-slate-800/60 dark:text-slate-500' : 'bg-blue-50 text-blue-500 dark:bg-blue-900/20 dark:text-blue-300'}`}>
                        {isLocked ? <Lock className="h-6 w-6" /> : <Brain className="h-6 w-6" />}
                      </div>
                    </div>

                    {isLocked ? (
                      <div className="rounded-2xl bg-slate-50 p-6 dark:bg-slate-800">
                        <div className="text-center">
                          <Lock className="mx-auto mb-3 h-8 w-8 text-slate-400" />
                          <p className="text-slate-700 mb-2 dark:text-slate-200">Module Locked</p>
                          <p className="text-sm text-slate-600 mb-4 dark:text-slate-300">
                            Sign up to access practice questions for this module
                          </p>
                          <Link
                            to="/paywall"
                            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                          >
                            Sign up to unlock
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    ) : hasPractice ? (
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between text-small uppercase tracking-wide text-blue-500 dark:text-blue-300">
                            <span>Question coverage</span>
                            <span>{coveragePercent}%</span>
                          </div>
                          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-blue-100 dark:bg-blue-900/30">
                            <div
                              className="h-2 rounded-full bg-blue-500"
                              style={{ width: `${coveragePercent}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between text-small uppercase tracking-wide text-blue-500 dark:text-blue-300">
                            <span>Accuracy</span>
                            <span>{accuracyPercent !== null ? `${accuracyPercent}%` : "—"}</span>
                          </div>
                          <div className="mt-2 flex items-center gap-2 text-small text-blue-500 dark:text-blue-300">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            <span>
                              {summary.masteredCount}/{summary.lessons.length} lessons mastered
                            </span>
                          </div>
                        </div>

                        <div className="mt-1 divide-y divide-blue-50 dark:divide-slate-800">
                          {summary.lessons.map(lesson => {
                            const acc = getAccuracy(progressData[lesson.id]);
                            const hasQs = (lesson.questions?.length ?? 0) > 0;
                            const hasFlashcards = (lesson.flashcards?.length ?? 0) > 0;
                            return (
                              <div key={lesson.id} className="flex items-center gap-2 py-2">
                                <div className={`h-2 w-2 flex-shrink-0 rounded-full ${
                                  acc === null ? 'bg-slate-200 dark:bg-slate-700' :
                                  acc >= 0.8   ? 'bg-green-500' :
                                  acc >= 0.6   ? 'bg-yellow-500' : 'bg-red-400'
                                }`} />
                                <span className="flex-1 min-w-0 truncate text-sm text-slate-700 dark:text-slate-200">
                                  {lesson.title}
                                </span>
                                <div className="flex gap-1.5 flex-shrink-0">
                                  {hasQs && (
                                    <Link
                                      to={`/practice/${lesson.id}/questions`}
                                      className="inline-flex items-center gap-1 rounded-lg bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-200 transition-colors dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
                                    >
                                      <Brain className="h-3 w-3" />
                                      <span className="hidden sm:inline">Questions</span>
                                    </Link>
                                  )}
                                  {hasFlashcards && (
                                    <Link
                                      to={`/practice/${lesson.id}/flashcards`}
                                      className="inline-flex items-center gap-1 rounded-lg bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-200 transition-colors dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-900/50"
                                    >
                                      <Zap className="h-3 w-3" />
                                      <span className="hidden sm:inline">Flashcards</span>
                                    </Link>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-2xl bg-blue-50 p-6 text-sm text-blue-700 dark:bg-blue-950 dark:text-blue-200">
                        <p className="text-blue-800 dark:text-blue-100">Practice sets in progress</p>
                        <p className="mt-2 text-blue-500 dark:text-blue-200">
                          We&apos;re preparing quizzes and flashcards for this module. Check back soon to train here.
                        </p>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
