import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { BookOpen, ChevronDown, ChevronRight } from "lucide-react";
import { getLessonsForModule, getModules } from "../../lib/content";

type StudySidebarProps = {
  className?: string;
  onNavigate?: () => void;
};

export default function StudySidebar({ className = "", onNavigate }: StudySidebarProps) {
  const location = useLocation();
  const modules = getModules();
  const [expandedModules, setExpandedModules] = useState<string[]>([modules[0]?.slug || ""]);

  useEffect(() => {
    const currentLessonId = location.pathname.split("/content/")[1];
    if (currentLessonId) {
      modules.forEach((module) => {
        const lessons = getLessonsForModule(module.slug);
        if (lessons.some((lesson) => lesson.id === currentLessonId)) {
          setExpandedModules((prev) =>
            prev.includes(module.slug) ? prev : [...prev, module.slug]
          );
        }
      });
    }
  }, [location, modules]);

  const toggleModule = (slug: string) => {
    setExpandedModules((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const isActiveLesson = (lessonId: string) => location.pathname.includes(lessonId);

  return (
    <aside
      aria-label="Study navigation"
      className={`h-full w-72 flex-shrink-0 overflow-y-auto border-r border-gray-200 bg-white md:max-h-screen md:sticky md:top-0 ${className}`}
    >
      <div className="p-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center">
          <BookOpen className="w-4 h-4 mr-2" />
          Study Content
        </h2>

        <nav className="space-y-1">
          {modules.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">No lessons available yet</p>
            </div>
          ) : (
            modules.map((module) => {
              const lessons = getLessonsForModule(module.slug);
              const isExpanded = expandedModules.includes(module.slug);

              return (
                <div key={module.slug}>
                  <button
                    onClick={() => toggleModule(module.slug)}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors hover:bg-teal-50"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {isExpanded ? (
                        <ChevronDown className="text-gray-400 flex-shrink-0" size={16} />
                      ) : (
                        <ChevronRight className="text-gray-400 flex-shrink-0" size={16} />
                      )}
                      <span className="font-semibold text-sm text-gray-900 truncate">
                        {module.title}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 ml-2">{module.count}</span>
                  </button>

                  {isExpanded && (
                    <div className="ml-4 mt-1 space-y-0.5">
                      {lessons.map((lesson) => {
                        const active = isActiveLesson(lesson.id);

                        return (
                          <Link
                            key={lesson.id}
                            to={`/content/${lesson.id}`}
                            className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                              active
                                ? "bg-teal-50 text-teal-700 font-medium"
                                : "text-gray-700 hover:bg-gray-50"
                            }`}
                            onClick={onNavigate}
                          >
                            <div className="flex items-center">
                              <span className="w-1.5 h-1.5 rounded-full bg-teal-600 mr-2 flex-shrink-0" />
                              <span className="truncate">{lesson.title}</span>
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
    </aside>
  );
}
