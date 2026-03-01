import { useMemo } from "react";
import { BookOpen, CheckCircle, MessageCircle, Sparkles, User } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

import { getAllLessons } from "../../lib/content";

interface MobileNavProps {
  isPremium?: boolean;
  pippaOpen?: boolean;
  onOpenPippa?: () => void;
}

export default function MobileNav({ isPremium, pippaOpen, onOpenPippa }: MobileNavProps) {
  const location = useLocation();
  const firstLessonId = useMemo(() => getAllLessons()[0]?.id, []);
  const flashcardsPath = firstLessonId ? `/practice/${firstLessonId}/flashcards` : "/practice";

  // Hidden while Pippa is full-screen
  if (pippaOpen) return null;

  return (
    <nav
      aria-label="Primary mobile navigation"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur md:hidden dark:border-gray-800 dark:bg-gray-950/90"
    >
      <div
        className="mx-auto flex max-w-xl items-stretch justify-between gap-1 px-4 pt-2"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.5rem)" }}
      >
        <NavLink
          to="/content"
          className={({ isActive }) =>
            [
              "flex flex-1 flex-col items-center gap-1 rounded-xl px-2 py-1 text-small font-medium transition-colors",
              isActive || location.pathname.startsWith("/content")
                ? "text-teal-600 dark:text-teal-300"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-100",
            ].join(" ")
          }
        >
          <BookOpen className="h-5 w-5" aria-hidden="true" />
          <span>Study</span>
        </NavLink>

        <NavLink
          to="/practice"
          className={({ isActive }) =>
            [
              "flex flex-1 flex-col items-center gap-1 rounded-xl px-2 py-1 text-small font-medium transition-colors",
              (isActive || location.pathname.startsWith("/practice")) &&
                !location.pathname.includes("/flashcards")
                ? "text-teal-600 dark:text-teal-300"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-100",
            ].join(" ")
          }
        >
          <CheckCircle className="h-5 w-5" aria-hidden="true" />
          <span>Practice</span>
        </NavLink>

        <NavLink
          to={flashcardsPath}
          className={({ isActive }) =>
            [
              "flex flex-1 flex-col items-center gap-1 rounded-xl px-2 py-1 text-small font-medium transition-colors",
              isActive || location.pathname.includes("/flashcards")
                ? "text-teal-600 dark:text-teal-300"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-100",
            ].join(" ")
          }
        >
          <Sparkles className="h-5 w-5" aria-hidden="true" />
          <span>Flashcards</span>
        </NavLink>

        {isPremium && (
          <button
            onClick={onOpenPippa}
            className="flex flex-1 flex-col items-center gap-1 rounded-xl px-2 py-1 text-small font-medium transition-colors text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-100"
          >
            <MessageCircle className="h-5 w-5" aria-hidden="true" />
            <span>Pippa</span>
          </button>
        )}

        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            [
              "flex flex-1 flex-col items-center gap-1 rounded-xl px-2 py-1 text-small font-medium transition-colors",
              isActive || location.pathname.startsWith("/dashboard")
                ? "text-teal-600 dark:text-teal-300"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-100",
            ].join(" ")
          }
        >
          <User className="h-5 w-5" aria-hidden="true" />
          <span>Profile</span>
        </NavLink>
      </div>
    </nav>
  );
}
