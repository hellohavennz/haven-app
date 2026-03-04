import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getCurrentUser, logout } from "../lib/auth";
import { onAuthStateChange } from "../lib/auth";
import { useSubscription } from "../lib/subscription";
import { Menu, X, Sparkles, Crown, Shield, BarChart3 } from "lucide-react";
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

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { tier } = useSubscription();

  const isStudyArea = ['/content', '/practice', '/flashcards'].some(p =>
    location.pathname.startsWith(p)
  );
  const logoHref = isStudyArea ? '/dashboard' : '/';

  useEffect(() => {
    // Get initial user
    getCurrentUser().then(setUser);
    
    // Listen for auth changes
    const { data: { subscription } } = onAuthStateChange((newUser) => {
      setUser(newUser);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    setUser(null);
    navigate("/");
  };

  const isAdmin = user?.email === 'hello.haven.nz@gmail.com';
  const showUpgrade = user && tier !== 'premium';
  const upgradeText = tier === 'plus' ? 'Upgrade to Premium' : 'Upgrade';

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
          {/* Left: Logo + Main Nav */}
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link to={logoHref} className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 bg-teal-600">
                <img src="/haven-icons/icon-512x512.png" alt="Haven" className="w-full h-full" />
              </div>
              <span className="font-heading font-semibold text-xl text-slate-900 dark:text-white">Haven</span>
            </Link>

            {/* Main Navigation - Desktop */}
            <div className="hidden md:flex items-center gap-1">
              <Link
                to="/content"
                className="px-4 py-2 text-base font-medium text-slate-700 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Study
              </Link>
              <Link
                to="/practice"
                className="px-4 py-2 text-base font-medium text-slate-700 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Practice
              </Link>
              <Link
                to="/exam"
                className="px-4 py-2 text-base font-medium text-slate-700 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Exam
              </Link>
              <Link
                to="/dashboard"
                className="px-4 py-2 text-base font-medium text-slate-700 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Dashboard
              </Link>
              <Link
                to="/help"
                className="px-4 py-2 text-base font-medium text-slate-700 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Help
              </Link>
              {tier === 'premium' && (
                <Link
                  to="/analytics"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-base font-medium text-slate-700 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <BarChart3 size={15} />
                  Analytics
                </Link>
              )}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-base font-medium text-slate-700 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <Shield size={15} />
                  Admin
                </Link>
              )}
            </div>
          </div>

          {/* Right: Upgrade + Auth */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {/* Upgrade Button */}
            {showUpgrade && (
              <Link
                to="/paywall"
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg font-semibold text-base hover:bg-amber-600 transition-colors"
              >
                {tier === 'plus' ? <Crown size={16} /> : <Sparkles size={16} />}
                {upgradeText}
              </Link>
            )}

            {/* Auth Buttons */}
            {user ? (
              <div className="hidden md:flex items-center gap-3">
                <Link
                  to="/profile"
                  aria-label="Profile"
                  className="rounded-full hover:opacity-80 transition-opacity"
                >
                  <Avatar user={user} />
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-base font-medium text-slate-700 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-base font-medium text-slate-700 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Sign In
                </Link>
                <Link
                  to="/paywall"
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg font-semibold text-base hover:bg-teal-700 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-lg dark:text-slate-200 dark:hover:bg-slate-800"
              aria-label="Open menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-gray-950">
          <div className="px-4 py-4 space-y-2">
            <Link
              to="/content"
              className="block px-4 py-2 text-base font-medium text-slate-700 hover:bg-teal-50 rounded-lg dark:text-slate-200 dark:hover:bg-slate-800"
              onClick={() => setMobileMenuOpen(false)}
            >
              Study
            </Link>
            <Link
              to="/practice"
              className="block px-4 py-2 text-base font-medium text-slate-700 hover:bg-teal-50 rounded-lg dark:text-slate-200 dark:hover:bg-slate-800"
              onClick={() => setMobileMenuOpen(false)}
            >
              Practice
            </Link>
            <Link
              to="/exam"
              className="block px-4 py-2 text-base font-medium text-slate-700 hover:bg-teal-50 rounded-lg dark:text-slate-200 dark:hover:bg-slate-800"
              onClick={() => setMobileMenuOpen(false)}
            >
              Exam
            </Link>
            <Link
              to="/dashboard"
              className="block px-4 py-2 text-base font-medium text-slate-700 hover:bg-teal-50 rounded-lg dark:text-slate-200 dark:hover:bg-slate-800"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              to="/help"
              className="block px-4 py-2 text-base font-medium text-slate-700 hover:bg-teal-50 rounded-lg dark:text-slate-200 dark:hover:bg-slate-800"
              onClick={() => setMobileMenuOpen(false)}
            >
              Help
            </Link>
            {tier === 'premium' && (
              <Link
                to="/analytics"
                className="flex items-center gap-1.5 px-4 py-2 text-base font-medium text-slate-700 hover:bg-teal-50 rounded-lg dark:text-slate-200 dark:hover:bg-slate-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                <BarChart3 size={15} />
                Analytics
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 px-4 py-2 text-base font-medium text-slate-700 hover:bg-teal-50 rounded-lg dark:text-slate-200 dark:hover:bg-slate-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Shield size={15} />
                Admin
              </Link>
            )}

            {showUpgrade && (
              <Link
                to="/paywall"
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg font-semibold text-base hover:bg-amber-600 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {tier === 'plus' ? <Crown size={16} /> : <Sparkles size={16} />}
                {upgradeText}
              </Link>
            )}

            <div className="border-t border-slate-200 pt-2 mt-2 dark:border-slate-800">
              {user ? (
                <>
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 px-4 py-2 text-base font-medium text-slate-700 hover:bg-teal-50 rounded-lg dark:text-slate-200 dark:hover:bg-slate-800"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Avatar user={user} />
                    {user.user_metadata?.full_name || user.email?.split('@')[0]}
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-base font-medium text-slate-700 hover:bg-slate-100 rounded-lg dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block px-4 py-2 text-base font-medium text-slate-700 hover:bg-slate-100 rounded-lg dark:text-slate-200 dark:hover:bg-slate-800"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/paywall"
                    className="block px-4 py-2 bg-teal-600 text-white rounded-lg font-semibold text-base text-center mt-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
