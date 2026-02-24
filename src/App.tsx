import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCurrentUser } from "./lib/auth";
import {
  BookOpen,
  Brain,
  Trophy,
  BarChart3,
  Sparkles,
  CheckCircle2,
  Target,
  Zap,
  Award,
  ArrowRight,
  Star,
  Clock,
  Crown,
  TrendingUp,
  Headphones,
  FileText,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import TestimonialCarousel from "./components/TestimonialCarousel";

type IconStat = {
  icon: LucideIcon;
  value: string;
  label: string;
  background: string;
  iconColor: string;
  helperText?: string;
};

const heroStats: IconStat[] = [
  { icon: BookOpen, value: "20+", label: "Comprehensive Lessons", background: "bg-teal-100", iconColor: "text-teal-600" },
  { icon: Target, value: "500+", label: "Practice Questions", background: "bg-green-100", iconColor: "text-green-600" },
  {
    icon: TrendingUp,
    value: "95%",
    label: "Haven User Pass Rate",
    background: "bg-amber-100",
    iconColor: "text-amber-600",
    helperText: "vs 68.5% average",
  },
];

type FeatureCard = {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
};

const productFeatures: FeatureCard[] = [
  {
    icon: BookOpen,
    title: "Plain-English Lessons",
    description: "Every topic from the official handbook, rewritten clearly with memory hooks and key facts.",
    gradient: "from-teal-500 to-teal-600",
  },
  {
    icon: Target,
    title: "Realistic Practice Questions",
    description: "Hundreds of exam-style questions with detailed explanations for every answer.",
    gradient: "from-green-500 to-green-600",
  },
  {
    icon: Brain,
    title: "Interactive Flashcards",
    description: "Memorize key facts with spaced repetition. Perfect for on-the-go learning.",
    gradient: "from-purple-500 to-purple-600",
  },
  {
    icon: BarChart3,
    title: "Smart Progress Tracking",
    description: "See your mastery level for each topic. Know exactly what to focus on.",
    gradient: "from-blue-500 to-blue-600",
  },
  {
    icon: Zap,
    title: "Full Mock Exams",
    description: "Practice under real exam conditions. Build confidence before test day.",
    gradient: "from-orange-500 to-orange-600",
  },
  {
    icon: Award,
    title: "Pass Guarantee",
    description: "Complete the course and fail? Get your money back. We're that confident.",
    gradient: "from-amber-500 to-amber-600",
  },
];

const dashboardHighlights = [
  "Visual progress charts for every module",
  "Personalized recommendations on what to study next",
  '"Ready for test" indicator when you hit 80%+ on all lessons',
];

const howItWorksSteps = [
  {
    title: "Study Each Lesson",
    description:
      "Read through our plain-English lessons covering every topic from the official handbook. Each lesson includes key facts and memory hooks.",
  },
  {
    title: "Practice Questions",
    description:
      "Test yourself with realistic exam-style questions. Get instant feedback with detailed explanations for every answer.",
  },
  {
    title: "Review with Flashcards",
    description:
      "Reinforce your memory with interactive flashcards. Perfect for quick daily review sessions on your phone or computer.",
  },
  {
    title: "Take the Real Test",
    description: "When you've scored 80%+ on all practice questions, you're ready. Book your test and pass with confidence.",
  },
];

const planPlusFeatures = [
  "All 29 comprehensive lessons",
  "500+ practice questions",
  "All flashcards for every lesson",
  "2 mock exams (45 min timer)",
  "Progress tracking",
  "Resit Support if you fail",
];

const planPremiumExtras = [
  { icon: Headphones, title: "AI study assistant (Pippa)", description: "Get instant answers to your questions" },
  { icon: BarChart3, title: "Performance analytics", description: "Identify weak areas with detailed insights" },
  { icon: Brain, title: "Dynamic exams", description: "Unlimited randomised practice exams" },
  { icon: FileText, title: "Offline mobile access", description: "Study anywhere, no internet needed" },
  { icon: Zap, title: "Priority email support", description: "Get help within 24 hours" },
];

const trustSignals = [
  { icon: Clock, title: "Instant Access", description: "Start learning immediately after purchase" },
  { icon: Award, title: "Resit Support", description: "Fail after completing the course? We cover your resit" },
  { icon: CheckCircle2, title: "Cancel Anytime", description: "No long-term commitment required" },
];

export default function App() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getCurrentUser().then(currentUser => {
      setLoading(false);
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
    <div className="space-y-20 pb-20 min-h-screen text-gray-900 transition-colors bg-white dark:bg-gray-950 dark:text-gray-100">
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-50 via-white to-cyan-50 dark:from-gray-900 dark:via-slate-950 dark:to-gray-900 -mx-4 px-4 py-20 md:py-32">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-100 rounded-full text-sm font-semibold mb-6">
            <Sparkles size={16} />
            <span>Pass Your Life in the UK Test with Confidence</span>
          </div>
          <h1 className="font-semibold text-gray-900 dark:text-white mb-6 leading-tight">
            Study Calmly.
            <br />
            <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">Pass Confidently.</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-200 mb-10 max-w-3xl mx-auto leading-relaxed">
            Master the official Life in the UK handbook with interactive lessons, practice questions, and smart progress tracking. Join thousands who passed on their first try.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/content" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl font-semibold hover:opacity-90 transition-all">
              Start Learning Free
              <ArrowRight size={24} />
            </Link>
            <a href="#pricing" className="inline-flex items-center gap-2 px-8 py-4 border-2 border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-800 rounded-xl font-semibold hover:bg-gray-50 transition-all">
              View Plans
              <Star size={20} />
            </a>
          </div>
          <p className="mt-6 text-sm text-gray-500 dark:text-gray-300">✓ Try the first lesson free • ✓ No credit card required • ✓ Pass guarantee</p>
        </div>
      </section>

      <section className="-mx-4 px-4 py-16 bg-slate-50 dark:bg-gray-900/60">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          {heroStats.map(stat => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="text-center">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 ${stat.background}`}>
                  <Icon className={stat.iconColor} size={32} />
                </div>
                <div className="text-4xl font-semibold text-gray-900 dark:text-white mb-2">{stat.value}</div>
                <p className="text-gray-600 dark:text-gray-200">{stat.label}</p>
                {stat.helperText && <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">{stat.helperText}</p>}
              </div>
            );
          })}
        </div>
      </section>

      <section className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Everything You Need to Pass</h2>
          <p className="text-gray-600 dark:text-gray-300">Comprehensive study tools designed for success</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {productFeatures.map(feature => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="bg-white border-2 border-gray-200 dark:border-gray-800 dark:bg-gray-900 rounded-2xl p-6 hover:border-teal-300 transition-all">
                <div className={`w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon className="text-white" size={24} />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="max-w-6xl mx-auto">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 md:p-12 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500 rounded-full blur-3xl opacity-20"></div>
          <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 dark:bg-white/5 backdrop-blur rounded-full text-sm font-semibold mb-6">
                <BarChart3 size={16} />
                <span>Smart Dashboard</span>
              </div>
              <h2 className="font-semibold mb-6">Track Every Step of Your Journey</h2>
              <p className="text-gray-300 mb-8">
                Your personal dashboard shows exactly where you are, what you've mastered, and what needs more practice. Never wonder if you're ready for the test.
              </p>
              <ul className="space-y-3 mb-8">
                {dashboardHighlights.map(highlight => (
                  <li key={highlight} className="flex items-center gap-3">
                    <CheckCircle2 className="text-green-400 flex-shrink-0" size={24} />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/content"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 dark:bg-gray-900 dark:text-white rounded-xl font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              >
                Try It Free
                <ArrowRight size={20} />
              </Link>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl dark:bg-gray-900 p-6 transform rotate-2 hover:rotate-0 transition-transform">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-200">Your Progress</span>
                    <span className="text-3xl font-semibold text-teal-600">68%</span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-3 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full" style={{ width: '68%' }}></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="bg-green-50 dark:bg-emerald-500/10 rounded-xl p-4">
                      <Trophy className="text-green-600 mb-2" size={24} />
                      <div className="text-2xl font-semibold text-gray-900 dark:text-white">12</div>
                      <div className="text-small text-gray-600 dark:text-gray-300">Mastered</div>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-500/10 rounded-xl p-4">
                      <Target className="text-blue-600 mb-2" size={24} />
                      <div className="text-2xl font-semibold text-gray-900 dark:text-white">85%</div>
                      <div className="text-small text-gray-600 dark:text-gray-300">Accuracy</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Loved by Thousands of Test Takers</h2>
          <p className="text-gray-600 dark:text-gray-300">Real stories from people who passed with Haven</p>
        </div>
        <TestimonialCarousel />
      </section>

      <section className="-mx-4 px-4 py-20 bg-slate-100 dark:bg-gray-900/40">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">How It Works</h2>
            <p className="text-gray-600 dark:text-gray-200">Four simple steps to test success</p>
          </div>
          <div className="space-y-8">
            {howItWorksSteps.map((step, index) => (
              <div key={step.title} className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-teal-600 text-white rounded-full flex items-center justify-center font-semibold text-xl">
                  {index + 1}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                  <p className="text-gray-600 dark:text-gray-200">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="-mx-4 px-4 py-20 bg-white dark:bg-gray-950/40">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center mb-12">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Choose Your Plan</h2>
            <p className="text-gray-600 dark:text-gray-300">Start free, or unlock full access</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white border-2 border-gray-300 dark:bg-gray-900 dark:border-gray-700 rounded-2xl p-8 flex flex-col">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl mb-4">
                  <BookOpen className="text-gray-600 dark:text-gray-400" size={32} />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Free</h3>
                <div className="flex items-baseline justify-center gap-2 mb-2">
                  <span className="text-5xl font-semibold text-gray-900 dark:text-white">£0</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Try Haven with the first module and core practice tools</p>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="text-gray-600 dark:text-gray-400 flex-shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700 dark:text-gray-200">First lesson (Values & Principles)</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="text-gray-600 dark:text-gray-400 flex-shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700 dark:text-gray-200">2 free modules</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="text-gray-600 dark:text-gray-400 flex-shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700 dark:text-gray-200">Practice questions (free modules only)</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="text-gray-600 dark:text-gray-400 flex-shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700 dark:text-gray-200">Sample flashcards (5 per lesson)</span>
                </li>
              </ul>
              <Link
                to="/signup?plan=free"
                className="flex items-center justify-center gap-2 w-full px-8 py-4 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-xl font-semibold hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors mt-auto"
              >
                Get Started Free
                <ArrowRight size={20} />
              </Link>
            </div>

            {/* Haven Plus */}
            <div className="bg-white border-2 border-teal-300 dark:bg-gray-900 dark:border-teal-400/40 rounded-2xl p-8 relative flex flex-col">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-teal-600 text-white text-sm font-semibold rounded-full">MOST POPULAR</div>
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 rounded-2xl mb-4">
                  <Sparkles className="text-teal-600" size={32} />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Haven Plus</h3>
                <div className="flex items-baseline justify-center gap-2 mb-2">
                  <span className="text-5xl font-semibold text-gray-900 dark:text-white">£4.99</span>
                  <span className="text-gray-600 dark:text-gray-300">per month</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Everything you need to pass</p>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {planPlusFeatures.map(feature => (
                  <li key={feature} className="flex items-start gap-3">
                    <CheckCircle2 className="text-teal-600 flex-shrink-0 mt-0.5" size={20} />
                    <span className="text-gray-700 dark:text-gray-200">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/paywall"
                className="flex items-center justify-center gap-2 w-full px-8 py-4 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-colors mt-auto"
              >
                Get Plus
                <ArrowRight size={18} />
              </Link>
            </div>

            {/* Haven Premium */}
            <div className="bg-white border-2 border-amber-300 dark:bg-gray-900 dark:border-amber-300/50 rounded-2xl p-8 relative flex flex-col">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold rounded-full">BEST VALUE</div>
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-2xl mb-4">
                  <Crown className="text-amber-600" size={32} />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Haven Premium</h3>
                <div className="flex items-baseline justify-center gap-2 mb-2">
                  <span className="text-5xl font-semibold text-gray-900 dark:text-white">£19.99</span>
                  <span className="text-gray-600 dark:text-gray-300">per year</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Ultimate learning experience</p>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-900 dark:text-white font-semibold">Everything in Haven Plus, and:</span>
                </li>
                {planPremiumExtras.map(extra => {
                  const Icon = extra.icon;
                  return (
                    <li key={extra.title} className="flex items-start gap-3">
                      <Icon className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
                      <div>
                        <span className="text-gray-900 dark:text-white font-semibold">{extra.title}</span>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{extra.description}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <Link
                to="/paywall"
                className="flex items-center justify-center gap-2 w-full px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg mt-auto"
              >
                Get Premium
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
          <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8 text-center">
            {trustSignals.map(signal => {
              const Icon = signal.icon;
              return (
                <div key={signal.title}>
                  <Icon className="text-teal-600 mx-auto mb-3" size={32} />
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{signal.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{signal.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
