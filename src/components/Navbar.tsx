import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCurrentUser, logout } from "../lib/auth";
import { onAuthStateChange } from "../lib/auth";
import { useSubscription } from "../lib/subscription";
import { Menu, X, Sparkles, Crown } from "lucide-react";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { tier } = useSubscription();

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

  const showUpgrade = user && tier !== 'premium';
  const upgradeText = tier === 'plus' ? 'Upgrade to Premium' : 'Upgrade';

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Left: Logo + Main Nav */}
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-lg">H</span>
              </div>
              <span className="font-black text-xl text-gray-900">Haven</span>
            </Link>

            {/* Main Navigation - Desktop */}
            <div className="hidden md:flex items-center gap-1">
              <Link
                to="/content"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
              >
                Study
              </Link>
              <Link
                to="/practice"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
              >
                Practice
              </Link>
              <Link
                to="/exam"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
              >
                Exam
              </Link>
              <Link
                to="/dashboard"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
              >
                Dashboard
              </Link>
              <Link
                to="/help"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
              >
                Help
              </Link>
            </div>
          </div>

          {/* Right: Upgrade + Auth */}
          <div className="flex items-center gap-3">
            {/* Upgrade Button */}
            {showUpgrade && (
              <Link
                to="/paywall"
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-semibold text-sm hover:opacity-90 transition-all"
              >
                {tier === 'plus' ? <Crown size={16} /> : <Sparkles size={16} />}
                {upgradeText}
              </Link>
            )}

            {/* Auth Buttons */}
            {user ? (
              <div className="hidden md:flex items-center gap-3">
                <span className="text-sm text-gray-600">Hi, {user.email?.split('@')[0]}</span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/paywall"
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg font-semibold text-sm hover:bg-teal-700 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-4 space-y-2">
            <Link
              to="/content"
              className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-teal-50 rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              Study
            </Link>
            <Link
              to="/practice"
              className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-teal-50 rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              Practice
            </Link>
            <Link
              to="/exam"
              className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-teal-50 rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              Exam
            </Link>
            <Link
              to="/dashboard"
              className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-teal-50 rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              to="/help"
              className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-teal-50 rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              Help
            </Link>

            {showUpgrade && (
              <Link
                to="/paywall"
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-semibold text-sm"
                onClick={() => setMobileMenuOpen(false)}
              >
                {tier === 'plus' ? <Crown size={16} /> : <Sparkles size={16} />}
                {upgradeText}
              </Link>
            )}

            <div className="border-t border-gray-200 pt-2 mt-2">
              {user ? (
                <>
                  <div className="px-4 py-2 text-sm text-gray-600">
                    Signed in as {user.email}
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/paywall"
                    className="block px-4 py-2 bg-teal-600 text-white rounded-lg font-semibold text-sm text-center mt-2"
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
