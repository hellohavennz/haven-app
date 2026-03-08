import data from "../content/lessons/lesson-1-values-principles.json";

export default function Lesson1Content() {
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <header className="space-y-2">
        <h1 className="font-semibold tracking-tight text-[#0F4C5C]">
          {data.title}
        </h1>
        <p className="text-slate-700">{data.overview}</p>
      </header>

      <section>
        <h2 className="font-semibold mb-3">Key Facts to Remember</h2>
        <ul className="list-disc pl-6 space-y-1 text-slate-800">
          {data.key_facts.map((f, i) => (
            <li key={i}>{f}</li>
          ))}
        </ul>
      </section>

      <section className="bg-white border rounded-xl p-4">
        <h3 className="font-semibold mb-2">Memory Hook</h3>
        <p className="text-slate-700 whitespace-pre-line">{data.memory_hook}</p>
      </section>

      <section>
        <h2 className="font-semibold mb-3">Practice Questions</h2>
        <ol className="list-decimal pl-6 space-y-4">
          {data.questions.map((q, i) => (
            <li key={i} className="bg-white border rounded-xl p-4">
              <p className="text-slate-900">{q.prompt}</p>
              <ul className="list-disc pl-6 mt-2">
                {q.options.map((opt, j) => (
                  <li key={j}>
                    {opt}
                    {j === q.correct_index ? " ✅" : ""}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h2 className="font-semibold mb-3">Flashcards</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {data.flashcards.map(([q, a], i) => (
            <div key={i} className="bg-white border rounded-xl p-4">
              <div className="text-sm text-slate-500">Q</div>
              <div className="font-medium">{q}</div>
              <div className="mt-2 text-sm text-slate-500">A</div>
              <div>{a}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
