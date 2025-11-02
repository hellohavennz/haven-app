import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCurrentUser } from "./lib/auth";
import { 
  BookOpen, Brain, Trophy, BarChart3, Sparkles, CheckCircle2, 
  Target, Zap, Award, ArrowRight, Star, Clock
} from "lucide-react";

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getCurrentUser().then(currentUser => {
      setUser(currentUser);
      setLoading(false);
      // Redirect authenticated users to dashboard
      if (currentUser) {
        navigate('/dashboard');
      }
    });
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-50 via-white to-cyan-50 -mx-4 px-4 py-20 md:py-32">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-100 text-teal-700 rounded-full text-sm font-semibold mb-6">
            <Sparkles size={16} />
            <span>Pass Your Life in the UK Test with Confidence</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 leading-tight">
            Study Calmly.
            <br />
            <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Pass Confidently.
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Master the official Life in the UK handbook with interactive lessons, 
            practice questions, and smart progress tracking. Join thousands who passed on their first try.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/content"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl font-bold text-lg hover:opacity-90 transition-all shadow-xl shadow-teal-200"
            >
              Start Learning Free
              <ArrowRight size={24} />
            </Link>
            <Link
              to="/paywall"
              className="inline-flex items-center gap-2 px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all"
            >
              View Premium
              <Star size={20} />
            </Link>
          </div>
          
          <p className="mt-6 text-sm text-gray-500">
            ✓ Try the first lesson free • ✓ No credit card required • ✓ Pass guarantee
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 rounded-2xl mb-4">
              <BookOpen className="text-teal-600" size={32} />
            </div>
            <div className="text-4xl font-black text-gray-900 mb-2">20+</div>
            <p className="text-gray-600 font-medium">Comprehensive Lessons</p>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-2xl mb-4">
              <Target className="text-green-600" size={32} />
            </div>
            <div className="text-4xl font-black text-gray-900 mb-2">500+</div>
            <p className="text-gray-600 font-medium">Practice Questions</p>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-2xl mb-4">
              <Trophy className="text-amber-600" size={32} />
            </div>
            <div className="text-4xl font-black text-gray-900 mb-2">95%</div>
            <p className="text-gray-600 font-medium">Pass Rate</p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
            Everything You Need to Pass
          </h2>
          <p className="text-xl text-gray-600">
            Comprehensive study tools designed for success
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-teal-300 hover:shadow-lg transition-all">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center mb-4">
              <BookOpen className="text-white" size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Plain-English Lessons
            </h3>
            <p className="text-gray-600">
              Every topic from the official handbook, rewritten clearly with memory hooks and key facts.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-teal-300 hover:shadow-lg transition-all">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4">
              <Target className="text-white" size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Realistic Practice Questions
            </h3>
            <p className="text-gray-600">
              Hundreds of exam-style questions with detailed explanations for every answer.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-teal-300 hover:shadow-lg transition-all">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
              <Brain className="text-white" size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Interactive Flashcards
            </h3>
            <p className="text-gray-600">
              Memorize key facts with spaced repetition. Perfect for on-the-go learning.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-teal-300 hover:shadow-lg transition-all">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
              <BarChart3 className="text-white" size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Smart Progress Tracking
            </h3>
            <p className="text-gray-600">
              See your mastery level for each topic. Know exactly what to focus on.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-teal-300 hover:shadow-lg transition-all">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-4">
              <Zap className="text-white" size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Full Mock Exams
            </h3>
            <p className="text-gray-600">
              Practice under real exam conditions. Build confidence before test day.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-teal-300 hover:shadow-lg transition-all">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center mb-4">
              <Award className="text-white" size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Pass Guarantee
            </h3>
            <p className="text-gray-600">
              Complete the course and fail? Get your money back. We're that confident.
            </p>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="max-w-6xl mx-auto">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 md:p-12 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500 rounded-full blur-3xl opacity-20"></div>
          <div className="relative z-10">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur rounded-full text-sm font-semibold mb-6">
                  <BarChart3 size={16} />
                  <span>Smart Dashboard</span>
                </div>
                <h2 className="text-4xl font-extrabold mb-6">
                  Track Every Step of Your Journey
                </h2>
                <p className="text-lg text-gray-300 mb-8">
                  Your personal dashboard shows exactly where you are, what you've mastered, 
                  and what needs more practice. Never wonder if you're ready for the test.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="text-green-400 flex-shrink-0" size={24} />
                    <span>Visual progress charts for every module</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="text-green-400 flex-shrink-0" size={24} />
                    <span>Personalized recommendations on what to study next</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="text-green-400 flex-shrink-0" size={24} />
                    <span>"Ready for test" indicator when you hit 80%+ on all lessons</span>
                  </li>
                </ul>
                <Link
                  to="/content"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-xl font-bold hover:bg-gray-100 transition-all"
                >
                  Try It Free
                  <ArrowRight size={20} />
                </Link>
              </div>
              
              <div className="relative">
                {/* Mock Dashboard Preview */}
                <div className="bg-white rounded-2xl shadow-2xl p-6 transform rotate-2 hover:rotate-0 transition-transform">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-600">Your Progress</span>
                      <span className="text-3xl font-black text-teal-600">68%</span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-3 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full" style={{width: '68%'}}></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div className="bg-green-50 rounded-xl p-4">
                        <Trophy className="text-green-600 mb-2" size={24} />
                        <div className="text-2xl font-bold text-gray-900">12</div>
                        <div className="text-xs text-gray-600">Mastered</div>
                      </div>
                      <div className="bg-blue-50 rounded-xl p-4">
                        <Target className="text-blue-600 mb-2" size={24} />
                        <div className="text-2xl font-bold text-gray-900">85%</div>
                        <div className="text-xs text-gray-600">Accuracy</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600">
            Four simple steps to test success
          </p>
        </div>
        
        <div className="space-y-8">
          <div className="flex gap-6 items-start">
            <div className="flex-shrink-0 w-12 h-12 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
              1
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Study Each Lesson</h3>
              <p className="text-gray-600">
                Read through our plain-English lessons covering every topic from the official handbook. 
                Each lesson includes key facts and memory hooks.
              </p>
            </div>
          </div>
          
          <div className="flex gap-6 items-start">
            <div className="flex-shrink-0 w-12 h-12 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
              2
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Practice Questions</h3>
              <p className="text-gray-600">
                Test yourself with realistic exam-style questions. Get instant feedback with detailed 
                explanations for every answer.
              </p>
            </div>
          </div>
          
          <div className="flex gap-6 items-start">
            <div className="flex-shrink-0 w-12 h-12 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
              3
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Review with Flashcards</h3>
              <p className="text-gray-600">
                Reinforce your memory with interactive flashcards. Perfect for quick daily review 
                sessions on your phone or computer.
              </p>
            </div>
          </div>
          
          <div className="flex gap-6 items-start">
            <div className="flex-shrink-0 w-12 h-12 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
              4
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Take the Real Test</h3>
              <p className="text-gray-600">
                When you've scored 80%+ on all practice questions, you're ready. Book your test 
                and pass with confidence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing CTA */}
      <section className="max-w-3xl mx-auto">
        <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-3xl p-12 text-white text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur rounded-full mb-6">
            <Sparkles className="text-white" size={32} />
          </div>
          <h2 className="text-4xl font-extrabold mb-4">
            Ready to Pass Your Test?
          </h2>
          <p className="text-xl text-teal-50 mb-8">
            Join thousands who passed on their first try
          </p>
          <div className="bg-white/10 backdrop-blur rounded-2xl p-6 mb-8 inline-block">
            <div className="flex items-baseline gap-2 justify-center mb-2">
              <span className="text-5xl font-black">£12.99</span>
              <span className="text-xl">one-time</span>
            </div>
            <p className="text-teal-50 text-sm">
              Lifetime access • Pass guarantee • No subscription
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/paywall"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-teal-600 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all shadow-xl"
            >
              Get Premium Access
              <ArrowRight size={24} />
            </Link>
            <Link
              to="/content"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white text-white rounded-xl font-bold text-lg hover:bg-white/10 transition-all"
            >
              Try First Lesson Free
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="max-w-4xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div>
            <Clock className="text-teal-600 mx-auto mb-3" size={32} />
            <h4 className="font-bold text-gray-900 mb-2">Instant Access</h4>
            <p className="text-sm text-gray-600">Start learning immediately after purchase</p>
          </div>
          <div>
            <Award className="text-teal-600 mx-auto mb-3" size={32} />
            <h4 className="font-bold text-gray-900 mb-2">Pass Guarantee</h4>
            <p className="text-sm text-gray-600">Complete course and fail? Get refunded</p>
          </div>
          <div>
            <CheckCircle2 className="text-teal-600 mx-auto mb-3" size={32} />
            <h4 className="font-bold text-gray-900 mb-2">No Subscription</h4>
            <p className="text-sm text-gray-600">One payment, lifetime access forever</p>
          </div>
        </div>
      </section>
    </div>
  );
}
