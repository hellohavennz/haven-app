import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getModules, getLessonsForModule } from "../lib/content";
import { getAllProgress } from "../lib/progress";
import { ChevronDown, ChevronRight, Brain, Sparkles, Trophy, Target, AlertCircle } from "lucide-react";

type ProgressData = Record<string, { attempted: number; correct: number }>;

export default function PracticeIndex() {
  const modules = getModules();
  const [expandedModules, setExpandedModules] = useState<string[]>([modules[0]?.slug || ""]);
  const [progressData, setProgressData] = useState<ProgressData>({});

  useEffect(() => {
    getAllProgress().then(setProgressData);
  }, []);

  const toggleModule = (slug: string) => {
    setExpandedModules(prev =>
      prev.includes(slug)
        ? prev.filter(s => s !== slug)
        : [...prev, slug]
    );
  };

  const getProgressStatus = (lessonId: string) => {
    const progress = progressData[lessonId];
    if (!progress || progress.attempted === 0) {
      return { status: 'not-started', percentage: 0, color: 'gray' };
    }

    const percentage = Math.round((progress.correct / progress.attempted) * 100);
    
    if (percentage >= 80) {
      return { status: 'mastered', percentage, color: 'green' };
    } else if (percentage >= 60) {
      return { status: 'good', percentage, color: 'amber' };
    } else {
      return { status: 'needs-work', percentage, color: 'red' };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'mastered':
        return <Trophy className="text-green-600" size={18} />;
      case 'good':
        return <Target className="text-amber-600" size={18} />;
      case 'needs-work':
        return <AlertCircle className="text-red-600" size={18} />;
      default:
        return <Sparkles className="text-gray-400" size={18} />;
    }
  };

  const getStatusBadge = (lessonId: string) => {
    const { status, percentage, color } = getProgressStatus(lessonId);
    
    if (status === 'not-started') {
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 border border-gray-200">
          <span className="text-xs font-medium text-gray-600">Not started</span>
        </div>
      );
    }

    const colorClasses = {
      green: 'bg-green-50 border-green-200 text-green-700',
      amber: 'bg-amber-50 border-amber-200 text-amber-700',
      red: 'bg-red-50 border-red-200 text-red-700',
    };

    return (
      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${colorClasses[color as keyof typeof colorClasses]}`}>
        {getStatusIcon(status)}
        <span className="text-xs font-bold">{percentage}%</span>
      </div>
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

      {/* Legend */}
      <div className="bg-white border-2 border-gray-200 rounded-xl p-4">
        <p className="text-sm font-medium text-gray-700 mb-3">Progress indicators:</p>
        <div className="flex flex-wrap gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Trophy className="text-green-600" size={16} />
            <span className="text-gray-600"><span className="font-medium text-green-700">80%+</span> Mastered</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="text-amber-600" size={16} />
            <span className="text-gray-600"><span className="font-medium text-amber-700">60-79%</span> Good progress</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle className="text-red-600" size={16} />
            <span className="text-gray-600"><span className="font-medium text-red-700">&lt;60%</span> Needs work</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="text-gray-400" size={16} />
            <span className="text-gray-600">Not started</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {modules.map(module => {
          const lessons = getLessonsForModule(module.slug);
          const isExpanded = expandedModules.includes(module.slug);

          // Calculate module progress
          const moduleProgress = lessons.map(l => getProgressStatus(l.id));
          const masteredCount = moduleProgress.filter(p => p.status === 'mastered').length;
          const attemptedCount = moduleProgress.filter(p => p.status !== 'not-started').length;

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
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                    <Brain className="text-white" size={20} />
                  </div>
                  <div className="text-left flex-1">
                    <h2 className="text-xl font-bold text-gray-900">{module.title}</h2>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-sm text-gray-500">
                        {module.count} {module.count === 1 ? 'lesson' : 'lessons'}
                      </p>
                      {attemptedCount > 0 && (
                        <div className="flex items-center gap-1.5">
                          <Trophy className="text-green-600" size={14} />
                          <span className="text-xs font-medium text-gray-700">
                            {masteredCount}/{module.count} mastered
                          </span>
                        </div>
                      )}
                    </div>
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
                    {lessons.map(lesson => {
                      const progress = progressData[lesson.id];
                      const hasAttempted = progress && progress.attempted > 0;

                      return (
                        <div
                          key={lesson.id}
                          className="bg-white border border-gray-200 rounded-lg p-4 hover:border-teal-300 hover:shadow-sm transition-all"
                        >
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                                <Sparkles className="text-white" size={18} />
                              </div>
                              <h3 className="font-bold text-gray-900 leading-tight pt-1 text-sm">
                                {lesson.title}
                              </h3>
                            </div>
                            {getStatusBadge(lesson.id)}
                          </div>

                          {hasAttempted && (
                            <div className="mb-3 text-xs text-gray-600">
                              <span className="font-medium">{progress.attempted}</span> questions attempted
                            </div>
                          )}

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
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Overall Stats */}
      <div className="bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-200 rounded-xl p-6">
        <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Trophy className="text-teal-600" size={20} />
          Your Overall Progress
        </h3>
        <p className="text-sm text-gray-600">
          Keep practicing to achieve 80% or higher on all lessons. Your progress is saved automatically as you practice.
        </p>
      </div>
    </div>
  );
}
