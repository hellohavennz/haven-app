import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllProgress, getAllProgressFromDB } from '../lib/progress';
import { getAllLessons, getModules, getLessonsForModule } from '../lib/content';
import { getCurrentUser } from '../lib/auth';
import { Trophy, Star, TrendingUp, Zap, BookOpen, CheckCircle, Target, Clock, Sparkles, ArrowRight } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import type { LessonProgress } from '../lib/progress';

const Dashboard: React.FC = () => {
  const [progress, setProgress] = useState<Record<string, LessonProgress>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadProgress = async () => {
      setIsLoading(true);
      const currentUser = await getCurrentUser();

      if (!isMounted) {
        return;
      }

      setUser(currentUser);

      if (currentUser) {
        try {
          const dbProgress = await getAllProgressFromDB();

          if (!isMounted) {
            return;
          }

          setProgress(dbProgress);
          setIsLoading(false);
          return;
        } catch (error) {
          console.error('Failed to load progress from Supabase', error);
        }
      }

      if (!isMounted) {
        return;
      }

      setProgress(getAllProgress());
      setIsLoading(false);
    };

    void loadProgress();

    return () => {
      isMounted = false;
    };
  }, []);

  const hasFullAccess = user && user.user_metadata?.isPremium === true;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading progress…</div>
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
  const masteredLessons = Object.entries(progress).filter(([, p]) => {
    const percentage = p.attempted > 0 ? (p.correct / p.attempted) * 100 : 0;
    return percentage >= 80;
  }).length;

  // Count lessons needing review (<60%)
  const needsReview = Object.entries(progress).filter(([, p]) => {
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
  const goodCount = Object.entries(progress).filter(([, p]) => {
    const percentage = p.attempted > 0 ? (p.correct / p.attempted) * 100 : 0;
    return percentage >= 60 && percentage < 80;
  }).length;
  const needsWorkCount = needsReview;
  const notStartedCount = totalLessons - lessonsStarted;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto space-y-8 text-gray-900 dark:text-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-semibold text-teal-700 mb-2 dark:text-teal-400">Your Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-300">{hasFullAccess ? 'Welcome back!' : 'Sample Dashboard'}</p>
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
          <div className="rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 p-6 dark:border-amber-400 dark:from-amber-400/10 dark:to-orange-500/10">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white">
                <Sparkles className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
                  This is a Sample Dashboard
                </h3>
                <p className="mb-4 text-gray-700 dark:text-gray-200">
                  Upgrade to Haven Plus to unlock your personalized dashboard with real-time progress tracking, performance analytics, and study recommendations tailored just for you.
                </p>
                <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-teal-600" />
                    <span>Real progress tracking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-teal-600" />
                    <span>Performance analytics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-teal-600" />
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
            <div className="text-5xl font-semibold mb-2">{accuracyScore}%</div>
            <div className="text-teal-100 font-medium">Accuracy Score</div>
            <div className="text-sm text-teal-100 mt-1">{totalAttempted} questions answered</div>
          </div>

          {/* Mastered */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <Trophy className="w-8 h-8" />
              <span className="text-sm bg-white/20 px-3 py-1 rounded-full font-medium">Mastered</span>
            </div>
            <div className="text-5xl font-semibold mb-2">{masteredLessons}</div>
            <div className="text-green-100 font-medium">Lessons at 80%+</div>
            <div className="text-sm text-green-100 mt-1">Out of {totalLessons} total</div>
          </div>

          {/* Progress */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8" />
              <span className="text-sm bg-white/20 px-3 py-1 rounded-full font-medium">Progress</span>
            </div>
            <div className="text-5xl font-semibold mb-2">{completionRate}%</div>
            <div className="text-blue-100 font-medium">Completion Rate</div>
            <div className="text-sm text-blue-100 mt-1">{lessonsStarted}/{totalLessons} lessons started</div>
          </div>

          {/* Focus */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <Zap className="w-8 h-8" />
              <span className="text-sm bg-white/20 px-3 py-1 rounded-full font-medium">Focus</span>
            </div>
            <div className="text-5xl font-semibold mb-2">{needsReview}</div>
            <div className="text-orange-100 font-medium">Need Review</div>
            <div className="text-sm text-orange-100 mt-1">Below 60% accuracy</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lesson Status */}
          <div className="lg:col-span-1 rounded-2xl bg-white p-6 shadow-lg dark:border dark:border-gray-800 dark:bg-gray-900/80">
            <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-6">Lesson Status</h2>

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
                  <div className="text-4xl font-semibold text-gray-900 dark:text-gray-100">{masteredCount}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">of {totalLessons}</div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Mastered (80%+)</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-gray-100">{masteredCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Good (60-79%)</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-gray-100">{goodCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Needs Work (&lt;60%)</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-gray-100">{needsWorkCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Not Started</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-gray-100">{notStartedCount}</span>
              </div>
            </div>
          </div>

          {/* Performance by Module */}
          <div className="lg:col-span-2 rounded-2xl bg-white p-6 shadow-lg dark:border dark:border-gray-800 dark:bg-gray-900/80">
            <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
              <Target className="text-teal-600" size={24} />
              Performance by Module
            </h2>

            <div className="space-y-4">
              {modulePerformance.map(module => (
                <div key={module.slug}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100">{module.title}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {module.masteredCount}/{module.totalLessons} mastered • {module.questionsAnswered} questions
                      </div>
                    </div>
                    <div className={`text-2xl font-semibold ${
                      module.avgPercentage >= 80 ? 'text-green-600' :
                      module.avgPercentage >= 60 ? 'text-yellow-600' :
                      module.avgPercentage > 0 ? 'text-gray-400' : 'text-gray-300'
                    }`}>
                      {module.avgPercentage > 0 ? `${module.avgPercentage}%` : '—'}
                    </div>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden dark:bg-gray-800">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Keep Learning */}
          <div className="rounded-2xl border-2 border-teal-200 bg-gradient-to-br from-teal-50 to-cyan-50 p-6 dark:border-teal-500/40 dark:from-teal-400/10 dark:to-cyan-400/10">
            <div className="w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center mb-4">
              <BookOpen className="text-white" size={24} />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Keep Learning</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
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
          <div className="rounded-2xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-6 dark:border-green-500/40 dark:from-emerald-400/10 dark:to-green-500/10">
            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mb-4">
              <CheckCircle className="text-white" size={24} />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Great Work!</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
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
          <div className="rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 dark:border-blue-500/40 dark:from-blue-400/10 dark:to-indigo-500/10">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
              <Clock className="text-white" size={24} />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Pro Tips</h3>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
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
