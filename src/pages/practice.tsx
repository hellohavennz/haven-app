import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import lessonIndex from '../content/lesson-index.json';

interface LessonProgress {
  questionsCompleted: number;
  totalQuestions: number;
  correctAnswers: number;
  flashcardsReviewed: number;
  totalFlashcards: number;
}

const PracticePage: React.FC = () => {
  const [progress, setProgress] = useState<Record<string, LessonProgress>>({});

  useEffect(() => {
    // Load progress from localStorage
    const savedProgress: Record<string, LessonProgress> = {};
    
    lessonIndex.lessons.forEach(lesson => {
      const lessonProgress = localStorage.getItem(`progress_${lesson.id}`);
      if (lessonProgress) {
        savedProgress[lesson.id] = JSON.parse(lessonProgress);
      } else {
        savedProgress[lesson.id] = {
          questionsCompleted: 0,
          totalQuestions: 0,
          correctAnswers: 0,
          flashcardsReviewed: 0,
          totalFlashcards: 0
        };
      }
    });
    
    setProgress(savedProgress);
  }, []);

  const getSuccessRate = (lessonId: string): number => {
    const p = progress[lessonId];
    if (!p || p.questionsCompleted === 0) return 0;
    return Math.round((p.correctAnswers / p.questionsCompleted) * 100);
  };

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    if (percentage >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">Practice</h1>
      <p className="text-lg text-gray-600 mb-8">
        Test your knowledge with questions and flashcards for each lesson
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lessonIndex.lessons.map((lesson) => {
          const lessonProgress = progress[lesson.id] || {
            questionsCompleted: 0,
            totalQuestions: 0,
            correctAnswers: 0,
            flashcardsReviewed: 0,
            totalFlashcards: 0
          };
          const successRate = getSuccessRate(lesson.id);
          const questionsProgress = lessonProgress.totalQuestions > 0
            ? Math.round((lessonProgress.questionsCompleted / lessonProgress.totalQuestions) * 100)
            : 0;
          const flashcardsProgress = lessonProgress.totalFlashcards > 0
            ? Math.round((lessonProgress.flashcardsReviewed / lessonProgress.totalFlashcards) * 100)
            : 0;

          return (
            <div
              key={lesson.id}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-200"
            >
              {/* Header with gradient */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
                <h3 className="text-xl font-bold mb-2">{lesson.title}</h3>
                <p className="text-sm text-blue-100">
                  Lesson {lesson.id.split('-').pop()}
                </p>
              </div>

              {/* Progress Stats */}
              <div className="p-6 bg-gray-50">
                <div className="space-y-4">
                  {/* Questions Progress */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Questions</span>
                      <span className="text-sm font-bold text-gray-900">
                        {lessonProgress.questionsCompleted}/{lessonProgress.totalQuestions || '?'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(questionsProgress)}`}
                        style={{ width: `${questionsProgress}%` }}
                      />
                    </div>
                  </div>

                  {/* Success Rate */}
                  {lessonProgress.questionsCompleted > 0 && (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Success Rate</span>
                        <span className="text-sm font-bold text-gray-900">{successRate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(successRate)}`}
                          style={{ width: `${successRate}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Flashcards Progress */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Flashcards</span>
                      <span className="text-sm font-bold text-gray-900">
                        {lessonProgress.flashcardsReviewed}/{lessonProgress.totalFlashcards || '?'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 bg-purple-500`}
                        style={{ width: `${flashcardsProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 grid grid-cols-2 gap-3">
                <Link
                  to={`/practice/${lesson.id}/questions`}
                  className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Questions
                </Link>
                <Link
                  to={`/practice/${lesson.id}/flashcards`}
                  className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Flashcards
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PracticePage;
