import { useState } from "react";
import { Link } from "react-router-dom";
import { getModules, getLessonsForModule } from "../lib/content";
import { ChevronDown, ChevronRight, Brain, Sparkles } from "lucide-react";

export default function PracticeIndex() {
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
        <h1 className="text-4xl font-bold text-gray-900">Practice</h1>
        <p className="text-lg text-gray-600">
          Test your knowledge with questions and flashcards. Your quiz scores are tracked automatically.
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
              {/* Module Header */}
              <button
                onClick={() => toggleModule(module.slug)}
                className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                    <Brain className="text-white" size={20} />
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

              {/* Lessons */}
              {isExpanded && (
                <div className="border-t border-gray-200 bg-gray-50">
                  <div className="p-4 grid gap-3 md:grid-cols-2">
                    {lessons.map(lesson => (
                      <div
                        key={lesson.id}
                        className="bg-white border border-gray-200 rounded-lg p-4 hover:border-teal-300 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-start gap-3 mb-4">
                          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                            <Sparkles className="text-white" size={18} />
                          </div>
                          <h3 className="font-bold text-gray-900 leading-tight pt-1">
                            {lesson.title}
                          </h3>
                        </div>

                        <div className="flex gap-2">
                          <Link
                            to={`/practice/${lesson.id}`}
                            className="flex-1 px-4 py-2 text-center rounded-lg bg-gradient-to-r from-teal-600 to-teal-700 text-white font-semibold hover:opacity-90 transition-all text-sm"
                          >
                            Questions
                          </Link>
                          <Link
                            to={`/flashcards/${lesson.id}`}
                            className="flex-1 px-4 py-2 text-center rounded-lg border-2 border-teal-200 text-teal-700 font-semibold hover:bg-teal-50 transition-all text-sm"
                          >
                            Flashcards
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

      {/* Stats placeholder */}
      <div className="bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-200 rounded-xl p-6">
        <h3 className="font-bold text-gray-900 mb-2">📊 Your Progress</h3>
        <p className="text-sm text-gray-600">
          Track your quiz scores and see which topics you've mastered. Progress is saved automatically.
        </p>
      </div>
    </div>
  );
}
