import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface Flashcard {
  question: string;
  answer: string;
}

const FlashcardsPage: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const [allFlashcards, setAllFlashcards] = useState<Flashcard[]>([]);
  const [remainingCards, setRemainingCards] = useState<Flashcard[]>([]);
  const [currentCard, setCurrentCard] = useState<Flashcard | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [lessonTitle, setLessonTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [sessionStats, setSessionStats] = useState({
    reviewed: 0,
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
    const loadFlashcards = async () => {
      try {
        const lessonModule = await import(`../content/lessons/${lessonId}.json`);
        const lessonData = lessonModule.default as { title: string; flashcards: [string, string][] };
        setLessonTitle(lessonData.title);
        
        const cards: Flashcard[] = lessonData.flashcards.map((card: [string, string]) => ({
          question: card[0],
          answer: card[1]
        }));
        
        const shuffled = shuffleArray(cards);
        setAllFlashcards(cards);
        setRemainingCards(shuffled);
        setCurrentCard(shuffled[0]);
        setSessionStats({
          reviewed: 0,
          total: shuffled.length
        });
        
        // Update total flashcards in progress
        const progressKey = `progress_${lessonId}`;
        const savedProgress = localStorage.getItem(progressKey);
        const progress = savedProgress ? JSON.parse(savedProgress) : {
          questionsCompleted: 0,
          totalQuestions: 0,
          correctAnswers: 0,
          flashcardsReviewed: 0,
          totalFlashcards: cards.length
        };
        progress.totalFlashcards = cards.length;
        localStorage.setItem(progressKey, JSON.stringify(progress));
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading flashcards:', error);
        setIsLoading(false);
      }
    };

    loadFlashcards();
  }, [lessonId]);

  useEffect(() => {
    if (isFlipped && currentCard && !isTransitioning) {
      // Auto-advance after 4 seconds
      const timer = setTimeout(() => {
        handleNext();
      }, 4000);
      
      return () => clearTimeout(timer);
    }
  }, [isFlipped, currentCard, isTransitioning]);

  const handleFlip = () => {
    if (!isFlipped && !isTransitioning) {
      setIsFlipped(true);
      
      // Update session stats
      setSessionStats(prev => ({
        ...prev,
        reviewed: prev.reviewed + 1
      }));
      
      // Update flashcards reviewed in localStorage
      const progressKey = `progress_${lessonId}`;
      const savedProgress = localStorage.getItem(progressKey);
      const progress = savedProgress ? JSON.parse(savedProgress) : {
        questionsCompleted: 0,
        totalQuestions: 0,
        correctAnswers: 0,
        flashcardsReviewed: 0,
        totalFlashcards: allFlashcards.length
      };
      progress.flashcardsReviewed = Math.max(progress.flashcardsReviewed, sessionStats.reviewed + 1);
      localStorage.setItem(progressKey, JSON.stringify(progress));
    }
  };

  const handleNext = () => {
    // Start transition - hide current card
    setIsTransitioning(true);
    
    // Wait for fade out, then change card
    setTimeout(() => {
      const newRemaining = remainingCards.slice(1);
      
      if (newRemaining.length > 0) {
        setRemainingCards(newRemaining);
        setCurrentCard(newRemaining[0]);
        setIsFlipped(false);
        
        // Wait a bit then fade in new card
        setTimeout(() => {
          setIsTransitioning(false);
        }, 50);
      } else {
        // Finished all cards
        alert(`Session Complete!\n\nYou reviewed all ${sessionStats.total} flashcards.`);
        navigate('/practice');
      }
    }, 300);
  };

  const handleRestart = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      const shuffled = shuffleArray(allFlashcards);
      setRemainingCards(shuffled);
      setCurrentCard(shuffled[0]);
      setIsFlipped(false);
      setSessionStats({
        reviewed: 0,
        total: shuffled.length
      });
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }, 300);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-slate-600">Loading flashcards...</div>
      </div>
    );
  }

  if (!currentCard) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="font-semibold text-slate-900 mb-4">No Flashcards Available</h1>
        <button
          onClick={() => navigate('/practice')}
          className="text-blue-600 hover:text-blue-800 font-semibold"
        >
          ← Back to Practice
        </button>
      </div>
    );
  }

  const progress = (sessionStats.reviewed / sessionStats.total) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8 px-4">
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
          <h1 className="font-semibold text-slate-900 mb-2">{lessonTitle}</h1>
          <div className="flex items-center justify-between">
            <p className="text-slate-600">
              Flashcard {sessionStats.reviewed + 1} of {sessionStats.total}
            </p>
            <p className="text-sm text-slate-500">
              {isFlipped ? 'Auto-advancing in 4 seconds...' : 'Click card to reveal answer'}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200 rounded-full h-3 mb-8 shadow-inner">
          <div
            className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Flashcard */}
        <div className={`perspective-1000 mb-8 transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
          <div
            onClick={handleFlip}
            className={`relative w-full h-96 cursor-pointer transition-transform duration-700 transform-style-3d ${
              isFlipped ? 'rotate-y-180' : ''
            }`}
            style={{
              transformStyle: 'preserve-3d',
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
            }}
          >
            {/* Front of card (Question) */}
            <div
              className="absolute w-full h-full backface-hidden"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-2xl p-8 flex flex-col items-center justify-center text-white">
                <div className="text-sm font-semibold uppercase tracking-wide mb-4 opacity-90">
                  Question
                </div>
                <div className="text-2xl md:text-3xl font-semibold text-center leading-relaxed">
                  {currentCard.question}
                </div>
                <div className="mt-8 text-sm opacity-75 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                  Click to reveal answer
                </div>
              </div>
            </div>

            {/* Back of card (Answer) */}
            <div
              className="absolute w-full h-full backface-hidden"
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)'
              }}
            >
              <div className="w-full h-full bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-2xl p-8 flex flex-col items-center justify-center text-white">
                <div className="text-sm font-semibold uppercase tracking-wide mb-4 opacity-90">
                  Answer
                </div>
                <div className="text-xl md:text-2xl font-semibold text-center leading-relaxed">
                  {currentCard.answer}
                </div>
                <div className="mt-8 text-sm opacity-75 flex items-center">
                  <svg className="w-5 h-5 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Auto-advancing...
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={handleRestart}
            disabled={isTransitioning}
            className="flex items-center px-6 py-3 bg-white hover:bg-slate-50 text-slate-800 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl border-2 border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Restart
          </button>

          <button
            onClick={handleNext}
            disabled={!isFlipped || isTransitioning}
            className={`flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg ${
              isFlipped && !isTransitioning
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white hover:shadow-xl'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
          >
            {remainingCards.length === 1 ? 'Finish' : 'Next'}
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlashcardsPage;
