import { Link } from "react-router-dom";
import { BookOpen, Brain, CheckCircle, ArrowRight, Trophy, Target, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="space-y-20">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-50 via-white to-emerald-50 px-6 py-16 md:px-12 md:py-20">
        <div className="absolute right-0 top-0 h-full w-1/2 opacity-10">
          <div className="absolute right-10 top-10 h-64 w-64 rounded-full bg-teal-400 blur-3xl" />
          <div className="absolute right-32 bottom-10 h-48 w-48 rounded-full bg-emerald-400 blur-3xl" />
        </div>

        <div className="relative grid gap-12 md:grid-cols-2 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-teal-100 px-4 py-2 text-sm font-semibold text-teal-700">
              <Trophy className="h-4 w-4" />
              175K+ Students Passed
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight text-gray-900">
              Pass Your Life in the UK Test
            </h1>

            <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
              Master the official content with engaging lessons, smart practice, and proven study methods. Join thousands who've passed with confidence.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/content"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-semibold hover:shadow-lg hover:scale-105 transition-all"
              >
                Start Learning Free
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/practice"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border-2 border-gray-300 bg-white text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all"
              >
                Try Practice Quiz
              </Link>
            </div>

            <div className="flex items-center gap-6 pt-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <span className="text-sm text-gray-600">No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <span className="text-sm text-gray-600">2 modules free</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative rounded-3xl bg-white p-8 shadow-2xl">
              <div className="absolute -left-4 -top-4 rounded-2xl bg-white px-4 py-3 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-emerald-500">
                    <Trophy className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">Learning Progress</div>
                    <div className="text-xs text-gray-500">Track your journey</div>
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">Lessons Completed</span>
                    <span className="font-semibold text-teal-600">15/31</span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
                    <div className="h-3 w-[48%] rounded-full bg-gradient-to-r from-teal-500 to-emerald-500" />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">Practice Accuracy</span>
                    <span className="font-semibold text-emerald-600">87%</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className={`h-12 rounded-lg ${i < 3 ? 'bg-gradient-to-br from-emerald-400 to-teal-400' : 'bg-gray-100'}`} />
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
                      <Target className="h-5 w-5 text-teal-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900">Next Milestone</div>
                      <div className="text-xs text-gray-600">Complete 5 more lessons</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 opacity-20 blur-2xl" />
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900">Everything You Need to Pass</h2>
          <p className="mt-2 text-gray-600">Comprehensive study tools designed for success</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="group rounded-2xl border border-gray-200 bg-white p-6 transition-all hover:border-teal-300 hover:shadow-lg">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100 text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors">
              <BookOpen className="h-6 w-6" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">Clear Lessons</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Master essential topics with easy-to-understand lessons, key facts, and memory techniques that make learning stick.
            </p>
          </div>

          <div className="group rounded-2xl border border-gray-200 bg-white p-6 transition-all hover:border-teal-300 hover:shadow-lg">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Brain className="h-6 w-6" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">Smart Practice</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Answer realistic questions with instant feedback. Track your progress and focus on areas that need improvement.
            </p>
          </div>

          <div className="group rounded-2xl border border-gray-200 bg-white p-6 transition-all hover:border-teal-300 hover:shadow-lg">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-sky-100 text-sky-600 group-hover:bg-sky-600 group-hover:text-white transition-colors">
              <CheckCircle className="h-6 w-6" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">Quick Review</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Reinforce what you've learned with flashcards. Perfect for quick study sessions on the go.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl bg-gradient-to-br from-gray-900 to-gray-800 px-6 py-12 text-white md:px-12">
        <div className="mx-auto max-w-3xl text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">Simple Path to Success</h2>
          <p className="text-lg text-gray-300">
            Follow our proven 4-step method used by thousands of successful test-takers
          </p>

          <div className="grid gap-6 md:grid-cols-2 pt-8">
            <div className="rounded-2xl bg-white/10 p-6 text-left backdrop-blur">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-teal-500 text-xl font-bold">1</div>
              <h3 className="mb-2 font-semibold">Study Lessons</h3>
              <p className="text-sm text-gray-300">Learn key facts with clear explanations and memory hooks</p>
            </div>

            <div className="rounded-2xl bg-white/10 p-6 text-left backdrop-blur">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-xl font-bold">2</div>
              <h3 className="mb-2 font-semibold">Practice Questions</h3>
              <p className="text-sm text-gray-300">Test your knowledge with realistic exam-style questions</p>
            </div>

            <div className="rounded-2xl bg-white/10 p-6 text-left backdrop-blur">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-sky-500 text-xl font-bold">3</div>
              <h3 className="mb-2 font-semibold">Review Flashcards</h3>
              <p className="text-sm text-gray-300">Reinforce learning with quick spaced repetition</p>
            </div>

            <div className="rounded-2xl bg-white/10 p-6 text-left backdrop-blur">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-purple-500 text-xl font-bold">4</div>
              <h3 className="mb-2 font-semibold">Take Mock Exam</h3>
              <p className="text-sm text-gray-300">Verify your readiness with a full practice test</p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-gray-200 bg-white p-8 md:p-12 text-center">
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
            <Users className="h-4 w-4" />
            Join 175K+ Successful Students
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Ready to Pass Your Test?
          </h2>

          <p className="text-lg text-gray-600">
            Start your free trial today. No credit card required. Cancel anytime.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              to="/content"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white text-lg font-semibold hover:shadow-lg hover:scale-105 transition-all"
            >
              Start Learning Free
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>

          <p className="text-sm text-gray-500">
            Money-back guarantee if you complete the course
          </p>
        </div>
      </section>
    </div>
  );
}
