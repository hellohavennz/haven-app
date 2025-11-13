import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";

import Navbar from "../components/Navbar";
import PracticeSidebar from "../components/PracticeSidebar";
import MobileNav from "../components/navigation/MobileNav";
import StudySidebar from "../components/navigation/StudySidebar";
import AskPippa from "../components/AskPippa";

export default function RootLayout() {
  const location = useLocation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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
    <div className="relative flex min-h-screen flex-col bg-[var(--bg)] text-[var(--text-primary)] theme-transition">
      <div className={showAnySidebar ? "hidden md:block" : undefined}>
        <Navbar />
      </div>

      {showAnySidebar && (
        <header className="flex items-center justify-between border-b px-4 py-3 md:hidden bg-[var(--bg)]">
          <button
            type="button"
            onClick={openDrawer}
            className="rounded-md p-2 text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-section)]"
          >
            <span className="sr-only">Open navigation</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
          <div className="font-semibold text-[var(--text-primary)]">Haven</div>
          <div className="h-6 w-6" aria-hidden="true" />
        </header>
      )}

      <div className="relative flex flex-1 min-h-0">
        {showStudySidebar && (
          <aside className="hidden h-full md:flex md:w-72 md:flex-shrink-0 md:border-r md:bg-[var(--bg-section)]">
            <StudySidebar className="flex-1" />
          </aside>
        )}

        {showPracticeSidebar && (
          <aside className="hidden h-full md:flex md:w-72 md:flex-shrink-0 md:border-r md:bg-[var(--bg-section)]">
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
        <footer className="border-t text-sm">
          <div className="mx-auto max-w-6xl px-4 py-8 text-center text-[var(--text-secondary)]">
            <p>© {new Date().getFullYear()} Haven • Learn calmly. Pass confidently.</p>
          </div>
        </footer>
      )}

      {showAnySidebar && <MobileNav />}

      {showAnySidebar && drawerSidebar && (
        <>
          <div
            className={`fixed inset-0 z-40 transition-opacity duration-300 md:hidden ${
              isDrawerOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
            }`}
            style={{ backgroundColor: "var(--overlay)" }}
            aria-hidden="true"
            onClick={closeDrawer}
          />
          <div
            className={`fixed inset-y-0 left-0 z-50 w-72 max-w-full transform overflow-hidden bg-[var(--bg-section)] transition-transform duration-300 md:hidden ${
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
