import { Link, Outlet, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import PracticeSidebar from "../components/PracticeSidebar";
import MobileNav from "../components/navigation/MobileNav";

function MobileTopBar() {
  return (
    <div className="md:hidden bg-white border-b border-gray-200">
      <div className="px-4 py-3 flex items-center justify-between">
        <button
          type="button"
          className="p-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-lg">H</span>
          </div>
          <span className="font-black text-lg text-gray-900">Haven</span>
        </Link>

        <div className="w-10" aria-hidden="true" />
      </div>
    </div>
  );
}

export default function RootLayout() {
  const location = useLocation();

  const showStudySidebar = location.pathname.startsWith('/content');
  const showPracticeSidebar = location.pathname.startsWith('/practice') || location.pathname.startsWith('/flashcards');
  const showAnySidebar = showStudySidebar || showPracticeSidebar;

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-teal-50 text-gray-900 overflow-hidden">
      <Navbar />

      {showAnySidebar && <MobileTopBar />}

      <div className="flex flex-1 min-h-0">
        {showStudySidebar && (
          <div className="hidden md:flex md:flex-col md:flex-shrink-0 h-full">
            <Sidebar />
          </div>
        )}
        {showPracticeSidebar && (
          <div className="hidden md:flex md:flex-col md:flex-shrink-0 h-full">
            <PracticeSidebar />
          </div>
        )}

        <main className="flex-1 min-h-0 flex flex-col">
          <div className={`flex-1 overflow-y-auto pb-20 ${showAnySidebar ? 'px-4 py-8 sm:px-6 lg:px-8' : ''}`}>
            <div className={showAnySidebar ? '' : 'mx-auto max-w-6xl px-4 py-12'}>
              <Outlet />
            </div>
        {showStudySidebar && <Sidebar />}
        {showPracticeSidebar && <PracticeSidebar />}
        
        <main className={`flex-1 overflow-y-auto pb-20 md:pb-0 ${showAnySidebar ? '' : ''}`}>
          <div className={showAnySidebar ? '' : 'mx-auto max-w-6xl px-4 py-12'}>
            <Outlet />
          </div>
        </main>
      </div>

      {!showAnySidebar && (
        <footer className="hidden md:block border-t border-gray-200 text-sm text-gray-600 flex-shrink-0">
          <div className="mx-auto max-w-6xl px-4 py-8 text-center">
            <p>© {new Date().getFullYear()} Haven • Learn calmly. Pass confidently.</p>
          </div>
        </footer>
      )}

      <MobileNav />
    </div>
  );
}
