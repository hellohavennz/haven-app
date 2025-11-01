import { Link, useParams } from "react-router-dom";
import { getLessonById } from "../lib/content";

export default function ContentLesson() {
  const { lessonId } = useParams();
  const data = lessonId ? getLessonById(lessonId) : null;
  if (!data) return <div className="max-w-3xl mx-auto p-6">Lesson not found.</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#0F4C5C]">
          {data.title}
        </h1>
        <p className="text-gray-700">{data.overview}</p>
      </header>

      <section>
        <h2 className="text-2xl font-semibold mb-3">Key Facts to Remember</h2>
        <ul className="list-disc pl-6 space-y-1 text-gray-800">
          {data.key_facts.map((f, i) => <li key={i}>{f}</li>)}
        </ul>
      </section>

      <section className="bg-white border rounded-xl p-4">
        <h3 className="text-lg font-semibold mb-2">Memory Hook</h3>
        <p className="text-gray-700">{data.memory_hook}</p>
      </section>

      <div className="flex gap-3">
        <Link to={`/practice/${data.id}`} className="px-4 py-2 rounded bg-black text-white">Test yourself</Link>
        <Link to={`/practice/${data.id}#flashcards`} className="px-4 py-2 rounded border">Flashcards</Link>
      </div>
    </div>
  );
}
