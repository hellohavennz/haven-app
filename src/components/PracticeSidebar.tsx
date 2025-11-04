import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { getModules, getLessonsForModule } from "../lib/content";
import { getAllProgress } from "../lib/progress";
import { ChevronDown, ChevronRight, Trophy, Target, AlertCircle, Circle } from "lucide-react";

type ProgressData = Record<string, { attempted: number; correct: number }>;

export default function PracticeSidebar() {
  const location = useLocation();
  const modules = getModules();
  const [expandedModules, setExpandedModules] = useState<string[]>([modules[0]?.slug || ""]);
  const [progressData, setProgressData] = useState<ProgressData>({});

  useEffect(() => {
    // getAllProgress returns an object directly, not a Promise
    const progress = getAllProgress();
    setProgressData(progress);
  }, [location]);

  useEffect(() => {
    const currentLessonId = location.pathname.split('/')[2];
    if (currentLessonId) {
      modules.forEach(module => {
        const lessons = getLessonsForModule(module.slug);
        if (lessons.some(l => l.id === currentLessonId)) {
          setExpandedModules(prev => 
            prev.includes(module.slug) ? prev : [...prev, module.slug]
          );
        }
      });
    }
  }, [location, modules]);

  const toggleModule = (slug: string) => {
    setExpandedModules(prev =>
      prev.includes(slug)
        ? prev.filter(s => s !== slug)
        : [...prev, slug]
    );
  };

  const getProgressBadge = (lessonId: string) => {
    const progress = progressData[lessonId];
    if (!progress || progress.attempted === 0) {
      return { icon: <Circle className="text-gray-300" size={14} />, text: '—', color: 'text-gray-400' };
    }
    const percentage = Math.round((progress.correct / progress.attempted) * 100);
    if (percentage >= 80) {
      return { icon: <Trophy className="text-green-600" size={14} />, text: `${percentage}%`, color: 'text-green-600' };
    } else if (percentage >= 60) {
      return { icon: <Target className="text-amber-600" size={14} />, text: `${percentage}%`, color: 'text-amber-600' };
    } else {
      return { icon: <AlertCircle className="text-red-600" size={14} />, text: `${percentage}%`, color: 'text-red-600' };
    }
  };

  const totalLessons = modules.reduce((sum, m) => sum + m.count, 0);
  const masteredLessons = Object.keys(progressData).filter(id => {
    const p = progressData[id];
    return p && p.attempted > 0 && (p.correct / p.attempted) >= 0.8;
  }).length;

  return (
    <aside className="w-72 bg-white border-r border-gray-200 flex flex-col flex-shrink-0 overflow-hidden">
      {/* Header - Fixed */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
          Practice
        </h2>
      </div>

      {/* Scrollable Module List */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <nav className="p-2">
          {modules.map(module => {
            const lessons = getLessonsForModule(module.slug);
            const isExpanded = expandedModules.includes(module.slug);
            const masteredInModule = lessons.filter(l => {
              const p = progressData[l.id];
              return p && p.attempted > 0 && (p.correct / p.attempted) >= 0.8;
            }).length;

            return (
              <div key={module.slug} className="mb-1">
                <button
                  onClick={() => toggleModule(module.slug)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  {isExpanded ? (
                    <ChevronDown className="text-gray-400 flex-shrink-0" size={18} />
                  ) : (
                    <ChevronRight className="text-gray-400 flex-shrink-0" size={18} />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-gray-900 truncate">
                      {module.title}
                    </div>
                    <div className="text-xs text-gray-500">
                      {masteredInModule}/{module.count} mastered
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="ml-4 mt-1 space-y-0.5">
                    {lessons.map(lesson => {
                      const isActive = location.pathname.includes(lesson.id);
                      const badge = getProgressBadge(lesson.id);
                      
                      return (
                        <NavLink
                          key={lesson.id}
                          to={`/practice/${lesson.id}`}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                            isActive
                              ? 'bg-teal-50 text-teal-700 font-medium'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {badge.icon}
                          <span className="flex-1 truncate text-xs">{lesson.title}</span>
                          <span className={`text-xs font-bold ${badge.color}`}>{badge.text}</span>
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

      {/* Progress Summary - Fixed at bottom */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
        <div className="text-center mb-3">
          <div className="text-3xl font-black text-green-600 mb-1">{masteredLessons}</div>
          <p className="text-xs text-gray-600">Lessons Mastered (80%+)</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500">Out of {totalLessons} total lessons</p>
        </div>
      </div>
    </aside>
  );
}
