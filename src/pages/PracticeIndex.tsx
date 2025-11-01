import { Link } from "react-router-dom";
import { getModules, getLessonsForModule } from "../lib/content";

export default function PracticeIndex() {
  const modules = getModules();
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Practice</h1>
      <p className="text-gray-600">Questions and flashcards by section. Your answers are tracked; flashcards are not.</p>

      {modules.map(m => {
        const lessons = getLessonsForModule(m.slug);
        return (
          <section key={m.slug} className="bg-white border rounded-xl p-5">
            <h2 className="text-xl font-semibold mb-2">{m.title}</h2>
            <ul className="space-y-2">
              {lessons.map(l => (
                <li key={l.id} className="flex items-center justify-between">
                  <div className="font-medium">{l.title}</div>
                  <div className="flex gap-2">
                    <Link to={`/practice/${l.id}`} className="px-3 py-2 rounded bg-black text-white">Questions</Link>
                    <Link to={`/practice/${l.id}#flashcards`} className="px-3 py-2 rounded border">Flashcards</Link>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
