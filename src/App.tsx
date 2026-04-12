import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCurrentUser } from "./lib/auth";
import { supabase } from "./lib/supabase";
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
  TrendingUp,
  ChevronDown,
  ShieldCheck,
  Bell,
  Smartphone,
  Tag,
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
  { icon: BookOpen, value: "29", label: "Comprehensive Lessons", background: "bg-teal-100", iconColor: "text-teal-600" },
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
    description: "Every topic in the official syllabus, explained plainly and structured for memory. No padding. Just what the test actually covers.",
    gradient: "from-teal-500 to-teal-600",
  },
  {
    icon: Target,
    title: "Realistic Practice Questions",
    description: "Questions designed to reflect the real exam style. Detailed explanations for every answer so you understand why, not just what.",
    gradient: "from-green-500 to-green-600",
  },
  {
    icon: Brain,
    title: "Interactive Flashcards",
    description: "Key facts from every lesson, formatted for quick daily review. Works well in short sessions. Tap to flip, track what you know.",
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
    description: "24 questions, 45 minutes, real exam format. The best way to know if you are genuinely ready before booking.",
    gradient: "from-orange-500 to-orange-600",
  },
  {
    icon: Award,
    title: "Resit Support",
    description: "Prepare with Haven and still don't pass? Get 1 free month of access to keep studying for your resit.",
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
      "Read through our plain-English lessons covering every topic you need to pass. Each lesson includes key facts and memory hooks.",
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

const trustSignals = [
  { icon: Clock, title: "Instant Access", description: "Start learning immediately after purchase" },
  { icon: Award, title: "Resit Support", description: "Prepare properly and still fail? Get 30 days of free access for your resit" },
  { icon: ShieldCheck, title: "No Auto-Renewal", description: "One-off payment. Access expires after 30 or 90 days. No surprises." },
];

const PLAN_PRICES = { plus_1m: 4.99, plus_3m: 9.99, premium_6m: 24.99 };

export default function App() {
  const [loading, setLoading] = useState(true);
  const [sale, setSale] = useState<{ active: boolean; discount: number } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'sale')
      .single()
      .then(({ data }) => {
        if (data?.value) setSale(data.value as { active: boolean; discount: number });
      });
  }, []);

  function salePrice(base: number): number {
    if (!sale?.active) return base;
    return Math.round(base * (1 - sale.discount / 100) * 100) / 100;
  }

  useEffect(() => {
    // One-shot check for existing session (e.g. user navigates back to marketing page)
    getCurrentUser().then(currentUser => {
      setLoading(false);
      if (currentUser) {
        navigate('/dashboard', { replace: true });
      }
    });

    // Also listen for SIGNED_IN so OAuth redirects that land here still work.
    // Supabase PKCE exchanges the ?code= param and fires SIGNED_IN asynchronously —
    // getCurrentUser() above may run before that exchange completes.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        navigate('/dashboard', { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-20 pb-20 min-h-screen text-slate-900 transition-colors bg-white dark:bg-gray-950 dark:text-gray-100">
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-50 via-white to-white dark:from-gray-900 dark:via-slate-950 dark:to-gray-900 -mx-4 px-4 py-20 md:py-32">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-100 rounded-full text-sm font-semibold mb-6">
            <Sparkles size={16} />
            <span>Pass Your Life in the UK Test with Confidence</span>
          </div>
          <h1 className="font-semibold text-slate-900 dark:text-white mb-6 leading-tight">
            Study Calmly.
            <br />
            <span className="bg-gradient-to-r from-teal-700 to-teal-400 bg-clip-text text-transparent">Pass Confidently.</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-200 mb-10 max-w-3xl mx-auto leading-relaxed">
            29 lessons mapped to the official syllabus. 500+ exam-style practice questions with detailed explanations. Flashcards, full mock tests, and progress tracking that shows you when you are genuinely ready.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/signup" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl font-semibold hover:opacity-90 transition-all">
              Start Learning Free
              <ArrowRight size={24} />
            </Link>
            <a href="#pricing" className="inline-flex items-center gap-2 px-8 py-4 border-2 border-slate-300 text-slate-700 dark:border-slate-600 dark:text-gray-100 dark:hover:bg-slate-800 rounded-xl font-semibold hover:bg-slate-50 transition-all">
              View Plans
              <Star size={20} />
            </a>
          </div>
          <div className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400">
              Log in
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-300">
            <span className="whitespace-nowrap">✓ Built around the official test syllabus</span>
            <span className="whitespace-nowrap">✓ Exam-style questions with detailed explanations</span>
            <span className="whitespace-nowrap">✓ No credit card required</span>
            <span className="whitespace-nowrap">✓ Resit support included</span>
          </div>
          <div className="flex justify-center mt-10">
            <ChevronDown size={28} className="animate-bounce text-slate-400 dark:text-slate-500" />
          </div>
        </div>
      </section>

      <section className="-mx-4 px-4 py-16 bg-slate-50 dark:bg-slate-900/60">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          {heroStats.map(stat => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="text-center">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 ${stat.background}`}>
                  <Icon className={stat.iconColor} size={32} />
                </div>
                <div className="text-4xl font-semibold text-slate-900 dark:text-white mb-2">{stat.value}</div>
                <p className="text-slate-600 dark:text-slate-200">{stat.label}</p>
                {stat.helperText && <p className="text-sm text-slate-500 dark:text-slate-300 mt-1">{stat.helperText}</p>}
              </div>
            );
          })}
        </div>
      </section>

      <section className="-mx-4 px-4 py-5 bg-teal-50 dark:bg-teal-950/30 border-y border-teal-100 dark:border-teal-900/50">
        <div className="max-w-3xl mx-auto flex items-start sm:items-center gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/60 flex items-center justify-center">
            <ShieldCheck className="text-teal-700 dark:text-teal-400" size={20} />
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            <strong className="text-slate-900 dark:text-white">Built around the official test syllabus.</strong>{' '}
            Every Haven lesson covers the material from <em>Life in the United Kingdom: A Guide for New Residents</em>, structured into clear lessons with memory hooks, practice questions, and flashcards. Use Haven alongside the official guide for the best chance of passing.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Everything You Need to Pass</h2>
          <p className="text-slate-600 dark:text-slate-300">Comprehensive study tools designed for success</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {productFeatures.map(feature => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="bg-white border-2 border-slate-200 dark:border-slate-800 dark:bg-slate-900 rounded-2xl p-6 hover:border-teal-300 transition-all">
                <div className={`w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon className="text-white" size={24} />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-300">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="-mx-4 px-4 py-16 bg-teal-50 dark:bg-teal-950/20 border-y border-teal-100 dark:border-teal-900/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-semibold text-slate-900 dark:text-white mb-4">More questions is not always better.</h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              The Life in the UK test draws from a defined syllabus. Knowing that material well is what gets you through.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/40 rounded-xl flex items-center justify-center mb-4">
                <Target className="text-teal-700 dark:text-teal-400" size={20} />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Exam-style questions</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">Haven's questions are written to reflect the real exam style, not to inflate a count. Each one tests genuine understanding rather than pattern recognition.</p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/40 rounded-xl flex items-center justify-center mb-4">
                <BookOpen className="text-teal-700 dark:text-teal-400" size={20} />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Explanations that teach</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">Every answer includes a detailed explanation so you understand why it is correct. Knowing the answer is not enough if you cannot explain it.</p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/40 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="text-teal-700 dark:text-teal-400" size={20} />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">A guided study path</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">Haven is not a question bank. It is a complete study path: lessons first, then practice, then flashcards, then mock tests. Progress tracking shows you when you are ready.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 md:p-12 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500 rounded-full blur-3xl opacity-20"></div>
          <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 dark:bg-white/5 backdrop-blur rounded-full text-sm font-semibold mb-6">
                <BarChart3 size={16} />
                <span>Smart Dashboard</span>
              </div>
              <h2 className="font-semibold mb-6">Track Every Step of Your Journey</h2>
              <p className="text-slate-300 mb-8">
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
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-900 dark:bg-slate-900 dark:text-white rounded-xl font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                Try It Free
                <ArrowRight size={20} />
              </Link>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl dark:bg-slate-900 p-6 transform rotate-2 hover:rotate-0 transition-transform">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-200">Your Progress</span>
                    <span className="text-3xl font-semibold text-teal-600">68%</span>
                  </div>
                  <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-3 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full" style={{ width: '68%' }}></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="bg-green-50 dark:bg-emerald-500/10 rounded-xl p-4">
                      <Trophy className="text-green-600 mb-2" size={24} />
                      <div className="text-2xl font-semibold text-slate-900 dark:text-white">12</div>
                      <div className="text-small text-slate-600 dark:text-slate-300">Mastered</div>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-500/10 rounded-xl p-4">
                      <Target className="text-blue-600 mb-2" size={24} />
                      <div className="text-2xl font-semibold text-slate-900 dark:text-white">85%</div>
                      <div className="text-small text-slate-600 dark:text-slate-300">Accuracy</div>
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
          <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Loved by Thousands of Test Takers</h2>
          <p className="text-slate-600 dark:text-slate-300">Real stories from people who passed with Haven</p>
        </div>
        <TestimonialCarousel />
      </section>

      <section className="-mx-4 px-4 py-20 bg-slate-100 dark:bg-slate-900/40">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-semibold text-slate-900 dark:text-white mb-4">How It Works</h2>
            <p className="text-slate-600 dark:text-slate-200">Four simple steps to test success</p>
          </div>
          <div className="space-y-8">
            {howItWorksSteps.map((step, index) => (
              <div key={step.title} className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-teal-600 text-white rounded-full flex items-center justify-center font-semibold text-xl">
                  {index + 1}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{step.title}</h3>
                  <p className="text-slate-600 dark:text-slate-200">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-3">Study Guides</h2>
          <p className="text-slate-600 dark:text-slate-300">Practical answers to the questions people ask most about the Life in the UK test</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <a
            href="/blog/life-in-the-uk-test-study-guide/"
            className="block bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-700 rounded-2xl p-7 hover:border-teal-400 transition-all group no-underline"
          >
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 px-3 py-1 rounded-full mb-4">
              <BookOpen size={12} />
              9 min read
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">Life in the UK Test: The Complete Study Guide</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">Who needs to take it, what it covers, how to prepare effectively, and what to expect on the day.</p>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-teal-600 dark:text-teal-400">
              Read guide <ArrowRight size={14} />
            </span>
          </a>
          <a
            href="/blog/life-in-the-uk-test-pass-rate/"
            className="block bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-700 rounded-2xl p-7 hover:border-teal-400 transition-all group no-underline"
          >
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 px-3 py-1 rounded-full mb-4">
              <TrendingUp size={12} />
              6 min read
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">What Is the Life in the UK Test Pass Rate?</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">Around 1 in 3 people fail on their first attempt. Here is what the data shows and what actually makes the difference.</p>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-teal-600 dark:text-teal-400">
              Read guide <ArrowRight size={14} />
            </span>
          </a>
          <a
            href="/blog/when-to-take-life-in-the-uk-test-before-ilr/"
            className="block bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-700 rounded-2xl p-7 hover:border-teal-400 transition-all group no-underline"
          >
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 px-3 py-1 rounded-full mb-4">
              <Clock size={12} />
              6 min read
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">When Should You Take the Life in the UK Test Before ILR?</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">The test result doesn't expire, but leaving it too late creates unnecessary risk. Here's how to plan your timing.</p>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-teal-600 dark:text-teal-400">
              Read guide <ArrowRight size={14} />
            </span>
          </a>
          <a
            href="/blog/how-to-choose-life-in-the-uk-test-study-app/"
            className="block bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-700 rounded-2xl p-7 hover:border-teal-400 transition-all group no-underline"
          >
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 px-3 py-1 rounded-full mb-4">
              <Target size={12} />
              6 min read
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">How to Choose a Life in the UK Test Study App</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">Large question counts are not the same as good preparation. Here is what to look for in a study tool.</p>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-teal-600 dark:text-teal-400">
              Read guide <ArrowRight size={14} />
            </span>
          </a>
        </div>
        <div className="text-center mt-7">
          <a href="/blog/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
            View all guides <ArrowRight size={14} />
          </a>
        </div>
      </section>

      <section id="pricing" className="-mx-4 px-4 py-20 bg-white dark:bg-gray-950/40">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="text-center mb-12">
            <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Pay once. No auto-renewal. Extend anytime.</h2>
            <p className="text-slate-600 dark:text-slate-300 max-w-xl mx-auto">No recurring payments. No cancellation reminders. One-off access for 30, 90, or 180 days. Need more time? Just extend - it stacks on top of what you have left.</p>
          </div>

          {/* Value comparison */}
          <div className="grid gap-3 sm:grid-cols-3 text-center -mt-4">
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-5 py-4">
              <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">£0</div>
              <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">to start - 3 modules, 252 questions, full flashcards</div>
            </div>
            <div className="rounded-2xl bg-teal-600 border border-teal-600 px-5 py-4">
              <div className="text-2xl font-bold text-white">
                {sale?.active ? `from £${salePrice(PLAN_PRICES.plus_1m).toFixed(2)}` : 'from £4.99'}
              </div>
              <div className="mt-1 text-sm text-teal-100">one-off payment - less than 10% of one failed test</div>
            </div>
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-5 py-4">
              <div className="text-2xl font-bold text-amber-500">£50</div>
              <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">cost of each failed attempt - plus a stand-down period</div>
            </div>
          </div>

          {/* Sale banner */}
          {sale?.active && (
            <div className="flex items-center justify-center gap-3 rounded-2xl border border-amber-200 dark:border-amber-700/50 bg-amber-50 dark:bg-amber-900/20 px-6 py-4">
              <Tag className="text-amber-600 dark:text-amber-400 flex-shrink-0" size={20} />
              <p className="font-semibold text-amber-900 dark:text-amber-200">
                Limited time: {sale.discount}% off all plans - discount applied automatically at checkout
              </p>
            </div>
          )}

          {/* 3-column grid: Free, Plus 1M, Plus 3M */}
          <div className="grid gap-6 md:grid-cols-3">

            {/* Free */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 flex flex-col">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Free</h3>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-4xl font-black text-slate-900 dark:text-white">£0</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">3 full modules, 252 questions. No credit card.</p>
              <ul className="space-y-3 mb-8 flex-1 text-sm">
                {['3 free modules', '252 practice questions', 'Full flashcards (free modules)', 'Progress tracking'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <span className="text-teal-600 dark:text-teal-400 font-bold flex-shrink-0">&#10003;</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/signup?plan=free"
                className="mt-auto block text-center px-4 py-3 border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-semibold rounded-xl hover:border-teal-400 hover:text-teal-700 dark:hover:border-teal-500 dark:hover:text-teal-400 transition-colors text-sm"
              >
                Get started free
              </Link>
              <p className="mt-2 text-center text-xs text-slate-400 dark:text-slate-500">No credit card required</p>
            </div>

            {/* Plus 1 Month - teal card */}
            <div className="bg-teal-600 rounded-2xl p-8 border border-teal-700 flex flex-col relative">
              <h3 className="text-xl font-bold text-white mb-1">Haven Plus</h3>
              <p className="text-sm font-semibold text-teal-100 mb-2">1 Month Access</p>
              <div className="flex items-end gap-2 mb-1">
                {sale?.active && (
                  <span className="text-xl font-bold text-white/50 line-through">£{PLAN_PRICES.plus_1m.toFixed(2)}</span>
                )}
                <span className="text-4xl font-black text-white">
                  £{salePrice(PLAN_PRICES.plus_1m).toFixed(2)}
                </span>
              </div>
              <p className="text-teal-100 text-xs mb-6">one-off · about £1.25/week</p>
              <ul className="space-y-3 mb-8 flex-1 text-sm">
                {['All 29 lessons', '500+ practice questions', 'All flashcards', 'Full mock exams', 'Progress tracking', 'Resit Support'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-white">
                    <span className="text-teal-200 font-bold flex-shrink-0">&#10003;</span>
                    {f === 'Resit Support' ? (
                      <a href="#resit-support" className="underline text-white/90 hover:text-white">Resit Support</a>
                    ) : f}
                  </li>
                ))}
              </ul>
              <Link
                to="/paywall"
                className="flex items-center justify-center gap-2 mt-auto w-full px-4 py-3 bg-white text-teal-700 font-bold rounded-xl hover:bg-teal-50 transition-colors text-sm"
              >
                Get 1 Month
                <ArrowRight size={16} />
              </Link>
              <p className="mt-2 text-center text-xs text-teal-200">No auto-renewal</p>
            </div>

            {/* Plus 3 Months */}
            <div className="bg-white dark:bg-slate-900 border-2 border-teal-500 dark:border-teal-400/60 rounded-2xl p-8 flex flex-col relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-teal-600 text-white text-xs font-bold rounded-full uppercase tracking-wide whitespace-nowrap">
                Most popular
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Haven Plus</h3>
              <p className="text-sm font-semibold text-teal-600 dark:text-teal-400 mb-2">3 Months Access</p>
              <div className="flex items-end gap-2 mb-1">
                {sale?.active && (
                  <span className="text-xl font-bold text-slate-400 dark:text-slate-500 line-through">£{PLAN_PRICES.plus_3m.toFixed(2)}</span>
                )}
                <span className="text-4xl font-black text-slate-900 dark:text-white">
                  £{salePrice(PLAN_PRICES.plus_3m).toFixed(2)}
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-xs mb-1">one-off · under £0.80/week</p>
              <p className="text-teal-600 dark:text-teal-400 text-xs font-semibold mb-6">Save £4.98 vs buying monthly</p>
              <ul className="space-y-3 mb-8 flex-1 text-sm">
                {['All 29 lessons', '500+ practice questions', 'All flashcards', 'Full mock exams', 'Progress tracking', 'Resit Support'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <span className="text-teal-600 dark:text-teal-400 font-bold flex-shrink-0">&#10003;</span>
                    {f === 'Resit Support' ? (
                      <a href="#resit-support" className="text-teal-700 dark:text-teal-400 underline">Resit Support</a>
                    ) : f}
                  </li>
                ))}
              </ul>
              <Link
                to="/paywall"
                className="flex items-center justify-center gap-2 mt-auto w-full px-4 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-colors text-sm"
              >
                Get 3 Months
                <ArrowRight size={16} />
              </Link>
              <p className="mt-2 text-center text-xs text-slate-400 dark:text-slate-500">No auto-renewal</p>
            </div>

          </div>

          {/* Premium - full-width dark row */}
          <div>
            <div className="bg-slate-900 rounded-2xl p-8 border border-amber-500/40 flex flex-col md:flex-row md:items-center gap-8 relative">
              <div className="absolute -top-3.5 left-8 px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full uppercase tracking-wide whitespace-nowrap">
                All Features
              </div>

              {/* Price */}
              <div className="flex-shrink-0 text-center md:text-left">
                <h3 className="text-xl font-bold text-white mb-1">Haven Premium</h3>
                <p className="text-sm font-semibold text-amber-400 mb-2">6 Months Access</p>
                <div className="flex items-end justify-center md:justify-start gap-2 mb-1">
                  {sale?.active && (
                    <span className="text-xl font-bold text-white/40 line-through">£{PLAN_PRICES.premium_6m.toFixed(2)}</span>
                  )}
                  <span className="text-4xl font-black text-white">
                    £{salePrice(PLAN_PRICES.premium_6m).toFixed(2)}
                  </span>
                </div>
                <p className="text-slate-400 text-xs">one-off · under £1/week</p>
              </div>

              {/* Features */}
              <div className="flex-1">
                <p className="text-slate-300 text-sm mb-4">Everything in Haven Plus, plus the full suite of advanced tools:</p>
                <div className="grid sm:grid-cols-2 gap-2 text-sm">
                  {[
                    { icon: Brain, label: 'Pippa AI study assistant' },
                    { icon: BarChart3, label: 'Performance analytics' },
                    { icon: Sparkles, label: 'Unlimited dynamic exams' },
                    { icon: Bell, label: 'Exam date reminders' },
                    { icon: Smartphone, label: 'Offline mobile access' },
                    { icon: CheckCircle2, label: 'All Plus features included' },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-2 text-slate-200">
                      <Icon className="text-amber-400 flex-shrink-0" size={15} />
                      {label}
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="flex-shrink-0 text-center">
                <Link
                  to="/paywall"
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl transition-all shadow-lg whitespace-nowrap text-sm"
                >
                  Get Premium
                  <ArrowRight size={16} />
                </Link>
                <p className="mt-2 text-xs text-slate-500">No auto-renewal</p>
              </div>
            </div>
          </div>

          <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8 text-center">
            {trustSignals.map(signal => {
              const Icon = signal.icon;
              return (
                <div key={signal.title}>
                  <Icon className="text-teal-600 mx-auto mb-3" size={32} />
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2">{signal.title}</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{signal.description}</p>
                </div>
              );
            })}
          </div>

          {/* Resit Support section */}
          <div id="resit-support" className="max-w-4xl mx-auto rounded-2xl border-2 border-amber-200 dark:border-amber-700/50 bg-amber-50 dark:bg-amber-900/10 p-8 md:p-10">
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <div className="flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900/40">
                <Award className="text-amber-600 dark:text-amber-400" size={28} />
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Resit Support</h3>
                  <p className="text-slate-700 dark:text-slate-300">
                    If you genuinely prepare with Haven and still don't pass, we'll add <strong>30 days of free access</strong> so you can keep studying and book a resit, at no extra charge.
                  </p>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white mb-2">To qualify, you must have:</p>
                    <ul className="space-y-1.5 text-sm text-slate-700 dark:text-slate-300">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="text-amber-500 flex-shrink-0 mt-0.5" size={15} />
                        Completed all 29 lessons
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="text-amber-500 flex-shrink-0 mt-0.5" size={15} />
                        Scored 75%+ on practice questions
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="text-amber-500 flex-shrink-0 mt-0.5" size={15} />
                        Passed at least one mock exam
                      </li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white mb-2">How to claim:</p>
                    <ul className="space-y-1.5 text-sm text-slate-700 dark:text-slate-300">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="text-amber-500 flex-shrink-0 mt-0.5" size={15} />
                        Email us your test result
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="text-amber-500 flex-shrink-0 mt-0.5" size={15} />
                        Within 14 days of your test date
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="text-amber-500 flex-shrink-0 mt-0.5" size={15} />
                        We'll add 30 days to your access
                      </li>
                    </ul>
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Available on all paid plans. Does not cover the cost of rebooking your test.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
