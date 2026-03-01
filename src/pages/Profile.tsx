import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, BadgeCheck, CheckCircle2, XCircle, AlertCircle, ArrowRight, CreditCard, Loader2, Award, Upload, KeyRound, Eye, EyeOff } from 'lucide-react';
import { getCurrentUser } from '../lib/auth';
import { updateDisplayName } from '../lib/auth';
import { useSubscription } from '../lib/subscription';
import { supabase } from '../lib/supabase';
import { usePageTitle } from '../hooks/usePageTitle';

// ── Resit Support ─────────────────────────────────────────────────────────

// 24 = 29 total lessons minus 5 chapter intros that have no practice questions
const LESSONS_REQUIRED = 24;
const SCORE_REQUIRED = 75;

type EligibilityStats = {
  lessonsCompleted: number;
  avgScore: number;
  examsPassed: number;
};

function EligRow({ passed, label, value, hint }: {
  passed: boolean; label: string; value: string; hint?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      {passed
        ? <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
        : <XCircle className="h-4 w-4 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
      }
      <div className="flex-1 min-w-0">
        <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
        <span className={`ml-2 text-sm font-semibold ${passed ? 'text-green-700 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          {value}
        </span>
        {hint && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{hint}</p>}
      </div>
    </div>
  );
}

function ResitSupportSection({ userId, userEmail }: { userId: string; userEmail: string }) {
  const [claim, setClaim] = useState<{ status: string; admin_notes: string | null } | null | 'loading'>('loading');
  const [eligibility, setEligibility] = useState<EligibilityStats | null>(null);
  const [eligLoading, setEligLoading] = useState(true);
  const [confirmedDate, setConfirmedDate] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitDone, setSubmitDone] = useState(false);

  useEffect(() => {
    // Existing claim
    supabase
      .from('resit_claims')
      .select('status, admin_notes')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .then(({ data }) => setClaim(data?.[0] ?? null));

    // Eligibility stats — both queries in parallel
    Promise.all([
      supabase.from('user_progress').select('completed, score, attempts').eq('user_id', userId),
      supabase.from('exam_attempts').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('passed', true),
    ]).then(([progressResult, examsResult]) => {
      const rows = progressResult.data ?? [];
      const lessonsCompleted = rows.filter(r => r.completed).length;
      const attempted = rows.filter(r => (r.attempts ?? 0) > 0);
      const avgScore = attempted.length > 0
        ? Math.round(attempted.reduce((s, r) => s + (r.score ?? 0), 0) / attempted.length)
        : 0;
      setEligibility({ lessonsCompleted, avgScore, examsPassed: examsResult.count ?? 0 });
      setEligLoading(false);
    });
  }, [userId]);

  const eligible = eligibility
    ? eligibility.lessonsCompleted >= LESSONS_REQUIRED
      && eligibility.avgScore >= SCORE_REQUIRED
      && eligibility.examsPassed >= 1
    : false;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !confirmedDate || !eligible) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const ext = file.name.split('.').pop() ?? 'jpg';
      const path = `${userId}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('resit-evidence')
        .upload(path, file, { contentType: file.type });
      if (uploadError) throw new Error(uploadError.message);

      const { error: insertError } = await supabase.from('resit_claims').insert({
        user_id: userId,
        user_email: userEmail,
        evidence_path: path,
        status: 'pending',
      });
      if (insertError) {
        if (insertError.code === '23505') throw new Error('You already have a claim under review. Please wait for it to be processed.');
        throw new Error(insertError.message);
      }

      setClaim({ status: 'pending', admin_notes: null });
      setSubmitDone(true);
    } catch (err: any) {
      setSubmitError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (claim === 'loading') return null;

  const STATUS_STYLES: Record<string, string> = {
    pending:  'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/10',
    approved: 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/10',
    rejected: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/10',
  };
  const STATUS_TEXT: Record<string, string> = {
    pending:  "Your application is under review. We'll process it within 2 business days.",
    approved: 'Approved! 30 days have been added before your next billing date — no action needed.',
    rejected: 'Unfortunately your application was not approved. You may resubmit with updated evidence below.',
  };

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 dark:border-amber-800/50 dark:bg-amber-900/10 p-6 space-y-5">
      <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
        <Award className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        Resit Support
      </h2>

      <p className="text-sm text-gray-700 dark:text-gray-300">
        If you studied with Haven and still didn't pass, we'll add <strong>30 days</strong> before
        your next billing date at no charge — works for both Plus and Premium plans.
      </p>

      {/* Existing claim status */}
      {claim && (
        <div className={`rounded-xl border p-4 text-sm ${STATUS_STYLES[claim.status] ?? ''}`}>
          <p className="font-semibold text-gray-900 dark:text-white capitalize mb-1">
            Status: {claim.status}
          </p>
          <p className="text-gray-700 dark:text-gray-300">{STATUS_TEXT[claim.status]}</p>
          {claim.admin_notes && claim.status === 'rejected' && (
            <p className="mt-2 text-gray-600 dark:text-gray-400 italic">{claim.admin_notes}</p>
          )}
        </div>
      )}

      {/* Eligibility + form — hidden while pending/approved; shown again after rejection */}
      {(!claim || claim.status === 'rejected') && (
        <>
          {/* Live eligibility check */}
          <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900 p-4 space-y-2.5">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
              Your eligibility
            </p>
            {eligLoading ? (
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                Checking your progress…
              </div>
            ) : eligibility && (
              <div className="space-y-2">
                <EligRow
                  passed={eligibility.lessonsCompleted >= LESSONS_REQUIRED}
                  label="Lessons completed"
                  value={`${eligibility.lessonsCompleted} / ${LESSONS_REQUIRED}`}
                  hint={eligibility.lessonsCompleted < LESSONS_REQUIRED
                    ? `Complete ${LESSONS_REQUIRED - eligibility.lessonsCompleted} more lesson${LESSONS_REQUIRED - eligibility.lessonsCompleted !== 1 ? 's' : ''}`
                    : undefined}
                />
                <EligRow
                  passed={eligibility.avgScore >= SCORE_REQUIRED}
                  label="Average practice score"
                  value={`${eligibility.avgScore}%`}
                  hint={eligibility.avgScore < SCORE_REQUIRED ? `Need ${SCORE_REQUIRED}% — keep practising` : undefined}
                />
                <EligRow
                  passed={eligibility.examsPassed >= 1}
                  label="Mock exam passed"
                  value={eligibility.examsPassed > 0 ? `${eligibility.examsPassed} passed` : 'None yet'}
                  hint={eligibility.examsPassed < 1 ? 'Pass at least one mock exam first' : undefined}
                />
              </div>
            )}
          </div>

          {!eligLoading && !eligible && (
            <p className="text-sm text-amber-800 dark:text-amber-300">
              Complete all three requirements above before applying.
            </p>
          )}

          {/* Application form — only unlocked when eligible */}
          {!eligLoading && eligible && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmedDate}
                  onChange={e => setConfirmedDate(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  My Life in the UK test was taken within the last 14 days and I did not pass
                </span>
              </label>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900 dark:text-white">
                  Upload your test result (letter or screenshot)
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">JPG, PNG, WEBP or PDF · max 10 MB</p>
                <label className={`flex items-center gap-3 rounded-xl border-2 border-dashed px-4 py-5 cursor-pointer transition-colors ${
                  file
                    ? 'border-teal-400 bg-teal-50 dark:border-teal-600 dark:bg-teal-900/20'
                    : 'border-gray-300 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-600'
                }`}>
                  <Upload className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {file ? file.name : 'Click to choose a file'}
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/heic,application/pdf"
                    className="sr-only"
                    onChange={e => setFile(e.target.files?.[0] ?? null)}
                  />
                </label>
              </div>

              {submitError && (
                <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {submitError}
                </div>
              )}

              <button
                type="submit"
                disabled={!confirmedDate || !file || submitting}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-6 py-3 font-semibold text-white transition-all hover:bg-amber-700 disabled:opacity-40"
              >
                {submitting
                  ? <><Loader2 className="h-4 w-4 animate-spin" />Submitting…</>
                  : <><Award className="h-4 w-4" />Submit Application</>
                }
              </button>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                We review applications within 2 business days. If approved, 30 days will be added
                before your next billing date automatically — no action needed from you.
              </p>
            </form>
          )}

          {submitDone && (
            <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              Application submitted! We'll review it within 2 business days.
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Main profile page ─────────────────────────────────────────────────────

const TIER_LABELS: Record<string, string> = {
  free: 'Free',
  plus: 'Haven Plus',
  premium: 'Haven Premium',
};

const TIER_COLORS: Record<string, string> = {
  free: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  plus: 'bg-emerald-100 text-emerald-700',
  premium: 'bg-amber-100 text-amber-700',
};

export default function Profile() {
  usePageTitle('Profile', 'Manage your Haven Study account, subscription, and personal details.');
  const [user, setUser] = useState<any>(null);
  const { tier } = useSubscription();
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState('');

  useEffect(() => {
    getCurrentUser().then(u => {
      if (u) {
        setUser(u);
        setName(u.user_metadata?.full_name || '');
      }
    });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      await updateDisplayName(name.trim());
      // Refresh user so navbar picks up the new name on next load
      const updated = await getCurrentUser();
      setUser(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save name');
    } finally {
      setSaving(false);
    }
  }

  // ── Change password ──────────────────────────────────────────────────────
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const passwordRules = [
    { label: 'At least 10 characters', ok: newPassword.length >= 10 },
    { label: 'One uppercase letter', ok: /[A-Z]/.test(newPassword) },
    { label: 'One lowercase letter', ok: /[a-z]/.test(newPassword) },
    { label: 'One number', ok: /[0-9]/.test(newPassword) },
  ];
  const passwordValid = passwordRules.every(r => r.ok);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError('');
    if (!passwordValid) {
      setPasswordTouched(true);
      setPasswordError('Please meet all password requirements.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }
    setPasswordSaving(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) throw updateError;
      setPasswordSaved(true);
      setNewPassword('');
      setConfirmPassword('');
      setPasswordTouched(false);
      setTimeout(() => setPasswordSaved(false), 3000);
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to update password.');
    } finally {
      setPasswordSaving(false);
    }
  }

  async function handleManageSubscription() {
    setPortalLoading(true);
    setPortalError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Not authenticated');

      const res = await fetch('/.netlify/functions/create-portal-session', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to open billing portal');
      }

      const { url } = await res.json();
      window.location.href = url;
    } catch (err: any) {
      setPortalError(err.message || 'Something went wrong. Please try again.');
      setPortalLoading(false);
    }
  }

  const initials = name.trim()
    ? name.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? '?';

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-10">
      <h1 className="font-semibold text-gray-900 dark:text-white">Profile</h1>

      {/* Avatar + name */}
      <div className="flex items-center gap-5">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 text-xl font-bold text-white">
          {initials}
        </div>
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">
            {user?.user_metadata?.full_name || 'No name set'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
        </div>
      </div>

      {/* Edit name */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-5 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <User className="h-5 w-5 text-teal-600" />
          Display Name
        </h2>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              First name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your first name"
              className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-gray-900 focus:border-teal-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              This is how we'll greet you in the app.
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {saved && (
            <div className="flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              Name updated!
            </div>
          )}

          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="rounded-xl bg-teal-600 px-6 py-3 font-semibold text-white transition-all hover:bg-teal-700 disabled:opacity-40"
          >
            {saving ? 'Saving…' : 'Save Name'}
          </button>
        </form>
      </div>

      {/* Change password */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-5 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-teal-600" />
          Change Password
        </h2>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              New password
            </label>
            <div className="relative">
              <input
                id="new-password"
                type={showNewPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={newPassword}
                onChange={e => { setNewPassword(e.target.value); setPasswordTouched(true); }}
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 pr-11 text-gray-900 focus:border-teal-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                aria-label={showNewPassword ? 'Hide password' : 'Show password'}
              >
                {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {passwordTouched && (
              <ul className="mt-2 space-y-1">
                {passwordRules.map(r => (
                  <li key={r.label} className={`flex items-center gap-2 text-xs font-medium ${r.ok ? 'text-teal-600' : 'text-red-500'}`}>
                    <span>{r.ok ? '✓' : '✗'}</span>
                    {r.label}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Confirm new password
            </label>
            <div className="relative">
              <input
                id="confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 pr-11 text-gray-900 focus:border-teal-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {passwordError && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {passwordError}
            </div>
          )}

          {passwordSaved && (
            <div className="flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              Password updated!
            </div>
          )}

          <button
            type="submit"
            disabled={passwordSaving || !newPassword}
            className="rounded-xl bg-teal-600 px-6 py-3 font-semibold text-white transition-all hover:bg-teal-700 disabled:opacity-40"
          >
            {passwordSaving ? 'Saving…' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* Account info */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-4 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Mail className="h-5 w-5 text-teal-600" />
          Account
        </h2>

        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Email</span>
            <span className="font-medium text-gray-900 dark:text-white">{user?.email}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Plan</span>
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${TIER_COLORS[tier] ?? TIER_COLORS.free}`}>
                {TIER_LABELS[tier] ?? 'Free'}
              </span>
              {tier === 'free' && (
                <Link
                  to="/paywall"
                  className="flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400"
                >
                  Upgrade <ArrowRight className="h-3 w-3" />
                </Link>
              )}
            </div>
          </div>
          {user?.email_confirmed_at && (
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Email verified</span>
              <span className="flex items-center gap-1 text-xs font-semibold text-green-700 dark:text-green-400">
                <BadgeCheck className="h-4 w-4" /> Verified
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Resit Support — only for paying users */}
      {(tier === 'plus' || tier === 'premium') && user && (
        <ResitSupportSection userId={user.id} userEmail={user.email} />
      )}

      {/* Manage subscription — only for paying users */}
      {(tier === 'plus' || tier === 'premium') && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-4 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-teal-600" />
            Subscription
          </h2>

          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage your billing, download invoices, or cancel your subscription via the Stripe customer portal.
          </p>

          {portalError && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {portalError}
            </div>
          )}

          <button
            onClick={handleManageSubscription}
            disabled={portalLoading}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-3 font-semibold text-white transition-all hover:bg-teal-700 disabled:opacity-40"
          >
            {portalLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Opening portal…
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4" />
                Manage Subscription
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
