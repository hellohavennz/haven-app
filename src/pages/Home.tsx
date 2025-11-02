import { Link } from "react-router-dom";
import { BookOpen, Brain, CheckCircle, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="grid gap-6 md:grid-cols-2 items-center">
        <div className="space-y-4">
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight tracking-tight">
            Pass the Life in the UK test with calm, guided study.
          </h1>
          <p className="text-gray-600 text-lg">
            Learn the official facts in plain English. Practice realistic questions.
            Review with flashcards and audio. Feel confident on exam day.
          </p>
          <div className="flex gap-3">
            <Link to="/content" className="px-5 py-2.5 rounded bg-black text-white hover:bg-gray-800 transition">
              Start studying
            </Link>
            <Link to="/practice" className="px-5 py-2.5 rounded border hover:bg-gray-50 transition">
              Try practice
            </Link>
          </div>
          <p className="text-xs text-gray-500">
            Try two modules free. Money-back guarantee if you complete the course.
          </p>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm space-y-3">
          <div className="text-sm text-gray-500">Your progress</div>
          <div className="h-3 bg-gray-100 rounded">
            <div className="h-3 w-1/5 bg-[#0F4C5C] rounded" />
          </div>
          <ul className="mt-2 text-sm list-disc pl-5 space-y-1">
            <li>Guided path aligned to the official syllabus</li>
            <li>Mock exams with explanations</li>
            <li>Community support and study tips</li>
          </ul>
        </div>
      </section>

      {/* Feature grid */}
      <section className="grid md:grid-cols-3 gap-4">
        <div className="bg-white border rounded-xl p-5">
          <BookOpen className="text-teal-600 mb-3" size={24} />
          <h3 className="font-semibold">Plain-English lessons</h3>
          <p className="text-sm text-gray-600">Everything you need, rewritten for clarity with memory hooks and key facts.</p>
        </div>
        <div className="bg-white border rounded-xl p-5">
          <Brain className="text-teal-600 mb-3" size={24} />
          <h3 className="font-semibold">Adaptive practice</h3>
          <p className="text-sm text-gray-600">Track accuracy and revisit weak topics until you're pass-ready.</p>
        </div>
        <div className="bg-white border rounded-xl p-5">
          <CheckCircle className="text-teal-600 mb-3" size={24} />
          <h3 className="font-semibold">Audio + flashcards</h3>
          <p className="text-sm text-gray-600">Listen on the go, then reinforce knowledge with quick-fire cards.</p>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white border rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-3">How it works</h2>
        <ol className="list-decimal pl-6 space-y-2 text-gray-700">
          <li>Study each lesson's overview, key facts, and memory hook.</li>
          <li>Open <span className="font-medium">Practice</span> to answer questions with explanations.</li>
          <li>Use flashcards to refresh — anywhere, any time.</li>
          <li>Take a full mock exam. If you've completed everything, you're pass-ready.</li>
        </ol>
      </section>

      {/* CTA */}
      <section className="text-center space-y-4">
        <h2 className="text-2xl font-bold">Ready to start?</h2>
        <Link 
          to="/content" 
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 text-white font-semibold hover:opacity-90 transition-all"
        >
          Begin Learning <ArrowRight size={20} />
        </Link>
      </section>
    </div>
  );
}
