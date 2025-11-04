import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getAllProgress } from '../lib/progress';

interface ProgressStats {
  totalLessons: number;
  completedLessons: number;
  averageScore: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<ProgressStats>({
    totalLessons: 0,
    completedLessons: 0,
    averageScore: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user || !user.id) {
          setIsLoading(false);
          return;
        }

        const progress = await getAllProgress(user.id);
        
        const completed = progress.filter(p => p.completed).length;
        const totalScore = progress.reduce((sum, p) => sum + p.score, 0);
        const avgScore = progress.length > 0 ? Math.round(totalScore / progress.length) : 0;

        setStats({
          totalLessons: 0,
          completedLessons: completed,
          averageScore: avgScore,
        });
      } catch (error) {
        // Silently fail
      } finally {
        setIsLoading(false);
      }
    };

    loadProgress();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-teal-600">
          <div className="text-sm font-semibold text-gray-600 uppercase mb-2">
            Progress
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {stats.completedLessons} / {stats.totalLessons}
          </div>
          <div className="text-sm text-gray-600 mt-1">Lessons Completed</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-emerald-600">
          <div className="text-sm font-semibold text-gray-600 uppercase mb-2">
            Average Score
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.averageScore}%</div>
          <div className="text-sm text-gray-600 mt-1">Across All Lessons</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-teal-600">
          <div className="text-sm font-semibold text-gray-600 uppercase mb-2">
            Completion
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {stats.totalLessons > 0 ? Math.round((stats.completedLessons / stats.totalLessons) * 100) : 0}%
          </div>
          <div className="text-sm text-gray-600 mt-1">Overall Progress</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/study"
          className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl shadow-lg p-8 transition-all duration-200 hover:shadow-xl"
        >
          <div className="flex items-center mb-4">
            <svg className="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h2 className="text-2xl font-bold">Study Lessons</h2>
          </div>
          <p className="text-teal-100">Review comprehensive lesson content and prepare for your test</p>
        </Link>

        <Link
          to="/practice"
          className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl shadow-lg p-8 transition-all duration-200 hover:shadow-xl"
        >
          <div className="flex items-center mb-4">
            <svg className="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h2 className="text-2xl font-bold">Practice Questions</h2>
          </div>
          <p className="text-teal-100">Test your knowledge with practice questions and flashcards</p>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
