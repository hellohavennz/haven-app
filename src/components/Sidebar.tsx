import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getAllProgress } from '../lib/progress';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user || !user.id) {
          return;
        }

        const progress = await getAllProgress(user.id);
        const completed = new Set(
          progress.filter(p => p.completed).map(p => p.lesson_id)
        );
        setCompletedLessons(completed);
      } catch (error) {
        // Silently fail - no user logged in
      }
    };

    loadProgress();
  }, []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen overflow-y-auto">
      <div className="p-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Study Content
        </h2>
        
        <div className="text-center py-8 text-gray-500">
          <p>Lessons will appear here</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
