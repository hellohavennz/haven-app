import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { BookOpen, ChevronDown, ChevronRight, Trophy } from "lucide-react";
import { getLessonsForModule, getModules } from "../../lib/content";
import { getAllProgress } from "../../lib/progress";

type StudySidebarProps = {
  className?: string;
  onNavigate?: () => void;
};

type ProgressRecord = Record<string, { attempted: number; correct: number }>;

export default function StudySidebar({ className = "", onNavigate }: StudySidebarProps) {
  const location = useLocation();
  const modules = useMemo(() => getModules(), []);
  const [expandedModule, setExpandedModule] = useState<string | null>(modules[0]?.slug ?? null);
  const [progressData, setProgressData] = useState<ProgressRecord>({});

  const totalLessons = modules.reduce((sum, module) => sum + module.count, 0);
  const startedLessons = useMemo(
    () => Object.values(progressData).filter(progress => progress.attempted > 0).length,
    [progressData]
  );
  const completedLessons = useMemo(
    () =>
      Object.values(progressData).filter(progress => {
        if (!progress || progress.attempted === 0) return false;
        return progress.correct / progress.attempted >= 0.8;
      }).length,
    [progressData]
  );
  const journeyPercent = totalLessons > 0 ? Math.round((startedLessons / totalLessons) * 100) : 0;
  const completionPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const lastPathnameRef = useRef<string | null>(null);

  useEffect(() => {
    const pathname = location.pathname;
    if (lastPathnameRef.current === pathname) {
      return;
    }

    lastPathnameRef.current = pathname;

    const currentLessonId = pathname.split("/content/")[1];
    if (!currentLessonId) {
      return;
    }

    modules.forEach((module) => {
      const lessons = getLessonsForModule(module.slug);
      if (lessons.some((lesson) => lesson.id === currentLessonId)) {
        setExpandedModule(module.slug);
      }
    });
  }, [location.pathname, modules]);

  useEffect(() => {
    try {
      const progress = getAllProgress();
      setProgressData(progress);
    } catch (error) {
      console.error("Failed to load lesson progress", error);
    }
  }, [location.pathname]);

  const toggleModule = (slug: string) => {
    setExpandedModule((current) => (current === slug ? null : slug));
  };

  const isActiveLesson = (lessonId: string) => location.pathname.includes(lessonId);

  const getLessonStatus = (lessonId: string) => {
    const progress = progressData[lessonId];

    if (!progress || progress.attempted === 0) {
      return {
        status: "Start",
        description: "Ready to begin",
        chipClass: "bg-gray-100 text-gray-700"
      };
    }

    const accuracy = Math.round((progress.correct / progress.attempted) * 100);

    if (accuracy >= 80) {
      return {
        status: "Completed",
        description: `${accuracy}% accuracy`,
        chipClass: "bg-emerald-100 text-emerald-700"
      };
    }

    return {
      status: "In progress",
      description: `${accuracy}% accuracy`,
      chipClass: "bg-amber-100 text-amber-700"
    };
  };

  return (
    <aside
      aria-label="Study navigation"
      className={`h-full w-72 flex-shrink-0 overflow-y-auto border-r border-gray-200 bg-white md:max-h-screen md:sticky md:top-0 ${className}`}
    >
      <div className="space-y-6 p-4">
        <div className="rounded-3xl bg-gradient-to-br from-teal-500 via-teal-600 to-emerald-500 p-5 text-white shadow-md">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-teal-100/80">Study Journey</p>
              <p className="mt-2 text-3xl font-bold leading-tight">{completedLessons}</p>
              <p className="text-sm text-teal-100">Lessons completed</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
              <Trophy className="h-6 w-6" />
            </div>
          </div>

          <div className="mt-4 space-y-3 text-sm text-teal-50/80">
            <div>
              <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-teal-100/90">
                <span>Started</span>
                <span>
                  {startedLessons}/{totalLessons}
                </span>
              </div>
              <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-white/25">
                <div
                  className="h-2 rounded-full bg-white"
                  style={{ width: `${journeyPercent}%` }}
                />
              </div>
            </div>
            <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-teal-100/80">
              <span>Completion</span>
              <span>{completionPercent}%</span>
            </div>
          </div>
        </div>

        <div>
          <h2 className="mb-3 flex items-center text-xs font-semibold uppercase tracking-[0.3em] text-gray-500">
            <BookOpen className="mr-2 h-4 w-4" />
            Study Content
          </h2>

          <nav className="space-y-2">
            {modules.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                <p className="text-sm">No lessons available yet</p>
              </div>
            ) : (
              modules.map((module) => {
                const lessons = getLessonsForModule(module.slug);
                const isExpanded = expandedModule === module.slug;

                const startedInModule = lessons.filter((lesson) => {
                  const progress = progressData[lesson.id];
                  return progress && progress.attempted > 0;
                }).length;

                const completedInModule = lessons.filter((lesson) => {
                  const progress = progressData[lesson.id];
                  if (!progress || progress.attempted === 0) return false;
                  return progress.correct / progress.attempted >= 0.8;
                }).length;

                const moduleProgress = lessons.length > 0
                  ? Math.round((completedInModule / lessons.length) * 100)
                  : 0;

                return (
                  <div key={module.slug} className="space-y-2">
                    <button
                      onClick={() => toggleModule(module.slug)}
                      className={`group relative w-full overflow-hidden rounded-2xl border transition-all duration-200 ${
                        isExpanded
                          ? "border-teal-400 bg-teal-50 text-teal-900 shadow-sm"
                          : "border-gray-200 bg-white hover:border-teal-200 hover:bg-teal-50"
                      }`}
                    >
                      <div className="flex items-start gap-3 px-4 py-3">
                        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-600">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-baseline gap-2">
                            <p className="truncate text-sm font-semibold text-gray-900">{module.title}</p>
                            <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[11px] font-semibold text-teal-700">
                              {moduleProgress}%
                            </span>
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                            <span>{module.count} lessons</span>
                            <span>• {completedInModule} completed</span>
                          </div>
                          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                            <div
                              className="h-1.5 rounded-full bg-teal-500"
                              style={{ width: `${moduleProgress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="space-y-1.5 rounded-2xl bg-gray-50 p-3">
                        {lessons.map((lesson) => {
                          const active = isActiveLesson(lesson.id);
                          const status = getLessonStatus(lesson.id);

                          return (
                            <Link
                              key={lesson.id}
                              to={`/content/${lesson.id}`}
                              className={`group relative block rounded-xl border px-3 py-3 text-sm transition-all ${
                                active
                                  ? "border-teal-300 bg-teal-50 text-teal-800 shadow-sm"
                                  : "border-transparent bg-white text-gray-700 hover:border-teal-200 hover:bg-teal-50"
                              }`}
                              onClick={onNavigate}
                            >
                              <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span
                                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${status.chipClass}`}
                                  >
                                    {status.status}
                                  </span>
                                  <p className={`min-w-0 flex-1 truncate font-semibold ${active ? "text-teal-800" : "text-gray-900"}`}>
                                    {lesson.title}
                                  </p>
                                </div>
                                <p className="text-xs text-gray-500">{status.description}</p>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </nav>
        </div>
      </div>
    </aside>
  );
}
