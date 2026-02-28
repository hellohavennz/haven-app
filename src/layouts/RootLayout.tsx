import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";

import Navbar from "../components/Navbar";
import PracticeSidebar from "../components/PracticeSidebar";
import MobileNav from "../components/navigation/MobileNav";
import StudySidebar from "../components/navigation/StudySidebar";
import AskPippa from "../components/AskPippa";
import { preloadContent } from "../lib/content";
import { checkSubscriptionStatus } from "../lib/subscription";
import { preloadOnboarding } from "../lib/onboarding";
import { recordLoginEvent } from "../lib/adminApi";
import { supabase } from "../lib/supabase";

export default function RootLayout() {
  const location = useLocation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [contentReady, setContentReady] = useState(false);

  useEffect(() => {
    Promise.all([preloadContent(), checkSubscriptionStatus(), preloadOnboarding()])
      .then(() => {
        setContentReady(true);
        // Fire-and-forget: record today's login for DAU/WAU/MAU tracking
        supabase.auth.getUser().then(({ data }) => {
          if (data.user) recordLoginEvent(data.user.id);
        });
      })
      .catch(err => {
        console.error('Failed to load content:', err);
        setContentReady(true); // unblock the UI even on error
      });
  }, []);

  const showStudySidebar = location.pathname.startsWith("/content");
  const showPracticeSidebar =
    location.pathname.startsWith("/practice") || location.pathname.startsWith("/flashcards");
  const showAnySidebar = showStudySidebar || showPracticeSidebar;

  useEffect(() => {
    setIsDrawerOpen(false);
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

  const contentWrapperClasses = showAnySidebar
    ? "h-full w-full px-4 pb-28 pt-4 md:px-8 md:pb-12"
    : "mx-auto h-full w-full max-w-6xl px-4 py-12";

  return (
    <div className="relative flex h-screen flex-col bg-gradient-to-br from-gray-50 via-white to-teal-50 text-gray-900 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900 dark:text-gray-100">
      <div className={showAnySidebar ? "hidden md:block" : undefined}>
        <Navbar />
      </div>

      {showAnySidebar && (
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 text-gray-900 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100 md:hidden">
          <button
            type="button"
            onClick={openDrawer}
            className="rounded-md p-2 text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            <span className="sr-only">Open navigation</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
          <div className="font-heading font-semibold">Haven</div>
          <div className="h-6 w-6" aria-hidden="true" />
        </header>
      )}

      <div className="relative flex flex-1 min-h-0">
        {showStudySidebar && (
          <aside className="hidden h-full md:flex md:w-72 md:flex-shrink-0 md:border-r md:border-gray-100 md:bg-white md:shadow-sm dark:md:border-gray-800 dark:md:bg-gray-900">
            <StudySidebar className="flex-1" />
          </aside>
        )}

        {showPracticeSidebar && (
          <aside className="hidden h-full md:flex md:w-72 md:flex-shrink-0 md:border-r md:border-gray-100 md:bg-white md:shadow-sm dark:md:border-gray-800 dark:md:bg-gray-900">
            <PracticeSidebar className="flex-1" />
          </aside>
        )}

        <main className="flex-1 overflow-y-auto">
          <div className={contentWrapperClasses}>
            <Outlet />
          </div>
        </main>
      </div>

      {!showAnySidebar && (
        <footer className="border-t border-gray-200 text-sm text-gray-600 dark:border-gray-800 dark:text-gray-300">
          <div className="mx-auto max-w-6xl px-4 py-8 text-center">
            <p>© {new Date().getFullYear()} Haven • Learn calmly. Pass confidently.</p>
          </div>
        </footer>
      )}

      {showAnySidebar && <MobileNav />}

      {showAnySidebar && drawerSidebar && (
        <>
          <div
            className={`fixed inset-0 z-40 bg-gray-900/40 transition-opacity duration-300 md:hidden ${
              isDrawerOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
            }`}
            aria-hidden="true"
            onClick={closeDrawer}
          />
          <div
            className={`fixed inset-y-0 left-0 z-50 w-72 max-w-full transform overflow-hidden bg-white shadow-xl transition-transform duration-300 dark:bg-gray-900 md:hidden ${
              isDrawerOpen ? "translate-x-0" : "-translate-x-full"
            }`}
            role="dialog"
            aria-modal="true"
          >
            {drawerSidebar}
          </div>
        </>
      )}

      <AskPippa />
    </div>
  );
}
