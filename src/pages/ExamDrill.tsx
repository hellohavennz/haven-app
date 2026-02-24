import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, RotateCcw, ArrowRight } from 'lucide-react';
import type { ExamQuestion } from '../types';
import { shuffle } from '../lib/examUtils';

type DrillState = { questions: ExamQuestion[] };

export default function ExamDrill() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as DrillState | null;

  // Re-shuffle options on mount so positions aren't memorised from the exam
  const [questions] = useState<ExamQuestion[]>(() => {
    if (!state?.questions?.length) return [];
    return state.questions.map(q => {
      const indices = q.options.map((_, i) => i);
      const shuffledIndices = shuffle(indices);
      const shuffledOptions = shuffledIndices.map(i => q.options[i]);
      const correctText = q.options[q.correct_index];
      return {
        ...q,
        options: shuffledOptions,
        correct_index: shuffledOptions.indexOf(correctText),
      };
    });
  });

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  if (!questions.length) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center space-y-4">
        <p className="text-gray-600 dark:text-gray-300">No questions to drill.</p>
        <Link
          to="/exam"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-3 font-semibold text-white"
        >
          Back to Exams
        </Link>
      </div>
    );
  }

  const currentQ = questions[currentIdx];
  const isCorrect = selected === currentQ.correct_index;
  const total = questions.length;

  function check() {
    if (selected === null) return;
    setChecked(true);
    if (isCorrect) setCorrectCount(c => c + 1);
  }

  function next() {
    if (currentIdx < total - 1) {
      setCurrentIdx(i => i + 1);
      setSelected(null);
      setChecked(false);
    } else {
      setFinished(true);
    }
  }

  if (finished) {
    const pct = Math.round((correctCount / total) * 100);
    const allRight = correctCount === total;

    return (
      <div className="mx-auto max-w-2xl space-y-8 px-4 py-12 text-center">
        <div
          className={`mx-auto flex h-24 w-24 items-center justify-center rounded-full border-4 ${
            allRight
              ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
              : pct >= 60
              ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
              : 'border-amber-400 bg-amber-50 dark:bg-amber-900/20'
          }`}
        >
          <div>
            <div className={`text-2xl font-bold ${allRight ? 'text-green-700 dark:text-green-300' : pct >= 60 ? 'text-teal-700 dark:text-teal-300' : 'text-amber-700 dark:text-amber-300'}`}>
              {correctCount}/{total}
            </div>
            <div className={`text-sm font-semibold ${allRight ? 'text-green-600' : pct >= 60 ? 'text-teal-600' : 'text-amber-600'}`}>
              {pct}%
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="font-semibold text-gray-900 dark:text-white">
            {allRight ? 'Perfect drill!' : pct >= 60 ? 'Good progress!' : 'Keep at it!'}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {allRight
              ? 'You got every question right. Those answers are locked in.'
              : `You got ${correctCount} of ${total} right. Run the drill again to reinforce the ones you missed.`}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={() => {
              setCurrentIdx(0);
              setSelected(null);
              setChecked(false);
              setCorrectCount(0);
              setFinished(false);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-gray-200 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200"
          >
            <RotateCcw className="h-4 w-4" />
            Drill Again
          </button>
          <Link
            to="/exam/take"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-3 font-semibold text-white hover:shadow-lg"
          >
            Take Another Exam
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Question {currentIdx + 1} of {total}
          </span>
          <span className="rounded-full bg-purple-100 px-3 py-0.5 text-xs font-semibold text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
            Drill session
          </span>
        </div>
        <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
          <div
            className="h-2 rounded-full bg-purple-500 transition-all"
            style={{ width: `${((currentIdx + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Question card */}
      <div className="rounded-2xl border-2 border-gray-200 bg-white p-6 space-y-5 dark:border-gray-800 dark:bg-gray-900">
        <p className="leading-relaxed text-gray-900 dark:text-gray-100">
          {currentQ.prompt}
        </p>

        <ul className="space-y-3">
          {currentQ.options.map((opt, i) => {
            const isCorrectOpt = i === currentQ.correct_index;
            const isPicked = selected === i;
            return (
              <li key={i}>
                <button
                  onClick={() => !checked && setSelected(i)}
                  disabled={checked}
                  className={`w-full rounded-xl border-2 p-4 text-left font-medium transition-all ${
                    checked
                      ? isCorrectOpt
                        ? 'border-green-500 bg-green-50 text-green-900 dark:bg-green-900/20 dark:text-green-200'
                        : isPicked
                        ? 'border-red-400 bg-red-50 text-red-900 dark:bg-red-900/20 dark:text-red-200'
                        : 'border-gray-100 text-gray-400 dark:border-gray-800 dark:text-gray-500'
                      : isPicked
                      ? 'border-purple-500 bg-purple-50 text-purple-900 dark:bg-purple-900/20 dark:text-purple-100'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    {checked && isCorrectOpt && (
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-600" />
                    )}
                    {checked && isPicked && !isCorrectOpt && (
                      <XCircle className="h-4 w-4 flex-shrink-0 text-red-500" />
                    )}
                    {opt}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {checked && (
          <div className={`rounded-xl p-3 text-sm font-semibold text-center ${
            isCorrect
              ? 'bg-green-100 text-green-900 dark:bg-green-900/30 dark:text-green-200'
              : 'bg-red-100 text-red-900 dark:bg-red-900/30 dark:text-red-200'
          }`}>
            {isCorrect ? 'Correct!' : `Incorrect — the answer is: ${currentQ.options[currentQ.correct_index]}`}
          </div>
        )}

        {checked && currentQ.explanation && (
          <div className="rounded-xl bg-blue-50 border border-blue-100 p-3 text-sm text-blue-900 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200">
            <span className="font-semibold">Explanation: </span>
            {currentQ.explanation}
          </div>
        )}
      </div>

      {/* Action button */}
      {!checked ? (
        <button
          onClick={check}
          disabled={selected === null}
          className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 py-4 font-semibold text-white transition-all hover:shadow-lg disabled:opacity-40"
        >
          Check Answer
        </button>
      ) : (
        <button
          onClick={next}
          className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 py-4 font-semibold text-white transition-all hover:shadow-lg"
        >
          {currentIdx < total - 1 ? 'Next Question →' : 'See Results →'}
        </button>
      )}
    </div>
  );
}
