import { NavLink } from "react-router-dom";
import { BookOpen, LayoutDashboard, Sparkles } from "lucide-react";

const tabs = [
  {
    to: "/content",
    label: "Study",
    icon: BookOpen,
  },
  {
    to: "/practice",
    label: "Practice",
    icon: Sparkles,
  },
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
];

export default function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t md:hidden">
      <div className="mx-auto max-w-3xl">
        <ul className="flex justify-around">
          {tabs.map(({ to, label, icon: Icon }) => (
            <li key={to} className="flex-1">
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-1 py-3 text-xs font-medium transition-colors ${
                    isActive ? "text-teal-600" : "text-gray-500 hover:text-teal-500"
                  }`
                }
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
