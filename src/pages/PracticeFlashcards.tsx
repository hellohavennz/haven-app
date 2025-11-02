import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getLessonById } from "../lib/content";
import { RotateCcw } from "lucide-react";

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
  const [countdown, setCountdown] = useState(4);

  useEffect(() => { setIdx(0); setReveal(false); }, [lessonId]);

  useEffect(() => {
    if (reveal) {
      setCountdown(4);
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      const timer = setTimeout(() => {
        setReveal(false);
        setIdx(i => (i + 1) % deck.length);
      }, 4000);

      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    }
  }, [reveal, deck.length]);

  if (!data) return <div className="max-w-3xl mx-auto p-6">Not found.</div>;
  const card = deck[idx];

  function skip() {
    setReveal(false);
    setIdx(i => (i + 1) % deck.length);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-32 md:pb-8">
      <div className="space-y-8">
        <header className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-teal-600 font-medium">
                <RotateCcw size={16} />
                <span>Flashcards</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                {data.title}
              </h1>
            </div>
            <Link to={`/content/${data.id}`} className="text-sm text-teal-600 hover:text-teal-700 font-medium">
              ← Back
            </Link>
          </div>
          <p className="text-gray-600 leading-relaxed">
            Tap the card to reveal the answer. It will automatically move to the next card.
          </p>
        </header>

        {card ? (
          <div className="space-y-8">
            <div
              onClick={() => setReveal(r => !r)}
              className={`relative h-96 rounded-3xl cursor-pointer flex items-center justify-center p-8 transition-all duration-300 ${
                reveal
                  ? "bg-gradient-to-br from-emerald-600 to-teal-700"
                  : "bg-gradient-to-br from-teal-600 to-teal-700"
              } hover:scale-105 active:scale-100`}
            >
              <div className="text-center space-y-6">
                <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full">
                  <span className="text-sm font-bold text-white uppercase tracking-wider">
                    {reveal ? "Answer" : "Question"}
                  </span>
                </div>
                <div className="text-3xl md:text-4xl font-bold text-white leading-tight px-4">
                  {reveal ? card[1] : card[0]}
                </div>
                <div className="text-sm text-teal-100 pt-4 font-medium">
                  {reveal ? `Auto-advancing in ${countdown}s...` : "Tap to reveal →"}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-gray-900">
                  Card {idx + 1} <span className="text-gray-500">of {deck.length}</span>
                </span>
                <span className="text-gray-500">
                  {Math.round(((idx + 1) / deck.length) * 100)}% complete
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-2 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full transition-all duration-300"
                  style={{ width: `${((idx + 1) / deck.length) * 100}%` }}
                />
              </div>
            </div>

            {!reveal && (
              <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 md:hidden z-40">
                <button
                  onClick={skip}
                  className="w-full max-w-2xl mx-auto px-6 py-4 rounded-xl border-2 border-teal-200 text-teal-700 font-semibold hover:bg-teal-50 transition-all active:scale-95"
                >
                  Skip →
                </button>
              </div>
            )}

            {!reveal && (
              <button
                onClick={skip}
                className="hidden md:block w-full py-4 rounded-xl border-2 border-teal-200 text-teal-700 font-semibold hover:bg-teal-50 transition-all active:scale-95"
              >
                Skip this card →
              </button>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-600">
            No flashcards available for this lesson yet.
          </div>
        )}
      </div>
    </div>
  );
}
