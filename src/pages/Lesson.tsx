import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { usePageTitle } from '../hooks/usePageTitle';

type Q = {
  id: string;
  prompt: string;
  options: string[];
  correct_index: number;
  rationale: string;
};

export default function Lesson() {
  const { lessonId } = useParams();
  const [title, setTitle] = useState("");
  usePageTitle(title || undefined);
  const [body, setBody] = useState("");
  const [qs, setQs] = useState<Q[]>([]);
  const [i, setI] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [state, setState] = useState<"ask" | "feedback">("ask");

  useEffect(() => {
    if (!lessonId) return;
    (async () => {
      const { data: lesson } = await supabase
        .from("lessons")
        .select("id, title, body")
        .eq("id", lessonId)
        .single();
      if (lesson) {
        setTitle(lesson.title);
        setBody(lesson.body || "");
      }
      const { data: questions } = await supabase
        .from("questions")
        .select("id, prompt, options, correct_index, rationale")
        .eq("lesson_id", lessonId);
      setQs((questions as Q[]) ?? []);
      setI(0);
      setSelected(null);
      setState("ask");
    })();
  }, [lessonId]);

  const q = qs[i];

  async function answer(choice: number) {
    setSelected(choice);
    setState("feedback");
    // recording attempts can be added later when auth is enabled
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="font-semibold tracking-tight text-[#0F4C5C]">{title}</h1>

      <article className="bg-white border rounded-xl p-5 leading-relaxed text-gray-800 space-y-3">
        {body.split("\n").map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} className="h-1" />;
          if (trimmed.startsWith("- ")) {
            return (
              <ul key={idx} className="list-disc pl-6">
                <li>{trimmed.substring(2)}</li>
              </ul>
            );
          }
          if (trimmed.startsWith("# ")) {
            return <h2 key={idx} className="font-semibold mt-2">{trimmed.substring(2)}</h2>;
          }
          return <p key={idx}>{line}</p>;
        })}
      </article>

      {q && (
        <div className="border rounded-xl p-5 bg-white">
          <p className="mb-2">{q.prompt}</p>
          <ul className="space-y-2">
            {q.options.map((opt, idx) => (
              <li key={idx}>
                <button
                  className={`w-full text-left p-2 rounded border ${selected===idx ? "bg-gray-100" : ""}`}
                  onClick={() => state==="ask" && answer(idx)}
                  disabled={state==="feedback"}
                >
                  {opt}
                </button>
              </li>
            ))}
          </ul>

          {state === "feedback" && (
            <div className="mt-3 text-sm">
              {selected === q.correct_index ? "✅ Correct" : "❌ Not quite"}
              {q.rationale && <div className="opacity-80 mt-1">{q.rationale}</div>}
              <button
                className="mt-3 px-3 py-2 bg-black text-white rounded"
                onClick={() => { setI((x) => x + 1); setSelected(null); setState("ask"); }}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
