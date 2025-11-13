import { useState, useEffect, ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Crown } from "lucide-react";

import { getCurrentUser, logout, onAuthStateChange } from "../lib/auth";
import { useSubscription } from "../lib/subscription";
import { useTheme } from "./ThemeProvider";

type NavLinkProps = {
  to: string;
  label: string;
};

type MobileNavLinkProps = {
  to: string;
  children: ReactNode;
  onClick: () => void;
};

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { tier } = useSubscription();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    getCurrentUser().then(setUser);

    const {
      data: { subscription },
    } = onAuthStateChange(newUser => {
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

  const showUpgrade = user && tier !== "premium";
  const upgradeText = tier === "plus" ? "Upgrade to Premium" : "Upgrade";
  const ThemeIcon = theme === "light" ? SunIcon : MoonIcon;

  return (
    <nav
      className="sticky top-0 z-50 border-b backdrop-blur"
      style={{ backgroundColor: "color-mix(in srgb, var(--bg) 92%, var(--bg-section) 8%)" }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-full px-2 py-1 transition-colors hover:bg-[var(--bg-section)]"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border bg-[var(--bg-section)] text-sm font-semibold text-[var(--text-primary)]">
              H
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--text-secondary)]">
                Haven
              </span>
              <span className="text-base font-semibold text-[var(--text-primary)]">Study Platform</span>
            </div>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            <NavLink to="/content" label="Study" />
            <NavLink to="/practice" label="Practice" />
            <NavLink to="/exam" label="Exam" />
            <NavLink to="/dashboard" label="Dashboard" />
            <NavLink to="/help" label="Help" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-full border text-[var(--nav-icon)] transition-colors hover:bg-[var(--bg-section)]"
            aria-label="Toggle theme"
          >
            <ThemeIcon className="h-5 w-5" />
          </button>

          {showUpgrade && (
            <Link
              to="/paywall"
              className="hidden items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-section)] md:flex"
            >
              <Crown size={16} />
              {upgradeText}
            </Link>
          )}

          {user ? (
            <div className="hidden items-center gap-3 md:flex">
              <span className="text-sm text-[var(--text-secondary)]">Hi, {user.email?.split("@")[0]}</span>
              <button
                onClick={handleLogout}
                className="rounded-full border px-4 py-2 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-section)]"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Link
                to="/login"
                className="rounded-full border px-4 py-2 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-section)]"
              >
                Sign In
              </Link>
              <Link
                to="/paywall"
                className="rounded-full bg-[var(--accent-primary)] px-5 py-2 text-sm font-semibold text-[#1E293B] transition-colors hover:bg-[var(--accent-primary-hover)]"
              >
                Sign Up
              </Link>
            </div>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-full border text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-section)] md:hidden"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t bg-[var(--bg)] md:hidden">
          <div className="space-y-2 px-4 py-4">
            <MobileNavLink to="/content" onClick={() => setMobileMenuOpen(false)}>
              Study
            </MobileNavLink>
            <MobileNavLink to="/practice" onClick={() => setMobileMenuOpen(false)}>
              Practice
            </MobileNavLink>
            <MobileNavLink to="/exam" onClick={() => setMobileMenuOpen(false)}>
              Exam
            </MobileNavLink>
            <MobileNavLink to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
              Dashboard
            </MobileNavLink>
            <MobileNavLink to="/help" onClick={() => setMobileMenuOpen(false)}>
              Help
            </MobileNavLink>

            {showUpgrade && (
              <Link
                to="/paywall"
                className="flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold text-[var(--text-primary)]"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Crown size={16} />
                {upgradeText}
              </Link>
            )}

            <div className="mt-3 space-y-2 border-t pt-3">
              {user ? (
                <>
                  <div className="text-sm text-[var(--text-secondary)]">Signed in as {user.email}</div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full rounded-full border px-4 py-2 text-left text-sm font-medium text-[var(--text-primary)]"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="space-y-2">
                  <MobileNavLink to="/login" onClick={() => setMobileMenuOpen(false)}>
                    Sign In
                  </MobileNavLink>
                  <Link
                    to="/paywall"
                    className="block w-full rounded-full bg-[var(--accent-primary)] px-4 py-2 text-center text-sm font-semibold text-[#1E293B] transition-colors hover:bg-[var(--accent-primary-hover)]"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

function NavLink({ to, label }: NavLinkProps) {
  return (
    <Link
      to={to}
      className="rounded-full px-4 py-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-section)] hover:text-[var(--text-primary)]"
    >
      {label}
    </Link>
  );
}

function MobileNavLink({ to, children, onClick }: MobileNavLinkProps) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="block w-full rounded-full px-4 py-2 text-left text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-section)]"
    >
      {children}
    </Link>
  );
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 2.75V5" strokeLinecap="round" />
      <path d="M12 19V21.25" strokeLinecap="round" />
      <path d="M4.75 12H7" strokeLinecap="round" />
      <path d="M17 12H19.25" strokeLinecap="round" />
      <path d="M5.6 5.6L7.2 7.2" strokeLinecap="round" />
      <path d="M16.8 16.8L18.4 18.4" strokeLinecap="round" />
      <path d="M5.6 18.4L7.2 16.8" strokeLinecap="round" />
      <path d="M16.8 7.2L18.4 5.6" strokeLinecap="round" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <path d="M19.25 14.36A7.25 7.25 0 0 1 9.64 4.75 7.25 7.25 0 1 0 19.25 14.36Z" />
    </svg>
  );
}
