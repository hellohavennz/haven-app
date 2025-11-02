import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllLessons, getModules } from "../lib/content";
import { getAllProgress } from "../lib/progress";
import { getCurrentUser } from "../lib/auth";
import { 
  Trophy, Target, AlertCircle, BookOpen, CheckCircle2, 
  TrendingUp, Award, Sparkles, ArrowRight, Zap, Brain, Clock, Star
} from "lucide-react";

type User = { email: string } | null;
type ProgressData = Record<string, { attempted: number; correct: number }>;

export default function Dashboard() {
  const [user, setUser] = useState<User>(null);
  const [progressData, setProgressData] = useState<ProgressData>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getCurrentUser(),
      getAllProgress()
    ]).then(([currentUser, progress]) => {
      setUser(currentUser);
      setProgressData(progress);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading your progress...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto p-6 mt-12">
        <div className="bg-gradient-to-br from-white to-teal-50 border-2 border-teal-200 rounded-2xl p-12 text-center shadow-xl">
          <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Trophy className="text-white" size={40} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Track Your Progress</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
            Sign in to save your progress, view detailed statistics, and get personalized recommendations.
          </p>
          <button
            onClick={() => {
              // AuthButton will handle the modal
              document.querySelector('button')?.click();
            }}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 text-white font-bold text-lg hover:opacity-90 transition shadow-lg"
          >
            <Sparkles size={24} />
            Sign In to Continue
          </button>
        </div>
      </div>
    );
  }

  const allLessons = getAllLessons();
  const modules = getModules();

  // Calculate statistics
  const totalLessons = allLessons.length;
  const lessonsAttempted = Object.keys(progressData).length;
  
  let totalQuestions = 0;
  let totalCorrect = 0;
  let masteredLessons = 0;
  let goodProgressLessons = 0;
  let needsWorkLessons = 0;
  let notStartedLessons = totalLessons;

  allLessons.forEach(lesson => {
    const progress = progressData[lesson.id];
    if (progress && progress.attempted > 0) {
      notStartedLessons--;
      totalQuestions += progress.attempted;
      totalCorrect += progress.correct;
      
      const percentage = (progress.correct / progress.attempted) * 100;
      
      if (percentage >= 80) masteredLessons++;
      else if (percentage >= 60) goodProgressLessons++;
      else needsWorkLessons++;
    }
  });

  const overallPercentage = totalQuestions > 0 
    ? Math.round((totalCorrect / totalQuestions) * 100) 
    : 0;

  const isReadyForTest = masteredLessons === totalLessons && totalLessons > 0;
  const completionPercentage = Math.round((lessonsAttempted / totalLessons) * 100);

  // Module breakdown
  const moduleStats = modules.map(module => {
    const moduleLessons = allLessons.filter(l => l.module_slug === module.slug);
    const moduleProgress = moduleLessons.map(l => progressData[l.id]).filter(Boolean);
    
    let moduleCorrect = 0;
    let moduleTotal = 0;
    let mastered = 0;
    
    moduleLessons.forEach(l => {
      const p = progressData[l.id];
      if (p && p.attempted > 0) {
        moduleCorrect += p.correct;
        moduleTotal += p.attempted;
        if ((p.correct / p.attempted) >= 0.8) mastered++;
      }
    });
    
    const percentage = moduleTotal > 0 ? Math.round((moduleCorrect / moduleTotal) * 100) : 0;
    
    return {
      ...module,
      total: moduleLessons.length,
      attempted: moduleProgress.length,
      mastered,
      percentage,
      questionsAnswered: moduleTotal
    };
  });

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6 pb-32 md:pb-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-5xl font-extrabold text-gray-900 bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
          Your Dashboard
        </h1>
        <p className="text-xl text-gray-600">Welcome back, <span className="font-semibold text-gray-900">{user.email}</span></p>
      </div>

      {/* Ready for Test Banner */}
      {isReadyForTest && (
        <div className="relative bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-3xl p-10 text-white overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-transparent"></div>
          <div className="absolute top-0 right-0 opacity-10 transform rotate-12">
            <Award size={300} />
          </div>
          <div className="relative z-10 flex items-center gap-6">
            <div className="flex-shrink-0 w-24 h-24 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
              <Trophy size={48} className="text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-4xl font-black mb-2">You're Test Ready! 🎉</h2>
              <p className="text-xl text-green-50 mb-4">
                Amazing work! You've mastered all {totalLessons} lessons with 80%+ scores.
              </p>
              <Link
                to="/mock"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-green-600 rounded-xl font-bold hover:bg-green-50 transition shadow-lg text-lg"
              >
                Take Full Practice Test <ArrowRight size={24} />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics - Large Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Overall Score */}
        <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-4">
            <Star className="opacity-80" size={28} />
            <span className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">Overall</span>
          </div>
          <div className="text-5xl font-black mb-2">{overallPercentage}%</div>
          <p className="text-teal-50">Accuracy Score</p>
          <p className="text-sm text-teal-100 mt-1">{totalQuestions} questions answered</p>
        </div>

        {/* Mastered */}
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-4">
            <Trophy className="opacity-80" size={28} />
            <span className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">Mastered</span>
          </div>
          <div className="text-5xl font-black mb-2">{masteredLessons}</div>
          <p className="text-green-50">Lessons at 80%+</p>
          <p className="text-sm text-green-100 mt-1">Out of {totalLessons} total</p>
        </div>

        {/* Progress */}
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="opacity-80" size={28} />
            <span className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">Progress</span>
          </div>
          <div className="text-5xl font-black mb-2">{completionPercentage}%</div>
          <p className="text-blue-50">Completion Rate</p>
          <p className="text-sm text-blue-100 mt-1">{lessonsAttempted}/{totalLessons} lessons started</p>
        </div>

        {/* Needs Work */}
        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-4">
            <Zap className="opacity-80" size={28} />
            <span className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">Focus</span>
          </div>
          <div className="text-5xl font-black mb-2">{needsWorkLessons}</div>
          <p className="text-orange-50">Need Review</p>
          <p className="text-sm text-orange-100 mt-1">Below 60% accuracy</p>
        </div>
      </div>

      {/* Performance Distribution - Donut Chart */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Donut Chart */}
        <div className="md:col-span-1 bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Lesson Status</h3>
          <div className="relative w-48 h-48 mx-auto mb-6">
            {/* SVG Donut Chart */}
            <svg className="transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="12"
              />
              
              {/* Mastered (Green) */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#10b981"
                strokeWidth="12"
                strokeDasharray={`${(masteredLessons / totalLessons) * 251.2} 251.2`}
                strokeDashoffset="0"
                className="transition-all duration-1000"
              />
              
              {/* Good Progress (Amber) */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="12"
                strokeDasharray={`${(goodProgressLessons / totalLessons) * 251.2} 251.2`}
                strokeDashoffset={`-${(masteredLessons / totalLessons) * 251.2}`}
                className="transition-all duration-1000"
              />
              
              {/* Needs Work (Red) */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#ef4444"
                strokeWidth="12"
                strokeDasharray={`${(needsWorkLessons / totalLessons) * 251.2} 251.2`}
                strokeDashoffset={`-${((masteredLessons + goodProgressLessons) / totalLessons) * 251.2}`}
                className="transition-all duration-1000"
              />
            </svg>
            
            {/* Center Text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-black text-gray-900">{lessonsAttempted}</div>
                <div className="text-xs text-gray-500 font-medium">of {totalLessons}</div>
              </div>
            </div>
          </div>
          
          {/* Legend */}
          <div className="space-y-2">
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
              <span className="text-sm font-bold text-gray-900">{goodProgressLessons}</span>
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
              <span className="text-sm font-bold text-gray-900">{notStartedLessons}</span>
            </div>
          </div>
        </div>

        {/* Module Performance Bars */}
        <div className="md:col-span-2 bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Brain className="text-teal-600" size={24} />
            Performance by Module
          </h3>
          
          <div className="space-y-4">
            {moduleStats.map(module => (
              <div key={module.slug} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 text-sm truncate">{module.title}</h4>
                    <p className="text-xs text-gray-500">
                      {module.mastered}/{module.total} mastered • {module.questionsAnswered} questions
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <div className={`text-2xl font-black ${
                      module.percentage >= 80 ? 'text-green-600' :
                      module.percentage >= 60 ? 'text-amber-600' :
                      module.percentage > 0 ? 'text-red-600' : 'text-gray-400'
                    }`}>
                      {module.attempted > 0 ? `${module.percentage}%` : '—'}
                    </div>
                  </div>
                </div>
                
                <div className="relative w-full h-4 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ${
                      module.percentage >= 80 
                        ? 'bg-gradient-to-r from-green-500 to-green-600' 
                        : module.percentage >= 60
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600'
                        : module.percentage > 0
                        ? 'bg-gradient-to-r from-red-500 to-red-600'
                        : 'bg-gray-300'
                    }`}
                    style={{ width: `${module.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Continue Learning */}
        <div className="bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-200 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center">
              <BookOpen className="text-white" size={24} />
            </div>
            <h3 className="font-bold text-gray-900 text-lg">Keep Learning</h3>
          </div>
          {lessonsAttempted < totalLessons ? (
            <>
              <p className="text-sm text-gray-700 mb-4">
                {totalLessons - lessonsAttempted} lessons waiting for you. Every lesson brings you closer to success!
              </p>
              <Link
                to="/content"
                className="inline-flex items-center gap-2 px-5 py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition text-sm shadow-lg"
              >
                Browse Lessons <ArrowRight size={18} />
              </Link>
            </>
          ) : (
            <p className="text-sm text-gray-700">
              Fantastic! You've started all lessons. Keep practicing to master them all.
            </p>
          )}
        </div>

        {/* Practice More */}
        {needsWorkLessons > 0 ? (
          <div className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                <AlertCircle className="text-white" size={24} />
              </div>
              <h3 className="font-bold text-gray-900 text-lg">Focus Areas</h3>
            </div>
            <p className="text-sm text-gray-700 mb-4">
              {needsWorkLessons} {needsWorkLessons === 1 ? 'lesson needs' : 'lessons need'} more practice. Let's improve those scores!
            </p>
            <Link
              to="/practice"
              className="inline-flex items-center gap-2 px-5 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition text-sm shadow-lg"
            >
              Practice Now <Target size={18} />
            </Link>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="text-white" size={24} />
              </div>
              <h3 className="font-bold text-gray-900 text-lg">Great Work!</h3>
            </div>
            <p className="text-sm text-gray-700 mb-4">
              No lessons below 60%! You're making excellent progress across the board.
            </p>
            <Link
              to="/practice"
              className="inline-flex items-center gap-2 px-5 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition text-sm shadow-lg"
            >
              Keep Practicing <Trophy size={18} />
            </Link>
          </div>
        )}

        {/* Study Tips */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Clock className="text-white" size={24} />
            </div>
            <h3 className="font-bold text-gray-900 text-lg">Pro Tips</h3>
          </div>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="text-blue-600 flex-shrink-0 mt-0.5" size={16} />
              <span>Aim for 80%+ on all lessons</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="text-blue-600 flex-shrink-0 mt-0.5" size={16} />
              <span>Use flashcards daily for retention</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="text-blue-600 flex-shrink-0 mt-0.5" size={16} />
              <span>Review weak areas regularly</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
