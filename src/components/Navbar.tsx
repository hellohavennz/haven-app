import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getCurrentUser, logout } from "../lib/auth";
import { onAuthStateChange } from "../lib/auth";
import { useSubscription } from "../lib/subscription";
import {
  Menu, Sparkles, Crown, Shield, BarChart3,
  User, HelpCircle, LogOut, LayoutDashboard,
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";

function getInitials(user: any): string {
  const name = user?.user_metadata?.full_name || user?.email?.split('@')[0] || '';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function Avatar({ user }: { user: any }) {
  return (
    <div className="h-8 w-8 rounded-full bg-teal-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
      {getInitials(user)}
    </div>
  );
}

interface NavbarProps {
  onOpenDrawer?: () => void;
}

export default function Navbar({ onOpenDrawer }: NavbarProps) {
  const [user, setUser] = useState<any>(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { tier } = useSubscription();

  const isStudyArea = ['/content', '/practice', '/flashcards'].some(p =>
    location.pathname.startsWith(p)
  );
  const logoHref = isStudyArea ? '/dashboard' : '/';

  useEffect(() => {
    getCurrentUser().then(setUser);
    const { data: { subscription } } = onAuthStateChange((newUser) => {
      setUser(newUser);
    });
    return () => { subscription?.unsubscribe(); };
  }, []);

  // Close profile menu on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    }
    if (profileMenuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileMenuOpen]);

  // Close profile menu on route change
  useEffect(() => { setProfileMenuOpen(false); }, [location.pathname]);

  const handleLogout = async () => {
    setProfileMenuOpen(false);
    await logout();
    setUser(null);
    navigate("/");
  };

  const isAdmin = user?.email === 'hello.haven.nz@gmail.com';
  const showUpgrade = user && tier !== 'premium';
  const upgradeText = tier === 'plus' ? 'Upgrade to Premium' : 'Upgrade to Plus';

  if (isAdmin) {
    return (
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 dark:bg-gray-950 dark:border-slate-800 font-ui">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex h-16 items-center justify-between">
            <Link to="/admin" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 bg-teal-600">
                <img src="/haven-icons/icon-512x512.png" alt="Haven" className="w-full h-full" />
              </div>
              <span className="font-heading font-semibold text-xl text-slate-900 dark:text-white">Haven</span>
            </Link>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 dark:bg-gray-950 dark:border-slate-800 font-ui">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between">

          {/* Left: module drawer burger (mobile, sidebar pages only) + Logo */}
          <div className="flex items-center gap-2 md:gap-8">
            {onOpenDrawer && (
              <button
                type="button"
                onClick={onOpenDrawer}
                className="md:hidden rounded-md p-2 text-slate-700 hover:bg-slate-100 transition-colors dark:text-slate-200 dark:hover:bg-slate-800"
                aria-label="Open module navigation"
              >
                <Menu className="h-6 w-6" aria-hidden="true" />
              </button>
            )}

            <Link to={logoHref} className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 bg-teal-600">
                <img src="/haven-icons/icon-512x512.png" alt="Haven" className="w-full h-full" />
              </div>
              <span className="font-heading font-semibold text-xl text-slate-900 dark:text-white">Haven</span>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-1">
              <Link to="/content" className="px-4 py-2 text-base font-medium text-slate-700 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors dark:text-slate-200 dark:hover:bg-slate-800">
                Study
              </Link>
              <Link to="/practice" className="px-4 py-2 text-base font-medium text-slate-700 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors dark:text-slate-200 dark:hover:bg-slate-800">
                Practice
              </Link>
              <Link to="/exam" className="px-4 py-2 text-base font-medium text-slate-700 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors dark:text-slate-200 dark:hover:bg-slate-800">
                Exam
              </Link>
              <Link to="/dashboard" className="px-4 py-2 text-base font-medium text-slate-700 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors dark:text-slate-200 dark:hover:bg-slate-800">
                Dashboard
              </Link>
              <Link to="/help" className="px-4 py-2 text-base font-medium text-slate-700 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors dark:text-slate-200 dark:hover:bg-slate-800">
                Help
              </Link>
              {tier === 'premium' && (
                <Link to="/analytics" className="inline-flex items-center gap-1.5 px-4 py-2 text-base font-medium text-slate-700 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors dark:text-slate-200 dark:hover:bg-slate-800">
                  <BarChart3 size={15} />
                  Analytics
                </Link>
              )}
              {isAdmin && (
                <Link to="/admin" className="inline-flex items-center gap-1.5 px-4 py-2 text-base font-medium text-slate-700 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors dark:text-slate-200 dark:hover:bg-slate-800">
                  <Shield size={15} />
                  Admin
                </Link>
              )}
            </div>
          </div>

          {/* Right: ThemeToggle + Upgrade (desktop) + Avatar dropdown */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            {/* Upgrade button — desktop only */}
            {showUpgrade && (
              <Link
                to="/paywall"
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg font-semibold text-base hover:bg-amber-600 transition-colors"
              >
                {tier === 'plus' ? <Crown size={16} /> : <Sparkles size={16} />}
                {upgradeText}
              </Link>
            )}

            {/* Profile avatar + dropdown */}
            {user ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setProfileMenuOpen(v => !v)}
                  aria-label="Profile menu"
                  className="rounded-full hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                >
                  <Avatar user={user} />
                </button>

                {profileMenuOpen && (
                  <div className="absolute right-0 top-11 w-52 rounded-2xl border border-slate-200 bg-white shadow-xl py-1.5 z-50 dark:bg-slate-900 dark:border-slate-700">
                    {/* User info */}
                    <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {user.user_metadata?.full_name || user.email?.split('@')[0]}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                    </div>

                    {/* Nav items */}
                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
                      >
                        <User size={15} className="text-slate-400" />
                        Profile
                      </Link>
                      <Link
                        to="/dashboard"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
                      >
                        <LayoutDashboard size={15} className="text-slate-400" />
                        Dashboard
                      </Link>
                      {tier === 'premium' && (
                        <Link
                          to="/analytics"
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
                        >
                          <BarChart3 size={15} className="text-slate-400" />
                          Analytics
                        </Link>
                      )}
                      <Link
                        to="/help"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
                      >
                        <HelpCircle size={15} className="text-slate-400" />
                        Help
                      </Link>
                      {showUpgrade && (
                        <Link
                          to="/paywall"
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm font-semibold text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/20 transition-colors"
                        >
                          <Sparkles size={15} />
                          {upgradeText}
                        </Link>
                      )}
                    </div>

                    {/* Sign out */}
                    <div className="border-t border-slate-100 dark:border-slate-800 py-1">
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <LogOut size={15} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-4 py-2 text-base font-medium text-slate-700 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors dark:text-slate-200 dark:hover:bg-slate-800">
                  Sign In
                </Link>
                <Link to="/paywall" className="hidden md:flex px-4 py-2 bg-teal-600 text-white rounded-lg font-semibold text-base hover:bg-teal-700 transition-colors">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
