import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import LessonContent from '../components/LessonContent';
import { getLessonById, getAllLessons } from '../lib/content';
import { usePageTitle } from '../hooks/usePageTitle';
import { getAllProgress, markLessonRead } from '../lib/progress';
import { CheckCircle2, Circle, ChevronLeft, ChevronRight, ClipboardList, Layers } from 'lucide-react';
import ReportButton from '../components/ReportButton';

const ContentLesson: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const lesson = lessonId ? getLessonById(lessonId) : null;
  usePageTitle(lesson?.title);
  const allLessons = getAllLessons();
  const currentIndex = allLessons.findIndex(l => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const [isRead, setIsRead] = useState(false);

  useEffect(() => {
    if (lessonId) {
      const p = getAllProgress()[lessonId];
      setIsRead(p?.read === true);
    }
  }, [lessonId]);

  const handleMarkRead = () => {
    if (!lessonId) return;
    const next = !isRead;
    setIsRead(next);
    markLessonRead(lessonId, next);
  };

  if (!lesson) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-slate-900 dark:text-gray-100">
        <h1 className="font-semibold text-slate-900 mb-4 dark:text-gray-100">Lesson Not Found</h1>
        <Link to="/content" className="text-teal-600 hover:text-teal-700 font-semibold dark:text-teal-300 dark:hover:text-teal-200">
          ← Back to Study
        </Link>
      </div>
    );
  }

  const hasQuestions = (lesson.questions?.length ?? 0) > 0;
  const hasFlashcards = (lesson.flashcards?.length ?? 0) > 0;
  const hasPractice = hasQuestions || hasFlashcards;

  return (
    <div className="min-h-screen bg-white py-8 px-4 text-slate-900 dark:bg-gray-950 dark:text-gray-100">
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
          <h1 className="font-semibold text-slate-900 mt-2 dark:text-gray-100">{lesson.title}</h1>
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
            <p className="text-slate-800 dark:text-gray-100">{lesson.memory_hook}</p>
          </div>
        )}

        {/* ── Lesson footer ──────────────────────────────────── */}
        <div className="mt-10 space-y-4">

          {/* Practice section */}
          {hasPractice && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-3">
                Practise this lesson
              </p>
              <div className="flex flex-wrap gap-3">
                {hasQuestions && (
                  <Link
                    to={`/practice/${lessonId}/questions`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-all text-sm"
                  >
                    <ClipboardList className="h-4 w-4" />
                    Practice Questions
                  </Link>
                )}
                {hasFlashcards && (
                  <Link
                    to={`/practice/${lessonId}/flashcards`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-teal-600 dark:border-teal-500 text-teal-700 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 font-semibold rounded-xl transition-all text-sm"
                  >
                    <Layers className="h-4 w-4" />
                    Flashcards
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Mark as read + Report — utility row */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleMarkRead}
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                isRead
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
              }`}
            >
              {isRead
                ? <CheckCircle2 className="h-4 w-4" />
                : <Circle className="h-4 w-4" />
              }
              {isRead ? 'Marked as read' : 'Mark as read'}
            </button>
            <ReportButton lessonId={lesson.id} contentType="lesson" />
          </div>

          {/* Prev / Next navigation */}
          {(prevLesson || nextLesson) && (
            <div className="border-t border-slate-200 dark:border-slate-700 pt-4 grid grid-cols-2 gap-3">
              {prevLesson ? (
                <Link
                  to={`/content/${prevLesson.id}`}
                  className="group flex flex-col gap-1 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-4 hover:border-teal-400 hover:bg-teal-50 dark:hover:border-teal-600 dark:hover:bg-teal-900/30 transition-colors"
                >
                  <span className="flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Previous
                  </span>
                  <span className="text-sm font-semibold text-slate-800 dark:text-gray-100 group-hover:text-teal-700 dark:group-hover:text-teal-300 line-clamp-2">
                    {prevLesson.title}
                  </span>
                </Link>
              ) : <div />}

              {nextLesson ? (
                <Link
                  to={`/content/${nextLesson.id}`}
                  className="group flex flex-col gap-1 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-4 text-right hover:border-teal-400 hover:bg-teal-50 dark:hover:border-teal-600 dark:hover:bg-teal-900/30 transition-colors"
                >
                  <span className="flex items-center gap-1 justify-end text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    Next
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-sm font-semibold text-slate-800 dark:text-gray-100 group-hover:text-teal-700 dark:group-hover:text-teal-300 line-clamp-2">
                    {nextLesson.title}
                  </span>
                </Link>
              ) : <div />}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ContentLesson;
