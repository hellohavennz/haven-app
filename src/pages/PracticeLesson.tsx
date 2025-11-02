import { useEffect, useMemo, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { getLessonById } from "../lib/content";
import { recordAttempt } from "../lib/progress";
import { CheckCircle2, AlertCircle, Lightbulb } from "lucide-react";

function shuffle<T>(arr: T[]): T[] {
  const shuffled = arr.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

type AnswerState = { selected: number | null; checked: boolean };

export default function PracticeLesson() {
  const { lessonId } = useParams();
  const data = lessonId ? getLessonById(lessonId) : null;
  const shuffledQuestions = useMemo(() => shuffle(data?.questions ?? []), [lessonId]);
  const contentRef = useRef<HTMLDivElement>(null);

  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [answer, setAnswer] = useState<AnswerState>({ selected: null, checked: false });
  const [sessionStats, setSessionStats] = useState({ attempted: 0, correct: 0 });
  const [finished, setFinished] = useState(false);
  const [wrongTopics, setWrongTopics] = useState<string[]>([]);

  // Scroll to top when lesson changes or question changes or finished state changes
  useEffect(() => {
    if (contentRef.current) {
      const mainElement = contentRef.current.closest('main');
      if (mainElement) {
        mainElement.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [lessonId, currentQIdx, finished]);

  // Reset state when lesson changes
  useEffect(() => {
    if (!lessonId || !data) return;
    setCurrentQIdx(0);
    setAnswer({ selected: null, checked: false });
    setSessionStats({ attempted: 0, correct: 0 });
    setFinished(false);
    setWrongTopics([]);
  }, [lessonId, data]);

  if (!data) return <div className="max-w-3xl mx-auto p-6">Lesson not found.</div>;

  const currentQ = shuffledQuestions[currentQIdx];
  const totalQuestions = shuffledQuestions.length;
  const isCorrect = answer.selected === currentQ?.correct_index;
  const percentage = sessionStats.attempted > 0 
    ? Math.round((sessionStats.correct / sessionStats.attempted) * 100) 
    : 0;
  const progressColor = percentage >= 80 ? "bg-green-600" : "bg-teal-600";

  function choose(optIdx: number) {
    if (answer.checked) return;
    setAnswer(prev => ({ ...prev, selected: optIdx }));
  }

  function check() {
    if (answer.selected === null) return;
    recordAttempt(data.id, isCorrect);
    setSessionStats(prev => ({
      attempted: prev.attempted + 1,
      correct: prev.correct + (isCorrect ? 1 : 0)
    }));
    setAnswer(prev => ({ ...prev, checked: true }));
    if (!isCorrect) {
      setWrongTopics(prev => [...prev, currentQ.prompt]);
    }
  }

  function next() {
    if (currentQIdx < totalQuestions - 1) {
      setCurrentQIdx(prev => prev + 1);
      setAnswer({ selected: null, checked: false });
    } else {
      setFinished(true);
    }
  }

  function retry() {
    setCurrentQIdx(0);
    setAnswer({ selected: null, checked: false });
    setSessionStats({ attempted: 0, correct: 0 });
    setFinished(false);
    setWrongTopics([]);
  }

  if (finished) {
    const finalPercentage = sessionStats.attempted > 0 
      ? Math.round((sessionStats.correct / sessionStats.attempted) * 100) 
      : 0;
    const passedStatus = finalPercentage >= 80;

    return (
      <div ref={contentRef} className="max-w-2xl mx-auto px-4 py-8 pb-32 md:pb-8 space-y-8">
        <div className="text-center space-y-6 py-12">
          <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
            passedStatus ? "bg-green-100" : "bg-teal-100"
          }`}>
            <CheckCircle2 className={passedStatus ? "text-green-600" : "text-teal-600"} size={48} />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              {passedStatus ? "Excellent work!" : "Good effort!"}
            </h1>
            <p className="text-xl text-gray-600">
              {passedStatus
                ? "You're ready to move forward!"
                : "A little more practice and you'll be there!"}
            </p>
          </div>
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 space-y-6 shadow-sm">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-700">Your Score</span>
              <span className={`font-bold text-3xl ${
                passedStatus ? "text-green-600" : "text-teal-600"
              }`}>
                {finalPercentage}%
              </span>
            </div>
            <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-4 rounded-full transition-all duration-1000 ${
                  passedStatus 
                    ? "bg-gradient-to-r from-green-500 to-green-600" 
                    : "bg-gradient-to-r from-teal-500 to-teal-600"
                }`}
                style={{ width: `${finalPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>{sessionStats.correct} correct</span>
              <span>{sessionStats.attempted - sessionStats.correct} incorrect</span>
            </div>
          </div>

          {passedStatus && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center gap-2 justify-center text-green-800">
                <CheckCircle2 size={20} />
                <p className="font-medium">You've mastered this topic! Keep up the great work!</p>
              </div>
            </div>
          )}

          {wrongTopics.length > 0 && (
            <div className="border-t pt-6 space-y-3">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Lightbulb className="text-amber-600" size={20} />
                Topics to review
              </h3>
              <ul className="space-y-2">
                {wrongTopics.slice(0, 3).map((topic, i) => (
                  <li key={i} className="text-sm text-gray-700 flex gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                    <AlertCircle className="flex-shrink-0 text-amber-600 mt-0.5" size={16} />
                    <span>{topic}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex gap-4 justify-center">
          <Link
            to={`/content/${data.id}`}
            className="px-8 py-4 rounded-xl border-2 border-teal-200 text-teal-700 font-semibold hover:bg-teal-50 transition-all active:scale-95"
          >
            Review Lesson
          </Link>
          <button
            onClick={retry}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 text-white font-semibold hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-teal-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={contentRef} className="max-w-2xl mx-auto px-4 py-8 pb-32 md:pb-8">
      <div className="space-y-8">
        <header className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Practice
            </h1>
            <Link to={`/content/${data.id}`} className="text-sm text-teal-600 hover:text-teal-700 font-medium">
              ← Back to lesson
            </Link>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">
                Question {currentQIdx + 1} <span className="text-gray-400">of {totalQuestions}</span>
              </span>
              <span className={`text-sm font-bold ${
                percentage >= 80 ? "text-green-600" : "text-gray-900"
              }`}>
                {percentage}% correct
              </span>
            </div>
            <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-2.5 rounded-full transition-all duration-300 ${progressColor}`}
                style={{ width: `${((currentQIdx + 1) / totalQuestions) * 100}%` }}
              />
            </div>
          </div>
        </header>

        <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 md:p-8 space-y-6 shadow-sm">
          <p className="text-xl md:text-2xl font-semibold text-gray-900 leading-relaxed">
            {currentQ.prompt}
          </p>

          <ul className="space-y-3">
            {currentQ.options.map((opt, i) => {
              const isRight = i === currentQ.correct_index;
              const picked = answer.selected === i;
              const show = answer.checked;
              return (
                <li key={i}>
                  <button
                    className={`w-full text-left p-4 rounded-xl border-2 font-medium transition-all active:scale-98
                      ${!show && picked ? "border-teal-600 bg-teal-50 shadow-sm" : "border-gray-200 hover:border-teal-300 hover:bg-gray-50"}
                      ${show && isRight ? "border-green-600 bg-green-50 text-green-900 shadow-sm" : ""}
                      ${show && picked && !isRight ? "border-red-600 bg-red-50 text-red-900 shadow-sm" : ""}
                      ${!show ? "cursor-pointer" : "cursor-default"}`}
                    onClick={() => choose(i)}
                    disabled={show}
                  >
                    {opt}
                  </button>
                </li>
              );
            })}
          </ul>

          {!answer.checked ? (
            <button
              className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 text-white font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 shadow-lg shadow-teal-200"
              onClick={check}
              disabled={answer.selected === null}
            >
              Check Answer
            </button>
          ) : (
            <div className="space-y-4">
              <div className={`flex items-center justify-center gap-2 text-xl font-bold py-4 rounded-xl ${
                isCorrect ? "bg-green-100 text-green-900" : "bg-red-100 text-red-900"
              }`}>
                {isCorrect ? (
                  <>
                    <CheckCircle2 size={24} />
                    <span>Correct!</span>
                  </>
                ) : (
                  <>
                    <AlertCircle size={24} />
                    <span>Not quite</span>
                  </>
                )}
              </div>
              {currentQ.explanation && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 text-sm text-blue-900 leading-relaxed">
                  <span className="font-semibold">Explanation:</span> {currentQ.explanation}
                </div>
              )}
              <button
                onClick={next}
                className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 text-white font-semibold hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-teal-200"
              >
                {currentQIdx < totalQuestions - 1 ? "Next Question →" : "See Results →"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
