import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getModules, getLessonsForModule } from "../lib/content";

type Meta = { id:string; title:string; module_slug:string };
type ModuleMeta = { slug:string; title:string; count:number };

export default function ContentIndex() {
  const [modules, setModules] = useState<ModuleMeta[]>([]);
  const [byModule, setByModule] = useState<Record<string, Meta[]>>({});

  useEffect(() => {
    (async () => {
      const mods = await getModules();
      setModules(mods);
      const acc: Record<string, Meta[]> = {};
      for (const m of mods) acc[m.slug] = await getLessonsForModule(m.slug);
      setByModule(acc);
    })();
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Life in the UK — Study</h1>
      <p className="text-gray-600">Read the learning material first, then jump to “Practice”.</p>

      {modules.map(m => (
        <section key={m.slug} className="bg-white border rounded-xl p-5 space-y-3">
          <h2 className="text-xl font-semibold">{m.title}</h2>
          <ul className="space-y-2">
            {(byModule[m.slug] || []).map(l => (
              <li key={l.id} className="flex items-center justify-between gap-3">
                <div className="font-medium">{l.title}</div>
                <div className="flex gap-2">
                  <Link to={`/content/${l.id}`} className="px-3 py-2 rounded border">Read</Link>
                  <Link to={`/practice/${l.id}`} className="px-3 py-2 rounded bg-black text-white">Practice</Link>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
