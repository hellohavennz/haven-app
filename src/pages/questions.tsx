import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface Question {
  prompt: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

const QuestionsPage: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [remainingQuestions, setRemainingQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [lessonTitle, setLessonTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [sessionStats, setSessionStats] = useState({
    attempted: 0,
    correct: 0,
    total: 0
  });

  // Shuffle array using Fisher-Yates algorithm
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const lessonModule = await import(`../content/lessons/${lessonId}.json`);
        const lessonData = lessonModule.default as { title: string; questions: Question[] };
        setLessonTitle(lessonData.title);
        
        const loadedQuestions: Question[] = lessonData.questions;
        const shuffled = shuffleArray(loadedQuestions);
        
        setQuestions(loadedQuestions);
        setRemainingQuestions(shuffled);
        setCurrentQuestion(shuffled[0]);
        setSessionStats({
          attempted: 0,
          correct: 0,
          total: shuffled.length
        });
        
        // Update total questions in progress
        const progressKey = `progress_${lessonId}`;
        const savedProgress = localStorage.getItem(progressKey);
        const progress = savedProgress ? JSON.parse(savedProgress) : {
          questionsCompleted: 0,
          totalQuestions: loadedQuestions.length,
          correctAnswers: 0,
          flashcardsReviewed: 0,
          totalFlashcards: 0
        };
        progress.totalQuestions = loadedQuestions.length;
        localStorage.setItem(progressKey, JSON.stringify(progress));
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading questions:', error);
        setIsLoading(false);
      }
    };

    loadQuestions();
  }, [lessonId]);

  const handleAnswerSelect = (index: number) => {
    if (selectedAnswer === null) {
      setSelectedAnswer(index);
      setShowExplanation(true);
      
      const isCorrect = index === currentQuestion?.correct_index;
      
      // Update session stats
      setSessionStats(prev => ({
        ...prev,
        attempted: prev.attempted + 1,
        correct: prev.correct + (isCorrect ? 1 : 0)
      }));
      
      // Update localStorage progress
      const progressKey = `progress_${lessonId}`;
      const savedProgress = localStorage.getItem(progressKey);
      const progress = savedProgress ? JSON.parse(savedProgress) : {
        questionsCompleted: 0,
        totalQuestions: questions.length,
        correctAnswers: 0,
        flashcardsReviewed: 0,
        totalFlashcards: 0
      };
      
      progress.questionsCompleted += 1;
      if (isCorrect) {
        progress.correctAnswers += 1;
      }
      
      localStorage.setItem(progressKey, JSON.stringify(progress));
    }
  };

  const handleNextQuestion = () => {
    // Remove current question from remaining questions
    const newRemaining = remainingQuestions.slice(1);
    
    if (newRemaining.length > 0) {
      setRemainingQuestions(newRemaining);
      setCurrentQuestion(newRemaining[0]);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      // No more questions - show completion
      alert(`Session Complete!\n\nYou answered ${sessionStats.correct + (selectedAnswer === currentQuestion?.correct_index ? 1 : 0)} out of ${sessionStats.total} questions correctly.\n\nAccuracy: ${Math.round(((sessionStats.correct + (selectedAnswer === currentQuestion?.correct_index ? 1 : 0)) / sessionStats.total) * 100)}%`);
      navigate('/practice');
    }
  };

  const handleRestart = () => {
    const shuffled = shuffleArray(questions);
    setRemainingQuestions(shuffled);
    setCurrentQuestion(shuffled[0]);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setSessionStats({
      attempted: 0,
      correct: 0,
      total: shuffled.length
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading questions...</div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">No Questions Available</h1>
        <button
          onClick={() => navigate('/practice')}
          className="text-blue-600 hover:text-blue-800 font-semibold"
        >
          ← Back to Practice
        </button>
      </div>
    );
  }

  const progress = ((sessionStats.attempted) / sessionStats.total) * 100;
  const accuracy = sessionStats.attempted > 0 ? Math.round((sessionStats.correct / sessionStats.attempted) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/practice')}
            className="text-blue-600 hover:text-blue-800 font-semibold mb-4 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Practice
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{lessonTitle}</h1>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-lg text-gray-600">
              Question {sessionStats.attempted + 1} of {sessionStats.total}
            </p>
            <div className="flex gap-4">
              <span className="text-sm font-semibold text-green-600">
                ✓ Correct: {sessionStats.correct}
              </span>
              <span className="text-sm font-semibold text-red-600">
                ✗ Wrong: {sessionStats.attempted - sessionStats.correct}
              </span>
              {sessionStats.attempted > 0 && (
                <span className="text-sm font-semibold text-blue-600">
                  Accuracy: {accuracy}%
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-8 shadow-inner">
          <div
            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {currentQuestion.prompt}
          </h2>

          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === currentQuestion.correct_index;
              const showResult = selectedAnswer !== null;

              let buttonClass = 'w-full text-left p-4 rounded-xl border-2 transition-all duration-200 font-medium ';
              
              if (!showResult) {
                buttonClass += 'border-gray-300 hover:border-blue-500 hover:bg-blue-50 bg-white';
              } else if (isCorrect) {
                buttonClass += 'border-green-500 bg-green-50 text-green-900';
              } else if (isSelected && !isCorrect) {
                buttonClass += 'border-red-500 bg-red-50 text-red-900';
              } else {
                buttonClass += 'border-gray-300 bg-gray-50 text-gray-600';
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={selectedAnswer !== null}
                  className={buttonClass}
                >
                  <div className="flex items-center">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center mr-3 font-semibold">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="flex-1">{option}</span>
                    {showResult && isCorrect && (
                      <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                    {showResult && isSelected && !isCorrect && (
                      <svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Explanation */}
        {showExplanation && (
          <div className={`rounded-2xl shadow-xl p-6 mb-6 ${
            selectedAnswer === currentQuestion.correct_index
              ? 'bg-green-50 border-2 border-green-500'
              : 'bg-red-50 border-2 border-red-500'
          }`}>
            <div className="flex items-start">
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                selectedAnswer === currentQuestion.correct_index
                  ? 'bg-green-500'
                  : 'bg-red-500'
              }`}>
                {selectedAnswer === currentQuestion.correct_index ? (
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <h3 className={`font-bold text-lg mb-2 ${
                  selectedAnswer === currentQuestion.correct_index
                    ? 'text-green-900'
                    : 'text-red-900'
                }`}>
                  {selectedAnswer === currentQuestion.correct_index ? 'Correct!' : 'Incorrect'}
                </h3>
                <p className={
                  selectedAnswer === currentQuestion.correct_index
                    ? 'text-green-800'
                    : 'text-red-800'
                }>
                  {currentQuestion.explanation}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={handleRestart}
            className="flex items-center px-6 py-3 bg-white hover:bg-gray-50 text-gray-800 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl border-2 border-gray-300"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Restart
          </button>

          {showExplanation && (
            <button
              onClick={handleNextQuestion}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {remainingQuestions.length === 1 ? 'Finish' : 'Next Question'}
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionsPage;
