import React from 'react';
import { useParams, Link } from 'react-router-dom';
import LessonContent from '../components/LessonContent';
import { getLessonById, getAllLessons } from '../lib/content';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ContentLesson: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const lesson = lessonId ? getLessonById(lessonId) : null;
  const allLessons = getAllLessons();
  const currentIndex = allLessons.findIndex(l => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  if (!lesson) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-gray-900 dark:text-gray-100">
        <h1 className="font-semibold text-gray-900 mb-4 dark:text-gray-100">Lesson Not Found</h1>
        <Link to="/content" className="text-teal-600 hover:text-teal-700 font-semibold dark:text-teal-300 dark:hover:text-teal-200">
          ← Back to Study
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8 px-4 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/content"
            className="text-teal-600 hover:text-teal-700 font-semibold mb-4 inline-flex items-center dark:text-teal-300 dark:hover:text-teal-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Study
          </Link>
          <h1 className="font-semibold text-gray-900 mt-2 dark:text-gray-100">{lesson.title}</h1>
        </div>

        {/* Lesson Content */}
        <LessonContent 
          sections={lesson.sections}
          study_sections={lesson.study_sections}
          overview={lesson.overview}
          key_facts={lesson.key_facts}
        />

        {/* Memory Hook */}
        {lesson.memory_hook && (
          <div className="mt-8 bg-purple-50 rounded-xl p-6 border border-purple-200 shadow-sm dark:bg-purple-900/30 dark:border-purple-700">
            <h3 className="font-semibold text-purple-900 mb-3 flex items-center dark:text-purple-100">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Memory Hook
            </h3>
            <p className="text-gray-800 dark:text-gray-100">{lesson.memory_hook}</p>
          </div>
        )}

        {/* Practice Buttons */}
        <div className="mt-8 flex gap-4 justify-center flex-wrap">
          <Link
            to={`/practice/${lessonId}/questions`}
            className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center"
          >
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Practice Questions
          </Link>
          <Link
            to={`/practice/${lessonId}/flashcards`}
            className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center"
          >
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Flashcards
          </Link>
        </div>

        {/* Prev / Next lesson navigation */}
        {(prevLesson || nextLesson) && (
          <div className="mt-10 border-t border-gray-200 dark:border-gray-800 pt-6 grid grid-cols-2 gap-4">
            {prevLesson ? (
              <Link
                to={`/content/${prevLesson.id}`}
                className="group flex flex-col gap-0.5 rounded-xl border border-gray-200 dark:border-gray-800 px-4 py-3 hover:border-teal-300 hover:bg-teal-50 dark:hover:border-teal-700 dark:hover:bg-teal-900/20 transition-colors"
              >
                <span className="flex items-center gap-1 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Previous
                </span>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 group-hover:text-teal-700 dark:group-hover:text-teal-300 line-clamp-2">
                  {prevLesson.title}
                </span>
              </Link>
            ) : <div />}

            {nextLesson ? (
              <Link
                to={`/content/${nextLesson.id}`}
                className="group flex flex-col gap-0.5 rounded-xl border border-gray-200 dark:border-gray-800 px-4 py-3 text-right hover:border-teal-300 hover:bg-teal-50 dark:hover:border-teal-700 dark:hover:bg-teal-900/20 transition-colors"
              >
                <span className="flex items-center gap-1 justify-end text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                  Next
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 group-hover:text-teal-700 dark:group-hover:text-teal-300 line-clamp-2">
                  {nextLesson.title}
                </span>
              </Link>
            ) : <div />}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentLesson;
