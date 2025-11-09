import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children, sidebar }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navigationLinks = [
    { path: '/study', label: 'Study' },
    { path: '/practice', label: 'Practice' },
    { path: '/dashboard', label: 'Dashboard' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Logo and mobile sidebar toggle */}
            <div className="flex items-center gap-3">
              {/* Mobile Sidebar Toggle (only show on pages with sidebar) */}
              {sidebar && (
                <button
                  onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                  className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  aria-label="Toggle lesson menu"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              )}

              {/* Logo */}
              <Link to="/" className="flex items-center gap-2">
                <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">H</span>
                </div>
                <span className="text-xl font-bold text-gray-900">Haven</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navigationLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.path)
                      ? 'bg-teal-50 text-teal-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right side - Auth buttons and mobile menu toggle */}
            <div className="flex items-center gap-3">
              {/* Desktop Auth Buttons */}
              <div className="hidden md:flex items-center gap-3">
                <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                  Sign In
                </button>
                <button className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors">
                  Sign Up
                </button>
              </div>

              {/* Mobile Main Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                aria-label="Toggle main menu"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Main Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-3 space-y-1">
              {navigationLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-base font-medium ${
                    isActive(link.path)
                      ? 'bg-teal-50 text-teal-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 border-t border-gray-200 space-y-2">
                <button className="w-full px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-lg text-left">
                  Sign In
                </button>
                <button className="w-full px-4 py-3 text-base font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700">
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <div className="flex">
        {/* Sidebar (Desktop and Mobile) */}
        {sidebar && (
          <>
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto">
              {sidebar}
            </aside>

            {/* Mobile Sidebar Overlay */}
            {isMobileSidebarOpen && (
              <>
                {/* Backdrop */}
                <div
                  className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40 top-16"
                  onClick={() => setIsMobileSidebarOpen(false)}
                />
                
                {/* Sidebar */}
                <aside className="lg:hidden fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 z-50 overflow-y-auto">
                  {sidebar}
                </aside>
              </>
            )}
          </>
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
