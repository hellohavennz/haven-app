import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import { getAllProgress } from "../lib/progress";
import { getAllLessons } from "../lib/content";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AskPippaProps {
  /** Controlled open state — managed by parent */
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  /**
   * When true, the floating trigger button is hidden on mobile (sm and below).
   * Set this when a MobileNav tab is handling the trigger instead.
   */
  hideMobileFloatingBtn?: boolean;
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

export default function AskPippa({ isOpen, onOpen, onClose, hideMobileFloatingBtn }: AskPippaProps) {
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Only scroll to bottom once a conversation has started — not on initial welcome message
    if (messages.length > 1 || loading) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

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
    } catch {
      setError("Sorry, I couldn't connect just now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating trigger button — desktop always, mobile only when MobileNav isn't handling it */}
      {!isOpen && (
        <button
          onClick={onOpen}
          className={[
            "fixed bottom-6 right-6 z-50 h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 text-white shadow-lg transition-all hover:scale-110 hover:shadow-xl",
            hideMobileFloatingBtn ? "hidden md:flex" : "flex",
          ].join(" ")}
          aria-label="Open Ask Pippa chat"
        >
          <MessageCircle className="h-7 w-7" />
        </button>
      )}

      {/* Chat panel
          Mobile  → fixed inset-0 (full screen)
          Desktop → fixed popup anchored bottom-right  */}
      {isOpen && (
        <div
          className={[
            // shared
            "fixed z-50 flex flex-col bg-white dark:bg-slate-900",
            // mobile: full screen — use 100dvh so panel shrinks when keyboard opens,
            // keeping the header and welcome message visible above the keyboard
            "inset-x-0 top-0 h-[100dvh]",
            // desktop: popup panel
            "md:inset-auto md:bottom-6 md:right-3 md:h-[560px] md:w-[calc(100vw-24px)] md:max-w-[380px] md:rounded-2xl md:border md:border-slate-200 md:shadow-2xl dark:md:border-slate-700",
          ].join(" ")}
          style={{ maxHeight: undefined }}
        >
          {/* Header */}
          <div className="flex flex-shrink-0 items-center justify-between rounded-none bg-gradient-to-br from-teal-500 to-emerald-500 p-4 text-white md:rounded-t-2xl">
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
              onClick={onClose}
              className="rounded-lg p-2 transition-colors hover:bg-white/20"
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
                      : "bg-slate-100 text-slate-800 rounded-tl-sm dark:bg-slate-800 dark:text-gray-100"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 mt-1">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div className="rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-3 dark:bg-slate-800">
                  <Loader2 className="h-4 w-4 animate-spin text-teal-600" />
                </div>
              </div>
            )}

            {error && (
              <p className="text-center text-xs text-red-500">{error}</p>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input — extra bottom padding for mobile home-indicator */}
          <form
            onSubmit={handleSubmit}
            className="flex-shrink-0 border-t border-slate-200 p-4 dark:border-slate-700"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 1rem)" }}
          >
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything…"
                disabled={loading}
                className="flex-1 rounded-xl border border-slate-300 px-4 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-gray-100 dark:placeholder-gray-400"
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
