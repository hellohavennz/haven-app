import { Link, useParams } from "react-router-dom";
import { getLessonById } from "../lib/content";
import { BookCheck, Brain, ArrowRight, CheckCircle2 } from "lucide-react";

export default function ContentLesson() {
  const { lessonId } = useParams();
  const data = lessonId ? getLessonById(lessonId) : null;
  if (!data) return <div className="max-w-3xl mx-auto p-6">Lesson not found.</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-32 md:pb-8">
      <div className="space-y-12">
        <header className="space-y-6">
          <div className="flex items-center gap-2 text-sm text-teal-600 font-medium">
            <BookCheck size={18} />
            <span>Study Lesson</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 leading-tight">
            {data.title}
          </h1>
          <div className="space-y-4 text-lg text-gray-700 leading-relaxed">
            {data.overview.split('\n\n').map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </header>

        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-6">
            <CheckCircle2 className="text-teal-600" size={24} />
            <h2 className="text-2xl font-bold text-gray-900">Key Facts to Remember</h2>
          </div>
          <div className="space-y-3">
            {data.key_facts.map((f, i) => (
              <div key={i} className="flex gap-3 items-start p-4 bg-white border border-gray-200 rounded-xl hover:border-teal-200 transition-colors">
                <CheckCircle2 className="flex-shrink-0 text-teal-600 mt-0.5" size={18} />
                <p className="text-gray-800 leading-relaxed">{f}</p>
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
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 md:hidden z-40">
        <div className="flex gap-3 max-w-4xl mx-auto">
          <Link
            to={`/flashcards/${data.id}`}
            className="flex-1 px-6 py-4 rounded-xl border-2 border-teal-200 text-teal-700 font-semibold hover:bg-teal-50 transition-all text-center active:scale-95"
          >
            Flashcards
          </Link>
          <Link
            to={`/practice/${data.id}`}
            className="flex-1 px-6 py-4 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 text-white font-semibold hover:opacity-90 transition-all text-center active:scale-95"
          >
            Practice
          </Link>
        </div>
      </div>

      <div className="hidden md:flex gap-4 mt-12 justify-center">
        <Link
          to={`/flashcards/${data.id}`}
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border-2 border-teal-200 text-teal-700 font-semibold hover:bg-teal-50 transition-all active:scale-95"
        >
          Review with Flashcards
        </Link>
        <Link
          to={`/practice/${data.id}`}
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 text-white font-semibold hover:opacity-90 transition-all active:scale-95"
        >
          Start Practice <ArrowRight size={20} />
        </Link>
      </div>
    </div>
  );
}
