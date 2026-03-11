import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  BookOpen,
  Sparkles,
  Crown,
  CheckCircle2,
  ArrowRight,
  Award,
  Loader2,
  Tag,
  Clock,
  Calendar,
  Brain,
  BarChart3,
  Bell,
  Smartphone,
} from 'lucide-react';
import { useSubscription } from '../lib/subscription';
import { useEffect, useState } from 'react';
import { getCurrentUser } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { usePageTitle } from '../hooks/usePageTitle';

type Plan = 'plus_1m' | 'plus_3m' | 'premium_6m';

const PLAN_PRICES: Record<Plan, number> = {
  plus_1m: 4.99,
  plus_3m: 9.99,
  premium_6m: 24.99,
};

function formatExpiry(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function Paywall() {
  usePageTitle('Pricing', 'Choose your Haven Study access pass. Pay once, study at your own pace. No recurring billing.');
  const navigate = useNavigate();
  const location = useLocation();
  const { tier, hasPlus, accessExpiresAt, isLoading } = useSubscription();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingOut, setCheckingOut] = useState<Plan | null>(null);
  const [checkoutError, setCheckoutError] = useState('');
  const [sale, setSale] = useState<{ active: boolean; discount: number } | null>(null);

  useEffect(() => {
    getCurrentUser().then(u => setIsLoggedIn(!!u));
  }, []);

  useEffect(() => {
    supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'sale')
      .single()
      .then(({ data }) => {
        if (data?.value) setSale(data.value as { active: boolean; discount: number });
      });
  }, []);

  // Handle ?checkout=plus_1m|plus_3m after signup redirect
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const checkoutPlan = params.get('checkout') as Plan | null;
    if (checkoutPlan && (checkoutPlan === 'plus_1m' || checkoutPlan === 'plus_3m')) {
      getCurrentUser().then(u => {
        if (u) {
          handleSelectPlan(checkoutPlan, u);
        }
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSelectPlan(plan: Plan, overrideUser?: any) {
    const user = overrideUser ?? (await getCurrentUser());

    if (!user) {
      navigate(`/signup?plan=${plan}`);
      return;
    }

    setCheckingOut(plan);
    setCheckoutError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/.netlify/functions/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ plan }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Checkout failed');
      }

      const { url } = await res.json();
      window.location.href = url;
    } catch (err: any) {
      setCheckoutError(err.message || 'Something went wrong. Please try again.');
      setCheckingOut(null);
    }
  }

  function salePrice(basePrice: number): number {
    if (!sale?.active) return basePrice;
    return Math.round(basePrice * (1 - sale.discount / 100) * 100) / 100;
  }

  function ctaLabel(plan: Plan) {
    if (isLoading) return 'Loading...';
    if (checkingOut === plan) return 'Redirecting...';
    if (plan === 'plus_1m') return hasPlus ? 'Extend by 1 Month' : 'Get 1 Month';
    if (plan === 'plus_3m') return hasPlus ? 'Extend by 3 Months' : 'Get 3 Months';
    return hasPlus ? 'Extend by 6 Months' : 'Get Premium';
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 py-16 px-4">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-teal-100 dark:bg-teal-900/40 px-4 py-2 text-sm font-semibold text-teal-700 dark:text-teal-300">
            <Sparkles className="h-4 w-4" />
            Simple, honest pricing
          </div>
          <h1 className="mb-4 font-semibold text-slate-900 dark:text-white">
            Pay once. Study until you're ready.
          </h1>
          <p className="mx-auto max-w-xl text-slate-600 dark:text-slate-300">
            No recurring payments. No cancellation reminders. Access lasts for as long as your pass covers. Extend whenever you need more time.
          </p>
        </div>

        {/* Active access notice */}
        {!isLoading && hasPlus && accessExpiresAt && (
          <div className="mb-8 flex items-center gap-3 rounded-2xl border border-teal-200 dark:border-teal-700 bg-teal-50 dark:bg-teal-900/20 px-6 py-4">
            <Calendar className="text-teal-600 dark:text-teal-400 flex-shrink-0" size={20} />
            <p className="text-teal-900 dark:text-teal-200">
              <span className="font-semibold">Your access is active until {formatExpiry(accessExpiresAt)}.</span>
              {' '}Need more time? Extend below and it will be added to your existing access.
            </p>
          </div>
        )}

        {sale?.active && (
          <div className="mb-8 flex items-center justify-center gap-3 rounded-2xl border border-amber-200 dark:border-amber-700/50 bg-amber-50 dark:bg-amber-900/20 px-6 py-4">
            <Tag className="text-amber-600 dark:text-amber-400 flex-shrink-0" size={20} />
            <p className="font-semibold text-amber-900 dark:text-amber-200">
              Limited time: {sale.discount}% off all plans — discount applied automatically at checkout
            </p>
          </div>
        )}

        {checkoutError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
            {checkoutError}
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Free Plan */}
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl p-6 flex flex-col">
            <div className="text-center mb-5">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-3">
                <BookOpen className="text-slate-600 dark:text-slate-400" size={28} />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Free</h3>
              <div className="flex items-baseline justify-center gap-2 mb-1">
                <span className="text-4xl font-semibold text-slate-900 dark:text-white">£0</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">No credit card. No time limit.</p>
            </div>
            <ul className="space-y-2.5 mb-6 flex-1 text-sm">
              {[
                '3 free modules',
                '252 practice questions',
                'Full flashcards (free modules)',
                'Progress tracking',
              ].map(f => (
                <li key={f} className="flex items-start gap-2">
                  <CheckCircle2 className="text-slate-500 dark:text-slate-400 flex-shrink-0 mt-0.5" size={16} />
                  <span className="text-slate-700 dark:text-slate-200">{f}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => navigate(isLoggedIn ? '/dashboard' : '/signup?plan=free')}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl font-semibold transition-colors mt-auto bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 text-sm"
            >
              Get Started Free
              <ArrowRight size={16} />
            </button>
            <p className="mt-2 text-center text-xs text-slate-400 dark:text-slate-500">No credit card required</p>
          </div>

          {/* Plus 1 Month */}
          <div className="bg-white dark:bg-slate-900 border-2 border-teal-300 dark:border-teal-400/40 rounded-2xl p-6 flex flex-col relative">
            <div className="text-center mb-5">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-teal-100 dark:bg-teal-900/40 rounded-2xl mb-3">
                <Clock className="text-teal-600 dark:text-teal-400" size={28} />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Haven Plus</h3>
              <p className="text-xs font-medium text-teal-600 dark:text-teal-400 mb-2">1 Month Access</p>
              <div className="flex items-baseline justify-center gap-1 mb-1">
                {sale?.active && (
                  <span className="text-xl font-semibold text-slate-400 dark:text-slate-500 line-through">
                    £{PLAN_PRICES.plus_1m.toFixed(2)}
                  </span>
                )}
                <span className="text-4xl font-semibold text-slate-900 dark:text-white">
                  £{salePrice(PLAN_PRICES.plus_1m).toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">one-off · ~£1.25/week</p>
            </div>
            <ul className="space-y-2.5 mb-6 flex-1 text-sm">
              {[
                'All 29 lessons',
                '500+ practice questions',
                'All flashcards',
                'Full mock exams',
                'Progress tracking',
                'Resit Support',
              ].map(f => (
                <li key={f} className="flex items-start gap-2">
                  <CheckCircle2 className="text-teal-600 dark:text-teal-400 flex-shrink-0 mt-0.5" size={16} />
                  {f === 'Resit Support' ? (
                    <span className="text-slate-700 dark:text-slate-200">
                      <a href="#resit-support" className="text-teal-700 underline dark:text-teal-300">Resit Support</a>
                    </span>
                  ) : (
                    <span className="text-slate-700 dark:text-slate-200">{f}</span>
                  )}
                </li>
              ))}
            </ul>
            <button
              onClick={() => !checkingOut && handleSelectPlan('plus_1m')}
              disabled={isLoading || !!checkingOut}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl font-semibold transition-colors mt-auto bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-70 text-sm"
            >
              {checkingOut === 'plus_1m' && <Loader2 className="animate-spin" size={16} />}
              {ctaLabel('plus_1m')}
              {checkingOut !== 'plus_1m' && !isLoading && <ArrowRight size={16} />}
            </button>
            <p className="mt-2 text-center text-xs text-slate-400 dark:text-slate-500">Expires after 30 days. No auto-renewal.</p>
          </div>

          {/* Plus 3 Months */}
          <div className="bg-white dark:bg-slate-900 border-2 border-teal-500 dark:border-teal-300/60 rounded-2xl p-6 flex flex-col relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-teal-700 text-white text-xs font-semibold rounded-full whitespace-nowrap">
              MOST POPULAR
            </div>
            <div className="text-center mb-5">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-teal-100 dark:bg-teal-900/40 rounded-2xl mb-3">
                <Sparkles className="text-teal-600 dark:text-teal-400" size={28} />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Haven Plus</h3>
              <p className="text-xs font-medium text-teal-600 dark:text-teal-400 mb-2">3 Months Access</p>
              <div className="flex items-baseline justify-center gap-1 mb-1">
                {sale?.active && (
                  <span className="text-xl font-semibold text-slate-400 dark:text-slate-500 line-through">
                    £{PLAN_PRICES.plus_3m.toFixed(2)}
                  </span>
                )}
                <span className="text-4xl font-semibold text-slate-900 dark:text-white">
                  £{salePrice(PLAN_PRICES.plus_3m).toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">one-off · under £0.80/week</p>
              <p className="mt-0.5 text-xs font-medium text-teal-600 dark:text-teal-400">Save £4.98 vs monthly</p>
            </div>
            <ul className="space-y-2.5 mb-6 flex-1 text-sm">
              {[
                'All 29 lessons',
                '500+ practice questions',
                'All flashcards',
                'Full mock exams',
                'Progress tracking',
                'Resit Support',
              ].map(f => (
                <li key={f} className="flex items-start gap-2">
                  <CheckCircle2 className="text-teal-600 dark:text-teal-400 flex-shrink-0 mt-0.5" size={16} />
                  {f === 'Resit Support' ? (
                    <span className="text-slate-700 dark:text-slate-200">
                      <a href="#resit-support" className="text-teal-700 underline dark:text-teal-300">Resit Support</a>
                    </span>
                  ) : (
                    <span className="text-slate-700 dark:text-slate-200">{f}</span>
                  )}
                </li>
              ))}
            </ul>
            <button
              onClick={() => !checkingOut && handleSelectPlan('plus_3m')}
              disabled={isLoading || !!checkingOut}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl font-semibold transition-colors mt-auto bg-teal-700 text-white hover:bg-teal-800 disabled:opacity-70 text-sm"
            >
              {checkingOut === 'plus_3m' && <Loader2 className="animate-spin" size={16} />}
              {ctaLabel('plus_3m')}
              {checkingOut !== 'plus_3m' && !isLoading && <ArrowRight size={16} />}
            </button>
            <p className="mt-2 text-center text-xs text-slate-400 dark:text-slate-500">Expires after 90 days. No auto-renewal.</p>
          </div>

          {/* Premium 6 Months */}
          <div className="bg-white dark:bg-slate-900 border-2 border-amber-300 dark:border-amber-300/50 rounded-2xl p-6 flex flex-col relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold rounded-full whitespace-nowrap">
              ALL FEATURES
            </div>
            <div className="text-center mb-5">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-amber-100 dark:bg-amber-900/30 rounded-2xl mb-3">
                <Crown className="text-amber-600 dark:text-amber-400" size={28} />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Haven Premium</h3>
              <p className="text-xs font-medium text-amber-600 dark:text-amber-400 mb-2">6 Months Access</p>
              <div className="flex items-baseline justify-center gap-1 mb-1">
                {sale?.active && (
                  <span className="text-xl font-semibold text-slate-400 dark:text-slate-500 line-through">
                    £{PLAN_PRICES.premium_6m.toFixed(2)}
                  </span>
                )}
                <span className="text-4xl font-semibold text-slate-900 dark:text-white">
                  £{salePrice(PLAN_PRICES.premium_6m).toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">one-off · under £1/week</p>
            </div>
            <ul className="space-y-2.5 mb-6 flex-1 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="text-amber-500 flex-shrink-0 mt-0.5" size={16} />
                <span className="text-slate-700 dark:text-slate-200 font-medium">Everything in Plus, and:</span>
              </li>
              {[
                { icon: Brain, label: 'Pippa AI study assistant' },
                { icon: BarChart3, label: 'Performance analytics' },
                { icon: Sparkles, label: 'Unlimited dynamic exams' },
                { icon: Bell, label: 'Exam date reminders' },
                { icon: Smartphone, label: 'Offline mobile access' },
              ].map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-start gap-2">
                  <Icon className="text-amber-500 flex-shrink-0 mt-0.5" size={16} />
                  <span className="text-slate-700 dark:text-slate-200">{label}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => !checkingOut && handleSelectPlan('premium_6m')}
              disabled={isLoading || !!checkingOut}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl font-semibold transition-all mt-auto bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 disabled:opacity-70 text-sm"
            >
              {checkingOut === 'premium_6m' && <Loader2 className="animate-spin" size={16} />}
              {ctaLabel('premium_6m')}
              {checkingOut !== 'premium_6m' && !isLoading && <ArrowRight size={16} />}
            </button>
            <p className="mt-2 text-center text-xs text-slate-400 dark:text-slate-500">Expires after 180 days. No auto-renewal.</p>
          </div>
        </div>

        {/* What's included free */}
        <div className="mt-12 rounded-3xl border border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-900/20 p-8">
          <h3 className="mb-1 font-semibold text-slate-900 dark:text-white text-center">What you get for free</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-6">No credit card. No time limit.</p>
          <div className="grid gap-4 sm:grid-cols-3 text-center">
            <div>
              <div className="text-3xl font-bold text-teal-600 dark:text-teal-400">3</div>
              <div className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-300">full modules</div>
              <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Values, What is the UK, Arts and Society</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-teal-600 dark:text-teal-400">252</div>
              <div className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-300">practice questions</div>
              <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">with answer explanations</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-teal-600 dark:text-teal-400">247</div>
              <div className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-300">flashcards</div>
              <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">full deck, not a sample</div>
            </div>
          </div>
        </div>

        {/* Resit Support section */}
        <div id="resit-support" className="mt-8 rounded-2xl border-2 border-amber-200 dark:border-amber-700/50 bg-amber-50 dark:bg-amber-900/10 p-8 md:p-10">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            <div className="flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900/40">
              <Award className="text-amber-600 dark:text-amber-400" size={28} />
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Resit Support</h3>
                <p className="text-slate-700 dark:text-slate-300">
                  If you genuinely prepare with Haven and still don't pass, we'll add <strong>30 days of free access</strong> so you can keep studying and book a resit, at no extra charge.
                </p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white mb-2">To qualify, you must have:</p>
                  <ul className="space-y-1.5 text-sm text-slate-700 dark:text-slate-300">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="text-amber-500 flex-shrink-0 mt-0.5" size={15} />
                      Completed all 29 lessons
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="text-amber-500 flex-shrink-0 mt-0.5" size={15} />
                      Scored 75%+ on practice questions
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="text-amber-500 flex-shrink-0 mt-0.5" size={15} />
                      Passed at least one mock exam
                    </li>
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white mb-2">How to claim:</p>
                  <ul className="space-y-1.5 text-sm text-slate-700 dark:text-slate-300">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="text-amber-500 flex-shrink-0 mt-0.5" size={15} />
                      Email us your test result
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="text-amber-500 flex-shrink-0 mt-0.5" size={15} />
                      Within 14 days of your test date
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="text-amber-500 flex-shrink-0 mt-0.5" size={15} />
                      We'll add 30 days to your access
                    </li>
                  </ul>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Available on all paid plans. Does not cover the cost of rebooking your test.
              </p>
            </div>
          </div>
        </div>

        {!isLoggedIn && (
          <div className="mt-12 text-center">
            <p className="text-slate-600 dark:text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300">
                Log in here
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
