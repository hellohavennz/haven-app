import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Home() {
  useEffect(() => {
    testSupabaseConnection();
  }, []);

  const testSupabaseConnection = () => {
    if (supabase) {
      console.log('Supabase client initialised');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">
          Hello Haven <span className="inline-block animate-wave">👋</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-md mx-auto">
          Your calm space for learning and growth
        </p>
      </div>
    </div>
  );
}
