import { useEffect, useMemo, useState, useRef } from "react";
import { Link, Navigate, useParams, useNavigate, useLocation } from "react-router-dom";
import { getLessonById, getAllLessons } from "../lib/content";
import { recordAttempt } from "../lib/progress";
import { CheckCircle2, AlertCircle, Lightbulb, Brain, Zap, ArrowRight, Lock, ChevronLeft } from "lucide-react";
import type { Question } from "../types";
import ReportButton from "../components/ReportButton";
import { usePageTitle } from '../hooks/usePageTitle';
import { useSubscription } from "../lib/subscription";
import { getCurrentUser } from "../lib/auth";
import { hasAccessToModuleSync } from "../lib/access";

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
    const indices = q.options.map((_: any, i: number) => i);
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
  const location = useLocation();
  const data = lessonId ? getLessonById(lessonId) : null;
  usePageTitle(data?.title);
  const { tier } = useSubscription();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    getCurrentUser().then(setUser);
  }, []);

  // Shuffle questions AND shuffle options within each question
  const shuffledQuestions = useMemo(() => {
    if (!data?.questions) return [];
    const shuffled = shuffle(data.questions);
    return shuffleQuestionOptions(shuffled);
  }, [data?.questions]);
  const hasQuestions = shuffledQuestions.length > 0;

  // Next lesson in practice order (for "Next lesson" button on results screen)
  const nextLesson = useMemo(() => {
    const allWithQs = getAllLessons().filter(l => (l.questions?.length ?? 0) > 0);
    const idx = allWithQs.findIndex(l => l.id === lessonId);
    return idx >= 0 && idx < allWithQs.length - 1 ? allWithQs[idx + 1] : null;
  }, [lessonId]);

  const contentRef = useRef<HTMLDivElement>(null);

  // Skip choice screen when navigated directly to /questions
  const [showChoice, setShowChoice] = useState(() => !location.pathname.endsWith('/questions'));
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
    setShowChoice(!location.pathname.endsWith('/questions'));
    setCurrentQIdx(0);
    setAnswer({ selected: null, checked: false });
    setSessionStats({ attempted: 0, correct: 0 });
    setFinished(false);
    setWrongTopics([]);
  }, [lessonId, location.pathname]);

  if (!data) return <div className="max-w-3xl mx-auto p-6 text-slate-900 dark:text-gray-100">Lesson not found.</div>;

  if (user && !hasAccessToModuleSync(data.module_slug, user, tier)) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 text-slate-900 dark:text-gray-100">
        <Link to="/practice" className="text-teal-600 hover:text-teal-700 font-semibold mb-6 inline-flex items-center dark:text-teal-300">
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back to Practice
        </Link>
        <h1 className="font-semibold text-slate-900 mt-2 mb-8 dark:text-gray-100">{data.title}</h1>
        <div className="rounded-2xl border border-teal-200 bg-teal-50 p-10 text-center dark:bg-teal-900/20 dark:border-teal-800">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-teal-100 dark:bg-teal-800/50 mb-4">
            <Lock className="w-7 h-7 text-teal-600 dark:text-teal-400" />
          </div>
          <h2 className="font-semibold text-slate-900 dark:text-white mb-2">This lesson is on the Plus plan</h2>
          <p className="text-slate-600 dark:text-slate-300 mb-6 max-w-sm mx-auto">
            Unlock all 29 lessons, practice questions, and mock exams from £4.99.
          </p>
          <Link
            to="/paywall"
            className="inline-flex items-center gap-2 px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-all"
          >
            View plans
          </Link>
        </div>
      </div>
    );
  }

  if (!hasQuestions && !showChoice) {
    return (
      <div ref={contentRef} className="max-w-2xl mx-auto px-4 py-8 pb-32 text-slate-900 dark:text-gray-100 md:pb-8">
        <div className="space-y-6 text-center">
          <h1 className="font-semibold text-slate-900 dark:text-gray-100">Practice</h1>
          <p className="text-slate-600 dark:text-slate-300">
            Practice questions for this lesson are coming soon. Try flashcards instead or review the
            lesson content.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              to={`/content/${data.id}`}
              className="px-6 py-3 rounded-xl border-2 border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-all dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Review Lesson
            </Link>
            <Link
              to={`/practice/${lessonId}/flashcards`}
              className="px-6 py-3 rounded-xl bg-teal-600 text-white font-semibold hover:opacity-90 transition-all"
            >
              Open Flashcards
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const hasFlashcards = (data.flashcards?.length ?? 0) > 0;

  if (showChoice && !hasQuestions && !hasFlashcards) {
    return <Navigate to="/practice" replace />;
  }

  if (showChoice) {
    return (
      <div ref={contentRef} className="max-w-2xl mx-auto px-4 py-8 pb-32 text-slate-900 dark:text-gray-100 md:pb-8">
        <div className="space-y-8">
          <header className="text-center space-y-4">
            <h1 className="font-semibold text-slate-900 dark:text-gray-100">
              {data.title}
            </h1>
            <p className="text-slate-600 dark:text-slate-300">
              Choose how you'd like to practice
            </p>
          </header>

          <div className="grid md:grid-cols-2 gap-6">
            <button
              onClick={() => hasQuestions && setShowChoice(false)}
              disabled={!hasQuestions}
              className="group bg-white border-2 border-slate-200 hover:border-teal-400 rounded-2xl p-8 transition-all duration-200 hover:shadow-xl text-left disabled:opacity-60 disabled:cursor-not-allowed dark:bg-slate-900 dark:border-slate-800 dark:hover:border-teal-400/80"
            >
              <div className="space-y-4">
                <div className="w-16 h-16 bg-teal-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Brain className="text-white" size={32} />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900 mb-2 dark:text-gray-100">
                    Practice Questions
                  </h2>
                  <p className="text-slate-600 mb-4 dark:text-slate-300">
                    {hasQuestions
                      ? `Test your knowledge with ${shuffledQuestions.length} multiple-choice questions`
                      : "We're writing practice questions for this lesson."}
                  </p>
                  <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
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
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                  <span className="text-teal-600 font-semibold group-hover:translate-x-1 inline-block transition-transform dark:text-teal-300">
                    {hasQuestions ? "Start Practice →" : "Practice coming soon"}
                  </span>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate(`/practice/${lessonId}/flashcards`)}
              className="group bg-white border-2 border-slate-200 hover:border-emerald-400 rounded-2xl p-8 transition-all duration-200 hover:shadow-xl text-left dark:bg-slate-900 dark:border-slate-800 dark:hover:border-emerald-400/80"
            >
              <div className="space-y-4">
                <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Zap className="text-white" size={32} />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900 mb-2 dark:text-gray-100">
                    Flashcards
                  </h2>
                  <p className="text-slate-600 mb-4 dark:text-slate-300">
                    Quick review with {data.flashcards?.length || 0} flashcards
                  </p>
                  <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
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
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
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
        ? supportiveMessages.medium_score ?? "Solid progress. Target the questions you missed to reach mastery."
        : supportiveMessages.low_score ?? "Keep going. Review the key facts and try another round.";

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
      <div ref={contentRef} className="max-w-2xl mx-auto px-4 py-8 pb-32 text-slate-900 dark:text-gray-100 md:pb-8 space-y-8">
        <div className="text-center space-y-6 py-12">
          <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${resultVariant.circleBg}`}>
            <CheckCircle2 className={resultVariant.iconColor} size={48} />
          </div>
          <div className="space-y-2">
            <h1 className="font-semibold text-slate-900 dark:text-gray-100">
              {resultVariant.headline}
            </h1>
            <p className="text-slate-600 dark:text-slate-300">
              {resultVariant.summary}
            </p>
          </div>
        </div>

        <div className="bg-white border-2 border-slate-200 rounded-2xl p-8 space-y-6 dark:bg-slate-900 dark:border-slate-800">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-700 dark:text-slate-200">Your Score</span>
              <span className={`font-semibold text-3xl ${resultVariant.accentText}`}>
                {finalPercentage}%
              </span>
            </div>
            <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden dark:bg-slate-800">
              <div
                className={`h-4 rounded-full transition-all duration-1000 bg-gradient-to-r ${resultVariant.gradient}`}
                style={{ width: `${finalPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-sm text-slate-600 dark:text-slate-300">
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
              <h3 className="font-semibold text-slate-900 flex items-center gap-2 dark:text-gray-100">
                <Lightbulb className="text-amber-500" size={20} />
                Topics to review
              </h3>
              <ul className="space-y-2">
                {wrongTopics.slice(0, 3).map((topic, i) => (
                  <li key={i} className="text-sm text-slate-700 flex gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100 dark:text-slate-900">
                    <AlertCircle className="flex-shrink-0 text-amber-500 mt-0.5" size={16} />
                    <span>{topic}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            to={`/content/${data.id}`}
            className="px-6 py-3 rounded-xl border-2 border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-all dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Study notes
          </Link>
          <button
            onClick={retry}
            className="px-6 py-3 rounded-xl bg-teal-600 text-white font-semibold hover:opacity-90 transition-all"
          >
            Try again
          </button>
          {nextLesson && (
            <Link
              to={`/practice/${nextLesson.id}/questions`}
              className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:opacity-90 transition-all inline-flex items-center gap-2"
            >
              Next lesson
              <ArrowRight size={16} />
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div ref={contentRef} className="max-w-2xl mx-auto px-4 py-8 pb-32 text-slate-900 dark:text-gray-100 md:pb-8">
      <div className="space-y-8">
        <header className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="font-semibold text-slate-900 dark:text-gray-100">
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
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Question {currentQIdx + 1} <span className="text-slate-400 dark:text-slate-400">of {totalQuestions}</span>
              </span>
              <span className={`text-sm font-semibold ${
                percentage >= 80 ? "text-green-600" : "text-slate-900 dark:text-gray-100"
              }`}>
                {percentage}% correct
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden dark:bg-slate-800">
              <div
                className={`h-2.5 rounded-full transition-all duration-300 ${progressColor}`}
                style={{ width: `${((currentQIdx + 1) / totalQuestions) * 100}%` }}
              />
            </div>
          </div>
        </header>

        <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 md:p-8 space-y-6 dark:bg-slate-900 dark:border-slate-800">
          <p className="text-slate-900 leading-relaxed dark:text-gray-100">
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
                      ${!show && picked ? "border-teal-400 bg-teal-50 dark:bg-teal-900/20" : "border-slate-200 hover:border-teal-300 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"}
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
              className="w-full px-6 py-4 rounded-xl bg-teal-600 text-white font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                className="w-full px-6 py-4 rounded-xl bg-teal-600 text-white font-semibold hover:opacity-90 transition-all"
              >
                {currentQIdx < totalQuestions - 1 ? "Next Question →" : "See Results →"}
              </button>
              <div className="flex justify-center pt-1">
                <ReportButton
                  lessonId={data.id}
                  contentType="question"
                  contentRef={String(currentQIdx)}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
