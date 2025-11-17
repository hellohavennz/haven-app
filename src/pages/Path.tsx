// src/pages/Path.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchModules, fetchLessonsForModule } from "../lib/api";

export default function Path() {
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModules()
      .then(setModules)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6">Loading modules…</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="font-semibold mb-4">Study Path</h1>
      <ul className="space-y-4">
        {modules.map((m) => (
          <li key={m.id} className="border rounded p-4">
            <h2 className="font-medium">{m.title}</h2>
            <p className="text-sm opacity-80 mb-3">{m.summary}</p>

            {/* Button that figures out first lesson and routes there */}
            <JumpToFirstLessonButton slug={m.slug} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function JumpToFirstLessonButton({ slug }: { slug: string }) {
  const [href, setHref] = useState<string | null>(null);

  useEffect(() => {
    // prefetch first lesson link (optional)
    void fetchLessonsForModule(slug).then(ls => {
      if (ls.length) setHref(`/lesson/${ls[0].id}`);
    });
  }, [slug]);

  if (!href) {
    return (
      <button
        className="px-3 py-2 rounded bg-gray-900 text-white"
        onClick={() => goDynamic(slug, setHref)}
      >
        Open Module
      </button>
    );
  }
  return (
    <Link className="px-3 py-2 rounded bg-black text-white" to={href}>
      Start Lesson
    </Link>
  );

  async function goDynamic(s: string, setH: (h: string)=>void) {
    const ls = await fetchLessonsForModule(s);
    if (ls.length) setH(`/lesson/${ls[0].id}`);
  }
}
