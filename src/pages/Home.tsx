import { Link } from "react-router-dom";
import { BookOpen, Brain, CheckCircle, ArrowRight, Trophy, Target, Users, Star } from "lucide-react";
import { usePageTitle } from '../hooks/usePageTitle';

export default function Home() {
  usePageTitle(undefined, 'Pass the Life in the UK test with calm, guided study. Interactive lessons, practice questions, and mock exams. Join thousands of students who passed on their first try.');
  return (
    <div className="space-y-20 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-950">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-50 via-white to-emerald-50 px-6 py-16 dark:from-gray-900 dark:via-slate-950 dark:to-emerald-950 md:px-12 md:py-20">
        <div className="absolute right-0 top-0 h-full w-1/2 opacity-10">
          <div className="absolute right-10 top-10 h-64 w-64 rounded-full bg-teal-400 blur-3xl" />
          <div className="absolute right-32 bottom-10 h-48 w-48 rounded-full bg-emerald-400 blur-3xl" />
        </div>

        <div className="relative grid gap-12 lg:grid-cols-2 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-teal-100 px-4 py-2 text-sm font-semibold text-teal-700 dark:bg-teal-500/20 dark:text-teal-200">
              <Trophy className="h-4 w-4" />
              175K+ Students Passed
            </div>

            <h1 className="font-semibold leading-tight tracking-tight text-gray-900 dark:text-white">
              Pass Your Life in the UK Test
            </h1>

            <p className="leading-relaxed text-gray-600 dark:text-gray-200">
              Master the official content with engaging lessons, smart practice, and proven study methods. Join thousands who've passed with confidence.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/content"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold hover:shadow-lg hover:scale-105 transition-all"
              >
                Start Learning Free
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/practice"
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-gray-300 bg-white px-6 py-3.5 text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:border-gray-500 dark:hover:bg-gray-800"
              >
                Try Practice Quiz
              </Link>
            </div>

            <div className="flex items-center gap-6 pt-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <span className="text-sm text-gray-600 dark:text-gray-300">No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <span className="text-sm text-gray-600 dark:text-gray-300">2 modules free</span>
              </div>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <img
              src="/haven/passed-life-uk-circle.png"
              alt="Happy student celebrating passing the Life in the UK test"
              className="w-full max-w-md rounded-full shadow-2xl transition-transform hover:scale-105"
            />
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 p-6 text-center dark:from-teal-900/30 dark:to-emerald-900/30">
          <div className="mb-2 text-4xl font-bold text-teal-600 dark:text-teal-400">31+</div>
          <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">Comprehensive Lessons</div>
          <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">Complete study materials</div>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 p-6 text-center dark:from-emerald-900/30 dark:to-teal-900/30">
          <div className="mb-2 text-4xl font-bold text-emerald-600 dark:text-emerald-400">94%</div>
          <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">Haven User Pass Rate</div>
          <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">Above national average</div>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-sky-50 to-teal-50 p-6 text-center dark:from-sky-900/30 dark:to-teal-900/30">
          <div className="mb-2 flex items-center justify-center gap-1">
            <span className="text-4xl font-bold text-sky-600 dark:text-sky-400">4.8</span>
            <Star className="h-6 w-6 fill-sky-500 text-sky-500" />
          </div>
          <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">Student Rating</div>
          <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">From 12,000+ reviews</div>
        </div>
      </section>

      <section>
        <div className="mb-8 text-center">
          <h2 className="font-semibold text-gray-900 dark:text-white">Everything You Need to Pass</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Comprehensive study tools designed for success</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="group rounded-2xl border border-gray-200 bg-white p-6 transition-all hover:border-teal-300 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900/70">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100 text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors">
              <BookOpen className="h-6 w-6" />
            </div>
            <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">Clear Lessons</h3>
            <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
              Master essential topics with easy-to-understand lessons, key facts, and memory techniques that make learning stick.
            </p>
          </div>

          <div className="group rounded-2xl border border-gray-200 bg-white p-6 transition-all hover:border-teal-300 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900/70">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Brain className="h-6 w-6" />
            </div>
            <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">Smart Practice</h3>
            <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
              Answer realistic questions with instant feedback. Track your progress and focus on areas that need improvement.
            </p>
          </div>

          <div className="group rounded-2xl border border-gray-200 bg-white p-6 transition-all hover:border-teal-300 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900/70">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-sky-100 text-sky-600 group-hover:bg-sky-600 group-hover:text-white transition-colors">
              <CheckCircle className="h-6 w-6" />
            </div>
            <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">Quick Review</h3>
            <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
              Reinforce what you've learned with flashcards. Perfect for quick study sessions on the go.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl bg-gradient-to-br from-gray-900 to-gray-800 px-6 py-12 text-white md:px-12">
        <div className="mx-auto max-w-3xl text-center space-y-6">
          <h2 className="font-semibold">Simple Path to Success</h2>
          <p className="text-gray-300">
            Follow our proven 4-step method used by thousands of successful test-takers
          </p>

          <div className="grid gap-6 md:grid-cols-2 pt-8">
            <div className="rounded-2xl bg-white/10 p-6 text-left backdrop-blur">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-teal-500 text-xl font-semibold">1</div>
              <h3 className="mb-2 font-semibold">Study Lessons</h3>
              <p className="text-sm text-gray-300">Learn key facts with clear explanations and memory hooks</p>
            </div>

            <div className="rounded-2xl bg-white/10 p-6 text-left backdrop-blur">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-xl font-semibold">2</div>
              <h3 className="mb-2 font-semibold">Practice Questions</h3>
              <p className="text-sm text-gray-300">Test your knowledge with realistic exam-style questions</p>
            </div>

            <div className="rounded-2xl bg-white/10 p-6 text-left backdrop-blur">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-sky-500 text-xl font-semibold">3</div>
              <h3 className="mb-2 font-semibold">Review Flashcards</h3>
              <p className="text-sm text-gray-300">Reinforce learning with quick spaced repetition</p>
            </div>

            <div className="rounded-2xl bg-white/10 p-6 text-left backdrop-blur">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-purple-500 text-xl font-semibold">4</div>
              <h3 className="mb-2 font-semibold">Take Mock Exam</h3>
              <p className="text-sm text-gray-300">Verify your readiness with a full practice test</p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-gray-200 bg-white p-8 text-center md:p-12 dark:border-gray-800 dark:bg-gray-900/70">
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200">
            <Users className="h-4 w-4" />
            Join 175K+ Successful Students
          </div>

          <h2 className="font-semibold text-gray-900 dark:text-white">
            Ready to Pass Your Test?
          </h2>

          <p className="text-gray-600 dark:text-gray-300">
            Start your free trial today. No credit card required. Cancel anytime.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              to="/content"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold hover:shadow-lg hover:scale-105 transition-all"
            >
              Start Learning Free
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Money-back guarantee if you complete the course
          </p>
        </div>
      </section>
    </div>
  );
}
