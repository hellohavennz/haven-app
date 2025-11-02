cat > src/pages/Dashboard.tsx << 'EOF'
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCurrentUser } from "../lib/auth";
import { getModules, getAllLessons } from "../lib/content";
import { getAllProgress } from "../lib/progress";
import { Trophy, Target, CheckCircle2, BarChart3, TrendingUp, Sparkles, ArrowRight, Lock, Crown, BookOpen } from "lucide-react";

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

  // If not logged in, show promotional dashboard
  if (!user) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-16">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full mb-4">
            <BarChart3 className="text-white" size={40} />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">
            Track Your Progress to Success
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Create an account to unlock your personal dashboard and track your journey to passing the Life in the UK test.
          </p>
        </div>

        {/* Demo Dashboard Preview */}
        <div className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-3xl p-8 md:p-12">
          <div className="space-y-8">
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

            <div className="bg-white border-2 border-teal-200 rounded-2xl p-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Your Progress</h3>
                <span className="text-3xl font-black text-teal-600">68%</span>
              </div>
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden mb-6">
                <div className="h-4 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full" style={{width: '68%'}}></div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">History Module</span>
                  <span className="font-semibold text-green-600">✓ 100%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Government & Law</span>
                  <span className="font-semibold text-amber-600">⚠ 65%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Everyday Life</span>
                  <span className="font-semibold text-gray-400">○ 0%</span>
                </div>
              </div>
            </div>

            <div className="absolute inset-0 backdrop-blur-sm bg-white/50 rounded-3xl flex items-center justify-center">
              <div className="bg-white border-2 border-gray-300 rounded-2xl p-8 text-center max-w-md mx-4">
                <Lock className="text-gray-400 mx-auto mb-4" size={48} />
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Sign In to Continue</h3>
                <p className="text-gray-600 mb-6">Create a free account to access your personal dashboard and start tracking your progress.</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link to="/signup" className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl font-bold hover:opacity-90 transition-all">
                    Sign Up Free
                  </Link>
                  <Link to="/login" className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all">
                    Sign In
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-6">
            <CheckCircle2 className="text-teal-600 mb-4" size={32} />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Track Your Progress</h3>
            <p className="text-gray-600">See exactly which topics you've mastered and which need more practice. Visual charts show your progress at a glance.</p>
          </div>
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-6">
            <Target className="text-teal-600mb-4" size={32} />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Personalized Recommendations</h3>
            <p className="text-gray-600">Get smart suggestions on what to study next based on your performance and weak areas.</p>
          </div>
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-6">
            <Trophy className="text-teal-600 mb-4" size={32} />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Achievement System</h3>
            <p className="text-gray-600">Earn badges and milestones as you progress. Stay motivated with clear goals and achievements.</p>
          </div>
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-6">
            <BarChart3 className="text-teal-600 mb-4" size={32} />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Detailed Analytics</h3>
            <p className="text-gray-600">Deep dive into your performance with detailed statistics on accuracy, time spent, and improvement trends.</p>
          </div>
        </div>

        {/* Pricing CTA */}
        <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-3xl p-8 md:p-12 text-white text-center">
          <Sparkles className="mx-auto mb-4" size={48} />
          <h2 className="text-3xl font-extrabold mb-4">Ready to Start Your Journey?</h2>
          <p className="text-xl text-teal-50 mb-8 max-w-2xl mx-auto">
            Create a free account and get access to your first lesson. Upgrade to Haven Plus for full access to all features.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-teal-600 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all">
              Sign Up Free
              <ArrowRight size={24} />
            </Link>
            <Link to="/paywall" className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white text-white rounded-xl font-bold text-lg hover:bg-white/10 transition-all">
              View Pricing
              <Crown size={24} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Existing dashboard code for logged-in users...
  const modules = getModules();
  const allLessons = getAllLessons();
  const totalLessons = allLessons.length;
  const completedLessons = Object.keys(progressData).length;
  const masteredLessons = Object.keys(progressData).filter(id => {
    const p = progressData[id];
    return p && p.attempted > 0 && (p.correct / p.attempted) >= 0.8;
  }).length;

  const totalAttempted = Object.values(progressData).reduce((sum, p) => sum + p.attempted, 0);
  const totalCorrect = Object.values(progressData).reduce((sum, p) => sum + p.correct, 0);
  const overallAccuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;
  const completionPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const isReadyForTest = masteredLessons === totalLessons && masteredLessons > 0;

  const needsWork = allLessons.filter(lesson => {
    const p = progressData[lesson.id];
    return p && p.attempted > 0 && (p.correct / p.attempted) < 0.6;
  }).slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <header>
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">Your Dashboard</h1>
        <p className="text-gray-600">Track your progress and see how you're doing</p>
      </header>

      {isReadyForTest && (
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 md:p-8 text-white">
          <div className="flex items-center gap-4">
            <Trophy size={48} />
            <div>
              <h2 className="text-2xl font-bold mb-2">🎉 You're Ready for the Test!</h2>
              <p className="text-green-50">You've mastered all lessons with 80%+ accuracy. Book your test with confidence!</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
              <BookOpen className="text-teal-600" size={24} />
            </div>
            <div>
              <div className="text-3xl font-black text-gray-900">{completionPercentage}%</div>
              <p className="text-sm text-gray-600">Overall Progress</p>
            </div>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full transition-all duration-500" style={{width: `${completionPercentage}%`}}></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">{completedLessons} of {totalLessons} lessons started</p>
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Trophy className="text-green-600" size={24} />
            </div>
            <div>
              <div className="text-3xl font-black text-gray-900">{masteredLessons}</div>
              <p className="text-sm text-gray-600">Lessons Mastered</p>
            </div>
          </div>
          <p className="text-xs text-gray-500">80%+ accuracy on these lessons</p>
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Target className="text-blue-600" size={24} />
            </div>
            <div>
              <div className="text-3xl font-black text-gray-900">{overallAccuracy}%</div>
              <p className="text-sm text-gray-600">Overall Accuracy</p>
            </div>
          </div>
          <p className="text-xs text-gray-500">{totalCorrect} correct out of {totalAttempted} attempted</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="text-teal-600" size={24} />
            Progress by Module
          </h2>
          <div className="space-y-4">
            {modules.map(module => {
              const moduleLessons = allLessons.filter(l => l.module_slug === module.slug);
              const moduleCompleted = moduleLessons.filter(l => progressData[l.id]?.attempted > 0).length;
              const modulePercentage = Math.round((moduleCompleted / moduleLessons.length) * 100);
              
              return (
                <div key={module.slug}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-gray-700">{module.title}</span>
                    <span className="text-sm font-bold text-teal-600">{modulePercentage}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-2 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full" style={{width: `${modulePercentage}%`}}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {needsWork.length > 0 && (
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="text-amber-600" size={24} />
              Needs More Practice
            </h2>
            <div className="space-y-3">
              {needsWork.map(lesson => {
                const p = progressData[lesson.id];
                const percentage = Math.round((p.correct / p.attempted) * 100);
                return (
                  <Link key={lesson.id} to={`/practice/${lesson.id}`} className="block p-4 bg-amber-50 border border-amber-200 rounded-xl hover:border-amber-300 transition-colors">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-gray-900 text-sm">{lesson.title}</span>
                      <span className="text-sm font-bold text-amber-600">{percentage}%</span>
                    </div>
                    <p className="text-xs text-gray-600">{p.correct} correct out of {p.attempted} attempted</p>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link to="/content" className="flex-1 px-8 py-4 text-center border-2 border-teal-200 text-teal-700 font-semibold rounded-xl hover:bg-teal-50 transition-all">
          Continue Studying
        </Link>
        <Link to="/practice" className="flex-1 px-8 py-4 text-center bg-gradient-to-r from-teal-600 to-teal-700 text-white font-semibold rounded-xl hover:opacity-90 transition-all">
          Practice Questions
        </Link>
      </div>
    </div>
  );
}
EOF