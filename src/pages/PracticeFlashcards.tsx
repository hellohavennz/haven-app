import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getLessonById } from "../lib/content";

function shuffle<T>(arr: T[]) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function PracticeFlashcards() {
  const { lessonId } = useParams();
  const data = lessonId ? getLessonById(lessonId) : null;
  const deck = useMemo(() => shuffle(data?.flashcards ?? []), [lessonId]);
  const [idx, setIdx] = useState(0);
  const [reveal, setReveal] = useState(false);

  useEffect(() => { setIdx(0); setReveal(false); }, [lessonId]);

  if (!data) return <div className="max-w-3xl mx-auto p-6">Not found.</div>;
  const card = deck[idx];

  function next() {
    setReveal(false);
    setIdx(i => (i + 1) % deck.length);
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#0F4C5C]">
          Flashcards — {data.title}
        </h1>
        <p className="text-gray-600">
          Need context? <Link to={`/content/${data.id}`} className="underline">Read the lesson</Link>
        </p>
      </header>

      {card ? (
        <div className="bg-white border rounded-xl p-6">
          <div className="text-sm text-gray-500">{reveal ? "Answer" : "Question"}</div>
          <div className="mt-1 text-lg">{reveal ? card[1] : card[0]}</div>

          <div className="mt-4 flex gap-2">
            <button className="px-3 py-2 rounded border" onClick={() => setReveal(r => !r)}>
              {reveal ? "Hide answer" : "Show answer"}
            </button>
            <button className="px-3 py-2 rounded bg-black text-white" onClick={next}>
              Next
            </button>
          </div>

          <div className="mt-2 text-xs text-gray-500">
            Card {idx + 1} of {deck.length} (order is random each visit)
          </div>
        </div>
      ) : (
        <div className="text-gray-600">No flashcards yet for this lesson.</div>
      )}
    </div>
  );
}
