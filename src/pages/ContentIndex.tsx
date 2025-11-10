import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Sparkles } from "lucide-react";

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

export default function ContentIndex() {
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
        console.error("Failed to read lesson progress", error);
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

  const totalLessons = allLessons.length;
  const startedLessons = useMemo(
    () =>
      allLessons.filter((lesson) => {
        const progress = progressData[lesson.id];
        return progress && progress.attempted > 0;
      }).length,
    [allLessons, progressData]
  );

  const completedLessons = useMemo(
    () =>
      allLessons.filter((lesson) => {
        const accuracy = getAccuracy(progressData[lesson.id]);
        return accuracy !== null && accuracy >= 0.8;
      }).length,
    [allLessons, progressData]
  );

  const overallProgressPercent =
    totalLessons > 0 ? Math.round((startedLessons / totalLessons) * 100) : 0;
  const overallCompletionPercent =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const nextLesson = useMemo(() => {
    return (
      allLessons.find((lesson) => {
        const accuracy = getAccuracy(progressData[lesson.id]);
        if (accuracy === null) {
          return true;
        }

        return accuracy < 0.8;
      }) ?? allLessons[0]
    );
  }, [allLessons, progressData]);

  const moduleSummaries = useMemo(() => {
    return modules.map((module) => {
      const lessons = getLessonsForModule(module.slug);
      const started = lessons.filter((lesson) => {
        const progress = progressData[lesson.id];
        return progress && progress.attempted > 0;
      });

      const completed = lessons.filter((lesson) => {
        const accuracy = getAccuracy(progressData[lesson.id]);
        return accuracy !== null && accuracy >= 0.8;
      });

      const inProgressLesson = lessons.find((lesson) => {
        const accuracy = getAccuracy(progressData[lesson.id]);
        return accuracy !== null && accuracy < 0.8;
      });

      const unstartedLesson = lessons.find((lesson) => {
        const progress = progressData[lesson.id];
        return !progress || progress.attempted === 0;
      });

      const nextUpLesson = inProgressLesson ?? unstartedLesson ?? lessons[0];

      const completedPercent =
        lessons.length > 0
          ? Math.round((completed.length / lessons.length) * 100)
          : 0;

      let callToActionLabel = "View lessons";
      if (nextUpLesson) {
        const accuracy = getAccuracy(progressData[nextUpLesson.id]);
        callToActionLabel =
          accuracy === null ? "Begin lesson" : "Continue lesson";
      }

      return {
        module,
        lessons,
        startedCount: started.length,
        completedCount: completed.length,
        completedPercent,
        nextUpLesson,
        callToActionLabel,
      };
    });
  }, [modules, progressData]);

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <div className="mx-auto w-full max-w-6xl px-4 pt-10 sm:px-6 lg:px-8">
        <header className="rounded-3xl bg-gradient-to-r from-teal-500 via-teal-600 to-emerald-500 p-8 text-white shadow-lg">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <p className="text-sm font-medium uppercase tracking-[0.35em] text-teal-100">
                Study dashboard
              </p>
              <h1 className="text-3xl font-bold md:text-4xl">
                Map your progress through the handbook
              </h1>
              <p className="max-w-xl text-sm text-teal-50/90 md:text-base">
                Track how you&apos;re moving through each module and jump back into the next lesson whenever you&apos;re ready.
              </p>
            </div>

            {nextLesson && (
              <Link
                to={`/content/${nextLesson.id}`}
                className="group inline-flex items-center gap-3 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-teal-700 shadow-md transition hover:text-emerald-600"
              >
                <Sparkles className="h-5 w-5 text-emerald-500" />
                <span>
                  Continue: <span className="font-bold">{nextLesson.title}</span>
                </span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            )}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-white/15 p-5">
              <div className="flex items-center justify-between text-sm uppercase tracking-wider text-teal-100">
                <span>Lessons started</span>
                <span>
                  {startedLessons}/{totalLessons}
                </span>
              </div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/30">
                <div
                  className="h-2 rounded-full bg-white"
                  style={{ width: `${overallProgressPercent}%` }}
                />
              </div>
            </div>

            <div className="rounded-2xl bg-white/15 p-5">
              <div className="flex items-center justify-between text-sm uppercase tracking-wider text-teal-100">
                <span>Lessons completed</span>
                <span>
                  {completedLessons}/{totalLessons}
                </span>
              </div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/30">
                <div
                  className="h-2 rounded-full bg-emerald-200"
                  style={{ width: `${overallCompletionPercent}%` }}
                />
              </div>
            </div>
          </div>
        </header>

        <section className="mt-10">
          <div className="mb-6 flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-teal-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Explore modules
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {moduleSummaries.map(({
              module,
              lessons,
              startedCount,
              completedCount,
              completedPercent,
              nextUpLesson,
              callToActionLabel,
            }) => {
              const inProgressCount = Math.max(startedCount - completedCount, 0);

              return (
                <div
                  key={module.slug}
                  className="flex h-full flex-col justify-between rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-teal-500">
                        Module {module.order + 1}
                      </p>
                      <h3 className="text-xl font-bold text-gray-900">
                        {module.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {lessons.length} lesson{lessons.length === 1 ? "" : "s"}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs uppercase tracking-wide text-gray-500">
                        <span>Completion</span>
                        <span>{completedPercent}%</span>
                      </div>
                      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-teal-400 to-emerald-500"
                          style={{ width: `${completedPercent}%` }}
                        />
                      </div>
                      <p className="mt-2 text-sm text-gray-600">
                        {completedCount}/{lessons.length} completed
                        {inProgressCount > 0 && ` · ${inProgressCount} in progress`}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    {nextUpLesson ? (
                      <Link
                        to={`/content/${nextUpLesson.id}`}
                        className="group inline-flex items-center gap-2 text-sm font-semibold text-teal-600 transition hover:text-emerald-600"
                      >
                        {callToActionLabel}
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    ) : (
                      <span className="text-sm text-gray-500">Lessons coming soon</span>
                    )}

                    <span className="text-xs uppercase tracking-widest text-gray-400">
                      Module {module.order + 1}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
