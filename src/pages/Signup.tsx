import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { signUp, signInWithGoogle } from "../lib/auth";
import { UserPlus, AlertCircle, CheckCircle2, Zap, Crown } from "lucide-react";

export default function Signup() {
  const location = useLocation();
  const selectedPlan = (location.state as any)?.selectedPlan || 'plus';
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const planDetails = {
    plus: {
      name: 'Haven Plus',
      price: '£9.99',
      icon: Zap,
      color: 'teal'
    },
    premium: {
      name: 'Haven Premium',
      price: '£19.99',
      icon: Crown,
      color: 'amber'
    }
  };

  const plan = planDetails[selectedPlan as keyof typeof planDetails];
  const PlanIcon = plan.icon;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signUp(email, password);
      setSuccess(true);
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (err: any) {
      setError(err.message || "Failed to sign up");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError("");
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Google");
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle2 className="text-green-600" size={48} />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">Account created!</h2>
          <p className="text-gray-600">Check your email to verify your account, then you can start learning.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 rounded-2xl mb-4">
            <UserPlus className="text-teal-600" size={32} />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">Create your account</h2>
          <p className="mt-2 text-gray-600">Start your journey to passing the test</p>

          <div className={`mt-6 inline-flex items-center gap-2 rounded-xl px-4 py-3 ${selectedPlan === 'premium' ? 'bg-gradient-to-r from-amber-100 to-orange-100 border-2 border-amber-300' : 'bg-teal-50 border-2 border-teal-200'}`}>
            <PlanIcon className={`h-5 w-5 ${selectedPlan === 'premium' ? 'text-amber-600' : 'text-teal-600'}`} />
            <span className="font-bold text-gray-900">{plan.name}</span>
            <span className="mx-2 text-gray-400">•</span>
            <span className="font-bold text-gray-900">{plan.price}</span>
          </div>

          <p className="mt-3 text-sm text-gray-500">
            <Link to="/paywall" className="text-teal-600 hover:text-teal-700 font-medium">
              Change plan
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-sm text-red-900">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
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
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-0 transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-0 transition-colors"
                placeholder="••••••••"
              />
              <p className="mt-1 text-xs text-gray-500">Must be at least 6 characters</p>
            </div>
          </div>

          <div className="rounded-xl border-2 border-gray-200 bg-gray-50 p-4 mb-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">Payment Information</p>
            <p className="text-xs text-gray-600 mb-3">
              Payment processing will be added soon. For now, creating an account will give you free access to {plan.name}.
            </p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Total due today:</span>
              <span className="text-xl font-bold text-gray-900">{plan.price}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full px-8 py-4 text-white rounded-xl font-bold text-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              selectedPlan === 'premium'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                : 'bg-gradient-to-r from-teal-600 to-teal-700'
            }`}
          >
            {loading ? "Creating account..." : `Continue with ${plan.name}`}
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Or sign up with</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 px-8 py-3 bg-white border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all"
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

          <p className="text-center text-sm text-gray-500 mt-4">
            Note: Social login providers need to be configured in Supabase Dashboard
          </p>

          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-teal-600 hover:text-teal-700">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
