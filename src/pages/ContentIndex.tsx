import { useState } from "react";
import { Link } from "react-router-dom";
import { getModules, getLessonsForModule } from "../lib/content";
import { ChevronDown, ChevronRight, BookOpen, CheckCircle2 } from "lucide-react";

export default function ContentIndex() {
  const modules = getModules();
  const [expandedModules, setExpandedModules] = useState<string[]>([modules[0]?.slug || ""]);

  const toggleModule = (slug: string) => {
    setExpandedModules(prev =>
      prev.includes(slug)
        ? prev.filter(s => s !== slug)
        : [...prev, slug]
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 pb-32 md:pb-8">
      <div className="space-y-3">
        <h1 className="text-4xl font-bold text-gray-900">Study Content</h1>
        <p className="text-lg text-gray-600">
          Click each section to expand and see all lessons. Read the content first, then practice.
        </p>
      </div>

      <div className="space-y-3">
        {modules.map(module => {
          const lessons = getLessonsForModule(module.slug);
          const isExpanded = expandedModules.includes(module.slug);

          return (
            <div
              key={module.slug}
              className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:border-teal-300 transition-colors"
            >
              {/* Module Header - Clickable */}
              <button
                onClick={() => toggleModule(module.slug)}
                className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                    <BookOpen className="text-white" size={20} />
                  </div>
                  <div className="text-left">
                    <h2 className="text-xl font-bold text-gray-900">{module.title}</h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {module.count} {module.count === 1 ? 'lesson' : 'lessons'}
                    </p>
                  </div>
                </div>

                {isExpanded ? (
                  <ChevronDown className="text-teal-600 flex-shrink-0" size={24} />
                ) : (
                  <ChevronRight className="text-gray-400 flex-shrink-0" size={24} />
                )}
              </button>

              {/* Lessons - Expandable */}
              {isExpanded && (
                <div className="border-t border-gray-200 bg-gray-50">
                  <div className="p-4 space-y-3">
                    {lessons.map(lesson => (
                      <div
                        key={lesson.id}
                        className="bg-white border border-gray-200 rounded-lg p-4 hover:border-teal-300 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <CheckCircle2 className="text-teal-600 flex-shrink-0 mt-1" size={20} />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 text-lg mb-2">
                              {lesson.title}
                            </h3>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {lesson.overview.split('\n\n')[0]}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Link
                            to={`/content/${lesson.id}`}
                            className="flex-1 px-4 py-2 text-center rounded-lg border-2 border-teal-200 text-teal-700 font-medium hover:bg-teal-50 transition-colors"
                          >
                            Study
                          </Link>
                          <Link
                            to={`/practice/${lesson.id}`}
                            className="flex-1 px-4 py-2 text-center rounded-lg bg-teal-600 text-white font-medium hover:bg-teal-700 transition-colors"
                          >
                            Practice
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-900">
        <p className="font-medium mb-1">💡 Study Tips</p>
        <ul className="space-y-1 ml-4">
          <li>• Read the Study content thoroughly first</li>
          <li>• Then test yourself with Practice questions</li>
          <li>• Review with Flashcards to reinforce memory</li>
        </ul>
      </div>
    </div>
  );
}
