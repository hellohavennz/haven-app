import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Lock, CheckCircle2, AlertCircle, Clock, Crown, ChevronDown, ChevronRight } from 'lucide-react';
import { useSubscription } from '../lib/subscription';
import { useProgress } from '../lib/progress';
import { getAllLessons, getModules } from '../lib/content';
import { getCurrentUser } from '../lib/auth';
import { syncExamHistory, MODULE_LABELS } from '../lib/examUtils';
import type { ExamAttempt } from '../types';
import { usePageTitle } from '../hooks/usePageTitle';

function pct(correct: number, attempted: number) {
  if (attempted === 0) return null;
  return Math.round((correct / attempted) * 100);
}

function AccuracyBar({ value, size = 'md' }: { value: number | null; size?: 'sm' | 'md' }) {
  const h = size === 'sm' ? 'h-1.5' : 'h-2';
  if (value === null) {
    return <div className={`${h} rounded-full bg-gray-100 dark:bg-gray-800`} />;
  }
  const color = value >= 80 ? 'bg-green-500' : value >= 60 ? 'bg-amber-400' : 'bg-red-400';
  return (
    <div className={`${h} rounded-full bg-gray-100 dark:bg-gray-800`}>
      <div className={`${h} rounded-full ${color} transition-all`} style={{ width: `${value}%` }} />
    </div>
  );
}

function StatusBadge({ value }: { value: number | null }) {
  if (value === null) return <span className="text-xs text-gray-400">Not started</span>;
  if (value >= 80) return <span className="text-xs font-semibold text-green-700 dark:text-green-400">Mastered</span>;
  if (value >= 60) return <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">Needs work</span>;
  return <span className="text-xs font-semibold text-red-600 dark:text-red-400">Weak area</span>;
}

function formatDuration(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}m ${s}s`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function Analytics() {
  usePageTitle('Analytics', 'Track your weak areas, module accuracy, and exam history with detailed performance analytics.');

  const { tier, isLoading: tierLoading } = useSubscription();
  const [userId, setUserId] = useState<string | undefined>();
  const [examHistory, setExamHistory] = useState<ExamAttempt[]>([]);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  useEffect(() => {
    getCurrentUser().then(u => setUserId(u?.id));
    syncExamHistory().then(setExamHistory).catch(() => {});
  }, []);

  const progress = useProgress(userId);

  if (tierLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="h-8 w-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  // Paywall gate for non-premium
  if (tier !== 'premium') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-amber-100 dark:bg-amber-900/30 mb-6">
            <Lock className="text-amber-600 dark:text-amber-400" size={36} />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">Performance Analytics</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Detailed insights into your weak areas, module accuracy, and exam history are available on Haven Premium.
          </p>
          <Link
            to="/paywall"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold px-8 py-4 rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg"
          >
            <Crown size={18} />
            Upgrade to Premium
          </Link>
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            <Link to="/dashboard" className="text-teal-600 hover:text-teal-700 dark:text-teal-400">← Back to Dashboard</Link>
          </p>
        </div>
      </div>
    );
  }

  const allLessons = getAllLessons();
  const modules = getModules();
  const lessonsWithQ = allLessons.filter(l => (l.questions?.length ?? 0) > 0);

  // Overall stats
  const totalCorrect = Object.values(progress).reduce((s, p) => s + p.correct, 0);
  const totalAttempted = Object.values(progress).reduce((s, p) => s + p.attempted, 0);
  const overallAccuracy = pct(totalCorrect, totalAttempted);
  const masteredCount = lessonsWithQ.filter(l => {
    const p = progress[l.id];
    return p && p.attempted > 0 && p.correct / p.attempted >= 0.8;
  }).length;
  const examsCount = examHistory.length;
  const passCount = examHistory.filter(a => a.passed).length;
  const passRate = pct(passCount, examsCount);

  // Per-module stats
  const moduleStats = modules.map(mod => {
    const lessons = allLessons.filter(l => l.module_slug === mod.slug && (l.questions?.length ?? 0) > 0);
    const modCorrect = lessons.reduce((s, l) => s + (progress[l.id]?.correct ?? 0), 0);
    const modAttempted = lessons.reduce((s, l) => s + (progress[l.id]?.attempted ?? 0), 0);
    const modMastered = lessons.filter(l => {
      const p = progress[l.id];
      return p && p.attempted > 0 && p.correct / p.attempted >= 0.8;
    }).length;
    return { slug: mod.slug, label: MODULE_LABELS[mod.slug] ?? mod.title, lessons, accuracy: pct(modCorrect, modAttempted), mastered: modMastered };
  });

  const toggleModule = (slug: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      next.has(slug) ? next.delete(slug) : next.add(slug);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4">
      <div className="mx-auto max-w-4xl space-y-8">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30">
            <BarChart3 className="text-amber-600 dark:text-amber-400" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Performance Analytics</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Your weak areas, module accuracy, and exam history</p>
          </div>
        </div>

        {/* Overview stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Overall accuracy', value: overallAccuracy !== null ? `${overallAccuracy}%` : '—', sub: `${totalAttempted} questions answered` },
            { label: 'Lessons mastered', value: `${masteredCount}/${lessonsWithQ.length}`, sub: '80%+ accuracy' },
            { label: 'Exams taken', value: examsCount.toString(), sub: examsCount === 0 ? 'None yet' : `${passCount} passed` },
            { label: 'Exam pass rate', value: passRate !== null ? `${passRate}%` : '—', sub: examsCount > 0 ? `${passCount} of ${examsCount}` : 'No exams yet' },
          ].map(s => (
            <div key={s.label} className="rounded-2xl bg-white dark:bg-gray-900 dark:border dark:border-gray-800 p-5 shadow-sm">
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{s.value}</div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-300">{s.label}</div>
              <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Module breakdown */}
        <div className="rounded-2xl bg-white dark:bg-gray-900 dark:border dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
            <h2 className="font-semibold text-gray-900 dark:text-white">Module Breakdown</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Click a module to see lesson detail</p>
          </div>

          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {moduleStats.map(mod => {
              const expanded = expandedModules.has(mod.slug);
              return (
                <div key={mod.slug}>
                  <button
                    onClick={() => toggleModule(mod.slug)}
                    className="w-full text-left px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">{mod.label}</span>
                          <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                              {mod.accuracy !== null ? `${mod.accuracy}%` : '—'}
                            </span>
                            <span className="text-xs text-gray-400">{mod.mastered}/{mod.lessons.length} mastered</span>
                            {expanded ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
                          </div>
                        </div>
                        <AccuracyBar value={mod.accuracy} />
                      </div>
                    </div>
                  </button>

                  {expanded && (
                    <div className="bg-gray-50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800">
                      {mod.lessons.map(lesson => {
                        const p = progress[lesson.id];
                        const accuracy = p ? pct(p.correct, p.attempted) : null;
                        return (
                          <div key={lesson.id} className="px-8 py-3 border-b last:border-0 border-gray-100 dark:border-gray-800/50">
                            <div className="flex items-center justify-between gap-4 mb-1">
                              <span className="text-sm text-gray-700 dark:text-gray-200 flex-1 min-w-0 truncate">{lesson.title}</span>
                              <div className="flex items-center gap-3 flex-shrink-0">
                                <StatusBadge value={accuracy} />
                                {accuracy !== null && (
                                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 w-10 text-right">{accuracy}%</span>
                                )}
                              </div>
                            </div>
                            <AccuracyBar value={accuracy} size="sm" />
                            {p && p.attempted > 0 && (
                              <p className="text-xs text-gray-400 mt-1">{p.correct}/{p.attempted} correct</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Exam history */}
        <div className="rounded-2xl bg-white dark:bg-gray-900 dark:border dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
            <h2 className="font-semibold text-gray-900 dark:text-white">Exam History</h2>
          </div>

          {examHistory.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-4">No exams taken yet.</p>
              <Link to="/exam" className="inline-flex items-center gap-2 bg-purple-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-purple-700 transition-colors">
                Start your first exam
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-gray-800">
              {examHistory.map(attempt => {
                const score = Math.round((attempt.correct / attempt.total) * 100);
                return (
                  <div key={attempt.id} className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      {/* Score */}
                      <div className={`flex-shrink-0 w-14 h-14 rounded-xl flex flex-col items-center justify-center ${attempt.passed ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                        <span className={`text-lg font-bold leading-none ${attempt.passed ? 'text-green-700 dark:text-green-300' : 'text-red-600 dark:text-red-300'}`}>{score}%</span>
                        <span className={`text-xs font-semibold mt-0.5 ${attempt.passed ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                          {attempt.passed ? 'PASS' : 'FAIL'}
                        </span>
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {attempt.correct}/{attempt.total} correct
                          </span>
                          <div className="flex items-center gap-3 text-xs text-gray-400 flex-shrink-0">
                            {attempt.durationSeconds > 0 && (
                              <span className="flex items-center gap-1"><Clock size={12} />{formatDuration(attempt.durationSeconds)}</span>
                            )}
                            <span>{formatDate(attempt.completedAt)}</span>
                          </div>
                        </div>
                        <AccuracyBar value={score} size="sm" />

                        {/* Module scores */}
                        {Object.keys(attempt.moduleScores).length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {Object.entries(attempt.moduleScores).map(([mod, s]) => {
                              const modPct = Math.round((s.correct / s.total) * 100);
                              const color = modPct >= 80 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                : modPct >= 60 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
                              return (
                                <span key={mod} className={`rounded-full px-2 py-0.5 text-xs font-medium ${color}`} title={MODULE_LABELS[mod]}>
                                  {(MODULE_LABELS[mod] ?? mod).replace('Government, Law & Role', 'Gov & Law').replace('Values & Principles', 'Values').replace('What is the UK?', 'UK')} {modPct}%
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Weak areas summary */}
        {(() => {
          const weakLessons = lessonsWithQ.filter(l => {
            const p = progress[l.id];
            return p && p.attempted > 0 && p.correct / p.attempted < 0.6;
          });
          if (weakLessons.length === 0) return null;
          return (
            <div className="rounded-2xl border-2 border-red-100 dark:border-red-900/40 bg-red-50 dark:bg-red-900/10 p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <h3 className="font-semibold text-red-900 dark:text-red-200 mb-2">Weak areas to focus on</h3>
                  <div className="flex flex-wrap gap-2">
                    {weakLessons.map(l => {
                      const p = progress[l.id]!;
                      const accuracy = pct(p.correct, p.attempted)!;
                      return (
                        <Link
                          key={l.id}
                          to={`/practice/${l.id}`}
                          className="inline-flex items-center gap-1.5 bg-white dark:bg-gray-900 border border-red-200 dark:border-red-800 rounded-lg px-3 py-1.5 text-sm text-red-800 dark:text-red-300 hover:border-red-400 transition-colors"
                        >
                          {l.title}
                          <span className="font-semibold">{accuracy}%</span>
                          <CheckCircle2 size={12} />
                        </Link>
                      );
                    })}
                  </div>
                  <p className="text-xs text-red-600 dark:text-red-400 mt-3">Click a lesson to go straight to practice questions.</p>
                </div>
              </div>
            </div>
          );
        })()}

      </div>
    </div>
  );
}
