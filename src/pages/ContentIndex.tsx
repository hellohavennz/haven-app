import { Link } from "react-router-dom";
import { getModules, getLessonsForModule } from "../lib/content";

export default function ContentIndex() {
  const modules = getModules();
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Life in the UK — Study</h1>
      <p className="text-gray-600">Read the learning material first, then jump to “Practice”.</p>

      {modules.map(m => {
        const lessons = getLessonsForModule(m.slug);
        return (
          <section key={m.slug} className="bg-white border rounded-xl p-5 space-y-3">
            <h2 className="text-xl font-semibold">{m.title}</h2>
            <ul className="space-y-2">
              {lessons.map(l => (
                <li key={l.id} className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-medium">{l.title}</div>
                    <div className="text-sm text-gray-600 line-clamp-2">{l.overview}</div>
                  </div>
                  <div className="flex gap-2">
                    <Link to={`/content/${l.id}`} className="px-3 py-2 rounded border">Read</Link>
                    <Link to={`/practice/${l.id}`} className="px-3 py-2 rounded bg-black text-white">Practice</Link>
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
