import { useState } from "react";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";

export default function AskPippa() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setMessage("");
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 text-white shadow-lg transition-all hover:scale-110 hover:shadow-xl"
          aria-label="Open Ask Pippa chat"
        >
          <MessageCircle className="h-7 w-7" />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[600px] w-[380px] flex-col rounded-2xl border border-gray-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between rounded-t-2xl bg-gradient-to-br from-teal-500 to-emerald-500 p-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold">Ask Pippa</h3>
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

          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-emerald-500">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 rounded-2xl bg-gray-100 p-3">
                  <p className="text-sm text-gray-800">
                    Hello! I'm Pippa, your AI study assistant. I'm here to help you prepare for
                    your Life in the UK test.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-emerald-500">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 rounded-2xl bg-gray-100 p-3">
                  <p className="text-sm text-gray-800 mb-3">
                    I can help you with:
                  </p>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-teal-600">•</span>
                      <span>Answering questions about lessons</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-teal-600">•</span>
                      <span>Explaining difficult concepts</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-teal-600">•</span>
                      <span>Study tips and strategies</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-teal-600">•</span>
                      <span>Connecting you with support</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="rounded-xl border-2 border-teal-200 bg-teal-50 p-4 text-center">
                <Sparkles className="mx-auto mb-2 h-8 w-8 text-teal-600" />
                <p className="text-sm font-semibold text-teal-900 mb-1">
                  Coming Soon!
                </p>
                <p className="text-xs text-teal-700">
                  Pippa is currently being trained and will be available to help you soon.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask me anything..."
                disabled
                className="flex-1 rounded-xl border border-gray-300 bg-gray-50 px-4 py-2 text-sm text-gray-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
              <button
                type="submit"
                disabled
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-300 text-gray-500 transition-colors"
                aria-label="Send message"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
