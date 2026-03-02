import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Brain,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Lock,
  Target,
} from "lucide-react";

import { getLessonsForModule, getModules } from "../lib/content";
import { useProgress } from "../lib/progress";
import { getCurrentUser } from "../lib/auth";
import { hasAccessToModule } from "../lib/access";

type ProgressRecord = Record<string, { attempted: number; correct: number }>;

type PracticeSidebarProps = {
  className?: string;
  onNavigate?: () => void;
};

export default function PracticeSidebar({
  className = "",
  onNavigate,
}: PracticeSidebarProps = {}) {
  const location = useLocation();
  const modules = useMemo(() => getModules(), []);
  const [expandedModule, setExpandedModule] = useState<string | null>(
    modules[0]?.slug ?? null
  );
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    getCurrentUser().then(setUser);
  }, []);

  const progressData = useProgress(user?.id);

  const totalLessons = modules.reduce((sum, module) => sum + module.count, 0);

  const startedLessons = useMemo(
    () =>
      Object.values(progressData).filter((record) => record.attempted > 0).length,
    [progressData]
  );

  const masteredLessons = useMemo(
    () =>
      Object.values(progressData).filter((record) => {
        if (!record || record.attempted === 0) return false;
        return record.correct / record.attempted >= 0.8;
      }).length,
    [progressData]
  );

  const coveragePercent =
    totalLessons > 0 ? Math.round((startedLessons / totalLessons) * 100) : 0;
  const masteryPercent =
    totalLessons > 0 ? Math.round((masteredLessons / totalLessons) * 100) : 0;

  const lastPathnameRef = useRef<string | null>(null);


  useEffect(() => {
    const pathname = location.pathname;
    if (lastPathnameRef.current === pathname) {
      return;
    }

    lastPathnameRef.current = pathname;

    const practiceMatch = pathname.match(/\/practice\/(.+?)(?:\/|$)/);
    const currentLessonId = practiceMatch?.[1];
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
    setExpandedModule((current) => (current === slug ? null : slug));
  };

  const getActiveLessonId = () => {
    const practiceMatch = location.pathname.match(/\/practice\/(.+?)(?:\/|$)/);
    return practiceMatch?.[1] ?? null;
  };

  const activeLessonId = getActiveLessonId();

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
      aria-label="Practice navigation"
      className={`h-screen w-72 flex-shrink-0 overflow-y-auto border-r border-blue-100 bg-white text-slate-900 md:sticky md:top-0 scrollbar-hide dark:border-gray-800 dark:bg-gray-900 dark:text-slate-100 ${className}`}
      style={{
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}
    >
      <div className="space-y-6 p-4 pb-32">
        <div className="rounded-2xl bg-blue-600 p-5 text-white shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
              <Target className="h-5 w-5" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-semibold">{masteredLessons}</div>
              <div className="text-small text-blue-100">Mastered</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-small text-blue-100">
              <span>Progress</span>
              <span>{coveragePercent}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/25">
              <div
                className="h-1.5 rounded-full bg-white transition-all"
                style={{ width: `${coveragePercent}%` }}
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
                      ? "bg-blue-50 text-blue-900 dark:bg-blue-900/20 dark:text-blue-100"
                      : "text-slate-700 hover:bg-blue-50 dark:text-slate-200 dark:hover:bg-blue-900/10"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isLocked ? (
                      <Lock className="h-4 w-4 flex-shrink-0 text-gray-400" />
                    ) : isExpanded ? (
                      <ChevronDown className="h-4 w-4 flex-shrink-0 text-blue-500" />
                    ) : (
                      <ChevronRight className="h-4 w-4 flex-shrink-0 text-blue-300" />
                    )}
                    <Brain className={`h-4 w-4 flex-shrink-0 ${isLocked ? 'text-gray-400' : 'text-blue-500'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">{module.title}</div>
                      <div className="text-small text-slate-500 dark:text-slate-300">
                        {isLocked ? 'Locked' : `${masteredInModule}/${lessons.length} completed`}
                      </div>
                    </div>
                  </div>
                </button>

                {isExpanded && !isLocked && (
                  <div className="mt-1 space-y-0.5 pl-3">
                    {lessons.map((lesson) => {
                      const status = getLessonStatus(lesson.id);
                      const active = activeLessonId === lesson.id;

                      return (
                        <NavLink
                          key={lesson.id}
                          to={`/practice/${lesson.id}`}
                          className={`group flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                            active
                              ? "bg-blue-100 font-medium text-blue-900 dark:bg-blue-900/30 dark:text-blue-100"
                              : "text-slate-700 hover:bg-blue-50 dark:text-slate-200 dark:hover:bg-blue-900/10"
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
                        </NavLink>
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
