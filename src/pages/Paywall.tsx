import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Sparkles, Crown, Zap, ArrowRight, BookOpen } from 'lucide-react';

type Plan = 'free' | 'plus' | 'premium';

export default function Paywall() {
  const [selectedPlan, setSelectedPlan] = useState<Plan>('free');
  const navigate = useNavigate();

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    if (plan === 'free') {
      navigate('/signup?plan=free');
    } else {
      navigate('/signup', { state: { selectedPlan: plan } });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-emerald-50 py-16 px-4">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-teal-100 px-4 py-2 text-sm font-semibold text-teal-700">
            <Sparkles className="h-4 w-4" />
            Choose Your Plan
          </div>
          <h1 className="mb-4 font-semibold text-gray-900">
            Pass Your Life in the UK Test
          </h1>
          <p className="mx-auto max-w-2xl text-gray-600">
            Join thousands who've passed on their first try. Get instant access to comprehensive study materials, practice questions, and expert guidance.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3 lg:gap-8">
          {/* Free Plan */}
          <div
            className={`group relative overflow-hidden rounded-3xl border-2 bg-white shadow-xl transition-all hover:-translate-y-1 hover:shadow-2xl ${
              selectedPlan === 'free'
                ? 'border-gray-500 ring-4 ring-gray-100'
                : 'border-gray-200'
            }`}
          >
            <div className="p-8 md:p-10">
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <BookOpen className="h-6 w-6 text-gray-600" />
                    <h3 className="font-semibold text-gray-900">Free</h3>
                  </div>
                  <p className="text-gray-600">Try Haven and get started</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-semibold text-gray-900">£0</div>
                  <div className="text-sm text-gray-500">forever</div>
                </div>
              </div>

              <ul className="mb-8 space-y-4">
                <li className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-600" />
                  <span className="text-gray-700">
                    <strong>First lesson</strong> (Values & Principles)
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-600" />
                  <span className="text-gray-700">
                    <strong>2 free modules</strong> to explore
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-600" />
                  <span className="text-gray-700">
                    <strong>Practice questions</strong> to test yourself
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-600" />
                  <span className="text-gray-700">
                    <strong>Progress tracking</strong> basics
                  </span>
                </li>
              </ul>

              <button
                onClick={() => handleSelectPlan('free')}
                className={`group/btn flex w-full items-center justify-center gap-2 rounded-xl px-8 py-4 font-semibold transition-all ${
                  selectedPlan === 'free'
                    ? 'bg-gray-900 text-white hover:bg-gray-800'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                Get Started Free
                <ArrowRight className="h-5 w-5 transition-transform group-hover/btn:translate-x-1" />
              </button>

              <p className="mt-4 text-center text-sm text-gray-500">
                No credit card required
              </p>
            </div>
          </div>

          {/* Haven Plus */}
          <div
            className={`group relative overflow-hidden rounded-3xl border-2 bg-white shadow-xl transition-all hover:-translate-y-1 hover:shadow-2xl ${
              selectedPlan === 'plus'
                ? 'border-teal-500 ring-4 ring-teal-100'
                : 'border-gray-200'
            }`}
          >
            <div className="p-8 md:p-10">
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <Zap className="h-6 w-6 text-teal-600" />
                    <h3 className="font-semibold text-gray-900">Haven Plus</h3>
                  </div>
                  <p className="text-gray-600">Perfect for focused learners</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-semibold text-gray-900">£9.99</div>
                  <div className="text-sm text-gray-500">one-time payment</div>
                </div>
              </div>

              <ul className="mb-8 space-y-4">
                <li className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-teal-600" />
                  <span className="text-gray-700">
                    <strong>31 comprehensive lessons</strong> covering all official handbook content
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-teal-600" />
                  <span className="text-gray-700">
                    <strong>500+ practice questions</strong> matching the real test format
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-teal-600" />
                  <span className="text-gray-700">
                    <strong>Progress tracking</strong> to monitor your improvement
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-teal-600" />
                  <span className="text-gray-700">
                    <strong>Lifetime access</strong> to all study materials
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-teal-600" />
                  <span className="text-gray-700">
                    <strong>Mobile-friendly</strong> study on any device
                  </span>
                </li>
              </ul>

              <button
                onClick={() => handleSelectPlan('plus')}
                className={`group/btn flex w-full items-center justify-center gap-2 rounded-xl px-8 py-4 font-semibold transition-all ${
                  selectedPlan === 'plus'
                    ? 'bg-teal-600 text-white hover:bg-teal-700'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                Get Haven Plus
                <ArrowRight className="h-5 w-5 transition-transform group-hover/btn:translate-x-1" />
              </button>

              <p className="mt-4 text-center text-sm text-gray-500">
                One-time payment • No recurring fees
              </p>
            </div>
          </div>

          {/* Haven Premium */}
          <div
            className={`group relative overflow-hidden rounded-3xl border-2 bg-gradient-to-br from-amber-50 to-orange-50 shadow-xl transition-all hover:-translate-y-1 hover:shadow-2xl ${
              selectedPlan === 'premium'
                ? 'border-amber-500 ring-4 ring-amber-100'
                : 'border-amber-200'
            }`}
          >
            <div className="absolute right-4 top-4 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-1 text-small font-semibold text-white shadow-lg">
              MOST POPULAR
            </div>

            <div className="p-8 md:p-10">
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <Crown className="h-6 w-6 text-amber-600" />
                    <h3 className="font-semibold text-gray-900">Haven Premium</h3>
                  </div>
                  <p className="text-gray-700">Ultimate preparation package</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-semibold text-gray-900">£19.99</div>
                  <div className="text-sm text-gray-600">one-time payment</div>
                </div>
              </div>

              <ul className="mb-8 space-y-4">
                <li className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
                  <span className="text-gray-800">
                    <strong>Everything in Haven Plus</strong>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
                  <span className="text-gray-800">
                    <strong>AI-powered study assistant</strong> for instant answers to your questions
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
                  <span className="text-gray-800">
                    <strong>4 full-length mock exams</strong> with detailed explanations
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
                  <span className="text-gray-800">
                    <strong>Interactive flashcards</strong> for quick revision
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
                  <span className="text-gray-800">
                    <strong>Performance analytics</strong> to identify weak areas
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
                  <span className="text-gray-800">
                    <strong>Priority email support</strong> from our expert team
                  </span>
                </li>
              </ul>

              <button
                onClick={() => handleSelectPlan('premium')}
                className={`group/btn flex w-full items-center justify-center gap-2 rounded-xl px-8 py-4 font-semibold transition-all ${
                  selectedPlan === 'premium'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg hover:from-amber-600 hover:to-orange-600'
                    : 'bg-white text-gray-900 hover:bg-gray-50'
                }`}
              >
                Get Haven Premium
                <ArrowRight className="h-5 w-5 transition-transform group-hover/btn:translate-x-1" />
              </button>

              <p className="mt-4 text-center text-sm text-gray-600">
                One-time payment • Best value • No recurring fees
              </p>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mb-3 text-4xl font-semibold text-teal-600">10,000+</div>
              <div className="text-sm font-medium text-gray-600">Students Passed</div>
            </div>
            <div className="text-center">
              <div className="mb-3 text-4xl font-semibold text-teal-600">94%</div>
              <div className="text-sm font-medium text-gray-600">First-Time Pass Rate</div>
            </div>
            <div className="text-center">
              <div className="mb-3 text-4xl font-semibold text-teal-600">4.9/5</div>
              <div className="text-sm font-medium text-gray-600">Average Rating</div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-12 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-teal-600 hover:text-teal-700">
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
