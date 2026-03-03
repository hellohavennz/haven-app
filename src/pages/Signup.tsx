import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { signUp, signInWithGoogle } from "../lib/auth";
import { UserPlus, AlertCircle, CheckCircle2, Zap, Crown, Eye, EyeOff } from "lucide-react";
import { usePageTitle } from '../hooks/usePageTitle';

export default function Signup() {
  usePageTitle('Sign up', 'Create your free Haven Study account and start preparing for the Life in the UK test today.');
  const location = useLocation();
  const navigate = useNavigate();

  // Read plan from URL query parameter (?plan=free) or fallback to location.state
  const searchParams = new URLSearchParams(location.search);
  const planFromQuery = searchParams.get('plan') || (location.state as any)?.selectedPlan || 'free';
  const selectedPlan = planFromQuery;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<'signup' | 'checkout'>('signup');

  const passwordMismatch = confirmPasswordTouched && confirmPassword !== "" && password !== confirmPassword;

  const passwordRules = [
    { label: 'At least 10 characters', ok: password.length >= 10 },
    { label: 'One uppercase letter', ok: /[A-Z]/.test(password) },
    { label: 'One lowercase letter', ok: /[a-z]/.test(password) },
    { label: 'One number', ok: /[0-9]/.test(password) },
    { label: 'One special character', ok: /[!@#$%^&*()\-_+=[\]{};':"\\|<>?,./`~]/.test(password) },
  ];
  const passwordValid = passwordRules.every(r => r.ok);

  const planDetails = {
    free: {
      name: 'Free',
      price: '£0',
      icon: UserPlus,
      color: 'gray'
    },
    plus: {
      name: 'Haven Plus',
      price: '£4.99',
      icon: Zap,
      color: 'teal'
    },
    premium: {
      name: 'Haven Premium',
      price: '£24.99',
      icon: Crown,
      color: 'amber'
    }
  };

  const plan = planDetails[selectedPlan as keyof typeof planDetails] || planDetails.free;
  const PlanIcon = plan.icon;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setLoadingStep('signup');

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      setLoading(false);
      return;
    }

    if (!passwordValid) {
      setError("Please meet all password requirements.");
      setPasswordTouched(true);
      setLoading(false);
      return;
    }

    try {
      const data = await signUp(email, password, name.trim() || undefined);

      const accessToken = data.session?.access_token;

      // Fire-and-forget welcome email
      if (accessToken) {
        fetch('/.netlify/functions/send-welcome-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
          body: JSON.stringify({ email, name: name.trim() || undefined }),
        }).catch(() => {});
      }

      if ((selectedPlan === 'plus' || selectedPlan === 'premium') && data.user && accessToken) {
        // Go straight to Stripe — skip the paywall detour
        setLoadingStep('checkout');
        const res = await fetch('/.netlify/functions/create-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
          body: JSON.stringify({ plan: selectedPlan }),
        });
        if (!res.ok) throw new Error((await res.text()) || 'Checkout setup failed');
        const { url } = await res.json();
        window.location.href = url;
        // Don't setLoading(false) — we're navigating away
      } else {
        setSuccess(true);
        setTimeout(() => navigate('/dashboard'), 2000);
      }
    } catch (err: any) {
      setError(err.message || "Failed to sign up");
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError("");
      // Persist plan across the OAuth full-page redirect so Dashboard can
      // trigger checkout after the user returns.
      if (selectedPlan === 'plus' || selectedPlan === 'premium') {
        localStorage.setItem('pending_checkout_plan', selectedPlan);
      }
      await signInWithGoogle();
    } catch (err: any) {
      localStorage.removeItem('pending_checkout_plan');
      setError(err.message || "Failed to sign in with Google");
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
            <CheckCircle2 className="text-green-600 dark:text-green-400" size={48} />
          </div>
          <h2 className="font-semibold text-slate-900 dark:text-white">Account created!</h2>
          <p className="text-slate-600 dark:text-slate-300">Check your email to verify your account, then you can start learning.</p>
          <p className="text-sm text-slate-400 dark:text-slate-500">Can't see it? Check your spam or junk folder.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 dark:bg-teal-900/40 rounded-2xl mb-4">
            <UserPlus className="text-teal-600 dark:text-teal-400" size={32} />
          </div>
          <h2 className="font-semibold text-slate-900 dark:text-white">Create your account</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-300">Start your journey to passing the test</p>

          <div className={`mt-6 inline-flex items-center gap-2 rounded-xl px-4 py-3 ${
            selectedPlan === 'premium'
              ? 'bg-gradient-to-r from-amber-100 to-orange-100 border-2 border-amber-300 dark:from-amber-900/30 dark:to-orange-900/30 dark:border-amber-700'
              : selectedPlan === 'free'
              ? 'bg-slate-100 border-2 border-slate-300 dark:bg-slate-800 dark:border-slate-600'
              : 'bg-teal-50 border-2 border-teal-200 dark:bg-teal-900/30 dark:border-teal-700'
          }`}>
            <PlanIcon className={`h-5 w-5 ${
              selectedPlan === 'premium'
                ? 'text-amber-600 dark:text-amber-400'
                : selectedPlan === 'free'
                ? 'text-slate-600 dark:text-slate-400'
                : 'text-teal-600 dark:text-teal-400'
            }`} />
            <span className="font-semibold text-slate-900 dark:text-white">{plan.name}</span>
            <span className="mx-2 text-slate-400 dark:text-slate-500">•</span>
            <span className="font-semibold text-slate-900 dark:text-white">{plan.price}</span>
          </div>

          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            <Link to="/paywall" className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 font-medium">
              Change plan
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-sm text-red-900 dark:text-red-300">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                First name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="given-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:border-teal-500 focus:ring-0 transition-colors"
                placeholder="Your first name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:border-teal-500 focus:ring-0 transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setPasswordTouched(true); }}
                  className="w-full px-4 py-3 pr-11 border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:border-teal-500 focus:ring-0 transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {passwordTouched && (
                <ul className="mt-2 space-y-1">
                  {passwordRules.map(r => (
                    <li key={r.label} className={`flex items-center gap-2 text-xs font-medium ${r.ok ? 'text-teal-600 dark:text-teal-400' : 'text-red-500 dark:text-red-400'}`}>
                      <span>{r.ok ? '✓' : '✗'}</span>
                      {r.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setConfirmPasswordTouched(true); }}
                  onBlur={() => setConfirmPasswordTouched(true)}
                  className={`w-full px-4 py-3 pr-11 border-2 rounded-xl focus:ring-0 transition-colors dark:bg-slate-800 dark:text-white ${
                    passwordMismatch
                      ? 'border-red-400 focus:border-red-500 dark:border-red-600'
                      : 'border-slate-200 focus:border-teal-500 dark:border-slate-700'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {passwordMismatch && (
                <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-center gap-1.5">
                  <AlertCircle size={14} className="flex-shrink-0" />
                  Passwords don't match
                </p>
              )}
            </div>
          </div>

          {(selectedPlan === 'plus' || selectedPlan === 'premium') && (
            <div className="rounded-xl border-2 border-teal-100 dark:border-teal-800 bg-teal-50 dark:bg-teal-900/20 p-4 mb-4 text-sm text-teal-800 dark:text-teal-200">
              After creating your account you'll be taken to our secure payment page to complete your {plan.name} subscription.
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full px-8 py-4 text-white rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              selectedPlan === 'premium'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                : selectedPlan === 'free'
                ? 'bg-slate-900 dark:bg-gray-700'
                : 'bg-gradient-to-r from-teal-600 to-teal-700'
            }`}
          >
            {loading
            ? loadingStep === 'checkout' ? 'Redirecting to checkout…' : 'Creating account…'
            : `Continue with ${plan.name}`}
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300 dark:border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400">Or sign up with</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 px-8 py-3 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-xl font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-gray-700 transition-all"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign up with Google
          </button>

          <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
