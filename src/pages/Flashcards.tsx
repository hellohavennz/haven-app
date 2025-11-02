import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getLessonById } from "../lib/content";
import { ChevronLeft, ChevronRight, RotateCw } from "lucide-react";

export default function Flashcards() {
  const { lessonId } = useParams();
  const data = lessonId ? getLessonById(lessonId) : null;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [lessonId]);

  if (!data || !data.flashcards || data.flashcards.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6 text-center">
          <h2 className="text-xl font-bold text-amber-900 mb-2">No flashcards available</h2>
          <p className="text-amber-700 mb-4">This lesson doesn't have flashcards yet.</p>
          <Link to={`/content/${lessonId}`} className="text-teal-600 hover:text-teal-700 font-medium">
            ← Back to lesson
          </Link>
        </div>
      </div>
    );
  }

  const flashcards = data.flashcards;
  const totalCards = flashcards.length;
  const [front, back] = flashcards[currentIndex];

  const nextCard = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % totalCards);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + totalCards) % totalCards);
  };

  const flipCard = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{data.title}</h1>
            <p className="text-gray-600">Flashcards</p>
          </div>
          <Link
            to={`/content/${lessonId}`}
            className="text-sm text-teal-600 hover:text-teal-700 font-medium"
          >
            ← Back to lesson
          </Link>
        </header>

        <div className="text-center">
          <span className="text-sm font-medium text-gray-600">
            Card {currentIndex + 1} of {totalCards}
          </span>
        </div>

        <div className="relative perspective-1000">
          <div
            className={`relative w-full h-96 cursor-pointer transition-transform duration-500 transform-style-3d ${
              isFlipped ? "rotate-y-180" : ""
            }`}
            onClick={flipCard}
          >
            {/* Front */}
            <div
              className={`absolute inset-0 backface-hidden bg-white border-2 border-gray-200 rounded-2xl p-12 flex items-center justify-center ${
                isFlipped ? "invisible" : "visible"
              }`}
            >
              <p className="text-2xl font-semibold text-gray-900 text-center">{front}</p>
            </div>

            {/* Back */}
            <div
              className={`absolute inset-0 backface-hidden bg-teal-50 border-2 border-teal-200 rounded-2xl p-12 flex items-center justify-center rotate-y-180 ${
                isFlipped ? "visible" : "invisible"
              }`}
            >
              <p className="text-xl text-gray-900 text-center">{back}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <RotateCw size={16} />
          <span>Click card to flip</span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <button
            onClick={prevCard}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={20} />
            Previous
          </button>

          <div className="flex gap-2">
            {Array.from({ length: totalCards }).map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setCurrentIndex(i);
                  setIsFlipped(false);
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentIndex ? "bg-teal-600 w-6" : "bg-gray-300"
                }`}
              />
            ))}
          </div>

          <button
            onClick={nextCard}
            disabled={currentIndex === totalCards - 1}
            className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="flex gap-4 pt-8 border-t border-gray-200">
          <Link
            to={`/content/${lessonId}`}
            className="flex-1 px-8 py-4 text-center border-2 border-teal-200 text-teal-700 font-semibold rounded-xl hover:bg-teal-50 transition-all"
          >
            Review Lesson
          </Link>
          <Link
            to={`/practice/${lessonId}`}
            className="flex-1 px-8 py-4 text-center bg-gradient-to-r from-teal-600 to-teal-700 text-white font-semibold rounded-xl hover:opacity-90 transition-all"
          >
            Practice Questions
          </Link>
        </div>
      </div>
    </div>
  );
}
