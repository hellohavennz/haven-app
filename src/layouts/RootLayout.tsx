// src/layouts/RootLayout.tsx
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function RootLayout() {
  return (
    <div className="min-h-screen bg-[#F7FAFC] text-[#111827]">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
      <footer className="mt-16 border-t text-sm text-gray-500">
        <div className="mx-auto max-w-5xl px-4 py-6">
          © {new Date().getFullYear()} Haven • Learn calmly. Pass confidently.
        </div>
      </footer>
    </div>
  );
}
