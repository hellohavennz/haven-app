import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Circle,
  Lock,
  Sparkles,
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

type ProgressRecord = Record<string, { attempted: number; correct: number; read?: boolean }>;

function getAccuracy(progress?: { attempted: number; correct: number }) {
  if (!progress || progress.attempted === 0) {
    return null;
  }

  return progress.correct / progress.attempted;
}

export default function ContentIndex() {
  usePageTitle('Study');
  const modules = useMemo(() => getModules(), []);
  const allLessons = useMemo(() => getAllLessons(), []);
  const [user, setUser] = useState<any>(null);
  const { tier } = useSubscription();

  useEffect(() => {
    getCurrentUser().then(setUser);
  }, []);

  const progressData = useProgress(user?.id);

  const totalLessons = allLessons.length;

  const startedLessons = useMemo(
    () =>
      allLessons.filter((lesson) => {
        const progress = progressData[lesson.id];
        return progress && (progress.attempted > 0 || progress.read === true);
      }).length,
    [allLessons, progressData]
  );

  const masteredLessons = useMemo(
    () =>
      allLessons.filter((lesson) => {
        const accuracy = getAccuracy(progressData[lesson.id]);
        return accuracy !== null && accuracy >= 0.8;
      }).length,
    [allLessons, progressData]
  );

  const overallProgressPercent =
    totalLessons > 0 ? Math.round((startedLessons / totalLessons) * 100) : 0;
  const overallMasteryPercent =
    totalLessons > 0 ? Math.round((masteredLessons / totalLessons) * 100) : 0;

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
        return progress && (progress.attempted > 0 || progress.read === true);
      });

      const mastered = lessons.filter((lesson) => {
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

      const startedPercent =
        lessons.length > 0
          ? Math.round((started.length / lessons.length) * 100)
          : 0;
      const masteredPercent =
        lessons.length > 0
          ? Math.round((mastered.length / lessons.length) * 100)
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
        masteredCount: mastered.length,
        startedPercent,
        masteredPercent,
        nextUpLesson,
        callToActionLabel,
      };
    });
  }, [modules, progressData]);

  return (
    <div className="min-h-screen bg-slate-50 pb-16 text-slate-900 transition-colors dark:bg-gray-950 dark:text-slate-100">
      <div className="mx-auto w-full max-w-6xl px-4 pt-10 sm:px-6 lg:px-8">
        <header className="rounded-3xl bg-gradient-to-r from-teal-500 via-teal-600 to-emerald-500 p-8 text-white shadow-lg dark:from-teal-600 dark:via-emerald-700 dark:to-emerald-800">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.35em] text-teal-100">
                Study dashboard
              </p>
              <h1 className="font-semibold">
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
                  Continue: <span className="font-semibold">{nextLesson.title}</span>
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
                <span>Lessons mastered</span>
                <span>
                  {masteredLessons}/{totalLessons}
                </span>
              </div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/30">
                <div
                  className="h-2 rounded-full bg-emerald-200"
                  style={{ width: `${overallMasteryPercent}%` }}
                />
              </div>
            </div>
          </div>
        </header>

        <section className="mt-10">
          <div className="mb-6 flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-teal-600" />
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">
              Explore modules
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {moduleSummaries.map(({
              module,
              lessons,
              startedCount,
              masteredCount,
              startedPercent,
              masteredPercent,
              nextUpLesson,
              callToActionLabel,
            }) => {
              // FIXED: Use sync version with user object
              const hasAccess = hasAccessToModuleSync(module.slug, user, tier);
              const isLocked = !hasAccess;

              return (
              <div
                key={module.slug}
                className={`flex h-full flex-col justify-between rounded-3xl border bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:bg-gray-900/70 dark:shadow-gray-900/30 ${
                  isLocked
                    ? 'border-gray-200 opacity-75 dark:border-gray-800'
                    : 'border-gray-100 dark:border-gray-800'
                }`}
              >
                <div className="space-y-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-small uppercase tracking-[0.35em] text-teal-500">
                          Module {module.order + 1}
                        </p>
                        {isLocked && (
                          <Lock className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                        )}
                      </div>
                      <h3 className="mt-2 font-semibold text-gray-900 dark:text-gray-100">
                        {module.title}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {lessons.length} lesson{lessons.length === 1 ? "" : "s"}
                      </p>
                    </div>
                    <div
                      className={`rounded-full p-3 ${
                        isLocked
                          ? 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'
                          : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-200'
                      }`}
                    >
                      {isLocked ? <Lock className="h-5 w-5" /> : <BarChart3 className="h-5 w-5" />}
                    </div>
                  </div>

                  <div>
                    <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                      <div
                        className="absolute left-0 top-0 h-full bg-teal-200"
                        style={{ width: `${startedPercent}%` }}
                      />
                      <div
                        className="absolute left-0 top-0 h-full bg-emerald-500"
                        style={{ width: `${masteredPercent}%` }}
                      />
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
                      <span>
                        Started {startedCount}/{lessons.length}
                      </span>
                      <span>
                        Mastered {masteredCount}/{lessons.length}
                      </span>
                    </div>
                  </div>

                  {nextUpLesson && (
                    <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-800">
                      <p className="text-small uppercase tracking-widest text-gray-500 dark:text-gray-400">
                        Next up
                      </p>
                      <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                        {nextUpLesson.title}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-small font-medium text-gray-500 dark:text-gray-300">
                        <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 shadow-sm dark:bg-gray-900">
                          <Circle className="h-3 w-3" />
                          {startedCount === 0 ? "Not started" : "Keep going"}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 shadow-sm dark:bg-gray-900">
                          <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                          {masteredCount} mastered
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex items-center justify-between">
                  {isLocked ? (
                    <Link
                      to="/paywall"
                      className="group inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition hover:text-teal-600 dark:text-gray-300"
                    >
                      <Lock className="h-4 w-4" />
                      Sign up to unlock
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  ) : nextUpLesson ? (
                    <Link
                      to={`/content/${nextUpLesson.id}`}
                      className="group inline-flex items-center gap-2 text-sm font-semibold text-teal-600 transition hover:text-emerald-600 dark:text-emerald-400"
                    >
                      {callToActionLabel}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  ) : (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Lessons coming soon
                    </span>
                  )}

                  <span className="text-small uppercase tracking-widest text-gray-400 dark:text-gray-500">
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
