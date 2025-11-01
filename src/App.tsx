// src/App.tsx
import { Link } from "react-router-dom";
import { getLessonsForModule } from "./lib/content";

export default function App() {
  const starters = getLessonsForModule("nations-symbols").slice(0, 1);

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
            <Link to="/content" className="px-5 py-2.5 rounded bg-black text-white">
              Start studying
            </Link>
            <Link to="/practice" className="px-5 py-2.5 rounded border">
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
          <h3 className="font-semibold">Plain-English lessons</h3>
          <p className="text-sm text-gray-600">Everything you need, rewritten for clarity with memory hooks and key facts.</p>
        </div>
        <div className="bg-white border rounded-xl p-5">
          <h3 className="font-semibold">Adaptive practice</h3>
          <p className="text-sm text-gray-600">Track accuracy and revisit weak topics until you’re pass-ready.</p>
        </div>
        <div className="bg-white border rounded-xl p-5">
          <h3 className="font-semibold">Audio + flashcards</h3>
          <p className="text-sm text-gray-600">Listen on the go, then reinforce knowledge with quick-fire cards.</p>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white border rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-3">How it works</h2>
        <ol className="list-decimal pl-6 space-y-2 text-gray-700">
          <li>Study each lesson’s overview, key facts, and memory hook.</li>
          <li>Open <span className="font-medium">Practice</span> to answer questions with explanations.</li>
          <li>Use flashcards to refresh — anywhere, any time.</li>
          <li>Take a full mock exam. If you’ve completed everything, you’re pass-ready.</li>
        </ol>
      </section>

      {/* Quick start */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Quick start</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white border rounded-xl p-5 space-y-2">
            <div className="text-sm text-gray-500">Study</div>
            <h3 className="font-semibold">Life in the UK — Start here</h3>
            {starters[0] ? (
              <div className="flex gap-2">
                <Link to={`/content/${starters[0].id}`} className="px-4 py-2 rounded bg-black text-white">Open lesson</Link>
                <Link to={`/practice/${starters[0].id}`} className="px-4 py-2 rounded border">Practice</Link>
              </div>
            ) : (
              <div className="text-sm text-gray-600">Lessons loading…</div>
            )}
          </div>
          <div className="bg-white border rounded-xl p-5 space-y-2">
            <div className="text-sm text-gray-500">Upgrade</div>
            <h3 className="font-semibold">Go Premium</h3>
            <p className="text-sm text-gray-600">Unlock audio, full mocks, and the pass-ready guarantee.</p>
            <Link to="/paywall" className="inline-block px-4 py-2 rounded bg-black text-white">See Premium</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
