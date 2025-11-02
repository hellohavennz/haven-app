import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { getModules, getLessonsForModule } from "../lib/content";
import { getAllProgress } from "../lib/progress";
import { useSubscription } from "../lib/subscription";
import { ChevronDown, ChevronRight, CheckCircle2, AlertCircle, Circle, BarChart3, Lock } from "lucide-react";

type ProgressData = Record<string, { attempted: number; correct: number }>;

export default function Sidebar() {
  const location = useLocation();
  const modules = getModules();
  const [expandedModules, setExpandedModules] = useState<string[]>([modules[0]?.slug || ""]);
  const [progressData, setProgressData] = useState<ProgressData>({});
  const { hasPlus } = useSubscription();

  useEffect(() => {
    getAllProgress().then(setProgressData);
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

  const getLessonIcon = (lessonId: string, isPremiumLesson: boolean) => {
    if (isPremiumLesson && !hasPlus) {
      return <Lock className="text-gray-400" size={16} />;
    }
    
    const progress = progressData[lessonId];
    if (!progress || progress.attempted === 0) {
      return <Circle className="text-gray-300" size={16} />;
    }
    const percentage = (progress.correct / progress.attempted) * 100;
    if (percentage >= 80) {
      return <CheckCircle2 className="text-green-600" size={16} />;
    } else if (percentage < 60) {
      return <AlertCircle className="text-red-600" size={16} />;
    }
    return <Circle className="text-amber-500" size={16} />;
  };

  const totalLessons = modules.reduce((sum, m) => sum + m.count, 0);
  const completedLessons = Object.keys(progressData).length;
  const completionPercentage = totalLessons > 0 
    ? Math.round((completedLessons / totalLessons) * 100) 
    : 0;

  return (
    <aside className="w-72 bg-white border-r border-gray-200 flex flex-col flex-shrink-0 overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
          Study Content
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        <nav className="p-2">
          {modules.map(module => {
            const lessons = getLessonsForModule(module.slug);
            const isExpanded = expandedModules.includes(module.slug);
            const completedInModule = lessons.filter(l => progressData[l.id]?.attempted > 0).length;

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
                      {completedInModule}/{module.count} started
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="ml-4 mt-1 space-y-0.5">
                    {lessons.map(lesson => {
                      const isActive = location.pathname.includes(lesson.id);
                      const isLocked = lesson.isPremium && !hasPlus;
                      
                      return (
                        <NavLink
                          key={lesson.id}
                          to={`/content/${lesson.id}`}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                            isActive
                              ? 'bg-teal-50 text-teal-700 font-medium'
                              : isLocked
                              ? 'text-gray-400'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {getLessonIcon(lesson.id, lesson.isPremium || false)}
                          <span className="flex-1 truncate">{lesson.title}</span>
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

      <div className="p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-900">Your Progress</span>
          <span className="text-2xl font-bold text-teal-600">{completionPercentage}%</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
          <div
            className="h-2 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        <p className="text-xs text-gray-600 mb-3">
          {completedLessons} of {totalLessons} lessons started
        </p>
        <NavLink
          to="/dashboard"
          className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
        >
          <BarChart3 size={16} />
          View Dashboard
        </NavLink>
      </div>
    </aside>
  );
}
