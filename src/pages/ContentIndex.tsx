import { Link } from "react-router-dom";
import { getModules, getLessonsForModule } from "../lib/content";
import { BookOpen } from "lucide-react";

export default function ContentIndex() {
  const modules = getModules();
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 pb-32 md:pb-8">
      <div className="space-y-3">
        <h1 className="text-4xl font-bold text-gray-900">Life in the UK — Study</h1>
        <p className="text-lg text-gray-600">Read the learning material first, then jump to "Practice".</p>
      </div>

      {modules.map(m => {
        const lessons = getLessonsForModule(m.slug);
        return (
          <section key={m.slug} className="space-y-4">
            <div className="flex items-center gap-2">
              <BookOpen className="text-teal-600" size={24} />
              <h2 className="text-2xl font-bold text-gray-900">{m.title}</h2>
            </div>
            <div className="grid gap-4">
              {lessons.map(l => (
                <div key={l.id} className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-teal-300 transition-all">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg mb-2">{l.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{l.overview}</p>
                    </div>
                    <div className="flex gap-3">
                      <Link 
                        to={`/content/${l.id}`} 
                        className="px-4 py-2 rounded-lg border-2 border-teal-200 text-teal-700 font-medium hover:bg-teal-50 transition-colors"
                      >
                        Study
                      </Link>
                      <Link 
                        to={`/practice/${l.id}`} 
                        className="px-4 py-2 rounded-lg bg-teal-600 text-white font-medium hover:bg-teal-700 transition-colors"
                      >
                        Practice
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
