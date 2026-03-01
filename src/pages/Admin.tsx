import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Flag, Trophy, BarChart3, CheckCircle2, XCircle,
  Clock, TrendingUp, AlertTriangle, RefreshCw, ChevronDown, ChevronUp,
  Calendar, Shield, FileCheck, ExternalLink, Loader2, Snowflake, Trash2,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { getCurrentUser } from '../lib/auth';
import {
  fetchAdminOverview,
  fetchAdminReports,
  fetchAdminUsers,
  fetchAdminExamStats,
  updateReportStatus,
  fetchResitClaims,
  approveResitClaim,
  rejectResitClaim,
  getEvidenceUrl,
  adminUserAction,
  type AdminOverview,
  type ContentReport,
  type AdminUser,
  type ExamStats,
  type ResitClaim,
} from '../lib/adminApi';
import { supabase } from '../lib/supabase';
import { usePageTitle } from '../hooks/usePageTitle';

const ADMIN_EMAIL = 'hello.haven.nz@gmail.com';

type Tab = 'overview' | 'reports' | 'users' | 'exams' | 'resit';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s.toString().padStart(2, '0')}s`;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days}d ago`;
  return formatDate(iso);
}

const CONTENT_TYPE_COLOURS: Record<string, string> = {
  lesson:    'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
  flashcard: 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-200',
  question:  'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200',
  exam:      'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
};

const STATUS_COLOURS: Record<string, string> = {
  open:      'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  reviewed:  'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  resolved:  'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
};

const TIER_COLOURS: Record<string, string> = {
  free:    'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  plus:    'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300',
  premium: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
};

// ── Stat card ─────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, accent = false, alert = false }: {
  label: string; value: string | number; sub?: string; accent?: boolean; alert?: boolean;
}) {
  return (
    <div className={`rounded-2xl border p-5 ${alert ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/10' : 'border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900'}`}>
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-3xl font-bold ${alert ? 'text-red-600 dark:text-red-400' : accent ? 'text-teal-600 dark:text-teal-400' : 'text-gray-900 dark:text-white'}`}>
        {value ?? '—'}
      </p>
      {sub && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

// ── Activity chart ─────────────────────────────────────────────────────────
type ChartPoint = { label: string; logins: number; signups: number };

function toWeekly(daily: { date: string; count: number }[]): { date: string; count: number }[] {
  const weeks: Record<string, number> = {};
  for (const { date, count } of daily) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d);
    monday.setDate(diff);
    const key = monday.toISOString().split('T')[0];
    weeks[key] = (weeks[key] ?? 0) + count;
  }
  return Object.entries(weeks).map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date));
}

function shortDate(iso: string, weekly: boolean) {
  const d = new Date(iso);
  if (weekly) return `${d.getDate()} ${d.toLocaleString('en-GB', { month: 'short' })}`;
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

function ActivityChart({
  logins,
  signups,
}: {
  logins: { date: string; count: number }[];
  signups: { date: string; count: number }[];
}) {
  const [weekly, setWeekly] = useState(false);

  const loginData  = weekly ? toWeekly(logins)  : logins;
  const signupData = weekly ? toWeekly(signups) : signups;

  // Merge on date
  const allDates = Array.from(new Set([...loginData.map(d => d.date), ...signupData.map(d => d.date)])).sort();
  const loginMap  = Object.fromEntries(loginData.map(d => [d.date, d.count]));
  const signupMap = Object.fromEntries(signupData.map(d => [d.date, d.count]));
  const chartData: ChartPoint[] = allDates.map(date => ({
    label: shortDate(date, weekly),
    logins:  loginMap[date]  ?? 0,
    signups: signupMap[date] ?? 0,
  }));

  if (!chartData.length) return <p className="text-sm text-gray-400">No activity data yet</p>;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Logins &amp; new accounts — last 30 days
        </p>
        <div className="flex gap-1 rounded-lg bg-gray-100 dark:bg-gray-800 p-0.5">
          {(['Daily', 'Weekly'] as const).map(label => (
            <button
              key={label}
              onClick={() => setWeekly(label === 'Weekly')}
              className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                (label === 'Weekly') === weekly
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="gLogins" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#14b8a6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gSignups" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
            itemStyle={{ color: '#374151' }}
          />
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
          <Area type="monotone" dataKey="logins"  name="Logins"       stroke="#14b8a6" fill="url(#gLogins)"  strokeWidth={2} dot={false} />
          <Area type="monotone" dataKey="signups" name="New accounts" stroke="#6366f1" fill="url(#gSignups)" strokeWidth={2} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Overview tab ──────────────────────────────────────────────────────────
function OverviewTab() {
  const [data, setData] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminOverview()
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (error) return <ErrorMsg msg={error} />;
  if (!data) return null;

  const tier = data.by_tier ?? {};

  return (
    <div className="space-y-8">
      {/* Users */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Users</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Total" value={data.total_users} accent />
          <StatCard label="Free" value={tier.free ?? 0} />
          <StatCard label="Plus" value={tier.plus ?? 0} />
          <StatCard label="Premium" value={tier.premium ?? 0} />
        </div>
      </section>

      {/* Signups */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Signups</h2>
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Last 7 days" value={data.new_7d} />
          <StatCard label="Last 30 days" value={data.new_30d} />
        </div>
      </section>

      {/* Activity */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Activity</h2>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <StatCard label="Today (DAU)" value={data.dau} />
          <StatCard label="This week (WAU)" value={data.wau} />
          <StatCard label="This month (MAU)" value={data.mau} />
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 p-5">
          <ActivityChart logins={data.daily_logins} signups={data.daily_signups ?? []} />
        </div>
      </section>

      {/* Alerts + exams */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Highlights</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Open reports" value={data.open_reports} alert={data.open_reports > 0} sub="need review" />
          <StatCard label="Exam attempts" value={data.exam_attempts} />
          <StatCard label="Exam pass rate" value={data.exam_pass_rate != null ? `${data.exam_pass_rate}%` : '—'} />
          <StatCard label="Tests in 7 days" value={data.upcoming_7d} sub={`${data.upcoming_30d} in 30 days`} />
        </div>
      </section>
    </div>
  );
}

// ── Reports tab ───────────────────────────────────────────────────────────
function ReportsTab() {
  const [status, setStatus] = useState<'open' | 'reviewed' | 'resolved' | 'all'>('open');
  const [reports, setReports] = useState<ContentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  function load(s: typeof status) {
    setStatus(s);
    setLoading(true);
    setError(null);
    fetchAdminReports(s)
      .then(setReports)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load('open'); }, []);

  async function handleUpdate(id: string, newStatus: 'reviewed' | 'resolved') {
    setUpdating(id);
    try {
      await updateReportStatus(id, newStatus);
      setReports(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
    } finally {
      setUpdating(null);
    }
  }

  const FILTERS: { label: string; value: typeof status }[] = [
    { label: 'Open', value: 'open' },
    { label: 'Reviewed', value: 'reviewed' },
    { label: 'Resolved', value: 'resolved' },
    { label: 'All', value: 'all' },
  ];

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => load(f.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              status === f.value
                ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            {f.label}
          </button>
        ))}
        <button onClick={() => load(status)} className="ml-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" title="Refresh">
          <RefreshCw size={16} />
        </button>
      </div>

      {loading && <Spinner />}
      {error && <ErrorMsg msg={error} />}
      {!loading && !error && reports.length === 0 && (
        <p className="text-center py-12 text-gray-500 dark:text-gray-400">No {status === 'all' ? '' : status} reports.</p>
      )}

      {!loading && reports.length > 0 && (
        <div className="space-y-2">
          {reports.map(r => {
            const isOpen = expanded === r.id;
            return (
              <div key={r.id} className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
                <button
                  onClick={() => setExpanded(isOpen ? null : r.id)}
                  className="w-full text-left p-4 flex items-start gap-3"
                >
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${CONTENT_TYPE_COLOURS[r.content_type] ?? ''}`}>
                        {r.content_type}
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COLOURS[r.status] ?? ''}`}>
                        {r.status}
                      </span>
                      {r.lesson_id && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{r.lesson_id}{r.content_ref != null ? ` · #${r.content_ref}` : ''}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-800 dark:text-gray-200 line-clamp-1">{r.message}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {r.user_email ?? 'anonymous'} · {timeAgo(r.created_at)}
                    </p>
                  </div>
                  {isOpen ? <ChevronUp size={16} className="text-gray-400 flex-shrink-0 mt-1" /> : <ChevronDown size={16} className="text-gray-400 flex-shrink-0 mt-1" />}
                </button>

                {isOpen && (
                  <div className="border-t border-gray-100 dark:border-gray-800 px-4 pb-4 pt-3 space-y-3">
                    <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">{r.message}</p>
                    <div className="flex gap-2">
                      {r.status !== 'reviewed' && r.status !== 'resolved' && (
                        <button
                          onClick={() => handleUpdate(r.id, 'reviewed')}
                          disabled={updating === r.id}
                          className="px-4 py-2 rounded-lg bg-amber-100 text-amber-800 text-xs font-semibold hover:bg-amber-200 disabled:opacity-50 transition-colors dark:bg-amber-900/30 dark:text-amber-300"
                        >
                          Mark Reviewed
                        </button>
                      )}
                      {r.status !== 'resolved' && (
                        <button
                          onClick={() => handleUpdate(r.id, 'resolved')}
                          disabled={updating === r.id}
                          className="px-4 py-2 rounded-lg bg-green-100 text-green-800 text-xs font-semibold hover:bg-green-200 disabled:opacity-50 transition-colors dark:bg-green-900/30 dark:text-green-300"
                        >
                          Mark Resolved
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Users tab ─────────────────────────────────────────────────────────────
function UsersTab() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tierFilter, setTierFilter] = useState<'all' | 'free' | 'plus' | 'premium'>('all');
  const [engFilter, setEngFilter] = useState<'all' | 'well' | 'struggling'>('all');
  const [acting, setActing] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<AdminUser | null>(null);

  useEffect(() => {
    fetchAdminUsers()
      .then(setUsers)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleAction(action: 'freeze' | 'unfreeze' | 'delete', user: AdminUser) {
    setActing(user.id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await adminUserAction(action, user.id, session!.access_token);
      if (action === 'delete') {
        setUsers(prev => prev.filter(u => u.id !== user.id));
        setConfirmDelete(null);
      } else {
        // Toggle banned_until: set far-future date for freeze, null for unfreeze
        setUsers(prev => prev.map(u =>
          u.id === user.id
            ? { ...u, banned_until: action === 'freeze' ? '2099-01-01T00:00:00Z' : null }
            : u,
        ));
      }
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    } finally {
      setActing(null);
    }
  }

  function engagementLabel(u: AdminUser): 'well' | 'struggling' | 'new' {
    if (u.total_exams === 0 && u.lessons_completed < 3) return 'new';
    if ((u.avg_exam_score ?? 0) >= 75 || u.exams_passed > 0) return 'well';
    if (u.total_exams >= 2 && u.exams_passed === 0) return 'struggling';
    if ((u.avg_exam_score ?? 100) < 50) return 'struggling';
    return 'well';
  }

  const filtered = users.filter(u => {
    if (tierFilter !== 'all' && u.subscription_tier !== tierFilter) return false;
    if (engFilter === 'well' && engagementLabel(u) !== 'well') return false;
    if (engFilter === 'struggling' && engagementLabel(u) !== 'struggling') return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4 flex-wrap items-center">
        <div className="flex gap-1.5">
          {(['all', 'free', 'plus', 'premium'] as const).map(t => (
            <button key={t} onClick={() => setTierFilter(t)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors capitalize ${
                tierFilter === t ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
              }`}
            >{t}</button>
          ))}
        </div>
        <div className="flex gap-1.5">
          {([['all', 'All'], ['well', 'Doing well'], ['struggling', 'Struggling']] as const).map(([v, l]) => (
            <button key={v} onClick={() => setEngFilter(v)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                engFilter === v ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
              }`}
            >{l}</button>
          ))}
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">{filtered.length} user{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {loading && <Spinner />}
      {error && <ErrorMsg msg={error} />}

      {!loading && !error && (
        <div className="space-y-2">
          {filtered.length === 0 && (
            <p className="text-center py-12 text-gray-500 dark:text-gray-400">No users match these filters.</p>
          )}
          {filtered.map(u => {
            const eng = engagementLabel(u);
            const frozen = u.banned_until != null && new Date(u.banned_until) > new Date();
            const busy = acting === u.id;
            return (
              <div key={u.id} className={`rounded-xl border p-4 bg-white dark:bg-gray-900 ${
                frozen
                  ? 'border-blue-200 dark:border-blue-800'
                  : eng === 'struggling'
                    ? 'border-red-200 dark:border-red-800'
                    : 'border-gray-200 dark:border-gray-800'
              }`}>
                <div className="flex items-start gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                        {u.display_name ?? u.email}
                      </span>
                      {u.display_name && (
                        <span className="text-xs text-gray-400 dark:text-gray-500 truncate">{u.email}</span>
                      )}
                      {frozen && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                          <Snowflake size={10} /> Frozen
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap mt-1">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${TIER_COLOURS[u.subscription_tier] ?? ''}`}>
                        {u.subscription_tier}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {u.lessons_completed} lessons · {u.total_exams} exam{u.total_exams !== 1 ? 's' : ''} · {u.exams_passed} passed
                      </span>
                      {u.avg_exam_score != null && (
                        <span className={`text-xs font-semibold ${u.avg_exam_score >= 75 ? 'text-green-600 dark:text-green-400' : u.avg_exam_score < 50 ? 'text-red-500 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`}>
                          avg {u.avg_exam_score}%
                        </span>
                      )}
                      {eng === 'struggling' && !frozen && (
                        <span className="flex items-center gap-1 text-xs font-semibold text-red-600 dark:text-red-400">
                          <AlertTriangle size={12} /> Struggling
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <div className="text-right text-xs text-gray-400 dark:text-gray-500 space-y-0.5">
                      {u.exam_date && (
                        <div className="flex items-center gap-1 justify-end text-teal-600 dark:text-teal-400 font-medium">
                          <Calendar size={11} />
                          Test {formatDate(u.exam_date)}
                        </div>
                      )}
                      <div>Joined {timeAgo(u.created_at)}</div>
                      {u.last_sign_in_at && <div>Active {timeAgo(u.last_sign_in_at)}</div>}
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleAction(frozen ? 'unfreeze' : 'freeze', u)}
                        disabled={busy}
                        title={frozen ? 'Unfreeze account' : 'Freeze account'}
                        className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors disabled:opacity-50 ${
                          frozen
                            ? 'border-teal-200 text-teal-700 hover:bg-teal-50 dark:border-teal-700 dark:text-teal-300 dark:hover:bg-teal-900/20'
                            : 'border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/20'
                        }`}
                      >
                        {busy ? <Loader2 size={11} className="animate-spin" /> : <Snowflake size={11} />}
                        {frozen ? 'Unfreeze' : 'Freeze'}
                      </button>
                      <button
                        onClick={() => setConfirmDelete(u)}
                        disabled={busy}
                        title="Delete account"
                        className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-50 transition-colors disabled:opacity-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                      >
                        <Trash2 size={11} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/30">
                <Trash2 className="text-red-600 dark:text-red-400" size={20} />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Delete account?</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">This cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Permanently delete <strong>{confirmDelete.display_name ?? confirmDelete.email}</strong> and all their data?
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConfirmDelete(null)}
                className="rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAction('delete', confirmDelete)}
                disabled={acting === confirmDelete.id}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {acting === confirmDelete.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                Delete permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Exams tab ─────────────────────────────────────────────────────────────
function ExamsTab() {
  const [data, setData] = useState<ExamStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminExamStats()
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (error) return <ErrorMsg msg={error} />;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total attempts" value={data.total_attempts} accent />
        <StatCard label="Pass rate" value={data.pass_rate != null ? `${data.pass_rate}%` : '—'} />
        <StatCard label="Avg score" value={data.avg_score_pct != null ? `${data.avg_score_pct}%` : '—'} />
        <StatCard label="Avg time" value={data.avg_duration_seconds != null ? formatDuration(data.avg_duration_seconds) : '—'} />
      </div>

      <div>
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Recent attempts</h2>
        {data.recent.length === 0 && (
          <p className="text-center py-12 text-gray-500 dark:text-gray-400">No exam attempts yet.</p>
        )}
        <div className="space-y-2">
          {data.recent.map(a => (
            <div key={a.id} className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 px-4 py-3 flex items-center gap-3">
              {a.passed
                ? <CheckCircle2 className="text-green-500 flex-shrink-0" size={18} />
                : <XCircle className="text-red-400 flex-shrink-0" size={18} />
              }
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-gray-900 dark:text-white truncate block">{a.user_email}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(a.completed_at)} · {formatDuration(a.duration_seconds)}</span>
              </div>
              <span className={`text-sm font-bold ${a.passed ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                {a.correct}/{a.total} ({Math.round(a.correct / a.total * 100)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Resit claims tab ──────────────────────────────────────────────────────
function ResitTab() {
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [claims, setClaims] = useState<ResitClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acting, setActing] = useState<string | null>(null);
  const [rejectNotes, setRejectNotes] = useState<Record<string, string>>({});
  const [showReject, setShowReject] = useState<string | null>(null);

  function load(s: typeof status) {
    setStatus(s);
    setLoading(true);
    setError(null);
    fetchResitClaims(s)
      .then(setClaims)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load('pending'); }, []);

  async function handleApprove(claim: ResitClaim) {
    setActing(claim.id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { stripeExtended } = await approveResitClaim(claim.id, session!.access_token);
      setClaims(prev => prev.filter(c => c.id !== claim.id));
      if (!stripeExtended) {
        alert(`Approved, but no active Stripe subscription found for this user — you'll need to extend manually.`);
      }
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    } finally {
      setActing(null);
    }
  }

  async function handleReject(claim: ResitClaim) {
    setActing(claim.id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await rejectResitClaim(claim.id, session!.access_token, rejectNotes[claim.id]);
      setClaims(prev => prev.filter(c => c.id !== claim.id));
      setShowReject(null);
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    } finally {
      setActing(null);
    }
  }

  const FILTERS: { label: string; value: typeof status }[] = [
    { label: 'Pending', value: 'pending' },
    { label: 'Approved', value: 'approved' },
    { label: 'Rejected', value: 'rejected' },
    { label: 'All', value: 'all' },
  ];

  const STATUS_CHIP: Record<string, string> = {
    pending:  'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    approved: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => load(f.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              status === f.value
                ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading && <Spinner />}
      {error && <ErrorMsg msg={error} />}
      {!loading && !error && claims.length === 0 && (
        <p className="py-12 text-center text-gray-500 dark:text-gray-400">No {status === 'all' ? '' : status} claims.</p>
      )}

      <div className="space-y-3">
        {claims.map(claim => (
          <div key={claim.id} className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 p-5 space-y-3">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">
                  {claim.user_email ?? claim.user_id}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Submitted {timeAgo(claim.created_at)}
                  {claim.reviewed_at && ` · Reviewed ${timeAgo(claim.reviewed_at)}`}
                </p>
              </div>
              <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${STATUS_CHIP[claim.status]}`}>
                {claim.status}
              </span>
            </div>

            {claim.admin_notes && (
              <p className="text-xs text-gray-600 dark:text-gray-400 italic">{claim.admin_notes}</p>
            )}

            <div className="flex items-center gap-3 flex-wrap">
              <a
                href={getEvidenceUrl(claim.evidence_path)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <ExternalLink size={12} />
                View evidence
              </a>

              {claim.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleApprove(claim)}
                    disabled={!!acting}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    {acting === claim.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                    Approve (+30 days)
                  </button>

                  {showReject === claim.id ? (
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <input
                        type="text"
                        value={rejectNotes[claim.id] ?? ''}
                        onChange={e => setRejectNotes(prev => ({ ...prev, [claim.id]: e.target.value }))}
                        placeholder="Rejection reason (optional)"
                        className="flex-1 min-w-0 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-xs dark:bg-gray-800 dark:text-white"
                      />
                      <button
                        onClick={() => handleReject(claim)}
                        disabled={!!acting}
                        className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setShowReject(null)}
                        className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowReject(claim.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 dark:border-red-800 px-3 py-1.5 text-xs font-semibold text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <XCircle size={12} />
                      Reject
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div className="flex justify-center py-12">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
    </div>
  );
}

function ErrorMsg({ msg }: { msg: string }) {
  return (
    <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 text-sm text-red-800 dark:text-red-300">
      {msg}
    </div>
  );
}

// ── Main admin page ───────────────────────────────────────────────────────
export default function Admin() {
  usePageTitle('Admin');
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('reports');
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    getCurrentUser().then(user => {
      if (user?.email === ADMIN_EMAIL) {
        setAllowed(true);
      } else {
        navigate('/dashboard', { replace: true });
      }
      setChecking(false);
    });
  }, []);

  if (checking) return (
    <div className="flex justify-center py-24">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
    </div>
  );

  if (!allowed) return null;

  const TABS: { id: Tab; label: string; icon: typeof Users }[] = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'reports',  label: 'Reports',  icon: Flag },
    { id: 'users',    label: 'Users',    icon: Users },
    { id: 'exams',    label: 'Exams',    icon: Trophy },
    { id: 'resit',    label: 'Resit',    icon: FileCheck },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900 dark:bg-gray-100">
          <Shield className="text-white dark:text-gray-900" size={20} />
        </div>
        <div>
          <h1 className="font-semibold text-gray-900 dark:text-white">Haven Admin</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">{ADMIN_EMAIL}</p>
        </div>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 rounded-xl bg-gray-100 dark:bg-gray-800 p-1">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
                tab === t.id
                  ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon size={15} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {tab === 'overview' && <OverviewTab />}
      {tab === 'reports'  && <ReportsTab />}
      {tab === 'users'    && <UsersTab />}
      {tab === 'exams'    && <ExamsTab />}
      {tab === 'resit'    && <ResitTab />}
    </div>
  );
}
