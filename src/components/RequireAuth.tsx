import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function RequireAuth() {
  const [user, setUser] = useState<unknown>(undefined); // undefined = still loading
  const location = useLocation();

  useEffect(() => {
    // onAuthStateChange fires immediately with the current session (INITIAL_SESSION)
    // and also after OAuth callbacks finish processing the hash/code — preventing
    // the race condition where getUser() returns null before the session is ready.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Still checking auth — show spinner
  if (user === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  // Not authenticated — redirect to login, preserving intended destination
  if (user === null) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
