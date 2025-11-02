import { Link } from "react-router-dom";
import { getLessonsForModule } from "./lib/content";
import { BookOpen, BarChart3, Headphones, CheckCircle, ArrowRight } from "lucide-react";

export default function App() {
  const starters = getLessonsForModule("nations-symbols").slice(0, 1);

  return (
    <div className="space-y-20">
      {/* Hero */}
      <section className="grid gap-12 lg:grid-cols-2 items-center py-8">
        <div className="space-y-6">
          <div className="space-y-3">
            <span className="inline-block text-sm font-semibold text-teal-600 bg-teal-50 px-3 py-1 rounded-full">Master the exam</span>
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-gray-900">
              Pass the Life in the UK test with clear, guided study.
            </h1>
          </div>
          <p className="text-lg text-gray-600 leading-relaxed">
            Learn the official facts in plain English. Practice realistic questions. Review with flashcards and audio. Feel confident on exam day.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link to="/content" className="px-6 py-3 rounded-lg bg-gradient-to-r from-teal-600 to-teal-700 text-white font-medium hover:opacity-90 transition-opacity">
              Start studying
            </Link>
            <Link to="/practice" className="px-6 py-3 rounded-lg border-2 border-teal-200 text-teal-700 font-medium hover:bg-teal-50 transition-colors">
              Try practice
            </Link>
          </div>
          <p className="text-sm text-gray-500">
            Try two modules free. Money-back guarantee if you complete the course.
          </p>
        </div>

        <div className="bg-white border border-teal-100 rounded-2xl p-8 shadow-lg">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-600">Your progress</span>
              <span className="text-sm font-bold text-teal-600">20%</span>
            </div>
            <div className="space-y-2">
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-2 w-1/5 bg-gradient-to-r from-teal-600 to-teal-500 rounded-full transition-all" />
              </div>
            </div>
            <ul className="space-y-3">
              <li className="flex gap-3 items-start">
                <CheckCircle size={20} className="text-teal-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">Guided path aligned to the official syllabus</span>
              </li>
              <li className="flex gap-3 items-start">
                <CheckCircle size={20} className="text-teal-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">Mock exams with detailed explanations</span>
              </li>
              <li className="flex gap-3 items-start">
                <CheckCircle size={20} className="text-teal-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">Community support and study tips</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="grid md:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md hover:border-teal-200 transition-all">
          <div className="w-12 h-12 bg-teal-50 rounded-lg flex items-center justify-center mb-4">
            <BookOpen className="text-teal-600" size={24} />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Plain-English lessons</h3>
          <p className="text-sm text-gray-600">Everything you need, rewritten for clarity with memory hooks and key facts.</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md hover:border-teal-200 transition-all">
          <div className="w-12 h-12 bg-teal-50 rounded-lg flex items-center justify-center mb-4">
            <BarChart3 className="text-teal-600" size={24} />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Adaptive practice</h3>
          <p className="text-sm text-gray-600">Track accuracy and revisit weak topics until you're pass-ready.</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md hover:border-teal-200 transition-all">
          <div className="w-12 h-12 bg-teal-50 rounded-lg flex items-center justify-center mb-4">
            <Headphones className="text-teal-600" size={24} />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Audio + flashcards</h3>
          <p className="text-sm text-gray-600">Listen on the go, then reinforce knowledge with quick-fire cards.</p>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gradient-to-br from-teal-50 to-white border border-teal-100 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">How it works</h2>
        <ol className="space-y-4">
          <li className="flex gap-4">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-sm font-bold">1</span>
            <span className="text-gray-700 pt-0.5">Study each lesson's overview, key facts, and memory hooks.</span>
          </li>
          <li className="flex gap-4">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-sm font-bold">2</span>
            <span className="text-gray-700 pt-0.5">Open <span className="font-medium">Practice</span> to answer questions with explanations.</span>
          </li>
          <li className="flex gap-4">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-sm font-bold">3</span>
            <span className="text-gray-700 pt-0.5">Use flashcards to refresh knowledge — anywhere, any time.</span>
          </li>
          <li className="flex gap-4">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-sm font-bold">4</span>
            <span className="text-gray-700 pt-0.5">Take a full mock exam. If you've completed everything, you're pass-ready.</span>
          </li>
        </ol>
      </section>

      {/* Quick start */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Get started now</h2>
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md hover:border-teal-200 transition-all">
            <div className="text-xs font-semibold text-teal-600 uppercase tracking-wide mb-3">Study path</div>
            <h3 className="font-bold text-gray-900 mb-4 text-lg">Life in the UK</h3>
            {starters[0] ? (
              <div className="flex flex-wrap gap-3">
                <Link to={`/content/${starters[0].id}`} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 text-white font-medium hover:bg-teal-700 transition-colors">
                  Open lesson <ArrowRight size={16} />
                </Link>
                <Link to={`/practice/${starters[0].id}`} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-teal-200 text-teal-700 font-medium hover:bg-teal-50 transition-colors">
                  Practice
                </Link>
              </div>
            ) : (
              <div className="text-sm text-gray-600">Lessons loading…</div>
            )}
          </div>
          <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-xl p-6 text-white shadow-lg">
            <div className="text-xs font-semibold uppercase tracking-wide mb-3 text-teal-100">Premium access</div>
            <h3 className="font-bold text-lg mb-2">Unlock everything</h3>
            <p className="text-sm text-teal-50 mb-4">Audio, full mocks, and the pass-ready guarantee.</p>
            <Link to="/paywall" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-teal-700 font-medium hover:bg-teal-50 transition-colors">
              See Premium <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
