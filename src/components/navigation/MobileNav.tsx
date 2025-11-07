import type { LucideIcon } from "lucide-react";
import { BookOpen, CheckCircle, Sparkles, User } from "lucide-react";
import { NavLink } from "react-router-dom";

type MobileNavItem = {
  icon: LucideIcon;
  label: string;
  to: string;
};

const NAV_ITEMS: MobileNavItem[] = [
  { to: "/content", label: "Study", icon: BookOpen },
  { to: "/practice", label: "Practice", icon: CheckCircle },
  { to: "/flashcards", label: "Flashcards", icon: Sparkles },
  { to: "/dashboard", label: "Profile", icon: User },
];

export default function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur">
      <div
        className="mx-auto flex max-w-md justify-between px-6 pt-2"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.5rem)" }}
      >
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                isActive
                  ? "text-teal-600"
                  : "text-gray-500 hover:text-gray-700"
              }`
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
