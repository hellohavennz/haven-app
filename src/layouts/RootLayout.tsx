import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { WifiOff } from "lucide-react";

import Navbar from "../components/Navbar";
import PracticeSidebar from "../components/PracticeSidebar";
import MobileNav from "../components/navigation/MobileNav";
import StudySidebar from "../components/navigation/StudySidebar";
import AskPippa from "../components/AskPippa";
import { Link } from "react-router-dom";
import { preloadContent } from "../lib/content";
import { checkSubscriptionStatus, clearSubscriptionCache, useSubscription } from "../lib/subscription";
import type { SubscriptionTier } from "../lib/subscription";
import { preloadOnboarding } from "../lib/onboarding";
import { recordLoginEvent } from "../lib/adminApi";
import { supabase } from "../lib/supabase";
import { useOnlineStatus, syncProgressOnReconnect } from "../lib/offline";

export default function RootLayout() {
  const location = useLocation();
  const { tier } = useSubscription();
  const [effectiveTier, setEffectiveTier] = useState<SubscriptionTier>('free');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [pippaOpen, setPippaOpen] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const [contentReady, setContentReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const isOnline = useOnlineStatus();
  const wasOnlineRef = useRef(navigator.onLine);

  useEffect(() => {
    Promise.all([preloadContent(), checkSubscriptionStatus(), preloadOnboarding()])
      .then(([, resolvedTier]) => {
        setEffectiveTier(resolvedTier as SubscriptionTier);
        setContentReady(true);
        supabase.auth.getUser().then(({ data }) => {
          if (data.user) {
            recordLoginEvent(data.user.id);
            setIsAdmin(data.user.email === 'hello.haven.nz@gmail.com');
            setIsLoggedIn(true);
          }
        });
      })
      .catch(err => {
        console.error('Failed to load content:', err);
        setContentReady(true);
      });

    // Keep isLoggedIn in sync with auth state changes (e.g. logout)
    // Also re-check subscription on sign-in/out to avoid stale cached tier
    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session?.user);
      if (!session?.user) {
        setIsAdmin(false);
        clearSubscriptionCache();
        setEffectiveTier('free');
      }
      if (event === 'SIGNED_IN') {
        clearSubscriptionCache();
        checkSubscriptionStatus().then(setEffectiveTier);
      }
    });
    return () => authSub.unsubscribe();
  }, []);

  // Flush any progress writes that failed while offline
  useEffect(() => {
    if (isOnline && !wasOnlineRef.current) {
      syncProgressOnReconnect().catch(() => {});
    }
    wasOnlineRef.current = isOnline;
  }, [isOnline]);

  const showStudySidebar = isLoggedIn && location.pathname.startsWith("/content");
  const showPracticeSidebar =
    isLoggedIn && (location.pathname.startsWith("/practice") || location.pathname.startsWith("/flashcards"));
  const showAnySidebar = showStudySidebar || showPracticeSidebar;

  // Bottom nav shows on all main app pages, not just sidebar pages
  const showMobileNav = showAnySidebar ||
    ['/exam', '/dashboard', '/profile', '/help', '/analytics'].some(p =>
      location.pathname.startsWith(p)
    );

  useEffect(() => {
    setIsDrawerOpen(false);
    // Scroll the main content area back to the top on every route change.
    // React Router's scroll restoration only tracks window.scrollY; the
    // scrollable element here is <main>, so we manage it ourselves.
    mainRef.current?.scrollTo({ top: 0 });
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = isDrawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isDrawerOpen]);

  if (!contentReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  const drawerSidebar = showStudySidebar ? (
    <StudySidebar onNavigate={closeDrawer} />
  ) : showPracticeSidebar ? (
    <PracticeSidebar onNavigate={closeDrawer} />
  ) : null;

  // min-h-full (not h-full) lets the wrapper grow with its content so that
  // pb-28 actually adds scroll space below the last element instead of being
  // absorbed into a fixed-height box that stops flush with the viewport.
  const contentWrapperClasses = showAnySidebar
    ? "min-h-full w-full px-4 pb-28 pt-4 md:px-8 md:pb-12"
    : "mx-auto w-full max-w-6xl px-4 pt-12 pb-28 md:pb-12";

  return (
    <div className="relative flex h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-teal-50 text-slate-900 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900 dark:text-gray-100">
      <Navbar onOpenDrawer={showAnySidebar ? openDrawer : undefined} />

      {/* Offline banner */}
      {!isOnline && (
        <div className="flex flex-shrink-0 items-center justify-center gap-2 border-b border-amber-200 bg-amber-50 py-2 text-xs text-amber-700 dark:border-amber-800/50 dark:bg-amber-900/20 dark:text-amber-300">
          <WifiOff className="h-3.5 w-3.5 flex-shrink-0" />
          You're offline. Studying from saved content.
        </div>
      )}

      <div className="relative flex flex-1 min-h-0">
        {showStudySidebar && (
          <aside className="hidden h-full md:flex md:w-72 md:flex-shrink-0 md:border-r md:border-slate-100 md:bg-white md:shadow-sm dark:md:border-slate-800 dark:md:bg-slate-900">
            <StudySidebar className="flex-1" />
          </aside>
        )}

        {showPracticeSidebar && (
          <aside className="hidden h-full md:flex md:w-72 md:flex-shrink-0 md:border-r md:border-slate-100 md:bg-white md:shadow-sm dark:md:border-slate-800 dark:md:bg-slate-900">
            <PracticeSidebar className="flex-1" />
          </aside>
        )}

        <main ref={mainRef} className="flex-1 overflow-y-auto">
          <div className={contentWrapperClasses}>
            <Outlet />
          </div>
          {!showAnySidebar && (
            <footer className="border-t border-slate-200 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300">
              <div className="mx-auto max-w-6xl px-4 py-8 flex flex-col items-center gap-4">
                <div className="flex items-center gap-5">
                  <a
                    href="https://www.facebook.com/HavenStudyUK/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Haven on Facebook"
                    className="text-slate-400 hover:text-blue-500 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                    </svg>
                  </a>
                  <a
                    href="https://www.instagram.com/haven.study.uk/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Haven on Instagram"
                    className="text-slate-400 hover:text-pink-500 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                      <circle cx="12" cy="12" r="4"/>
                      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
                    </svg>
                  </a>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500">
                  <Link to="/privacy" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Privacy Policy</Link>
                  <span>·</span>
                  <Link to="/terms" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Terms of Service</Link>
                </div>
                <p>© {new Date().getFullYear()} Haven • Learn calmly. Pass confidently.</p>
              </div>
            </footer>
          )}
        </main>
      </div>

      {showMobileNav && !isAdmin && (
        <MobileNav pippaOpen={pippaOpen} />
      )}

      {showAnySidebar && drawerSidebar && !isAdmin && (
        <>
          <div
            className={`fixed inset-0 z-40 bg-slate-900/40 transition-opacity duration-300 md:hidden ${
              isDrawerOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
            }`}
            aria-hidden="true"
            onClick={closeDrawer}
          />
          <div
            className={`fixed inset-y-0 left-0 z-50 w-72 max-w-full transform overflow-hidden bg-white shadow-xl transition-transform duration-300 dark:bg-slate-900 md:hidden ${
              isDrawerOpen ? "translate-x-0" : "-translate-x-full"
            }`}
            role="dialog"
            aria-modal="true"
          >
            {drawerSidebar}
          </div>
        </>
      )}

      {effectiveTier === 'premium' && isLoggedIn && !isAdmin && (
        <AskPippa
          isOpen={pippaOpen}
          onOpen={() => setPippaOpen(true)}
          onClose={() => setPippaOpen(false)}
          hideMobileFloatingBtn={location.pathname.startsWith('/exam')}
        />
      )}
    </div>
  );
}
