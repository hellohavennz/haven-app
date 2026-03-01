import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  BookOpen,
  Sparkles,
  Crown,
  CheckCircle2,
  ArrowRight,
  Brain,
  BarChart3,
  Headphones,
  Bell,
  Smartphone,
  Award,
  Loader2,
} from 'lucide-react';
import { useSubscription } from '../lib/subscription';
import { useEffect, useState } from 'react';
import { getCurrentUser } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { usePageTitle } from '../hooks/usePageTitle';

type Plan = 'free' | 'plus' | 'premium';

const PLAN_ORDER: Plan[] = ['free', 'plus', 'premium'];

function isUpgrade(current: Plan, target: Plan) {
  return PLAN_ORDER.indexOf(target) > PLAN_ORDER.indexOf(current);
}

export default function Paywall() {
  usePageTitle('Pricing', 'Choose the Haven Study plan that\'s right for you. Start free or unlock unlimited practice, mock exams, and flashcards with Haven Plus or Premium.');
  const navigate = useNavigate();
  const location = useLocation();
  const { tier: currentTier, isLoading } = useSubscription();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingOut, setCheckingOut] = useState<Plan | null>(null);
  const [checkoutError, setCheckoutError] = useState('');

  useEffect(() => {
    getCurrentUser().then(u => setIsLoggedIn(!!u));
  }, []);

  // Handle ?checkout=plus|premium after signup redirect
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const checkoutPlan = params.get('checkout') as Plan | null;
    if (checkoutPlan && (checkoutPlan === 'plus' || checkoutPlan === 'premium')) {
      getCurrentUser().then(u => {
        if (u) {
          handleSelectPlan(checkoutPlan, u);
        }
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSelectPlan(plan: Plan, overrideUser?: any) {
    if (plan === currentTier) return;

    if (plan === 'free') {
      navigate('/signup?plan=free');
      return;
    }

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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan,
          userId: user.id,
          email: user.email,
          token: session?.access_token,
        }),
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

  const isCurrent = (plan: Plan) => !isLoading && currentTier === plan;
  const canUpgrade = (plan: Plan) => !isLoading && isUpgrade(currentTier, plan);

  function ctaLabel(plan: Plan, label: string) {
    if (isLoading) return 'Loading…';
    if (isCurrent(plan)) return 'Current Plan';
    if (checkingOut === plan) return 'Redirecting…';
    return label;
  }

  function ctaClass(plan: Plan, primary: string) {
    if (isCurrent(plan)) return 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-default';
    if (canUpgrade(plan) || !isLoading) return primary;
    return primary;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 py-16 px-4">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-teal-100 dark:bg-teal-900/40 px-4 py-2 text-sm font-semibold text-teal-700 dark:text-teal-300">
            <Sparkles className="h-4 w-4" />
            Choose Your Plan
          </div>
          <h1 className="mb-4 font-semibold text-gray-900 dark:text-white">
            Pass Your Life in the UK Test
          </h1>
          <p className="mx-auto max-w-2xl text-gray-600 dark:text-gray-300">
            Start free, or unlock full access with a Plus or Premium plan.
          </p>
        </div>

        {checkoutError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
            {checkoutError}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          {/* Free Plan */}
          <div className={`bg-white dark:bg-gray-900 border-2 rounded-2xl p-8 flex flex-col relative ${isCurrent('free') ? 'border-teal-400 ring-4 ring-teal-100 dark:ring-teal-900/40' : 'border-gray-200 dark:border-gray-700'}`}>
            {isCurrent('free') && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-teal-700 text-white text-sm font-semibold rounded-full whitespace-nowrap">
                YOUR PLAN
              </div>
            )}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl mb-4">
                <BookOpen className="text-gray-600 dark:text-gray-400" size={32} />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Free</h3>
              <div className="flex items-baseline justify-center gap-2 mb-1">
                <span className="text-5xl font-semibold text-gray-900 dark:text-white">£0</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">forever</p>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {[
                'First lesson (Values & Principles)',
                '2 free modules',
                'Practice questions (free modules only)',
                'Sample flashcards (5 per lesson)',
              ].map(f => (
                <li key={f} className="flex items-start gap-3">
                  <CheckCircle2 className="text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700 dark:text-gray-200">{f}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => !isCurrent('free') && handleSelectPlan('free')}
              disabled={isCurrent('free') || isLoading}
              className={`flex items-center justify-center gap-2 w-full px-8 py-4 rounded-xl font-semibold transition-colors mt-auto ${ctaClass('free', 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200')}`}
            >
              {ctaLabel('free', 'Get Started Free')}
              {!isCurrent('free') && !isLoading && <ArrowRight size={18} />}
            </button>
            <p className="mt-3 text-center text-xs text-gray-400 dark:text-gray-500">No credit card required</p>
          </div>

          {/* Haven Plus */}
          <div className={`bg-white dark:bg-gray-900 border-2 rounded-2xl p-8 flex flex-col relative ${isCurrent('plus') ? 'border-teal-400 ring-4 ring-teal-100 dark:ring-teal-900/40' : 'border-teal-300 dark:border-teal-400/40'}`}>
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-teal-700 text-white text-sm font-semibold rounded-full whitespace-nowrap">
              {isCurrent('plus') ? 'YOUR PLAN' : 'MOST POPULAR'}
            </div>
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 dark:bg-teal-900/40 rounded-2xl mb-4">
                <Sparkles className="text-teal-600 dark:text-teal-400" size={32} />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Haven Plus</h3>
              <div className="flex items-baseline justify-center gap-1.5 mb-1">
                <span className="text-5xl font-semibold text-gray-900 dark:text-white">£4.99</span>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">/month</span>
              </div>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {[
                'All 29 comprehensive lessons',
                '500+ practice questions',
                'All flashcards for every lesson',
                '2 mock exams per month',
                'Progress tracking',
                'Resit Support — 1 free month if you fail',
              ].map(f => (
                <li key={f} className="flex items-start gap-3">
                  <CheckCircle2 className="text-teal-600 dark:text-teal-400 flex-shrink-0 mt-0.5" size={20} />
                  {f.startsWith('Resit Support') ? (
                    <span className="text-gray-700 dark:text-gray-200">
                      <a href="#resit-support" className="text-teal-700 underline dark:text-teal-300">Resit Support</a>
                      {' — 1 free month if you fail'}
                    </span>
                  ) : (
                    <span className="text-gray-700 dark:text-gray-200">{f}</span>
                  )}
                </li>
              ))}
            </ul>
            <button
              onClick={() => !isCurrent('plus') && !checkingOut && handleSelectPlan('plus')}
              disabled={isCurrent('plus') || isLoading || !!checkingOut}
              className={`flex items-center justify-center gap-2 w-full px-8 py-4 rounded-xl font-semibold transition-colors mt-auto ${ctaClass('plus', 'bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-70')}`}
            >
              {checkingOut === 'plus' && <Loader2 className="animate-spin" size={18} />}
              {ctaLabel('plus', 'Get Plus')}
              {!isCurrent('plus') && !isLoading && checkingOut !== 'plus' && <ArrowRight size={18} />}
            </button>
            <p className="mt-3 text-center text-xs text-gray-400 dark:text-gray-500">Cancel anytime</p>
          </div>

          {/* Haven Premium */}
          <div className={`bg-white dark:bg-gray-900 border-2 rounded-2xl p-8 flex flex-col relative ${isCurrent('premium') ? 'border-amber-400 ring-4 ring-amber-100 dark:ring-amber-900/40' : 'border-amber-300 dark:border-amber-300/50'}`}>
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold rounded-full whitespace-nowrap">
              {isCurrent('premium') ? 'YOUR PLAN' : 'BEST VALUE'}
            </div>
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-2xl mb-4">
                <Crown className="text-amber-600 dark:text-amber-400" size={32} />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Haven Premium</h3>
              <div className="flex items-baseline justify-center gap-1.5 mb-1">
                <span className="text-5xl font-semibold text-gray-900 dark:text-white">£24.99</span>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">/6 months</span>
              </div>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" size={20} />
                <span className="text-gray-900 dark:text-white font-semibold">Everything in Haven Plus, and:</span>
              </li>
              {[
                { Icon: Headphones, title: 'AI study assistant (Pippa)', desc: 'Get instant answers to your questions' },
                { Icon: BarChart3, title: 'Performance analytics', desc: 'Identify weak areas with detailed insights' },
                { Icon: Brain, title: 'Dynamic exams', desc: 'Unlimited randomised practice exams' },
                { Icon: Bell, title: 'Exam reminders', desc: 'Alerts 7 days and 1 day before your test' },
                { Icon: Smartphone, title: 'Install to home screen', desc: 'Works offline — study anywhere, no internet needed' },
              ].map(({ Icon, title, desc }) => (
                <li key={title} className="flex items-start gap-3">
                  <Icon className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <span className="text-gray-900 dark:text-white font-semibold">{title}</span>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{desc}</p>
                  </div>
                </li>
              ))}
            </ul>
            <button
              onClick={() => !isCurrent('premium') && !checkingOut && handleSelectPlan('premium')}
              disabled={isCurrent('premium') || isLoading || !!checkingOut}
              className={`flex items-center justify-center gap-2 w-full px-8 py-4 rounded-xl font-semibold transition-all mt-auto ${ctaClass('premium', 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-lg disabled:opacity-70')}`}
            >
              {checkingOut === 'premium' && <Loader2 className="animate-spin" size={18} />}
              {ctaLabel('premium', 'Get Premium')}
              {!isCurrent('premium') && !isLoading && checkingOut !== 'premium' && <ArrowRight size={18} />}
            </button>
            <p className="mt-3 text-center text-xs text-gray-400 dark:text-gray-500">6-month plan · best value</p>
          </div>
        </div>

        {/* Trust signals */}
        <div className="mt-16 rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 shadow-sm">
          <div className="grid gap-8 md:grid-cols-3 text-center">
            <div>
              <div className="mb-3 text-4xl font-semibold text-teal-600">10,000+</div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Students Passed</div>
            </div>
            <div>
              <div className="mb-3 text-4xl font-semibold text-teal-600">94%</div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">First-Time Pass Rate</div>
            </div>
            <div>
              <div className="mb-3 text-4xl font-semibold text-teal-600">4.9/5</div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Rating</div>
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
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Resit Support</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  If you genuinely prepare with Haven and still don't pass, we'll give you <strong>1 free month</strong> of continued access so you can keep studying and book a resit — at no extra charge.
                </p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">To qualify, you must have:</p>
                  <ul className="space-y-1.5 text-sm text-gray-700 dark:text-gray-300">
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
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">How to claim:</p>
                  <ul className="space-y-1.5 text-sm text-gray-700 dark:text-gray-300">
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
                      We'll add 1 free month to your account
                    </li>
                  </ul>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Available on Plus and Premium plans. Does not cover the cost of rebooking your test.
              </p>
            </div>
          </div>
        </div>

        {!isLoggedIn && (
          <div className="mt-12 text-center">
            <p className="text-gray-600 dark:text-gray-400">
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
