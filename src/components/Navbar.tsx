import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Home, LayoutDashboard } from "lucide-react";
import AuthButton from "./AuthButton";
import { getCurrentUser } from "../lib/auth";

const link = "px-4 py-2 rounded-lg transition text-sm font-medium text-gray-700 hover:text-teal-600 hover:bg-teal-50";
const active = "bg-teal-100 text-teal-700 hover:bg-teal-100";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    getCurrentUser().then(setUser);
  }, []);

  return (
    <header className="border-b border-gray-200 bg-white/95 backdrop-blur-sm sticky top-0 z-40">
      <nav className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-gradient-to-br from-teal-600 to-teal-700 rounded-lg flex items-center justify-center">
            <Home size={18} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-teal-600 to-teal-700 bg-clip-text text-transparent">Haven</span>
        </NavLink>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2">
            {user && (
              <NavLink to="/dashboard" className={({isActive}) => `${link} ${isActive ? active : ""}`}>
                <span className="flex items-center gap-1.5">
                  <LayoutDashboard size={16} />
                  Dashboard
                </span>
              </NavLink>
            )}
            <NavLink to="/content" className={({isActive}) => `${link} ${isActive ? active : ""}`}>Study</NavLink>
            <NavLink to="/practice" className={({isActive}) => `${link} ${isActive ? active : ""}`}>Practice</NavLink>
            <NavLink to="/paywall" className={({isActive}) => `${link} ${isActive ? active : ""}`}>Upgrade</NavLink>
          </div>
          <AuthButton />
        </div>
      </nav>
    </header>
  );
}
