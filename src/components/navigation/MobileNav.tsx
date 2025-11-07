import { useMemo } from "react";
import type { LucideIcon } from "lucide-react";
import { BookOpen, CheckCircle, Sparkles, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { getAllLessons } from "../../lib/content";

type MobileNavItem = {
  icon: LucideIcon;
  label: string;
  to: string;
  isActive: (path: string) => boolean;
};

export default function MobileNav() {
  const location = useLocation();
  const flashcardsPath = useMemo(() => {
    const lessons = getAllLessons();
    return lessons.length ? `/practice/${lessons[0].id}/flashcards` : "/practice";
  }, []);

  const NAV_ITEMS: MobileNavItem[] = [
    {
      to: "/content",
      label: "Study",
      icon: BookOpen,
      isActive: (path) => path.startsWith("/content"),
    },
    {
      to: "/practice",
      label: "Practice",
      icon: CheckCircle,
      isActive: (path) => path.startsWith("/practice") && !path.includes("/flashcards"),
    },
    {
      to: flashcardsPath,
      label: "Flashcards",
      icon: Sparkles,
      isActive: (path) => path.includes("/flashcards"),
    },
    {
      to: "/dashboard",
      label: "Profile",
      icon: User,
      isActive: (path) => path.startsWith("/dashboard"),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur">
      <div
        className="mx-auto flex max-w-md justify-between px-6 pt-2"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.5rem)" }}
      >
        {NAV_ITEMS.map(({ to, label, icon: Icon, isActive }) => {
          const active = isActive(location.pathname);
          return (
            <Link
              key={label}
              to={to}
              className={`flex flex-col items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                active ? "text-teal-600" : "text-gray-500 hover:text-gray-700"
              }`}
            >
            <Icon className="h-5 w-5" aria-hidden="true" />
            <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
