import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Lock,
  Trophy
} from "lucide-react";
import { getLessonsForModule, getModules } from "../../lib/content";
import { useProgress } from "../../lib/progress";
import { getCurrentUser } from "../../lib/auth";
import { hasAccessToModule } from "../../lib/access";

type StudySidebarProps = {
  className?: string;
  onNavigate?: () => void;
};

type ProgressRecord = Record<string, { attempted: number; correct: number }>;

export default function StudySidebar({ className = "", onNavigate }: StudySidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const modules = useMemo(() => getModules(), []);
  const [expandedModule, setExpandedModule] = useState<string | null>(modules[0]?.slug ?? null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    getCurrentUser().then(setUser);
  }, []);

  const progressData = useProgress(user?.id);

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


  const toggleModule = (slug: string) => {
    const isExpanding = expandedModule !== slug;
    setExpandedModule((current) => (current === slug ? null : slug));
    if (isExpanding) {
      const firstLesson = getLessonsForModule(slug)[0];
      if (firstLesson) {
        navigate(`/content/${firstLesson.id}`);
        onNavigate?.();
      }
    }
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
      className={`h-screen w-72 flex-shrink-0 overflow-y-auto border-r border-gray-200 bg-white text-gray-900 md:sticky md:top-0 scrollbar-hide dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100 ${className}`}
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
              <div className="text-2xl font-semibold">{masteredLessons}</div>
              <div className="text-small text-teal-100">Mastered</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-small text-teal-100">
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
                      ? "bg-teal-50 text-teal-900 dark:bg-teal-900/20 dark:text-teal-100"
                      : "text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isLocked ? (
                      <Lock className="h-4 w-4 flex-shrink-0 text-gray-400" />
                    ) : isExpanded ? (
                      <ChevronDown className="h-4 w-4 flex-shrink-0 text-teal-600" />
                    ) : (
                      <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-400" />
                    )}
                    <BookOpen className={`h-4 w-4 flex-shrink-0 ${isLocked ? 'text-gray-400' : 'text-teal-600'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">{module.title}</div>
                      <div className="text-small text-gray-500 dark:text-gray-300">
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
                              ? "bg-teal-100 font-medium text-teal-900 dark:bg-teal-900/30 dark:text-teal-100"
                              : "text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
                          }`}
                          onClick={onNavigate}
                        >
                          <span
                            className={`flex-shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold ${status.badgeClass}`}
                          >
                            {status.badge}
                          </span>
                          <span className="flex-1 truncate">{lesson.title}</span>
                          {status.badge !== "New" && (
                            <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0 text-emerald-600" />
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
