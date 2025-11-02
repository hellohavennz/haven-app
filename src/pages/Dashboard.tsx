import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCurrentUser } from "../lib/auth";
import { getModules, getAllLessons } from "../lib/content";
import { getAllProgress } from "../lib/progress";
import { Trophy, Target, Zap, Star, BookOpen, BarChart3, TrendingUp, CheckCircle2, Clock, Brain, Sparkles, ArrowRight, Lock } from "lucide-react";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState<Record<string, { attempted: number; correct: number }>>({});

  useEffect(() => {
    getCurrentUser().then(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const progress = await getAllProgress();
        setProgressData(progress);
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Logged-out dashboard
  if (!user) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-16">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full mb-4">
            <BarChart3 className="text-white" size={40} />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">Track Your Progress to Success</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">Create an account to unlock your personal dashboard and track your journey to passing the Life in the UK test.</p>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-3xl p-8 md:p-12 relative">
          <div className="space-y-8 opacity-50">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 text-center">
                <Trophy className="text-amber-600 mx-auto mb-3" size={40} />
                <div className="text-4xl font-black text-gray-900 mb-2">12</div>
                <p className="text-gray-600 font-medium">Lessons Mastered</p>
              </div>
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 text-center">
                <Target className="text-green-600 mx-auto mb-3" size={40} />
                <div className="text-4xl font-black text-gray-900 mb-2">85%</div>
                <p className="text-gray-600 font-medium">Average Score</p>
              </div>
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 text-center">
                <TrendingUp className="text-teal-600 mx-auto mb-3" size={40} />
                <div className="text-4xl font-black text-gray-900 mb-2">68%</div>
                <p className="text-gray-600 font-medium">Overall Progress</p>
              </div>
            </div>
          </div>

          <div className="absolute inset-0 backdrop-blur-sm bg-white/50 rounded-3xl flex items-center justify-center">
            <div className="bg-white border-2 border-gray-300 rounded-2xl p-8 text-center max-w-md mx-4">
              <Lock className="text-gray-400 mx-auto mb-4" size={48} />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Sign In to Continue</h3>
              <p className="text-gray-600 mb-6">Create a free account to access your personal dashboard and start tracking your progress.</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/signup" className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl font-bold hover:opacity-90 transition-all">Sign Up Free</Link>
                <Link to="/login" className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all">Sign In</Link>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-6">
            <CheckCircle2 className="text-teal-600 mb-4" size={32} />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Track Your Progress</h3>
            <p className="text-gray-600">See exactly which topics you've mastered and which need more practice.</p>
          </div>
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-6">
            <Target className="text-teal-600 mb-4" size={32} />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Personalized Recommendations</h3>
            <p className="text-gray-600">Get smart suggestions on what to study next based on your performance.</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate stats
  const modules = getModules();
  const allLessons = getAllLessons();
  const totalLessons = allLessons.length;
  const completedLessons = Object.keys(progressData).length;
  const masteredLessons = Object.keys(progressData).filter(id => {
    const p = progressData[id];
    return p && p.attempted > 0 && (p.correct / p.attempted) >= 0.8;
  }).length;
  const needsWorkLessons = Object.keys(progressData).filter(id => {
    const p = progressData[id];
    return p && p.attempted > 0 && (p.correct / p.attempted) < 0.6;
  }).length;

  const totalAttempted = Object.values(progressData).reduce((sum, p) => sum + p.attempted, 0);
  const totalCorrect = Object.values(progressData).reduce((sum, p) => sum + p.correct, 0);
  const accuracyScore = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;
  const completionRate = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const isReadyForTest = masteredLessons === totalLessons && masteredLessons > 0;

  const lessonsToReview = allLessons.filter(lesson => {
    const p = progressData[lesson.id];
    return p && p.attempted > 0 && (p.correct / p.attempted) < 0.6;
  }).slice(0, 3);

  const notStartedCount = totalLessons - completedLessons;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <header>
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-1">Your Dashboard</h1>
        <p className="text-gray-600">Welcome back, <span className="font-semibold">{user.email}</span></p>
      </header>

      {/* Ready Banner */}
      {isReadyForTest && (
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 md:p-8 text-white">
          <div className="flex items-center gap-4">
            <Trophy size={56} />
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">🎉 You're Ready for the Test!</h2>
              <p className="text-green-50 text-lg">You've mastered all lessons with 80%+ accuracy. Book your test with confidence!</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Star size={28} className="opacity-80" />
            <span className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">Overall</span>
          </div>
          <div className="text-4xl md:text-5xl font-black mb-1">{accuracyScore}%</div>
          <p className="text-teal-50 text-sm">Accuracy Score</p>
          <p className="text-teal-100 text-xs mt-1">{totalCorrect} questions answered</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Trophy size={28} className="opacity-80" />
            <span className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">Mastered</span>
          </div>
          <div className="text-4xl md:text-5xl font-black mb-1">{masteredLessons}</div>
          <p className="text-green-50 text-sm">Lessons at 80%+</p>
          <p className="text-green-100 text-xs mt-1">Out of {totalLessons} total</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp size={28} className="opacity-80" />
            <span className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">Progress</span>
          </div>
          <div className="text-4xl md:text-5xl font-black mb-1">{completionRate}%</div>
          <p className="text-blue-50 text-sm">Completion Rate</p>
          <p className="text-blue-100 text-xs mt-1">{completedLessons}/{totalLessons} lessons started</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Zap size={28} className="opacity-80" />
            <span className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">Focus</span>
          </div>
          <div className="text-4xl md:text-5xl font-black mb-1">{needsWorkLessons}</div>
          <p className="text-orange-50 text-sm">Need Review</p>
          <p className="text-orange-100 text-xs mt-1">Below 60% accuracy</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Lesson Status */}
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Lesson Status</h2>
          
          <div className="flex items-center justify-center mb-8">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full -rotate-90">
                <circle cx="96" cy="96" r="88" stroke="#e5e7eb" strokeWidth="16" fill="none" />
                <circle 
                  cx="96" cy="96" r="88" 
                  stroke="#10b981" 
                  strokeWidth="16" 
                  fill="none"
                  strokeDasharray={`${(masteredLessons / totalLessons) * 552.92} 552.92`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-5xl font-black text-gray-900">{masteredLessons}</div>
                <div className="text-sm text-gray-500">of {totalLessons}</div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-700">Mastered (80%+)</span>
              </div>
              <span className="text-sm font-bold text-gray-900">{masteredLessons}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <span className="text-sm text-gray-700">Good (60-79%)</span>
              </div>
              <span className="text-sm font-bold text-gray-900">{completedLessons - masteredLessons - needsWorkLessons}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-sm text-gray-700">Needs Work (&lt;60%)</span>
              </div>
              <span className="text-sm font-bold text-gray-900">{needsWorkLessons}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                <span className="text-sm text-gray-700">Not Started</span>
              </div>
              <span className="text-sm font-bold text-gray-900">{notStartedCount}</span>
            </div>
          </div>
        </div>

        {/* Performance by Module */}
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <BarChart3 className="text-teal-600" size={24} />
            Performance by Module
          </h2>
          <div className="space-y-6">
            {modules.map(module => {
              const moduleLessons = allLessons.filter(l => l.module_slug === module.slug);
              const moduleMastered = moduleLessons.filter(l => {
                const p = progressData[l.id];
                return p && p.attempted > 0 && (p.correct / p.attempted) >= 0.8;
              }).length;
              const moduleAttempted = moduleLessons.filter(l => progressData[l.id]?.attempted > 0).length;
              const percentage = moduleLessons.length > 0 ? Math.round((moduleMastered / moduleLessons.length) * 100) : 0;
              
              return (
                <div key={module.slug}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-gray-900">{module.title}</span>
                    <span className="text-2xl font-black text-teal-600">{percentage}%</span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-1">
                    <div 
                      className="h-3 bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500" 
                      style={{width: `${percentage}%`}}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500">{moduleMastered}/{moduleLessons.length} mastered • {moduleAttempted} questions</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-cyan-600 rounded-xl flex items-center justify-center">
              <BookOpen className="text-white" size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Keep Learning</h3>
          </div>
          <p className="text-gray-700 mb-4 text-sm">{notStartedCount} lessons waiting for you. Every lesson brings you closer to success!</p>
          <Link to="/content" className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-600 text-white rounded-xl font-semibold hover:bg-cyan-700 transition-all">
            Browse Lessons
            <ArrowRight size={18} />
          </Link>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="text-white" size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Great Work!</h3>
          </div>
          <p className="text-gray-700 mb-4 text-sm">
            {needsWorkLessons === 0 
              ? "No lessons below 60%! You're making excellent progress across the board."
              : "Keep up the momentum! Practice makes perfect."}
          </p>
          <Link to="/practice" className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all">
            Keep Practicing
            <Trophy size={18} />
          </Link>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
              <Clock className="text-white" size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Pro Tips</h3>
          </div>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="text-purple-600 flex-shrink-0 mt-0.5" size={16} />
              <span>Aim for 80%+ on all lessons</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="text-purple-600 flex-shrink-0 mt-0.5" size={16} />
              <span>Use flashcards daily for retention</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="text-purple-600 flex-shrink-0 mt-0.5" size={16} />
              <span>Review weak areas regularly</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Review Lessons */}
      {lessonsToReview.length > 0 && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Brain className="text-amber-600" size={24} />
            Lessons to Review
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            {lessonsToReview.map(lesson => {
              const p = progressData[lesson.id];
              const percentage = Math.round((p.correct / p.attempted) * 100);
              return (
                <Link 
                  key={lesson.id} 
                  to={`/practice/${lesson.id}`}
                  className="bg-white border-2 border-amber-200 rounded-xl p-4 hover:border-amber-300 transition-colors"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-900 text-sm">{lesson.title}</span>
                    <span className="text-lg font-bold text-amber-600">{percentage}%</span>
                  </div>
                  <p className="text-xs text-gray-600">{p.correct}/{p.attempted} correct</p>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
