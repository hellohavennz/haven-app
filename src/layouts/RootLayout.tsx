import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import PracticeSidebar from "../components/PracticeSidebar";

export default function RootLayout() {
  const location = useLocation();
  
  const showStudySidebar = location.pathname.startsWith('/content');
  const showPracticeSidebar = location.pathname.startsWith('/practice') || location.pathname.startsWith('/flashcards');
  const showAnySidebar = showStudySidebar || showPracticeSidebar;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50 text-gray-900 flex flex-col">
      <Navbar />
      
      <div className="flex flex-1 overflow-hidden">
        {showStudySidebar && <Sidebar />}
        {showPracticeSidebar && <PracticeSidebar />}
        
        <main className={`flex-1 overflow-y-auto ${showAnySidebar ? '' : 'mx-auto max-w-6xl px-4 py-12'}`}>
          <Outlet />
        </main>
      </div>
      
      {!showAnySidebar && (
        <footer className="mt-20 border-t border-gray-200 text-sm text-gray-600">
          <div className="mx-auto max-w-6xl px-4 py-8 text-center">
            <p>© {new Date().getFullYear()} Haven • Learn calmly. Pass confidently.</p>
          </div>
        </footer>
      )}
    </div>
  );
}
