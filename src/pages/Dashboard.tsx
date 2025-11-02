import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllLessons, getModules } from "../lib/content";
import { getAllProgress } from "../lib/progress";
import { getCurrentUser } from "../lib/auth";
import { 
  Trophy, Target, AlertCircle, BookOpen, CheckCircle2, 
  TrendingUp, Award, Sparkles, ArrowRight, Clock
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
          <div className="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your progress...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="text-teal-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in to track progress</h2>
          <p className="text-gray-600 mb-6">
            Create an account to save your progress across all devices and see your personalized dashboard.
          </p>
          <Link
            to="/"
            className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 text-white font-semibold hover:opacity-90 transition"
          >
            Sign In to Continue
          </Link>
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
  let needsWorkLessons = 0;

  allLessons.forEach(lesson => {
    const progress = progressData[lesson.id];
    if (progress) {
      totalQuestions += progress.attempted;
      totalCorrect += progress.correct;
      
      const percentage = progress.attempted > 0 
        ? (progress.correct / progress.attempted) * 100 
        : 0;
      
      if (percentage >= 80) masteredLessons++;
      else if (percentage < 60 && progress.attempted > 0) needsWorkLessons++;
    }
  });

  const overallPercentage = totalQuestions > 0 
    ? Math.round((totalCorrect / totalQuestions) * 100) 
    : 0;

  const isReadyForTest = masteredLessons === totalLessons && totalLessons > 0;

  // Module breakdown
  const moduleStats = modules.map(module => {
    const moduleLessons = allLessons.filter(l => l.module_slug === module.slug);
    const attempted = moduleLessons.filter(l => progressData[l.id]?.attempted > 0).length;
    const mastered = moduleLessons.filter(l => {
      const p = progressData[l.id];
      return p && p.attempted > 0 && (p.correct / p.attempted) >= 0.8;
    }).length;
    
    return {
      ...module,
      total: moduleLessons.length,
      attempted,
      mastered,
      percentage: attempted > 0 ? Math.round((mastered / moduleLessons.length) * 100) : 0
    };
  });

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6 pb-32 md:pb-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-gray-900">Your Dashboard</h1>
        <p className="text-lg text-gray-600">Welcome back, {user.email}</p>
      </div>

      {/* Ready for Test Banner */}
      {isReadyForTest && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10">
            <Award size={200} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <Trophy size={32} />
              <h2 className="text-3xl font-bold">You're Ready!</h2>
            </div>
            <p className="text-lg mb-6 text-green-50">
              Congratulations! You've mastered all lessons with 80%+ scores. You're ready to take the full practice test.
            </p>
            <Link
              to="/mock"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-green-600 rounded-xl font-bold hover:bg-green-50 transition"
            >
              Take Practice Test <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      )}

      {/* Overall Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <BookOpen className="text-teal-600" size={24} />
            <span className="text-sm font-medium text-gray-500">Progress</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {lessonsAttempted}/{totalLessons}
          </div>
          <p className="text-sm text-gray-600">Lessons started</p>
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <Trophy className="text-green-600" size={24} />
            <span className="text-sm font-medium text-gray-500">Mastered</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {masteredLessons}
          </div>
          <p className="text-sm text-gray-600">Lessons at 80%+</p>
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <Target className="text-blue-600" size={24} />
            <span className="text-sm font-medium text-gray-500">Overall</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {overallPercentage}%
          </div>
          <p className="text-sm text-gray-600">{totalQuestions} questions</p>
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <AlertCircle className="text-red-600" size={24} />
            <span className="text-sm font-medium text-gray-500">Review</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {needsWorkLessons}
          </div>
          <p className="text-sm text-gray-600">Need more work</p>
        </div>
      </div>

      {/* Progress by Module */}
      <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <TrendingUp className="text-teal-600" size={24} />
          Progress by Module
        </h2>
        
        <div className="space-y-4">
          {moduleStats.map(module => (
            <div key={module.slug} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{module.title}</h3>
                  <p className="text-sm text-gray-600">
                    {module.mastered} of {module.total} mastered • {module.attempted} attempted
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{module.percentage}%</div>
                </div>
              </div>
              
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${
                    module.percentage >= 80 
                      ? 'bg-gradient-to-r from-green-500 to-green-600' 
                      : module.percentage >= 60
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600'
                      : 'bg-gradient-to-r from-red-500 to-red-600'
                  }`}
                  style={{ width: `${module.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* What to study next */}
        <div className="bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-200 rounded-xl p-6">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Sparkles className="text-teal-600" size={20} />
            Continue Learning
          </h3>
          {lessonsAttempted < totalLessons ? (
            <>
              <p className="text-sm text-gray-700 mb-4">
                You have {totalLessons - lessonsAttempted} lessons left to try. Keep going!
              </p>
              <Link
                to="/content"
                className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition text-sm"
              >
                Browse Lessons <ArrowRight size={16} />
              </Link>
            </>
          ) : (
            <p className="text-sm text-gray-700">
              Great job! You've started all available lessons. Keep practicing to improve your scores.
            </p>
          )}
        </div>

        {/* Practice more */}
        {needsWorkLessons > 0 && (
          <div className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-xl p-6">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <AlertCircle className="text-red-600" size={20} />
              Focus Areas
            </h3>
            <p className="text-sm text-gray-700 mb-4">
              {needsWorkLessons} {needsWorkLessons === 1 ? 'lesson needs' : 'lessons need'} more practice to reach 80%.
            </p>
            <Link
              to="/practice"
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition text-sm"
            >
              Practice Now <ArrowRight size={16} />
            </Link>
          </div>
        )}

        {/* Study streak or motivation */}
        {needsWorkLessons === 0 && lessonsAttempted === totalLessons && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <CheckCircle2 className="text-green-600" size={20} />
              Excellent Work!
            </h3>
            <p className="text-sm text-gray-700 mb-4">
              All lessons are at 60% or above. You're making great progress!
            </p>
            <Link
              to="/practice"
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition text-sm"
            >
              Keep Practicing <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>

      {/* Study Tips */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Clock className="text-blue-600" size={20} />
          Study Tips
        </h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="text-blue-600 flex-shrink-0 mt-0.5" size={16} />
            <span>Study each lesson thoroughly before attempting practice questions</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="text-blue-600 flex-shrink-0 mt-0.5" size={16} />
            <span>Aim for 80% or higher on all practice questions to be test-ready</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="text-blue-600 flex-shrink-0 mt-0.5" size={16} />
            <span>Use flashcards to reinforce key facts, dates, and names</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="text-blue-600 flex-shrink-0 mt-0.5" size={16} />
            <span>Review lessons where you scored below 60% until you improve</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
