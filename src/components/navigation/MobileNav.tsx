import { useMemo } from "react";
import type { LucideIcon } from "lucide-react";
import { BookOpen, CheckCircle, Sparkles, User } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

import { getAllLessons } from "../../lib/content";

type MobileNavItem = {
  icon: LucideIcon;
  label: string;
  to: string;
  isPathActive: (pathname: string) => boolean;
};

export default function MobileNav() {
  const location = useLocation();
  const firstLessonId = useMemo(() => getAllLessons()[0]?.id, []);
  const flashcardsPath = firstLessonId ? `/practice/${firstLessonId}/flashcards` : "/practice";

  const navItems: MobileNavItem[] = [
    {
      label: "Study",
      icon: BookOpen,
      to: "/content",
      isPathActive: (pathname) => pathname.startsWith("/content"),
    },
    {
      label: "Practice",
      icon: CheckCircle,
      to: "/practice",
      isPathActive: (pathname) =>
        pathname.startsWith("/practice") && !pathname.includes("/flashcards"),
    },
    {
      label: "Flashcards",
      icon: Sparkles,
      to: flashcardsPath,
      isPathActive: (pathname) => pathname.includes("/flashcards"),
    },
    {
      label: "Profile",
      icon: User,
      to: "/dashboard",
      isPathActive: (pathname) => pathname.startsWith("/dashboard"),
    },
  ];

  return (
    <nav
      aria-label="Primary mobile navigation"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur md:hidden"
    >
      <div
        className="mx-auto flex max-w-xl items-stretch justify-between gap-1 px-4 pt-2"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.5rem)" }}
      >
        {navItems.map(({ label, icon: Icon, to, isPathActive }) => (
          <NavLink
            key={label}
            to={to}
            className={({ isActive }) =>
              [
                "flex flex-1 flex-col items-center gap-1 rounded-xl px-2 py-1 text-xs font-medium transition-colors",
                (isActive || isPathActive(location.pathname))
                  ? "text-teal-600"
                  : "text-gray-500 hover:text-gray-700",
              ].join(" ")
            }
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
