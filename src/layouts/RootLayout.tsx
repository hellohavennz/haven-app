import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import StudySidebar from "../components/Sidebar";
import PracticeSidebar from "../components/PracticeSidebar";

export default function RootLayout() {
  const location = useLocation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const showStudySidebar = location.pathname.startsWith('/content');
  const showPracticeSidebar = location.pathname.startsWith('/practice') || location.pathname.startsWith('/flashcards');
  const showAnySidebar = showStudySidebar || showPracticeSidebar;

  useEffect(() => {
    setIsDrawerOpen(showStudySidebar);
  }, [showStudySidebar]);

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-teal-50 text-gray-900 overflow-hidden">
      <Navbar />

      <div className="flex flex-1 min-h-0 relative">
        {showStudySidebar && (
          <>
            <div className="hidden md:block">
              <StudySidebar />
            </div>

            <div
              className={`fixed inset-y-0 left-0 z-50 w-72 max-w-full transform bg-white shadow-xl transition-transform duration-300 ease-in-out md:hidden ${
                isDrawerOpen ? 'translate-x-0 pointer-events-auto' : '-translate-x-full pointer-events-none'
              }`}
            >
              <StudySidebar onNavigate={closeDrawer} />
            </div>

            <div
              className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 md:hidden ${
                isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
              }`}
              onClick={closeDrawer}
            />
          </>
        )}
        {showPracticeSidebar && <PracticeSidebar />}

        <main className={`flex-1 overflow-y-auto ${showAnySidebar ? '' : ''}`}>
          <div className={showAnySidebar ? '' : 'mx-auto max-w-6xl px-4 py-12'}>
            {showStudySidebar && !isDrawerOpen && (
              <div className="md:hidden px-4 pt-4">
                <button
                  type="button"
                  onClick={openDrawer}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-teal-50 hover:text-teal-700"
                >
                  Open study navigation
                </button>
              </div>
            )}
            <Outlet />
          </div>
        </main>
      </div>
      
      {!showAnySidebar && (
        <footer className="border-t border-gray-200 text-sm text-gray-600 flex-shrink-0">
          <div className="mx-auto max-w-6xl px-4 py-8 text-center">
            <p>© {new Date().getFullYear()} Haven • Learn calmly. Pass confidently.</p>
          </div>
        </footer>
      )}
    </div>
  );
}
