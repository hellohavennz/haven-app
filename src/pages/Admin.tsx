import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Flag, Trophy, BarChart3, CheckCircle2, XCircle,
  Clock, TrendingUp, AlertTriangle, RefreshCw, ChevronDown, ChevronUp,
  Calendar, Shield,
} from 'lucide-react';
import { getCurrentUser } from '../lib/auth';
import {
  fetchAdminOverview,
  fetchAdminReports,
  fetchAdminUsers,
  fetchAdminExamStats,
  updateReportStatus,
  type AdminOverview,
  type ContentReport,
  type AdminUser,
  type ExamStats,
} from '../lib/adminApi';

const ADMIN_EMAIL = 'hello.haven.nz@gmail.com';

type Tab = 'overview' | 'reports' | 'users' | 'exams';

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

// ── Mini bar chart ─────────────────────────────────────────────────────────
function MiniBarChart({ data }: { data: { date: string; count: number }[] }) {
  if (!data.length) return <p className="text-sm text-gray-400">No login data yet</p>;
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div className="flex items-end gap-px h-14">
      {data.map(d => (
        <div
          key={d.date}
          className="flex-1 bg-teal-400 dark:bg-teal-500 rounded-sm opacity-70 hover:opacity-100 transition-opacity min-h-px"
          style={{ height: `${Math.max((d.count / max) * 100, 4)}%` }}
          title={`${d.date}: ${d.count} user${d.count !== 1 ? 's' : ''}`}
        />
      ))}
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
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Daily logins — last 30 days</p>
          <MiniBarChart data={data.daily_logins} />
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

  useEffect(() => {
    fetchAdminUsers()
      .then(setUsers)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

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
            return (
              <div key={u.id} className={`rounded-xl border p-4 bg-white dark:bg-gray-900 ${
                eng === 'struggling'
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
                      {eng === 'struggling' && (
                        <span className="flex items-center gap-1 text-xs font-semibold text-red-600 dark:text-red-400">
                          <AlertTriangle size={12} /> Struggling
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right text-xs text-gray-400 dark:text-gray-500 space-y-0.5 flex-shrink-0">
                    {u.exam_date && (
                      <div className="flex items-center gap-1 justify-end text-teal-600 dark:text-teal-400 font-medium">
                        <Calendar size={11} />
                        Test {formatDate(u.exam_date)}
                      </div>
                    )}
                    <div>Joined {timeAgo(u.created_at)}</div>
                    {u.last_sign_in_at && <div>Active {timeAgo(u.last_sign_in_at)}</div>}
                  </div>
                </div>
              </div>
            );
          })}
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
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900 dark:bg-gray-100">
          <Shield className="text-white dark:text-gray-900" size={20} />
        </div>
        <div>
          <h1 className="font-semibold text-gray-900 dark:text-white">HavenReady Admin</h1>
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
    </div>
  );
}
