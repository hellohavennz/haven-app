import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useProgress } from '../lib/progress';
import { getAllLessons, getModules, getLessonsForModule } from '../lib/content';
import { getCurrentUser, getSession } from '../lib/auth';
import { Trophy, Star, TrendingUp, Zap, BookOpen, CheckCircle, Target, Sparkles, ArrowRight, CheckCircle2, XCircle, FileCheck, X } from 'lucide-react';
import { useSubscription, clearSubscriptionCache, checkSubscriptionStatus } from '../lib/subscription';
import { getExamHistory, syncExamHistory, getReadinessStatus, getExamsThisMonth } from '../lib/examUtils';
import { isOnboardingComplete, getDaysUntilExam } from '../lib/onboarding';
import type { ExamAttempt } from '../types';
import { usePageTitle } from '../hooks/usePageTitle';
import InstallHaven from '../components/InstallHaven';

interface LessonProgressData {
  attempted: number;
  correct: number;
}

const Dashboard: React.FC = () => {
  usePageTitle('Dashboard', 'Your Haven Study dashboard. Track your progress, review results, and continue studying.');
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const { tier, isLoading: tierLoading } = useSubscription();
  const [examHistory, setExamHistory] = useState<ExamAttempt[]>([]);
  const [upgradeBanner, setUpgradeBanner] = useState<string | null>(null);
  const daysUntilExam = getDaysUntilExam();

  // Detect first dashboard visit — stored in localStorage so it's only true once
  const [isFirstVisit] = useState(() => {
    try {
      const visited = localStorage.getItem('haven-dashboard-visited');
      if (!visited) {
        localStorage.setItem('haven-dashboard-visited', '1');
        return true;
      }
      return false;
    } catch { return false; }
  });

  useEffect(() => {
    if (!isOnboardingComplete()) {
      navigate('/welcome', { replace: true });
      return;
    }
    getCurrentUser().then(u => {
      if (u?.email === 'hello.haven.nz@gmail.com') {
        navigate('/admin', { replace: true });
        return;
      }
      setUser(u);
      setIsLoading(false);
    });
    setExamHistory(getExamHistory());
    syncExamHistory().then(setExamHistory).catch(() => {});

    // Handle post-checkout redirect
    const params = new URLSearchParams(location.search);
    if (params.get('upgraded') === '1') {
      clearSubscriptionCache();
      checkSubscriptionStatus().then(freshTier => {
        const label =
          freshTier === 'premium' ? 'Haven Premium' :
          freshTier === 'plus' ? 'Haven Plus' :
          'your new plan';
        setUpgradeBanner(`You're now on ${label}!`);
      });
      navigate(location.pathname, { replace: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // After Google OAuth the user returns as free tier; if they had selected
  // a paid plan before OAuth, resume checkout now that we have their session.
  useEffect(() => {
    if (tierLoading || !user) return;
    const pendingPlan = localStorage.getItem('pending_checkout_plan');
    if (!pendingPlan) return;
    localStorage.removeItem('pending_checkout_plan'); // clear before async work
    if (tier !== 'free') return; // already paid (e.g. returning user)
    getSession().then(session => {
      const token = session?.access_token;
      if (!token) return;
      fetch('/.netlify/functions/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan: pendingPlan }),
      })
        .then(r => r.ok ? r.json() : null)
        .then(data => { if (data?.url) window.location.href = data.url; })
        .catch(() => {});
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, tier, tierLoading]);

  const progress = useProgress(user?.id);

  const hasFullAccess = user && (tier === 'plus' || tier === 'premium');

  if (isLoading || tierLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-slate-600">Loading...</div>
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

  // "Continue" suggestion: weakest started lesson, or first unstarted with questions
  const weakestLesson = allLessons
    .filter(l => {
      const p = progress[l.id];
      return p && p.attempted > 0 && (p.correct / p.attempted) < 0.6;
    })
    .sort((a, b) => {
      const pa = progress[a.id], pb = progress[b.id];
      return (pa.correct / pa.attempted) - (pb.correct / pb.attempted);
    })[0] ?? null;

  const nextUnstarted = allLessons.find(
    l => !progress[l.id] && (l.questions?.length ?? 0) > 0
  ) ?? null;

  const continueSuggestion = weakestLesson ?? nextUnstarted;
  const continueIsWeak = !!weakestLesson;

  // Lesson status breakdown
  const masteredCount = masteredLessons;
  const goodCount = Object.entries(progress).filter(([_, p]) => {
    const percentage = p.attempted > 0 ? (p.correct / p.attempted) * 100 : 0;
    return percentage >= 60 && percentage < 80;
  }).length;
  const needsWorkCount = needsReview;
  const notStartedCount = totalLessons - masteredCount - goodCount - needsWorkCount;

  return (
    <div className="min-h-screen bg-cream py-10 px-4 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto space-y-8 text-slate-900 dark:text-gray-100">
        {/* PWA install prompt */}
        <InstallHaven />

        {/* Upgrade success banner */}
        {upgradeBanner && (
          <div className="flex items-start justify-between gap-4 rounded-2xl border border-teal-200 bg-teal-50 px-5 py-4 dark:border-teal-700 dark:bg-teal-900/20">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0 text-teal-600 dark:text-teal-400" />
              <p className="font-semibold text-teal-800 dark:text-teal-200">{upgradeBanner}</p>
            </div>
            <button
              onClick={() => setUpgradeBanner(null)}
              className="flex-shrink-0 text-teal-600 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-200"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-semibold text-slate-900 mb-2 dark:text-white">Your Dashboard</h1>
            <p className="text-slate-600 dark:text-slate-300">
              {isFirstVisit
                ? `Welcome${user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ''}!`
                : `Welcome back${user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ''}!`}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {daysUntilExam !== null && (
              <div className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
                daysUntilExam <= 7
                  ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                  : daysUntilExam <= 30
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                  : 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300'
              }`}>
                <Target className="h-4 w-4" />
                {daysUntilExam} day{daysUntilExam !== 1 ? 's' : ''} to go
              </div>
            )}
            {!hasFullAccess && (
              <Link
                to="/paywall"
                className="inline-flex items-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all"
              >
                <Sparkles className="h-4 w-4" />
                Upgrade to Plus
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>

        {/* Getting Started — shown until user has started at least one lesson */}
        {lessonsStarted === 0 && examHistory.length === 0 && (
          <div className="rounded-2xl border border-teal-200 bg-teal-50 p-6 dark:border-teal-700 dark:bg-teal-900/20">
            <div className="flex items-start gap-5">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-teal-600">
                <BookOpen className="h-7 w-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-slate-900 dark:text-white mb-1">
                  Ready to start learning?
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                  Work through each lesson, practise the questions, then take a mock exam when you're ready. You've got this.
                </p>
                <div className="flex flex-wrap gap-3">
                  {continueSuggestion ? (
                    <Link
                      to={`/content/${continueSuggestion.id}`}
                      className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 transition-all"
                    >
                      Start Lesson 1
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  ) : null}
                  <Link
                    to="/content"
                    className="inline-flex items-center gap-2 rounded-xl border-2 border-teal-300 dark:border-teal-700 px-5 py-2.5 text-sm font-semibold text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/30 transition-all"
                  >
                    Browse all lessons
                  </Link>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-5 border-t border-teal-200 dark:border-teal-700 grid grid-cols-3 gap-4 text-center">
              {[
                { icon: <BookOpen className="h-5 w-5" />, step: '1', label: 'Study', detail: 'Read each lesson' },
                { icon: <Target className="h-5 w-5" />, step: '2', label: 'Practice', detail: 'Answer questions' },
                { icon: <Star className="h-5 w-5" />, step: '3', label: 'Exam', detail: 'Take a mock test' },
              ].map(({ icon, step, label, detail }) => (
                <div key={label}>
                  <div className="flex justify-center mb-1.5 text-teal-600 dark:text-teal-400">{icon}</div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-0.5">Step {step}</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{label}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{detail}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Study plan widget — shown when exam date is set */}
        {daysUntilExam !== null && (() => {
          const lessonsLeft = notStartedCount;
          const requiredPace = lessonsLeft > 0 ? Math.ceil(lessonsLeft / daysUntilExam) : 0;
          return (
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${
                    daysUntilExam <= 7 ? 'bg-red-100 dark:bg-red-900/30' :
                    daysUntilExam <= 30 ? 'bg-amber-100 dark:bg-amber-900/30' :
                    'bg-teal-100 dark:bg-teal-900/30'
                  }`}>
                    <Target className={`h-5 w-5 ${
                      daysUntilExam <= 7 ? 'text-red-600 dark:text-red-400' :
                      daysUntilExam <= 30 ? 'text-amber-600 dark:text-amber-400' :
                      'text-teal-600 dark:text-teal-400'
                    }`} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {daysUntilExam} day{daysUntilExam !== 1 ? 's' : ''} until your exam
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {lessonsLeft > 0
                        ? `${lessonsLeft} lesson${lessonsLeft !== 1 ? 's' : ''} remaining`
                        : 'All lessons started. Keep practising!'}
                    </p>
                  </div>
                </div>
                {lessonsLeft > 0 && requiredPace > 0 && (
                  <div className="text-right flex-shrink-0">
                    <p className="font-semibold text-sm text-slate-700 dark:text-slate-300">
                      ~{requiredPace} lesson{requiredPace !== 1 ? 's' : ''}/day
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      to finish in time
                    </p>
                  </div>
                )}
              </div>
              <div className="mt-4 h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className={`h-full rounded-full transition-all ${
                    completionRate >= 80 ? 'bg-green-500' :
                    completionRate >= 40 ? 'bg-teal-500' : 'bg-teal-400'
                  }`}
                  style={{ width: `${Math.max(completionRate, 2)}%` }}
                />
              </div>
              <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">
                {completionRate}% of lessons started
              </p>
            </div>
          );
        })()}

        {!hasFullAccess && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-700 dark:bg-amber-900/10">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white">
                <Sparkles className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="mb-2 font-semibold text-slate-900 dark:text-gray-100">
                  This is a Sample Dashboard
                </h3>
                <p className="mb-4 text-slate-700 dark:text-slate-200">
                  Upgrade to Haven Plus to unlock your personalized dashboard with real-time progress tracking, performance analytics, and study recommendations tailored just for you.
                </p>
                <div className="flex flex-wrap gap-3 text-sm text-slate-600 dark:text-slate-300">
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Overall Accuracy */}
          <div className="bg-teal-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <Star className="w-8 h-8" />
              <span className="text-sm bg-white/20 px-3 py-1 rounded-full font-medium">Overall</span>
            </div>
            <div className="text-5xl font-semibold mb-2">{accuracyScore}%</div>
            <div className="text-teal-100 font-medium">Accuracy Score</div>
            <div className="text-sm text-teal-100 mt-1">{totalAttempted} questions answered</div>
          </div>

          {/* Mastered */}
          <div className="bg-amber-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <Trophy className="w-8 h-8" />
              <span className="text-sm bg-white/20 px-3 py-1 rounded-full font-medium">Mastered</span>
            </div>
            <div className="text-5xl font-semibold mb-2">{masteredLessons}</div>
            <div className="text-amber-100 font-medium">Lessons at 80%+</div>
            <div className="text-sm text-amber-100 mt-1">Out of {totalLessons} total</div>
          </div>

          {/* Progress */}
          <div className="bg-teal-700 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8" />
              <span className="text-sm bg-white/20 px-3 py-1 rounded-full font-medium">Progress</span>
            </div>
            <div className="text-5xl font-semibold mb-2">{completionRate}%</div>
            <div className="text-teal-100 font-medium">Completion Rate</div>
            <div className="text-sm text-teal-100 mt-1">{lessonsStarted}/{totalLessons} lessons started</div>
          </div>

          {/* Focus */}
          <div className="bg-amber-700 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <Zap className="w-8 h-8" />
              <span className="text-sm bg-white/20 px-3 py-1 rounded-full font-medium">Focus</span>
            </div>
            <div className="text-5xl font-semibold mb-2">{needsReview}</div>
            <div className="text-amber-100 font-medium">Need Review</div>
            <div className="text-sm text-amber-100 mt-1">Below 60% accuracy</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lesson Status */}
          <div className="lg:col-span-1 rounded-2xl bg-white p-6 border border-slate-200 dark:border-slate-800 dark:bg-slate-900/80">
            <h2 className="font-semibold text-slate-900 dark:text-gray-100 mb-6">Lesson Status</h2>

            <div className="flex items-center justify-center mb-8">
              <div className="relative w-48 h-48">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r="80"
                    fill="none"
                    stroke="#DDE5E2"
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
                  <div className="text-4xl font-semibold text-slate-900 dark:text-gray-100">{masteredCount}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-300">of {totalLessons}</div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm text-slate-700 dark:text-slate-300">Mastered (80%+)</span>
                </div>
                <span className="font-semibold text-slate-900 dark:text-gray-100">{masteredCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-sm text-slate-700 dark:text-slate-300">Good (60-79%)</span>
                </div>
                <span className="font-semibold text-slate-900 dark:text-gray-100">{goodCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-sm text-slate-700 dark:text-slate-300">Needs Work (&lt;60%)</span>
                </div>
                <span className="font-semibold text-slate-900 dark:text-gray-100">{needsWorkCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                  <span className="text-sm text-slate-700 dark:text-slate-300">Not Started</span>
                </div>
                <span className="font-semibold text-slate-900 dark:text-gray-100">{notStartedCount}</span>
              </div>
            </div>
          </div>

          {/* Performance by Module */}
          <div className="lg:col-span-2 rounded-2xl bg-white p-6 border border-slate-200 dark:border-slate-800 dark:bg-slate-900/80">
            <h2 className="font-semibold text-slate-900 dark:text-gray-100 mb-6 flex items-center gap-2">
              <Target className="text-teal-600" size={24} />
              Performance by Module
            </h2>

            <div className="space-y-4">
              {modulePerformance.map(module => (
                <div key={module.slug}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-gray-100">{module.title}</div>
                      <div className="text-sm text-slate-600 dark:text-slate-300">
                        {module.masteredCount}/{module.totalLessons} mastered • {module.questionsAnswered} questions
                      </div>
                    </div>
                    <div className={`text-2xl font-semibold ${
                      module.avgPercentage >= 80 ? 'text-green-600' :
                      module.avgPercentage >= 60 ? 'text-yellow-600' :
                      module.avgPercentage > 0 ? 'text-slate-400' : 'text-slate-300'
                    }`}>
                      {module.avgPercentage > 0 ? `${module.avgPercentage}%` : '—'}
                    </div>
                  </div>
                  <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden dark:bg-slate-800">
                    <div
                      className={`h-full rounded-full transition-all ${
                        module.avgPercentage >= 80 ? 'bg-green-500' :
                        module.avgPercentage >= 60 ? 'bg-yellow-500' :
                        module.avgPercentage > 0 ? 'bg-red-400' : 'bg-slate-300'
                      }`}
                      style={{ width: `${module.avgPercentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Exam Widget */}
        <ExamWidget history={examHistory} hasAccess={hasFullAccess} tier={tier} />

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Keep Learning */}
          <div className="rounded-2xl border border-teal-200 bg-teal-50 p-6 dark:border-teal-500/40 dark:bg-teal-900/10">
            <div className="w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center mb-4">
              <BookOpen className="text-white" size={24} />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-gray-100 mb-2">Keep Learning</h3>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
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
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900/50">
            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mb-4">
              <CheckCircle className="text-white" size={24} />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-gray-100 mb-2">Great Work!</h3>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              {needsReview === 0
                ? "No lessons below 60%! You're making excellent progress across the board."
                : `${needsReview} lesson${needsReview > 1 ? 's' : ''} need${needsReview === 1 ? 's' : ''} more practice. Keep going!`}
            </p>
            <Link
              to="/practice"
              className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-all"
            >
              Keep Practicing
              <Trophy size={20} />
            </Link>
          </div>

          {/* Your next step */}
          {continueSuggestion ? (
            <div className={`rounded-2xl border p-6 ${
              continueIsWeak
                ? 'border-amber-200 bg-amber-50 dark:border-amber-700 dark:bg-amber-900/10'
                : 'border-blue-100 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/10'
            }`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                continueIsWeak ? 'bg-amber-500' : 'bg-blue-600'
              }`}>
                {continueIsWeak
                  ? <Zap className="text-white" size={24} />
                  : <ArrowRight className="text-white" size={24} />
                }
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-gray-100 mb-1">
                {continueIsWeak ? 'Needs more practice' : 'Up next'}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-1 font-medium">
                {continueSuggestion.title}
              </p>
              {continueIsWeak && progress[continueSuggestion.id] && (
                <p className="text-xs text-amber-700 dark:text-amber-400 mb-4">
                  {Math.round((progress[continueSuggestion.id].correct / progress[continueSuggestion.id].attempted) * 100)}% accuracy. Aim for 80%+
                </p>
              )}
              {!continueIsWeak && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  Not started yet
                </p>
              )}
              <div className="flex gap-2">
                <Link
                  to={`/content/${continueSuggestion.id}`}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-xl transition-all ${
                    continueIsWeak
                      ? 'bg-amber-500 hover:bg-amber-600'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  Study
                </Link>
                {(continueSuggestion.questions?.length ?? 0) > 0 && (
                  <Link
                    to={`/practice/${continueSuggestion.id}/questions`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl border-2 border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 transition-all"
                  >
                    Practice
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-teal-200 bg-teal-50 p-6 dark:border-teal-700 dark:bg-teal-900/10">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mb-4">
                <Trophy className="text-white" size={24} />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-gray-100 mb-2">All caught up!</h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">
                Every lesson has been attempted. Keep your scores above 80% and take a mock exam when you're ready.
              </p>
              <Link
                to="/exam"
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-all"
              >
                Take a Mock Exam
                <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function ExamWidget({
  history,
  hasAccess,
  tier,
}: {
  history: ExamAttempt[];
  hasAccess: boolean;
  tier: string;
}) {
  const last = history[0] ?? null;
  const readiness = getReadinessStatus(history);
  const recent = history.slice(0, 5);
  const examsThisMonth = getExamsThisMonth(history);
  const plusLimitReached = tier === 'plus' && examsThisMonth >= 2;
  const bestPct = history.length > 0
    ? Math.max(...history.map(a => Math.round((a.correct / a.total) * 100)))
    : null;

  const Cta = () => (
    hasAccess && plusLimitReached ? (
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 px-5 py-2.5 text-sm font-semibold text-slate-400 dark:text-slate-500 cursor-not-allowed">
          Limit reached
        </span>
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Resets next month</p>
      </div>
    ) : hasAccess ? (
      <Link
        to="/exam/take"
        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-lg"
      >
        {last ? 'Take Another' : 'Start Exam'}
        <ArrowRight className="h-4 w-4" />
      </Link>
    ) : (
      <Link
        to="/paywall"
        className="inline-flex items-center gap-2 rounded-xl border-2 border-purple-300 px-5 py-2.5 text-sm font-semibold text-purple-700 transition-all hover:bg-purple-50 dark:border-purple-700 dark:text-purple-300"
      >
        Unlock Exams
        <ArrowRight className="h-4 w-4" />
      </Link>
    )
  );

  return (
    <div className="rounded-2xl bg-white p-6 border border-slate-200 dark:border-slate-800 dark:bg-slate-900/80">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-semibold text-slate-900 dark:text-gray-100 flex items-center gap-2">
          <FileCheck className="text-purple-600 dark:text-purple-400" size={22} />
          Mock Exams
          {tier === 'plus' && (
            <span className={`text-xs font-semibold rounded-full px-2.5 py-0.5 ${
              plusLimitReached
                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
            }`}>
              {examsThisMonth}/2 this month
            </span>
          )}
        </h2>
        <Link
          to="/exam"
          className="text-sm font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
        >
          View all →
        </Link>
      </div>

      {last ? (
        <>
          {/* Three stats spread evenly */}
          <div className="grid grid-cols-3 divide-x divide-gray-100 dark:divide-gray-700/50 mb-5">
            {/* Last score */}
            <div className="flex flex-col items-center gap-1 px-2">
              <span className={`text-2xl font-bold tabular-nums ${
                last.passed ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'
              }`}>
                {Math.round((last.correct / last.total) * 100)}%
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">Last score</span>
              <span className={`inline-flex items-center gap-1 text-xs font-semibold ${
                last.passed ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'
              }`}>
                {last.passed ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                {last.passed ? 'Pass' : 'Fail'}
              </span>
            </div>

            {/* Best score */}
            <div className="flex flex-col items-center gap-1 px-2">
              <span className="text-2xl font-bold tabular-nums text-slate-900 dark:text-gray-100">
                {bestPct}%
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">Best score</span>
              <span className="text-xs text-slate-400 dark:text-slate-500">
                {history.length} attempt{history.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Recent results */}
            <div className="flex flex-col items-center gap-1 px-2">
              <div className="flex items-center gap-1 h-8">
                {recent.map(a => (
                  <div
                    key={a.id}
                    title={`${Math.round((a.correct / a.total) * 100)}%`}
                    className={`h-4 w-4 rounded-full ${a.passed ? 'bg-green-500' : 'bg-red-400'}`}
                  />
                ))}
              </div>
              <span className="text-xs text-slate-400 dark:text-slate-500">Recent</span>
              <span className={`text-xs font-medium ${
                readiness.ready ? 'text-green-600 dark:text-green-400' : 'text-slate-500 dark:text-slate-400'
              }`}>
                {readiness.ready ? '✓ Ready' : `${readiness.passedCount}/${readiness.totalRecent} passed`}
              </span>
            </div>
          </div>

          <div className="flex justify-end">
            <Cta />
          </div>
        </>
      ) : (
        /* Empty state */
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-purple-100 dark:bg-purple-900/30">
              <Trophy className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-gray-100">No exams yet</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">24 questions · 45 min · 75% to pass</p>
            </div>
          </div>
          <div className="sm:flex-shrink-0">
            <Cta />
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
