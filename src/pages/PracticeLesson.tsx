import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getLessonById } from "../lib/content";
import { getProgress, recordAttempt, resetProgress } from "../lib/progress";

function shuffle<T>(arr: T[]) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function PracticeLesson() {
  const { lessonId } = useParams();
  const data = lessonId ? getLessonById(lessonId) : null;

  const [idx, setIdx] = useState(0);
  const [choice, setChoice] = useState<number | null>(null);
  const [phase, setPhase] = useState<"ask" | "feedback">("ask");
  const [stats, setStats] = useState(getProgress(lessonId || ""));

  const flashcards = useMemo(() => shuffle(data?.flashcards ?? []), [lessonId]);

  useEffect(() => {
    setIdx(0); setChoice(null); setPhase("ask");
    setStats(getProgress(lessonId || ""));
  }, [lessonId]);

  if (!data) return <div className="max-w-3xl mx-auto p-6">Not found.</div>;
  const q = data.questions[idx];

  function answer(i: number) {
    if (!data) return;
    setChoice(i);
    setPhase("feedback");
    const updated = recordAttempt(data.id, i === q.correct_index);
    setStats(updated);
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#0F4C5C]">
          Practice — {data.title}
        </h1>
        <p className="text-gray-600">
          Read the study material first →{" "}
          <Link to={`/content/${data.id}`} className="underline">Study: {data.title}</Link>
        </p>
        <div className="text-sm text-gray-600">
          Progress: <strong>{stats.correct || 0}</strong> correct out of <strong>{stats.attempted || 0}</strong>{" "}
          attempts
          <button
            className="ml-3 text-xs px-2 py-1 border rounded"
            onClick={() => { resetProgress(data.id); setStats({attempted:0, correct:0}); }}
          >
            Reset
          </button>
        </div>
      </header>

      {/* Questions */}
      <section id="questions" className="space-y-4">
        <h2 className="text-xl font-semibold">Questions</h2>
        {q ? (
          <div className="bg-white border rounded-xl p-5">
            <p className="font-medium">{q.prompt}</p>
            <ul className="mt-3 space-y-2">
              {q.options.map((opt, i) => (
                <li key={i}>
                  <button
                    className={`w-full text-left p-2 rounded border ${choice===i ? "bg-gray-100" : ""}`}
                    onClick={() => phase==="ask" && answer(i)}
                    disabled={phase==="feedback"}
                  >
                    {opt}
                  </button>
                </li>
              ))}
            </ul>

            {phase === "feedback" && (
              <div className="mt-4 text-sm">
                {choice === q.correct_index ? "✅ Correct" : "❌ Not quite"}
                <div className="mt-2 opacity-80">
                  Learn more in{" "}
                  <Link to={`/content/${data.id}`} className="underline">the study section</Link>. Tip: read the
                  key facts and memory hook for quick recall.
                </div>
                <div className="mt-3">
                  <button
                    className="px-3 py-2 rounded bg-black text-white"
                    onClick={() => { setIdx(idx+1 < data.questions.length ? idx+1 : 0); setChoice(null); setPhase("ask"); }}
                  >
                    Next question
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-gray-600">No questions yet for this lesson.</div>
        )}
      </section>

      {/* Flashcards */}
      <section id="flashcards" className="space-y-3">
        <h2 className="text-xl font-semibold">Flashcards</h2>
        <p className="text-sm text-gray-600">Click a card to reveal the answer. (Not tracked for progress.)</p>
        <div className="grid md:grid-cols-2 gap-3">
          {flashcards.map(([q, a], i) => (
            <FlipCard key={i} question={q} answer={a} />
          ))}
        </div>
      </section>
    </div>
  );
}

function FlipCard({ question, answer }: { question: string; answer: string }) {
  const [show, setShow] = useState(false);
  return (
    <button
      className="text-left bg-white border rounded-xl p-4 hover:shadow transition"
      onClick={() => setShow(s => !s)}
    >
      <div className="text-sm text-gray-500">{show ? "Answer" : "Question"}</div>
      <div className="mt-1">{show ? answer : question}</div>
    </button>
  );
}
