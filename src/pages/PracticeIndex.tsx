import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Brain,
  CheckCircle2,
  Circle,
  Target,
} from "lucide-react";

import {
  getAllLessons,
  getLessonsForModule,
  getModules,
} from "../lib/content";
import { getAllProgress } from "../lib/progress";

type ProgressRecord = Record<string, { attempted: number; correct: number }>;

function getAccuracy(progress?: { attempted: number; correct: number }) {
  if (!progress || progress.attempted === 0) {
    return null;
  }

  return progress.correct / progress.attempted;
}

export default function PracticeIndex() {
  const modules = useMemo(() => getModules(), []);
  const allLessons = useMemo(() => getAllLessons(), []);
  const [progressData, setProgressData] = useState<ProgressRecord>({});

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const syncProgress = () => {
      try {
        setProgressData(getAllProgress());
      } catch (error) {
        console.error("Failed to read practice progress", error);
      }
    };

    syncProgress();

    const handleStorage = (event: StorageEvent) => {
      if (event.key === "lesson-progress") {
        syncProgress();
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

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

  const completedLessons = useMemo(
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

      const completed = lessonsWithPractice.filter((lesson) => {
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
        completedCount: completed.length,
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
    <div className="min-h-screen bg-slate-50 pb-16">
      <div className="mx-auto w-full max-w-6xl px-4 pt-10 sm:px-6 lg:px-8">
        <header className="rounded-3xl bg-gradient-to-r from-sky-500 via-indigo-500 to-cyan-500 p-8 text-white shadow-lg">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <p className="text-sm font-medium uppercase tracking-[0.35em] text-sky-100">
                Practice dashboard
              </p>
              <h1 className="text-3xl font-bold md:text-4xl">
                Track your quiz progress across every module
              </h1>
              <p className="max-w-xl text-sm text-sky-50/90 md:text-base">
                See how many questions you&apos;ve attempted, how consistent your answers are,
                Track your quiz mastery across every module
              </h1>
              <p className="max-w-xl text-sm text-sky-50/90 md:text-base">
                See how many questions you&apos;ve attempted, where you&apos;re mastering the material,
                and jump straight into the next lesson that needs review.
              </p>
            </div>

            {nextLesson && (
              <Link
                to={`/practice/${nextLesson.id}`}
                className="group inline-flex items-center gap-3 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-indigo-700 shadow-md transition hover:text-sky-700"
              >
                <Brain className="h-5 w-5 text-sky-500" />
                <span>
                  Continue practice: <span className="font-bold">{nextLesson.title}</span>
                </span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            )}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-white/15 p-5">
              <div className="flex items-center justify-between text-sm uppercase tracking-wider text-sky-100">
                <span>Questions attempted</span>
                <span>{attemptedQuestions}</span>
              </div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/30">
                <div
                  className="h-2 rounded-full bg-white"
                  style={{ width: `${questionCoveragePercent}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-sky-50/80">
                {totalQuestions} total questions available
              </p>
            </div>

            <div className="rounded-2xl bg-white/15 p-5">
              <div className="flex items-center justify-between text-sm uppercase tracking-wider text-sky-100">
                <span>Accuracy</span>
                <span>{overallAccuracyPercent !== null ? `${overallAccuracyPercent}%` : "—"}</span>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-sky-50/80">
                <Target className="h-4 w-4" />
                <span>{correctAnswers} correct answers logged</span>
              </div>
            </div>

            <div className="rounded-2xl bg-white/15 p-5">
              <div className="flex items-center justify-between text-sm uppercase tracking-wider text-sky-100">
                <span>Lessons completed</span>
                <span>
                  {completedLessons}/{lessonsWithQuestions.length}
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
                        ? `${Math.round((completedLessons / lessonsWithQuestions.length) * 100)}%`
                        ? `${Math.round((masteredLessons / lessonsWithQuestions.length) * 100)}%`
                        : "0%",
                  }}
                />
              </div>
              <p className="mt-2 text-xs text-sky-50/80">Completion is 80%+ accuracy</p>
              <p className="mt-2 text-xs text-sky-50/80">Mastery is 80%+ accuracy</p>
            </div>
          </div>
        </header>

        <section className="mt-10 space-y-6">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-5 w-5 text-indigo-500" />
            <h2 className="text-lg font-semibold text-slate-800">Module progress</h2>
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

              return (
                <article
                  key={module.slug}
                  className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-lg"
                >
                  <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-sky-400 via-indigo-400 to-cyan-400" />
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
                          Module
                        </p>
                        <h3 className="text-xl font-semibold text-slate-900">{module.title}</h3>
                        <p className="text-sm text-slate-500">
                          {hasPractice
                            ? `${summary.lessons.length} lessons · ${summary.totalQuestions} questions`
                            : "Practice questions coming soon"}
                        </p>
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                        <Brain className="h-6 w-6" />
                      </div>
                    </div>

                    {hasPractice ? (
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-500">
                            <span>Question coverage</span>
                            <span>{coveragePercent}%</span>
                          </div>
                          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-2 rounded-full bg-gradient-to-r from-sky-500 to-cyan-500"
                              style={{ width: `${coveragePercent}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-500">
                            <span>Accuracy</span>
                            <span>{accuracyPercent !== null ? `${accuracyPercent}%` : "—"}</span>
                          </div>
                          <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            <span>
                              {summary.completedCount}/{summary.lessons.length} lessons completed
                              {summary.masteredCount}/{summary.lessons.length} lessons mastered
                            </span>
                          </div>
                        </div>

                        <div className="rounded-2xl bg-slate-50 p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Next focus
                          </p>
                          <div className="mt-1 flex items-start gap-2 text-sm text-slate-700">
                            {nextUpLesson ? (
                              <>
                                <Circle className="mt-0.5 h-3 w-3 flex-shrink-0 text-slate-400" />
                                <span>{nextUpLesson.title}</span>
                              </>
                            ) : (
                              <span>All practice in this module completed 🎉</span>
                              <span>All practice in this module mastered 🎉</span>
                            )}
                          </div>

                          <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-wide">
                            <span className="rounded-full bg-slate-200 px-3 py-1 text-slate-700">
                              {summary.startedCount} started
                            </span>
                            <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">
                              {summary.completedCount} completed
                              {summary.masteredCount} mastered
                            </span>
                          </div>

                          {nextUpLesson && summary.callToActionLabel && (
                            <Link
                              to={`/practice/${nextUpLesson.id}`}
                              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 transition hover:text-sky-600"
                            >
                              {summary.callToActionLabel}
                              <ArrowRight className="h-4 w-4" />
                            </Link>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-2xl bg-slate-50 p-6 text-sm text-slate-600">
                        <p className="font-semibold text-slate-700">Practice sets in progress</p>
                        <p className="mt-2 text-slate-500">
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
