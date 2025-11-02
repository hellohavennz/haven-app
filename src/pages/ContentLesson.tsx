import { useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { getLessonById, getAllLessons } from "../lib/content";
import { useSubscription } from "../lib/subscription";
import { BookCheck, Brain, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import Paywall from "../components/Paywall";

export default function ContentLesson() {
  const { lessonId } = useParams();
  const data = lessonId ? getLessonById(lessonId) : null;
  const allLessons = getAllLessons();
  const contentRef = useRef<HTMLDivElement>(null);
  const { isPremium, isLoading } = useSubscription();
  
  useEffect(() => {
    if (contentRef.current) {
      const mainElement = contentRef.current.closest('main');
      if (mainElement) {
        mainElement.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [lessonId]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
          <h2 className="text-xl font-bold text-red-900 mb-2">Lesson not found</h2>
          <p className="text-red-700 mb-4">The lesson you're looking for doesn't exist.</p>
          <Link to="/content" className="text-teal-600 hover:text-teal-700 font-medium">
            ← Back to Study
          </Link>
        </div>
      </div>
    );
  }

  // Show paywall if lesson is premium and user doesn't have access
  if (data.isPremium && !isPremium) {
    return <Paywall />;
  }

  const currentIndex = allLessons.findIndex(l => l.id === data.id);
  const previousLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  return (
    <div ref={contentRef} className="max-w-4xl mx-auto px-6 py-8">
      <div className="space-y-12">
        <header className="space-y-6">
          <div className="flex items-center gap-2 text-sm text-teal-600 font-medium">
            <BookCheck size={18} />
            <span>Study Lesson</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 leading-tight">
            {data.title}
          </h1>
          <div className="prose prose-lg max-w-none">
            {data.overview.split('\n\n').map((paragraph, i) => (
              <p key={i} className="text-gray-700 leading-relaxed">{paragraph}</p>
            ))}
          </div>
        </header>

        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-6">
            <CheckCircle2 className="text-teal-600" size={24} />
            <h2 className="text-2xl font-bold text-gray-900">Key Facts to Remember</h2>
          </div>
          <div className="space-y-3">
            {data.key_facts.map((fact, i) => (
              <div key={i} className="flex gap-3 items-start p-4 bg-white border border-gray-200 rounded-xl hover:border-teal-200 transition-colors">
                <CheckCircle2 className="flex-shrink-0 text-teal-600 mt-0.5" size={18} />
                <p className="text-gray-800 leading-relaxed">{fact}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-8">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="text-amber-600" size={24} />
            <h3 className="text-xl font-bold text-gray-900">Memory Hook</h3>
          </div>
          <p className="text-gray-800 leading-relaxed text-lg">{data.memory_hook}</p>
        </section>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to={`/flashcards/${data.id}`}
            className="flex-1 px-8 py-4 text-center rounded-xl border-2 border-teal-200 text-teal-700 font-semibold hover:bg-teal-50 transition-all"
          >
            Review with Flashcards
          </Link>
          <Link
            to={`/practice/${data.id}`}
            className="flex-1 inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 text-white font-semibold hover:opacity-90 transition-all"
          >
            Start Practice <ArrowRight size={20} />
          </Link>
        </div>

        <div className="flex items-center justify-between pt-8 border-t border-gray-200">
          {previousLesson ? (
            <Link
              to={`/content/${previousLesson.id}`}
              className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-medium hover:border-teal-300 hover:bg-teal-50 transition-all"
            >
              <ArrowLeft size={18} />
              <div className="text-left">
                <div className="text-xs text-gray-500">Previous</div>
                <div className="text-sm font-semibold truncate max-w-[150px]">{previousLesson.title}</div>
              </div>
            </Link>
          ) : (
            <div></div>
          )}

          {nextLesson && (
            <Link
              to={`/content/${nextLesson.id}`}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-600 text-white font-medium hover:bg-teal-700 transition-all"
            >
              <div className="text-right">
                <div className="text-xs text-teal-100">Next</div>
                <div className="text-sm font-semibold truncate max-w-[150px]">{nextLesson.title}</div>
              </div>
              <ArrowRight size={18} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
