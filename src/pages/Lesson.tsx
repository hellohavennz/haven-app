// src/pages/Lesson.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchLessonWithQuestionsById } from "../lib/api";
import { supabase } from "../lib/supabase";

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
  const [body, setBody] = useState("");
  const [qs, setQs] = useState<Q[]>([]);
  const [i, setI] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [state, setState] = useState<"ask" | "feedback">("ask");

  useEffect(() => {
    if (!lessonId) return;
    fetchLessonWithQuestionsById(lessonId)
      .then(({ lesson, questions }) => {
        setTitle(lesson.title);
        setBody(lesson.body || "");
        setQs(questions as Q[]);
        setI(0);
        setSelected(null);
        setState("ask");
      })
      .catch(console.error);
  }, [lessonId]);

  if (!lessonId) return <div className="p-6">Missing lesson id.</div>;
  const q = qs[i];

  async function answer(choice: number) {
    setSelected(choice);
    setState("feedback");

    // Optional: record attempt (requires user auth enabled)
    const { data: { user } } = await supabase.auth.getUser();
    const user_id = user?.id ?? "00000000-0000-0000-0000-000000000000"; // guest
    await supabase.from("attempts").insert({
      user_id,
      question_id: q.id,
      correct: choice === q.correct_index,
    });
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-5">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <pre className="bg-gray-50 p-3 rounded whitespace-pre-wrap">{body}</pre>

      {q && (
        <div className="border rounded p-4">
          <p className="font-medium mb-2">{q.prompt}</p>
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
              <div className="opacity-80 mt-1">{q.rationale}</div>
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
