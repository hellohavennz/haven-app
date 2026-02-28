import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import { getAllProgress } from "../lib/progress";
import { getAllLessons } from "../lib/content";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const WELCOME: Message = {
  role: "assistant",
  content:
    "Hi! I'm Pippa, your personal study assistant. Ask me anything about the Life in the UK test — history, laws, culture, or how to remember tricky facts. I'm here to help! 🌿",
};

function buildUserContext(): string {
  const progress = getAllProgress();
  const lessons = getAllLessons();

  const weak = lessons
    .filter((l) => {
      const p = progress[l.id];
      return p && p.attempted > 0 && p.correct / p.attempted < 0.6;
    })
    .map((l) => `${l.title} (${Math.round((progress[l.id].correct / progress[l.id].attempted) * 100)}%)`);

  const strong = lessons
    .filter((l) => {
      const p = progress[l.id];
      return p && p.attempted > 0 && p.correct / p.attempted >= 0.8;
    })
    .map((l) => l.title);

  const lines: string[] = [];
  if (strong.length) lines.push(`Strong areas: ${strong.join(", ")}`);
  if (weak.length) lines.push(`Needs more practice: ${weak.join(", ")}`);
  if (!lines.length) lines.push("No practice data yet — just getting started.");

  return lines.join("\n");
}

export default function AskPippa() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    // Capture history before state update (excludes static welcome)
    const historyToSend = messages.slice(1);
    const context = buildUserContext();

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const res = await fetch("/.netlify/functions/ask-pippa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ message: text, history: historyToSend, context }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Failed to get a response");
      }

      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err: any) {
      setError("Sorry, I couldn't connect just now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 text-white shadow-lg transition-all hover:scale-110 hover:shadow-xl"
          aria-label="Open Ask Pippa chat"
        >
          <MessageCircle className="h-7 w-7" />
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-0 right-0 z-50 flex flex-col bg-white shadow-2xl dark:bg-gray-900 sm:bottom-6 sm:right-6 sm:h-[600px] sm:w-[380px] sm:rounded-2xl sm:border sm:border-gray-200 dark:sm:border-gray-700"
          style={{ height: "100dvh", width: "100vw" }}
        >
          {/* Override fixed sizing on larger screens */}
          <style>{`
            @media (min-width: 640px) {
              .pippa-panel { height: 600px !important; width: 380px !important; }
            }
          `}</style>

          {/* Header */}
          <div className="flex flex-shrink-0 items-center justify-between rounded-t-none bg-gradient-to-br from-teal-500 to-emerald-500 p-4 text-white sm:rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">Ask Pippa</h3>
                <p className="text-xs text-white/90">Your study assistant</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1 transition-colors hover:bg-white/20"
              aria-label="Close chat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                {msg.role === "assistant" && (
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 mt-1">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-teal-600 text-white rounded-tr-sm"
                      : "bg-gray-100 text-gray-800 rounded-tl-sm dark:bg-gray-800 dark:text-gray-100"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {loading && (
              <div className="flex gap-2">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 mt-1">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div className="rounded-2xl rounded-tl-sm bg-gray-100 px-4 py-3 dark:bg-gray-800">
                  <Loader2 className="h-4 w-4 animate-spin text-teal-600" />
                </div>
              </div>
            )}

            {error && (
              <p className="text-center text-xs text-red-500">{error}</p>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="flex-shrink-0 border-t border-gray-200 p-4 dark:border-gray-700"
          >
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything…"
                disabled={loading}
                className="flex-1 rounded-xl border border-gray-300 px-4 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white transition-colors hover:bg-teal-700 disabled:opacity-40"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
