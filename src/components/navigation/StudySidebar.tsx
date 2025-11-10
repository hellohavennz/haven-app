import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  Clock,
  Trophy
} from "lucide-react";
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
  const [expandedModules, setExpandedModules] = useState<string[]>([modules[0]?.slug || ""]);
  const [progressData, setProgressData] = useState<ProgressRecord>({});

  const totalLessons = modules.reduce((sum, module) => sum + module.count, 0);
  const startedLessons = useMemo(
    () => Object.values(progressData).filter(progress => progress.attempted > 0).length,
    [progressData]
  );
  const masteredLessons = useMemo(
    () =>
      Object.values(progressData).filter(progress => {
        if (!progress || progress.attempted === 0) return false;
        return progress.correct / progress.attempted >= 0.8;
      }).length,
    [progressData]
  );
  const journeyPercent = totalLessons > 0 ? Math.round((startedLessons / totalLessons) * 100) : 0;
  const masteryPercent = totalLessons > 0 ? Math.round((masteredLessons / totalLessons) * 100) : 0;

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
        setExpandedModules((prev) =>
          prev.includes(module.slug) ? prev : [...prev, module.slug]
        );
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
    setExpandedModules((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const isActiveLesson = (lessonId: string) => location.pathname.includes(lessonId);

  const getLessonStatus = (lessonId: string) => {
    const progress = progressData[lessonId];

    if (!progress || progress.attempted === 0) {
      return {
        label: "Ready to begin",
        badge: "Start",
        badgeClass: "bg-gray-200 text-gray-700",
        iconBg: "bg-gray-100 text-gray-400",
        icon: <Circle className="h-4 w-4" />
      };
    }

    const accuracy = Math.round((progress.correct / progress.attempted) * 100);

    if (accuracy >= 80) {
      return {
        label: "Mastered",
        badge: `${accuracy}%`,
        badgeClass: "bg-emerald-100 text-emerald-700",
        iconBg: "bg-emerald-100 text-emerald-600",
        icon: <CheckCircle2 className="h-4 w-4" />
      };
    }

    if (accuracy >= 50) {
      return {
        label: "In progress",
        badge: `${accuracy}%`,
        badgeClass: "bg-amber-100 text-amber-700",
        iconBg: "bg-amber-100 text-amber-600",
        icon: <Clock className="h-4 w-4" />
      };
    }

    return {
      label: "Keep practicing",
      badge: `${accuracy}%`,
      badgeClass: "bg-rose-100 text-rose-700",
      iconBg: "bg-rose-100 text-rose-600",
      icon: <AlertTriangle className="h-4 w-4" />
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
              <p className="mt-2 text-3xl font-bold leading-tight">{masteredLessons}</p>
              <p className="text-sm text-teal-100">Lessons mastered</p>
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
              <span>Mastery</span>
              <span>{masteryPercent}%</span>
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
                const isExpanded = expandedModules.includes(module.slug);

                const startedInModule = lessons.filter((lesson) => {
                  const progress = progressData[lesson.id];
                  return progress && progress.attempted > 0;
                }).length;

                const masteredInModule = lessons.filter((lesson) => {
                  const progress = progressData[lesson.id];
                  if (!progress || progress.attempted === 0) return false;
                  return progress.correct / progress.attempted >= 0.8;
                }).length;

                const moduleProgress = lessons.length > 0
                  ? Math.round((startedInModule / lessons.length) * 100)
                  : 0;

                return (
                  <div key={module.slug} className="space-y-2">
                    <button
                      onClick={() => toggleModule(module.slug)}
                      className={`group relative flex w-full items-stretch overflow-hidden rounded-2xl border transition-all duration-200 ${
                        isExpanded
                          ? "border-teal-500/50 bg-gradient-to-r from-teal-500 via-teal-500 to-emerald-500 text-white shadow-lg"
                          : "border-gray-200 bg-white hover:border-teal-200 hover:bg-teal-50/70 hover:shadow"
                      }`}
                    >
                      <div className="flex w-full items-center gap-3 px-4 py-3">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 flex-shrink-0 text-white" />
                        ) : (
                          <ChevronRight className="h-4 w-4 flex-shrink-0 text-teal-500" />
                        )}
                        <div
                          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${
                            isExpanded ? "bg-white/15 text-white" : "bg-teal-100 text-teal-600"
                          }`}
                        >
                          <BookOpen className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div
                            className={`truncate text-sm font-semibold ${
                              isExpanded ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {module.title}
                          </div>
                          <div
                            className={`mt-1 flex flex-wrap items-center gap-2 text-xs ${
                              isExpanded ? "text-teal-50/80" : "text-gray-500"
                            }`}
                          >
                            <span>{module.count} lessons</span>
                            <span>• {masteredInModule} mastered</span>
                          </div>
                          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/25">
                            <div
                              className={`h-1.5 rounded-full ${isExpanded ? "bg-white" : "bg-teal-500"}`}
                              style={{ width: `${moduleProgress}%` }}
                            />
                          </div>
                        </div>
                        <span
                          className={`self-start rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                            isExpanded ? "bg-white/15 text-white" : "bg-teal-100 text-teal-700"
                          }`}
                        >
                          {moduleProgress}%
                        </span>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="space-y-1.5 rounded-2xl bg-gray-50/80 p-3">
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
                              <div className="flex items-start gap-3">
                                <div
                                  className={`mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${status.iconBg}`}
                                >
                                  {status.icon}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className={`truncate font-semibold ${active ? "text-teal-800" : "text-gray-900"}`}>
                                    {lesson.title}
                                  </p>
                                  <p className="text-xs text-gray-500">{status.label}</p>
                                </div>
                                <span
                                  className={`mt-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${status.badgeClass}`}
                                >
                                  {status.badge}
                                </span>
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
