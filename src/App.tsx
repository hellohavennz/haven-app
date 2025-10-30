// src/App.tsx
import { Link } from "react-router-dom";

export default function App() {
  return (
    <section className="grid gap-10 md:grid-cols-2 items-center">
      {/* LEFT: Intro text */}
      <div className="space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight text-[#0F4C5C]">
          Haven. Learn calmly. Pass confidently.
        </h1>

        <p className="text-gray-700 text-lg">
          Your friendly study companion for the{" "}
          <strong>Life in the UK test</strong>.  
          Step-by-step lessons, realistic practice questions, and a supportive
          community — everything you need to feel ready on exam day.
        </p>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/path"
            className="px-5 py-2.5 rounded-lg bg-[#0F4C5C] text-white font-medium hover:bg-[#136273] transition"
          >
            Start studying
          </Link>
          <Link
            to="/paywall"
            className="px-5 py-2.5 rounded-lg border border-[#0F4C5C] text-[#0F4C5C] font-medium hover:bg-[#0F4C5C]/10 transition"
          >
            See Premium
          </Link>
        </div>

        <p className="text-sm text-gray-500">
          Try the first two modules free. Upgrade any time.
        </p>
      </div>

  {/* RIGHT: Image + progress card */}
<div className="space-y-6">
  <img
    src="https://placehold.co/400x250/0F4C5C/FFFFFF?text=Haven+Study"
    alt="Study illustration"
    className="rounded-xl shadow-md w-full"
  />

  <div className="rounded-2xl border bg-white p-6 shadow-sm">
    <div className="text-sm text-gray-500 mb-2">Your progress</div>
    <div className="h-3 bg-gray-100 rounded">
      <div className="h-3 w-1/5 bg-[#0F4C5C] rounded" />
    </div>
    <ul className="mt-5 text-sm list-disc pl-5 space-y-1 text-gray-700">
      <li>Guided study path based on the official syllabus</li>
      <li>Mock exams with explanations and tracking</li>
      <li>Community forum for tips and support</li>
    </ul>
  </div>
</div>

    </section>
  );
}
