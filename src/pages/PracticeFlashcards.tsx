import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getLessonById } from "../lib/content";
import { useSubscription } from "../lib/subscription";
import { RotateCcw, Lock, ArrowRight } from "lucide-react";
import ReportButton from "../components/ReportButton";
import { usePageTitle } from '../hooks/usePageTitle';

const FREE_CARD_LIMIT = 5;

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
  const { tier, isLoading } = useSubscription();
  const data = lessonId ? getLessonById(lessonId) : null;
  usePageTitle(data?.title ? `${data.title} — Flashcards` : 'Flashcards');
  // Plus and Premium both get full flashcard access; only Free is limited
  const hasFullAccess = tier === "plus" || tier === "premium";

  const allCards = data?.flashcards ?? [];
  const totalCount = allCards.length;

  // Shuffle all cards; free users get first 5 only
  const deck = useMemo(() => {
    const shuffled = shuffle(allCards);
    return hasFullAccess ? shuffled : shuffled.slice(0, FREE_CARD_LIMIT);
  }, [lessonId, hasFullAccess]);

  const [idx, setIdx] = useState(0);
  const [reveal, setReveal] = useState(false);

  useEffect(() => { setIdx(0); setReveal(false); }, [lessonId]);

  if (!data) return <div className="max-w-3xl mx-auto p-6 text-slate-900 dark:text-gray-100">Not found.</div>;

  // Show upgrade card when non-premium user has exhausted their sample cards
  const showUpgradeCard = !isLoading && !hasFullAccess && idx >= deck.length && deck.length > 0;
  const card = showUpgradeCard ? null : deck[idx];

  function skip() {
    setReveal(false);
    setIdx(i => {
      const next = i + 1;
      // Full-access users cycle; free users advance past the limit to trigger upgrade screen
      return (hasFullAccess && next >= deck.length) ? 0 : next;
    });
  }

  function handleCardClick() {
    if (!card) return;
    if (!reveal) {
      setReveal(true);
    } else {
      skip();
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-32 text-slate-900 dark:text-gray-100 md:pb-8">
      <div className="space-y-8">
        <header className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-teal-600 font-medium dark:text-teal-300">
                <RotateCcw size={16} />
                <span>Flashcards</span>
              </div>
              <h1 className="font-semibold text-slate-900 dark:text-gray-100">
                {data.title}
              </h1>
            </div>
            <Link to={`/content/${data.id}`} className="text-sm text-teal-600 hover:text-teal-700 font-medium dark:text-teal-300 dark:hover:text-teal-200">
              ← Back
            </Link>
          </div>
          <p className="text-slate-600 leading-relaxed dark:text-slate-300">
            Tap the card to reveal the answer, then tap again to continue.
          </p>
        </header>

        {showUpgradeCard ? (
          /* Upgrade prompt after sample cards */
          <div className="space-y-8">
            <div className="relative h-96 rounded-3xl flex items-center justify-center p-8 bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-dashed border-slate-600">
              <div className="text-center space-y-5">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl">
                  <Lock className="text-white" size={32} />
                </div>
                <h2 className="text-2xl font-semibold text-white leading-tight">
                  You've seen the sample flashcards
                </h2>
                <p className="text-slate-300">
                  Upgrade to Plus or Premium to unlock all {totalCount} flashcards for this lesson
                </p>
                <Link
                  to="/paywall"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition-all"
                >
                  Upgrade to Plus
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        ) : card ? (
          <div className="space-y-8">
            <div
              onClick={handleCardClick}
              className={`relative h-96 rounded-3xl cursor-pointer flex items-center justify-center p-8 transition-all duration-300 ${
                reveal
                  ? "bg-gradient-to-br from-emerald-600 to-teal-700"
                  : "bg-gradient-to-br from-teal-600 to-teal-700"
              } hover:scale-105 active:scale-100`}
            >
              <div className="text-center space-y-6">
                <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full">
                  <span className="text-sm font-semibold text-white uppercase tracking-wider">
                    {reveal ? "Answer" : "Question"}
                  </span>
                </div>
                <div className="text-3xl md:text-4xl font-semibold text-white leading-tight px-4">
                  {reveal ? card[1] : card[0]}
                </div>
                <div className="text-sm text-teal-100 pt-4 font-medium">
                  {reveal ? "Tap to continue →" : "Tap to reveal →"}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-900 dark:text-gray-100">
                  Card {idx + 1} <span className="text-slate-500 dark:text-slate-400">of {hasFullAccess ? totalCount : deck.length}{!hasFullAccess && totalCount > FREE_CARD_LIMIT ? ` (${totalCount} total)` : ""}</span>
                </span>
                <span className="text-slate-500 dark:text-slate-400">
                  {Math.round(((idx + 1) / deck.length) * 100)}% complete
                </span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden dark:bg-slate-800">
                <div
                  className="h-2 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full transition-all duration-300"
                  style={{ width: `${((idx + 1) / deck.length) * 100}%` }}
                />
              </div>
              {!hasFullAccess && !isLoading && totalCount > FREE_CARD_LIMIT && (
                <p className="text-xs text-center text-slate-400 dark:text-slate-500">
                  Sample: {FREE_CARD_LIMIT} of {totalCount} flashcards ·{" "}
                  <Link to="/paywall" className="text-teal-500 hover:text-teal-600 font-semibold">
                    Unlock all →
                  </Link>
                </p>
              )}
            </div>

            <div className="flex justify-center pt-2">
              <ReportButton
                lessonId={data.id}
                contentType="flashcard"
                contentRef={String(idx)}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-6 text-center py-12">
            <p className="text-slate-600 dark:text-slate-300">
              This is a module overview — no flashcards here. The individual lessons each have their own flashcards.
            </p>
            <Link
              to={`/content/${data.id}`}
              className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold hover:opacity-90 transition-all"
            >
              Back to lesson
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
