import { useEffect, useMemo, useState, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getLessonById } from "../lib/content";
import { recordAttempt } from "../lib/progress";
import { CheckCircle2, AlertCircle, Lightbulb, Brain, Zap } from "lucide-react";
import type { Question } from "../types";

function shuffle<T>(arr: T[]): T[] {
  const shuffled = arr.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

type ShuffledQuestion = {
  prompt: string;
  options: string[];
  correctAnswerText: string;
  explanation?: string;
  shuffledCorrectIndex: number;
};

function shuffleQuestionOptions(questions: Question[]): ShuffledQuestion[] {
  return questions.map(q => {
    // Create array of option indices [0, 1, 2, 3]
    const indices = q.options.map((_, i) => i);
    // Shuffle the indices
    const shuffledIndices = shuffle(indices);
    
    // Reorder options based on shuffled indices
    const shuffledOptions = shuffledIndices.map(i => q.options[i]);
    
    // Find where the correct answer ended up
    const correctAnswerText = q.options[q.correct_index];
    const shuffledCorrectIndex = shuffledOptions.indexOf(correctAnswerText);
    
    return {
      prompt: q.prompt,
      options: shuffledOptions,
      correctAnswerText,
      explanation: q.explanation,
      shuffledCorrectIndex
    };
  });
}

type AnswerState = { selected: number | null; checked: boolean };

export default function PracticeLesson() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const data = lessonId ? getLessonById(lessonId) : null;
  
  // Shuffle questions AND shuffle options within each question
  const shuffledQuestions = useMemo(() => {
    if (!data?.questions) return [];
    const shuffled = shuffle(data.questions);
    return shuffleQuestionOptions(shuffled);
  }, [data?.questions]);
  const hasQuestions = shuffledQuestions.length > 0;
  
  const contentRef = useRef<HTMLDivElement>(null);

  const [showChoice, setShowChoice] = useState(true);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [answer, setAnswer] = useState<AnswerState>({ selected: null, checked: false });
  const [sessionStats, setSessionStats] = useState({ attempted: 0, correct: 0 });
  const [finished, setFinished] = useState(false);
  const [wrongTopics, setWrongTopics] = useState<string[]>([]);

  useEffect(() => {
    if (contentRef.current) {
      const mainElement = contentRef.current.closest('main');
      if (mainElement) {
        mainElement.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [lessonId, currentQIdx, finished]);

  useEffect(() => {
    setShowChoice(true);
    setCurrentQIdx(0);
    setAnswer({ selected: null, checked: false });
    setSessionStats({ attempted: 0, correct: 0 });
    setFinished(false);
    setWrongTopics([]);
  }, [lessonId]);

  if (!data) return <div className="max-w-3xl mx-auto p-6 text-gray-900 dark:text-gray-100">Lesson not found.</div>;

  if (!hasQuestions && !showChoice) {
    return (
      <div ref={contentRef} className="max-w-2xl mx-auto px-4 py-8 pb-32 text-gray-900 dark:text-gray-100 md:pb-8">
        <div className="space-y-6 text-center">
          <h1 className="font-semibold text-gray-900 dark:text-gray-100">Practice</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Practice questions for this lesson are coming soon. Try flashcards instead or review the
            lesson content.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              to={`/content/${data.id}`}
              className="px-6 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-all dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              Review Lesson
            </Link>
            <Link
              to={`/practice/${lessonId}/flashcards`}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold hover:opacity-90 transition-all"
            >
              Open Flashcards
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (showChoice) {
    return (
      <div ref={contentRef} className="max-w-2xl mx-auto px-4 py-8 pb-32 text-gray-900 dark:text-gray-100 md:pb-8">
        <div className="space-y-8">
          <header className="text-center space-y-4">
            <h1 className="font-semibold text-gray-900 dark:text-gray-100">
              {data.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Choose how you'd like to practice
            </p>
          </header>

          <div className="grid md:grid-cols-2 gap-6">
            <button
              onClick={() => hasQuestions && setShowChoice(false)}
              disabled={!hasQuestions}
              className="group bg-white border-2 border-gray-200 hover:border-teal-400 rounded-2xl p-8 transition-all duration-200 hover:shadow-xl text-left disabled:opacity-60 disabled:cursor-not-allowed dark:bg-gray-900 dark:border-gray-800 dark:hover:border-teal-400/80"
            >
              <div className="space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Brain className="text-white" size={32} />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900 mb-2 dark:text-gray-100">
                    Practice Questions
                  </h2>
                  <p className="text-gray-600 mb-4 dark:text-gray-300">
                    {hasQuestions
                      ? `Test your knowledge with ${shuffledQuestions.length} multiple-choice questions`
                      : "We're writing practice questions for this lesson."}
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="text-teal-500 flex-shrink-0" size={16} />
                      Instant feedback on answers
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="text-teal-500 flex-shrink-0" size={16} />
                      Detailed explanations
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="text-teal-500 flex-shrink-0" size={16} />
                      Track your progress
                    </li>
                  </ul>
                </div>
                <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                  <span className="text-teal-600 font-semibold group-hover:translate-x-1 inline-block transition-transform dark:text-teal-300">
                    {hasQuestions ? "Start Practice →" : "Practice coming soon"}
                  </span>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate(`/practice/${lessonId}/flashcards`)}
              className="group bg-white border-2 border-gray-200 hover:border-emerald-400 rounded-2xl p-8 transition-all duration-200 hover:shadow-xl text-left dark:bg-gray-900 dark:border-gray-800 dark:hover:border-emerald-400/80"
            >
              <div className="space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Zap className="text-white" size={32} />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900 mb-2 dark:text-gray-100">
                    Flashcards
                  </h2>
                  <p className="text-gray-600 mb-4 dark:text-gray-300">
                    Quick review with {data.flashcards?.length || 0} flashcards
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="text-emerald-500 flex-shrink-0" size={16} />
                      Randomized for better retention
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="text-emerald-500 flex-shrink-0" size={16} />
                      Auto-advance after viewing
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="text-emerald-500 flex-shrink-0" size={16} />
                      Perfect for quick review
                    </li>
                  </ul>
                </div>
                <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                  <span className="text-emerald-600 font-semibold group-hover:translate-x-1 inline-block transition-transform dark:text-emerald-300">
                    Start Flashcards →
                  </span>
                </div>
              </div>
            </button>
          </div>

          <div className="text-center">
            <Link
              to={`/content/${data.id}`}
              className="text-teal-600 hover:text-teal-700 font-medium inline-flex items-center gap-2 dark:text-teal-300 dark:hover:text-teal-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to lesson
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = shuffledQuestions[currentQIdx];
  if (!currentQ) {
    return null;
  }
  const totalQuestions = shuffledQuestions.length;
  const isCorrect = answer.selected === currentQ?.shuffledCorrectIndex;
  const percentage = sessionStats.attempted > 0 
    ? Math.round((sessionStats.correct / sessionStats.attempted) * 100) 
    : 0;
  const progressColor = percentage >= 80 ? "bg-green-500" : "bg-teal-500";

  function choose(optIdx: number) {
    if (answer.checked) return;
    setAnswer(prev => ({ ...prev, selected: optIdx }));
  }

  function check() {
    if (answer.selected === null) return;
    if (!data) return;
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
    setShowChoice(true);
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

    const isHighScore = finalPercentage >= 80;
    const isMediumScore = finalPercentage >= 50 && finalPercentage < 80;

    const resultVariant = isHighScore
      ? {
          circleBg: "bg-green-100",
          iconColor: "text-green-600",
          gradient: "from-green-400 to-green-500",
          accentText: "text-green-600",
          headline: "Outstanding work!",
          summary: "You're ready to move forward!",
        }
      : isMediumScore
        ? {
            circleBg: "bg-teal-100",
            iconColor: "text-teal-600",
            gradient: "from-teal-400 to-teal-500",
            accentText: "text-teal-600",
            headline: "Great progress!",
            summary: "A little more practice and you'll be there!",
          }
        : {
            circleBg: "bg-amber-100",
            iconColor: "text-amber-600",
            gradient: "from-amber-400 to-amber-500",
            accentText: "text-amber-600",
            headline: "Keep practicing!",
            summary: "Review the lesson and try again soon!",
          };

    const supportiveMessages = data.supportive_messages ?? {};
    const supportiveMessage = isHighScore
      ? supportiveMessages.high_score ?? "You've mastered this topic! Keep up the great work!"
      : isMediumScore
        ? supportiveMessages.medium_score ?? "Solid progress—target the questions you missed to reach mastery."
        : supportiveMessages.low_score ?? "Keep going—review the key facts and try another round.";

    const highlightVariant = isHighScore
      ? {
          bg: "bg-green-50",
          border: "border-green-200",
          text: "text-green-800",
          iconColor: "text-green-600",
          Icon: CheckCircle2,
        }
      : isMediumScore
        ? {
            bg: "bg-teal-50",
            border: "border-teal-200",
            text: "text-teal-800",
            iconColor: "text-teal-600",
            Icon: Brain,
          }
        : {
            bg: "bg-amber-50",
            border: "border-amber-200",
            text: "text-amber-800",
            iconColor: "text-amber-600",
            Icon: Lightbulb,
          };

    const HighlightIcon = highlightVariant.Icon;

    return (
      <div ref={contentRef} className="max-w-2xl mx-auto px-4 py-8 pb-32 text-gray-900 dark:text-gray-100 md:pb-8 space-y-8">
        <div className="text-center space-y-6 py-12">
          <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${resultVariant.circleBg}`}>
            <CheckCircle2 className={resultVariant.iconColor} size={48} />
          </div>
          <div className="space-y-2">
            <h1 className="font-semibold text-gray-900 dark:text-gray-100">
              {resultVariant.headline}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {resultVariant.summary}
            </p>
          </div>
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 space-y-6 dark:bg-gray-900 dark:border-gray-800">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-700 dark:text-gray-200">Your Score</span>
              <span className={`font-semibold text-3xl ${resultVariant.accentText}`}>
                {finalPercentage}%
              </span>
            </div>
            <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden dark:bg-gray-800">
              <div
                className={`h-4 rounded-full transition-all duration-1000 bg-gradient-to-r ${resultVariant.gradient}`}
                style={{ width: `${finalPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
              <span>{sessionStats.correct} correct</span>
              <span>{sessionStats.attempted - sessionStats.correct} incorrect</span>
            </div>
          </div>

          <div className={`${highlightVariant.bg} ${highlightVariant.border} rounded-xl p-4`}>
            <div className={`flex items-center gap-2 justify-center ${highlightVariant.text} dark:text-gray-100`}>
              <HighlightIcon className={highlightVariant.iconColor} size={20} />
              <p className="text-center">{supportiveMessage}</p>
            </div>
          </div>

          {wrongTopics.length > 0 && (
            <div className="border-t pt-6 space-y-3">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2 dark:text-gray-100">
                <Lightbulb className="text-amber-500" size={20} />
                Topics to review
              </h3>
              <ul className="space-y-2">
                {wrongTopics.slice(0, 3).map((topic, i) => (
                  <li key={i} className="text-sm text-gray-700 flex gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100 dark:text-gray-900">
                    <AlertCircle className="flex-shrink-0 text-amber-500 mt-0.5" size={16} />
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
            className="px-8 py-4 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-all dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            Review Lesson
          </Link>
          <button
            onClick={retry}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-400 text-white font-semibold hover:opacity-90 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={contentRef} className="max-w-2xl mx-auto px-4 py-8 pb-32 text-gray-900 dark:text-gray-100 md:pb-8">
      <div className="space-y-8">
        <header className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="font-semibold text-gray-900 dark:text-gray-100">
              Practice
            </h1>
            <button
              onClick={() => setShowChoice(true)}
              className="text-sm text-teal-600 hover:text-teal-700 font-medium dark:text-teal-300 dark:hover:text-teal-200"
            >
              ← Change mode
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Question {currentQIdx + 1} <span className="text-gray-400 dark:text-gray-400">of {totalQuestions}</span>
              </span>
              <span className={`text-sm font-semibold ${
                percentage >= 80 ? "text-green-600" : "text-gray-900 dark:text-gray-100"
              }`}>
                {percentage}% correct
              </span>
            </div>
            <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden dark:bg-gray-800">
              <div
                className={`h-2.5 rounded-full transition-all duration-300 ${progressColor}`}
                style={{ width: `${((currentQIdx + 1) / totalQuestions) * 100}%` }}
              />
            </div>
          </div>
        </header>

        <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 md:p-8 space-y-6 dark:bg-gray-900 dark:border-gray-800">
          <p className="text-gray-900 leading-relaxed dark:text-gray-100">
            {currentQ.prompt}
          </p>

          <ul className="space-y-3">
            {currentQ.options.map((opt, i) => {
              const isRight = i === currentQ.shuffledCorrectIndex;
              const picked = answer.selected === i;
              const show = answer.checked;
              return (
                <li key={i}>
                  <button
                    className={`w-full text-left p-4 rounded-xl border-2 font-medium transition-all
                      ${!show && picked ? "border-teal-400 bg-teal-50 dark:bg-teal-900/20" : "border-gray-200 hover:border-teal-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"}
                      ${show && isRight ? "border-green-500 bg-green-50 text-green-900 dark:bg-green-900/30 dark:text-green-200" : ""}
                      ${show && picked && !isRight ? "border-red-400 bg-red-50 text-red-900 dark:bg-red-900/30 dark:text-red-200" : ""}
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
              className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-400 text-white font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={check}
              disabled={answer.selected === null}
            >
              Check Answer
            </button>
          ) : (
            <div className="space-y-4">
              <div className={`flex items-center justify-center gap-2 text-xl font-semibold py-4 rounded-xl ${
                isCorrect ? "bg-green-100 text-green-900 dark:bg-green-900/40 dark:text-green-200" : "bg-red-100 text-red-900 dark:bg-red-900/40 dark:text-red-200"
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
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 text-sm text-blue-900 leading-relaxed dark:bg-blue-900/30 dark:text-blue-100 dark:border-blue-800">
                  <span className="font-semibold">Explanation:</span> {currentQ.explanation}
                </div>
              )}
              <button
                onClick={next}
                className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-400 text-white font-semibold hover:opacity-90 transition-all"
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
