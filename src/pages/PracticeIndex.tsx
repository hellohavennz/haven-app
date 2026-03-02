import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Brain,
  CheckCircle2,
  Circle,
  Lock,
  Target,
} from "lucide-react";

import { getCurrentUser } from "../lib/auth";
import { hasAccessToModule } from "../lib/access";

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
    <div className="min-h-screen bg-slate-50 pb-16 dark:bg-slate-950">
      <div className="mx-auto w-full max-w-6xl px-4 pt-10 sm:px-6 lg:px-8">
        <header className="rounded-3xl bg-slate-600 p-8 text-white shadow-lg">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.35em] text-slate-200">
                Practice dashboard
              </p>
              <h1 className="font-semibold">
                Track your quiz mastery across every module
              </h1>
              <p className="max-w-xl text-sm text-slate-100/90 md:text-base">
                See how many questions you&apos;ve attempted, where you&apos;re mastering the material,
                and jump straight into the next lesson that needs review.
              </p>
            </div>

            {nextLesson && (
              <Link
                to={`/practice/${nextLesson.id}`}
                className="group inline-flex items-center gap-3 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-md transition hover:text-slate-900"
              >
                <Brain className="h-5 w-5 text-slate-500" />
                <span>
                  Continue practice: <span className="font-semibold">{nextLesson.title}</span>
                </span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            )}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-white/15 p-5">
              <div className="flex items-center justify-between text-sm uppercase tracking-wider text-slate-200">
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
              <div className="flex items-center justify-between text-sm uppercase tracking-wider text-slate-200">
                <span>Accuracy</span>
                <span>{overallAccuracyPercent !== null ? `${overallAccuracyPercent}%` : "—"}</span>
              </div>
              <div className="mt-3 flex items-center gap-2 text-small text-sky-50/80">
                <Target className="h-4 w-4" />
                <span>{correctAnswers} correct answers logged</span>
              </div>
            </div>

            <div className="rounded-2xl bg-white/15 p-5">
              <div className="flex items-center justify-between text-sm uppercase tracking-wider text-slate-200">
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
            <BarChart3 className="h-5 w-5 text-sky-600" />
            <h2 className="font-semibold text-slate-800 dark:text-slate-100">Module progress</h2>
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

              const hasAccess = hasAccessToModule(module.slug, user);
              const isLocked = !hasAccess;

              return (
                <article
                  key={module.slug}
                  className={`group relative overflow-hidden rounded-3xl border bg-white p-6 shadow-sm transition hover:shadow-lg dark:bg-gray-900 dark:border-gray-800 dark:hover:shadow-gray-900/40 ${isLocked ? 'border-gray-200 opacity-75 dark:border-gray-800/70' : 'border-slate-200'}`}
                >
                  <div className={`absolute inset-x-0 top-0 h-1.5 ${isLocked ? 'bg-gray-300' : 'bg-slate-400'}`} />
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-small uppercase tracking-[0.35em] text-slate-400">
                            Module
                          </p>
                          {isLocked && <Lock className="h-3 w-3 text-gray-400" />}
                        </div>
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100">{module.title}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-300">
                          {hasPractice
                            ? `${summary.lessons.length} lessons · ${summary.totalQuestions} questions`
                            : "Practice questions coming soon"}
                        </p>
                      </div>
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${isLocked ? 'bg-gray-100 text-gray-400 dark:bg-gray-800/60 dark:text-gray-500' : 'bg-slate-100 text-slate-500 dark:bg-gray-800 dark:text-slate-200'}`}>
                        {isLocked ? <Lock className="h-6 w-6" /> : <Brain className="h-6 w-6" />}
                      </div>
                    </div>

                    {isLocked ? (
                      <div className="rounded-2xl bg-gray-50 p-6 dark:bg-gray-800">
                        <div className="text-center">
                          <Lock className="mx-auto mb-3 h-8 w-8 text-gray-400" />
                          <p className="text-gray-700 mb-2 dark:text-gray-200">Module Locked</p>
                          <p className="text-sm text-gray-600 mb-4 dark:text-gray-300">
                            Sign up to access practice questions for this module
                          </p>
                          <Link
                            to="/paywall"
                            className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800"
                          >
                            Sign up to unlock
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    ) : hasPractice ? (
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between text-small uppercase tracking-wide text-slate-500 dark:text-slate-300">
                            <span>Question coverage</span>
                            <span>{coveragePercent}%</span>
                          </div>
                          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                            <div
                              className="h-2 rounded-full bg-slate-600"
                              style={{ width: `${coveragePercent}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between text-small uppercase tracking-wide text-slate-500 dark:text-slate-300">
                            <span>Accuracy</span>
                            <span>{accuracyPercent !== null ? `${accuracyPercent}%` : "—"}</span>
                          </div>
                          <div className="mt-2 flex items-center gap-2 text-small text-slate-500 dark:text-slate-300">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            <span>
                              {summary.masteredCount}/{summary.lessons.length} lessons mastered
                            </span>
                          </div>
                        </div>

                        <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
                          <p className="text-small uppercase tracking-wide text-slate-500 dark:text-slate-300">
                            Next focus
                          </p>
                          <div className="mt-1 flex items-start gap-2 text-sm text-slate-700 dark:text-slate-200">
                            {nextUpLesson ? (
                              <>
                                <Circle className="mt-0.5 h-3 w-3 flex-shrink-0 text-slate-400" />
                                <span>{nextUpLesson.title}</span>
                              </>
                            ) : (
                              <span>All practice in this module mastered 🎉</span>
                            )}
                          </div>

                          <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-wide">
                            <span className="rounded-full bg-slate-200 px-3 py-1 text-slate-700 dark:bg-slate-800 dark:text-slate-100">
                              {summary.startedCount} started
                            </span>
                            <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700 dark:bg-emerald-200/20 dark:text-emerald-300">
                              {summary.masteredCount} mastered
                            </span>
                          </div>

                          {nextUpLesson && summary.callToActionLabel && (
                            <Link
                              to={`/practice/${nextUpLesson.id}`}
                              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-sky-600 transition hover:text-cyan-600 dark:text-sky-300 dark:hover:text-cyan-300"
                            >
                              {summary.callToActionLabel}
                              <ArrowRight className="h-4 w-4" />
                            </Link>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-2xl bg-slate-50 p-6 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                        <p className="text-slate-700 dark:text-slate-100">Practice sets in progress</p>
                        <p className="mt-2 text-slate-500 dark:text-slate-300">
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
