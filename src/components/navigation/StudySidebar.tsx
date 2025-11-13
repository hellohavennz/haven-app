import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Lock,
  Trophy
} from "lucide-react";
import { getLessonsForModule, getModules } from "../../lib/content";
import { getAllProgress } from "../../lib/progress";
import { getCurrentUser } from "../../lib/auth";
import { hasAccessToModule } from "../../lib/access";

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
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    getCurrentUser().then(setUser);
  }, []);

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
        badge: "New",
        badgeClass: "bg-gray-100 text-gray-600"
      };
    }

    const accuracy = Math.round((progress.correct / progress.attempted) * 100);

    if (accuracy >= 80) {
      return {
        badge: `${accuracy}%`,
        badgeClass: "bg-emerald-100 text-emerald-700"
      };
    }

    return {
      badge: `${accuracy}%`,
      badgeClass: "bg-amber-100 text-amber-700"
    };
  };

  return (
    <aside
      aria-label="Study navigation"
      className={`h-screen w-72 flex-shrink-0 overflow-y-auto border-r border-[var(--divider)] bg-[var(--bg-section)] text-[var(--text-secondary)] md:sticky md:top-0 scrollbar-hide ${className}`}`
      style={{
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}
    >
      <div className="space-y-6 p-4 pb-32">
        <div className="rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 p-5 text-white shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
              <Trophy className="h-5 w-5" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{masteredLessons}</div>
              <div className="text-xs text-teal-100">Mastered</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-teal-100">
              <span>Progress</span>
              <span>{journeyPercent}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/25">
              <div
                className="h-1.5 rounded-full bg-white transition-all"
                style={{ width: `${journeyPercent}%` }}
              />
            </div>
          </div>
        </div>

        <nav className="space-y-1">
          {modules.map((module) => {
            const lessons = getLessonsForModule(module.slug);
            const isExpanded = expandedModule === module.slug;
            const hasAccess = hasAccessToModule(module.slug, user);
            const isLocked = !hasAccess;

            const masteredInModule = lessons.filter((lesson) => {
              const progress = progressData[lesson.id];
              if (!progress || progress.attempted === 0) return false;
              return progress.correct / progress.attempted >= 0.8;
            }).length;

            return (
              <div key={module.slug}>
                <button
                  onClick={() => !isLocked && toggleModule(module.slug)}
                  className={`group w-full rounded-lg px-3 py-2.5 text-left transition-colors ${
                    isLocked
                      ? "cursor-not-allowed opacity-60"
                      : isExpanded
                      ? "bg-[var(--bg-section-alt)] text-[var(--text-primary)]"
                      : "hover:bg-[var(--bg-section-alt)]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isLocked ? (
                      <Lock className="h-4 w-4 flex-shrink-0 text-[var(--text-secondary)]" />
                    ) : isExpanded ? (
                      <ChevronDown
                        className="h-4 w-4 flex-shrink-0"
                        style={{ color: "color-mix(in srgb, #14b8a6 70%, var(--text-primary) 30%)" }}
                      />
                    ) : (
                      <ChevronRight className="h-4 w-4 flex-shrink-0 text-[var(--text-secondary)]" />
                    )}
                    <BookOpen
                      className="h-4 w-4 flex-shrink-0"
                      style={{
                        color: isLocked
                          ? 'var(--text-secondary)'
                          : "color-mix(in srgb, #14b8a6 70%, var(--text-primary) 30%)"
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="truncate text-sm font-semibold text-[var(--text-primary)]">{module.title}</div>
                      <div className="text-xs">
                        {isLocked ? 'Locked' : `${masteredInModule}/${lessons.length} completed`}
                      </div>
                    </div>
                  </div>
                </button>

                {isExpanded && !isLocked && (
                  <div className="mt-1 space-y-0.5 pl-3">
                    {lessons.map((lesson) => {
                      const active = isActiveLesson(lesson.id);
                      const status = getLessonStatus(lesson.id);

                      return (
                        <Link
                          key={lesson.id}
                          to={`/content/${lesson.id}`}
                          className={`group flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                            active
                              ? "bg-[var(--bg-section-alt)] font-medium text-[var(--text-primary)]"
                              : "hover:bg-[var(--bg-section-alt)]"
                          }`}
                          onClick={onNavigate}
                        >
                          <span
                            className="flex-shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold"
                            style={{
                              backgroundColor: status.badgeClass.includes('emerald')
                                ? 'color-mix(in srgb, #10b981 18%, var(--bg))'
                                : status.badgeClass.includes('amber')
                                ? 'color-mix(in srgb, #f59e0b 18%, var(--bg))'
                                : 'color-mix(in srgb, var(--text-secondary) 20%, var(--bg))',
                              color: status.badgeClass.includes('emerald')
                                ? 'color-mix(in srgb, #10b981 70%, var(--text-primary) 30%)'
                                : status.badgeClass.includes('amber')
                                ? 'color-mix(in srgb, #f59e0b 70%, var(--text-primary) 30%)'
                                : 'var(--text-secondary)'
                            }}
                          >
                            {status.badge}
                          </span>
                          <span className="flex-1 truncate">{lesson.title}</span>
                          {status.badge !== "New" && (
                            <CheckCircle2
                              className="h-3.5 w-3.5 flex-shrink-0"
                              style={{ color: "color-mix(in srgb, #10b981 70%, var(--text-primary) 30%)" }}
                            />
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
