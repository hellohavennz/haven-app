import { NavLink } from "react-router-dom";

const link = "px-3 py-2 rounded hover:bg-gray-100 transition text-sm font-medium";
const active = "bg-black text-white hover:bg-black/90";

export default function Navbar() {
  return (
    <header className="border-b bg-white/70 backdrop-blur">
      <nav className="mx-auto max-w-5xl px-4 h-14 flex items-center justify-between">
        <NavLink to="/" className="text-lg font-semibold">Haven</NavLink>
        <div className="flex items-center gap-1">
          <NavLink to="/path" className={({isActive}) => `${link} ${isActive ? active : ""}`}>Study Path</NavLink>
          <NavLink to="/lesson1-content" className={({isActive}) => `${link} ${isActive ? active : ""}`}>Lesson 1 (content)</NavLink>
          <NavLink to="/mock" className={({isActive}) => `${link} ${isActive ? active : ""}`}>Mock Exam</NavLink>
          <NavLink to="/paywall" className={({isActive}) => `${link} ${isActive ? active : ""}`}>Upgrade</NavLink>
        </div>
      </nav>
    </header>
  );
}
