import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, BadgeCheck, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { getCurrentUser } from '../lib/auth';
import { updateDisplayName } from '../lib/auth';
import { useSubscription } from '../lib/subscription';

const TIER_LABELS: Record<string, string> = {
  free: 'Free',
  plus: 'HavenReady Plus',
  premium: 'HavenReady Premium',
};

const TIER_COLORS: Record<string, string> = {
  free: 'bg-gray-100 text-gray-700',
  plus: 'bg-emerald-100 text-emerald-700',
  premium: 'bg-amber-100 text-amber-700',
};

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const { tier } = useSubscription();
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

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
    </div>
  );
}
