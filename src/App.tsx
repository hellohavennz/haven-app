// src/App.tsx
import { Link } from "react-router-dom";

export default function App() {
  return (
    <section className="grid gap-6 md:grid-cols-2 items-center">
      <div className="space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Pass the Life in the UK test with calm, guided study.
        </h1>
        <p className="text-gray-600">
          Realistic practice, adaptive review, audio lessons, and a supportive
          community—built to help you feel ready on exam day.
        </p>
        <div className="flex gap-3">
          <Link to="/content" className="px-4 py-2 rounded bg-black text-white">
            Start studying
          </Link>
          <Link to="/paywall" className="px-4 py-2 rounded border">
            See Premium
          </Link>
        </div>
        <p className="text-xs text-gray-500">
          Try two modules free. Upgrade any time.
        </p>
      </div>
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="text-sm text-gray-500 mb-2">Your progress</div>
        <div className="h-3 bg-gray-100 rounded">
          <div className="h-3 w-1/5 bg-[#0F4C5C] rounded" />
        </div>
        <ul className="mt-4 text-sm list-disc pl-5 space-y-1">
          <li>Guided path based on the official syllabus</li>
          <li>Mock exams with explanations</li>
          <li>Community forum for tips and support</li>
        </ul>
      </div>
    </section>
  );
}
