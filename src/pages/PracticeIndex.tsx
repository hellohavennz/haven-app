import { Link } from "react-router-dom";
import { getModules, getLessonsForModule } from "../lib/content";
import { BookOpen, Sparkles } from "lucide-react";

export default function PracticeIndex() {
  const modules = getModules();
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 pb-32 md:pb-8">
      <div className="space-y-3">
        <h1 className="text-4xl font-bold text-gray-900">Practice</h1>
        <p className="text-lg text-gray-600">Questions and flashcards by section. Your answers are tracked; flashcards are not.</p>
      </div>

      {modules.map(m => {
        const lessons = getLessonsForModule(m.slug);
        return (
          <section key={m.slug} className="space-y-4">
            <div className="flex items-center gap-2">
              <BookOpen className="text-teal-600" size={24} />
              <h2 className="text-2xl font-bold text-gray-900">{m.title}</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {lessons.map(l => (
                <div key={l.id} className="group bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-2xl p-6 hover:border-teal-300 hover:shadow-lg transition-all duration-200">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-md">
                        <Sparkles className="text-white" size={20} />
                      </div>
                      <h3 className="font-bold text-gray-900 text-lg leading-tight pt-1">{l.title}</h3>
                    </div>
                    <div className="flex gap-3">
                      <Link
                        to={`/practice/${l.id}`}
                        className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 text-white font-semibold text-center hover:opacity-90 transition-all active:scale-95 shadow-md"
                      >
                        Questions
                      </Link>
                      <Link
                        to={`/flashcards/${l.id}`}
                        className="flex-1 px-4 py-3 rounded-xl border-2 border-teal-200 text-teal-700 font-semibold text-center hover:bg-teal-50 transition-all active:scale-95"
                      >
                        Flashcards
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
