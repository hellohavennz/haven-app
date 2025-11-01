import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getLessonById } from "../lib/content";
import { getProgress, recordAttempt, resetProgress } from "../lib/progress";

type AnswerState = { selected: number | null; checked: boolean };

export default function PracticeLesson() {
  const { lessonId } = useParams();
  const data = lessonId ? getLessonById(lessonId) : null;

  const [answers, setAnswers] = useState<AnswerState[]>([]);
  const [stats, setStats] = useState(getProgress(lessonId || ""));

  useEffect(() => {
    if (!data) return;
    setAnswers(data.questions.map(() => ({ selected: null, checked: false })));
    setStats(getProgress(data.id));
  }, [lessonId]);

  if (!data) return <div className="max-w-3xl mx-auto p-6">Not found.</div>;

  function choose(qIdx: number, optIdx: number) {
    setAnswers(prev => {
      const next = prev.slice();
      next[qIdx].selected = optIdx;
      return next;
    });
  }

  function check(qIdx: number) {
    if (!data) return;
    const q = data.questions[qIdx];
    const sel = answers[qIdx].selected;
    if (sel === null) return;
    const updated = recordAttempt(data.id, sel === q.correct_index);
    setStats(updated);
    setAnswers(prev => {
      const next = prev.slice();
      next[qIdx].checked = true;
      return next;
    });
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#0F4C5C]">
          Practice — {data.title}
        </h1>
        <p className="text-gray-600">
          Study first → <Link to={`/content/${data.id}`} className="underline">read the lesson</Link>
        </p>
        <div className="text-sm text-gray-600">
          Progress: <strong>{stats.correct || 0}</strong> correct of <strong>{stats.attempted || 0}</strong>
          <button
            className="ml-3 text-xs px-2 py-1 border rounded"
            onClick={() => { resetProgress(data.id); setStats({attempted:0, correct:0}); }}
          >
            Reset
          </button>
        </div>
      </header>

      <section id="questions" className="space-y-5">
        <h2 className="text-xl font-semibold">Questions</h2>
        {data.questions.map((q, qIdx) => {
          const a = answers[qIdx] || { selected: null, checked: false };
          return (
            <div key={qIdx} className="bg-white border rounded-xl p-5 space-y-3">
              <p className="font-medium">{q.prompt}</p>
              <ul className="space-y-2">
                {q.options.map((opt, i) => {
                  const isRight = i === q.correct_index;
                  const picked = a.selected === i;
                  const show = a.checked;
                  return (
                    <li key={i}>
                      <button
                        className={`w-full text-left p-2 rounded border
                          ${picked ? "bg-gray-100" : ""}
                          ${show && isRight ? "border-green-600" : ""}
                          ${show && picked && !isRight ? "border-red-600" : ""}`}
                        onClick={() => choose(qIdx, i)}
                        disabled={show}
                      >
                        {opt}
                      </button>
                    </li>
                  );
                })}
              </ul>

              <div className="flex gap-2">
                <button
                  className="px-3 py-2 rounded bg-black text-white disabled:opacity-50"
                  onClick={() => check(qIdx)}
                  disabled={a.selected === null || a.checked}
                >
                  Check answer
                </button>
                {a.checked && (
                  <Link to={`/content/${data.id}`} className="px-3 py-2 rounded border">
                    Review in study section
                  </Link>
                )}
              </div>

              {a.checked && (
                <div className="text-sm mt-2">
                  {a.selected === q.correct_index ? "✅ Correct" : "❌ Not quite — review the key facts."}
                </div>
              )}
            </div>
          );
        })}
      </section>
    </div>
  );
}
