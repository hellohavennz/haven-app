import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function RootLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50 text-gray-900">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-12">
        <Outlet />
      </main>
      <footer className="mt-20 border-t border-gray-200 text-sm text-gray-600">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <p>© {new Date().getFullYear()} Haven • Learn calmly. Pass confidently.</p>
        </div>
      </footer>
    </div>
  );
}
