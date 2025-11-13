import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllProgress } from '../lib/progress';
import { getAllLessons, getModules, getLessonsForModule } from '../lib/content';
import { getCurrentUser } from '../lib/auth';
import { Trophy, Star, TrendingUp, Zap, BookOpen, CheckCircle, Target, Clock, Sparkles, ArrowRight } from 'lucide-react';

interface LessonProgressData {
  attempted: number;
  correct: number;
}

const Dashboard: React.FC = () => {
  const [progress, setProgress] = useState<Record<string, LessonProgressData>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    getCurrentUser().then(setUser);
    const progressData = getAllProgress();
    setProgress(progressData);
    setIsLoading(false);
  }, []);

  const hasFullAccess = user && user.user_metadata?.isPremium === true;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] text-[var(--text-secondary)]">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  const allLessons = getAllLessons();
  const modules = getModules();

  // Calculate statistics
  const totalLessons = allLessons.length;
  const lessonsStarted = Object.keys(progress).length;
  const completionRate = totalLessons > 0 ? Math.round((lessonsStarted / totalLessons) * 100) : 0;

  // Calculate accuracy
  const totalAttempted = Object.values(progress).reduce((sum, p) => sum + p.attempted, 0);
  const totalCorrect = Object.values(progress).reduce((sum, p) => sum + p.correct, 0);
  const accuracyScore = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

  // Count mastered lessons (80%+)
  const masteredLessons = Object.entries(progress).filter(([_, p]) => {
    const percentage = p.attempted > 0 ? (p.correct / p.attempted) * 100 : 0;
    return percentage >= 80;
  }).length;

  // Count lessons needing review (<60%)
  const needsReview = Object.entries(progress).filter(([_, p]) => {
    const percentage = p.attempted > 0 ? (p.correct / p.attempted) * 100 : 0;
    return percentage < 60 && p.attempted > 0;
  }).length;

  // Module performance
  const modulePerformance = modules.map(module => {
    const moduleLessons = getLessonsForModule(module.slug);
    const moduleProgress = moduleLessons.map(lesson => {
      const p = progress[lesson.id];
      if (!p || p.attempted === 0) return 0;
      return (p.correct / p.attempted) * 100;
    });
    
    const masteredCount = moduleProgress.filter(p => p >= 80).length;
    const avgPercentage = moduleProgress.length > 0 
      ? Math.round(moduleProgress.reduce((a, b) => a + b, 0) / moduleProgress.length)
      : 0;
    
    const questionsAnswered = moduleLessons.reduce((sum, lesson) => {
      const p = progress[lesson.id];
      return sum + (p?.attempted || 0);
    }, 0);

    return {
      ...module,
      masteredCount,
      totalLessons: moduleLessons.length,
      avgPercentage,
      questionsAnswered
    };
  });

  // Lesson status breakdown
  const masteredCount = masteredLessons;
  const goodCount = Object.entries(progress).filter(([_, p]) => {
    const percentage = p.attempted > 0 ? (p.correct / p.attempted) * 100 : 0;
    return percentage >= 60 && percentage < 80;
  }).length;
  const needsWorkCount = needsReview;
  const notStartedCount = totalLessons - lessonsStarted;

  return (
    <div className="min-h-screen bg-[var(--bg)] px-4 py-8 text-[var(--text-secondary)]">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-4xl font-bold text-[var(--text-primary)]">Your Dashboard</h1>
            <p className="text-lg">{hasFullAccess ? 'Welcome back!' : 'Sample Dashboard'}</p>
          </div>
          {!hasFullAccess && (
            <Link
              to="/paywall"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:opacity-90"
            >
              <Sparkles className="h-5 w-5" />
              Upgrade for Full Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        {!hasFullAccess && (
          <div
            className="rounded-2xl border-2 bg-gradient-to-br p-6"
            style={{
              borderColor: "color-mix(in srgb, #f59e0b 60%, var(--divider) 40%)",
              backgroundImage:
                "linear-gradient(135deg, color-mix(in srgb, #fcd34d 18%, var(--bg) 82%), color-mix(in srgb, #fb923c 14%, var(--bg) 86%))",
            }}
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white">
                <Sparkles className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="mb-2 text-xl font-bold text-[var(--text-primary)]">
                  This is a Sample Dashboard
                </h3>
                <p className="mb-4">
                  Upgrade to Haven Plus to unlock your personalized dashboard with real-time progress tracking, performance analytics, and study recommendations tailored just for you.
                </p>
                <div className="flex flex-wrap gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-[color:color-mix(in_srgb,#059669_70%,var(--text-primary)_30%)]" />
                    <span>Real progress tracking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-[color:color-mix(in_srgb,#059669_70%,var(--text-primary)_30%)]" />
                    <span>Performance analytics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-[color:color-mix(in_srgb,#059669_70%,var(--text-primary)_30%)]" />
                    <span>Study recommendations</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Overall Accuracy */}
          <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <Star className="w-8 h-8" />
              <span className="text-sm bg-white/20 px-3 py-1 rounded-full font-medium">Overall</span>
            </div>
            <div className="text-5xl font-bold mb-2">{accuracyScore}%</div>
            <div className="text-teal-100 font-medium">Accuracy Score</div>
            <div className="text-sm text-teal-100 mt-1">{totalAttempted} questions answered</div>
          </div>

          {/* Mastered */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <Trophy className="w-8 h-8" />
              <span className="text-sm bg-white/20 px-3 py-1 rounded-full font-medium">Mastered</span>
            </div>
            <div className="text-5xl font-bold mb-2">{masteredLessons}</div>
            <div className="text-green-100 font-medium">Lessons at 80%+</div>
            <div className="text-sm text-green-100 mt-1">Out of {totalLessons} total</div>
          </div>

          {/* Progress */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8" />
              <span className="text-sm bg-white/20 px-3 py-1 rounded-full font-medium">Progress</span>
            </div>
            <div className="text-5xl font-bold mb-2">{completionRate}%</div>
            <div className="text-blue-100 font-medium">Completion Rate</div>
            <div className="text-sm text-blue-100 mt-1">{lessonsStarted}/{totalLessons} lessons started</div>
          </div>

          {/* Focus */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <Zap className="w-8 h-8" />
              <span className="text-sm bg-white/20 px-3 py-1 rounded-full font-medium">Focus</span>
            </div>
            <div className="text-5xl font-bold mb-2">{needsReview}</div>
            <div className="text-orange-100 font-medium">Need Review</div>
            <div className="text-sm text-orange-100 mt-1">Below 60% accuracy</div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Lesson Status */}
          <div className="rounded-2xl bg-[var(--bg-section)] p-6 shadow-lg lg:col-span-1">
            <h2 className="mb-6 text-xl font-bold text-[var(--text-primary)]">Lesson Status</h2>
            
            <div className="flex items-center justify-center mb-8">
              <div className="relative w-48 h-48">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r="80"
                    fill="none"
                    stroke="#E5E7EB"
                    strokeWidth="16"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="80"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="16"
                    strokeDasharray={`${(masteredCount / totalLessons) * 502.4} 502.4`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-4xl font-bold text-[var(--text-primary)]">{masteredCount}</div>
                  <div className="text-sm">of {totalLessons}</div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm">Mastered (80%+)</span>
                </div>
                <span className="font-bold text-[var(--text-primary)]">{masteredCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-sm">Good (60-79%)</span>
                </div>
                <span className="font-bold text-[var(--text-primary)]">{goodCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-sm">Needs Work (&lt;60%)</span>
                </div>
                <span className="font-bold text-[var(--text-primary)]">{needsWorkCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                  <span className="text-sm">Not Started</span>
                </div>
                <span className="font-bold text-[var(--text-primary)]">{notStartedCount}</span>
              </div>
            </div>
          </div>

          {/* Performance by Module */}
          <div className="rounded-2xl bg-[var(--bg-section)] p-6 shadow-lg lg:col-span-2">
            <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-[var(--text-primary)]">
              <Target className="text-[color:color-mix(in_srgb,var(--accent-secondary)_70%,var(--text-primary)_30%)]" size={24} />
              Performance by Module
            </h2>

            <div className="space-y-4">
              {modulePerformance.map(module => (
                <div key={module.slug}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-semibold text-[var(--text-primary)]">{module.title}</div>
                      <div className="text-sm">
                        {module.masteredCount}/{module.totalLessons} mastered • {module.questionsAnswered} questions
                      </div>
                    </div>
                    <div className={`text-2xl font-bold ${
                      module.avgPercentage >= 80 ? 'text-green-600' :
                      module.avgPercentage >= 60 ? 'text-yellow-600' :
                      module.avgPercentage > 0 ? 'text-gray-400' : 'text-gray-300'
                    }`}>
                      {module.avgPercentage > 0 ? `${module.avgPercentage}%` : '—'}
                    </div>
                  </div>
                  <div className="w-full h-3 overflow-hidden rounded-full bg-[color:color-mix(in_srgb,var(--divider)_65%,transparent)]">
                    <div
                      className={`h-full rounded-full transition-all ${
                        module.avgPercentage >= 80 ? 'bg-green-500' :
                        module.avgPercentage >= 60 ? 'bg-yellow-500' :
                        module.avgPercentage > 0 ? 'bg-red-400' : 'bg-gray-300'
                      }`}
                      style={{ width: `${module.avgPercentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Keep Learning */}
          <div
            className="rounded-2xl border-2 bg-gradient-to-br p-6"
            style={{
              borderColor: "color-mix(in srgb, var(--accent-secondary) 55%, var(--divider) 45%)",
              backgroundImage:
                "linear-gradient(135deg, color-mix(in srgb, var(--accent-secondary) 16%, var(--bg) 84%), color-mix(in srgb, #22d3ee 12%, var(--bg) 88%))",
            }}
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-600">
              <BookOpen className="text-white" size={24} />
            </div>
            <h3 className="mb-2 text-xl font-bold text-[var(--text-primary)]">Keep Learning</h3>
            <p className="mb-4">
              {notStartedCount} lessons waiting for you. Every lesson brings you closer to success!
            </p>
            <Link
              to="/content"
              className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-all"
            >
              Browse Lessons
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Great Work */}
          <div
            className="rounded-2xl border-2 bg-gradient-to-br p-6"
            style={{
              borderColor: "color-mix(in srgb, #22c55e 55%, var(--divider) 45%)",
              backgroundImage:
                "linear-gradient(135deg, color-mix(in srgb, #22c55e 14%, var(--bg) 86%), color-mix(in srgb, #86efac 14%, var(--bg) 86%))",
            }}
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-600">
              <CheckCircle className="text-white" size={24} />
            </div>
            <h3 className="mb-2 text-xl font-bold text-[var(--text-primary)]">Great Work!</h3>
            <p className="mb-4">
              {needsReview === 0
                ? "No lessons below 60%! You're making excellent progress across the board."
                : `${needsReview} lesson${needsReview > 1 ? 's' : ''} need${needsReview === 1 ? 's' : ''} more practice. Keep going!`}
            </p>
            <Link
              to="/practice"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all"
            >
              Keep Practicing
              <Trophy size={20} />
            </Link>
          </div>

          {/* Pro Tips */}
          <div
            className="rounded-2xl border-2 bg-gradient-to-br p-6"
            style={{
              borderColor: "color-mix(in srgb, #2563eb 55%, var(--divider) 45%)",
              backgroundImage:
                "linear-gradient(135deg, color-mix(in srgb, #2563eb 14%, var(--bg) 86%), color-mix(in srgb, #a5b4fc 14%, var(--bg) 86%))",
            }}
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
              <Clock className="text-white" size={24} />
            </div>
            <h3 className="mb-4 text-xl font-bold text-[var(--text-primary)]">Pro Tips</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={16} />
                <span>Aim for 80%+ on all lessons</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={16} />
                <span>Use flashcards daily for retention</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={16} />
                <span>Review weak areas regularly</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
