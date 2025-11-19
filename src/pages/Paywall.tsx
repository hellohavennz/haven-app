import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Sparkles, Crown, Zap, BookOpen } from 'lucide-react';
import PlanCard, { type PlanCardFeature } from '../components/PlanCard';

type Plan = 'free' | 'plus' | 'premium';

const paywallFreeFeatures: PlanCardFeature[] = [
  {
    key: 'free-lesson',
    content: (
      <div className="flex items-start gap-3">
        <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-600 dark:text-gray-400" />
        <span className="text-gray-700 dark:text-gray-200">
          <strong>First lesson</strong> (Values & Principles)
        </span>
      </div>
    ),
  },
  {
    key: 'free-modules',
    content: (
      <div className="flex items-start gap-3">
        <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-600 dark:text-gray-400" />
        <span className="text-gray-700 dark:text-gray-200">
          <strong>2 free modules</strong> to explore
        </span>
      </div>
    ),
  },
  {
    key: 'free-practice',
    content: (
      <div className="flex items-start gap-3">
        <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-600 dark:text-gray-400" />
        <span className="text-gray-700 dark:text-gray-200">
          <strong>Practice questions</strong> to test yourself
        </span>
      </div>
    ),
  },
  {
    key: 'free-progress',
    content: (
      <div className="flex items-start gap-3">
        <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-600 dark:text-gray-400" />
        <span className="text-gray-700 dark:text-gray-200">
          <strong>Progress tracking</strong> basics
        </span>
      </div>
    ),
  },
];

const paywallPlusFeatures: PlanCardFeature[] = [
  {
    key: 'plus-lessons',
    content: (
      <div className="flex items-start gap-3">
        <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-teal-600" />
        <span className="text-gray-700 dark:text-gray-200">
          <strong>31 comprehensive lessons</strong> covering all official handbook content
        </span>
      </div>
    ),
  },
  {
    key: 'plus-practice',
    content: (
      <div className="flex items-start gap-3">
        <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-teal-600" />
        <span className="text-gray-700 dark:text-gray-200">
          <strong>500+ practice questions</strong> matching the real test format
        </span>
      </div>
    ),
  },
  {
    key: 'plus-tracking',
    content: (
      <div className="flex items-start gap-3">
        <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-teal-600" />
        <span className="text-gray-700 dark:text-gray-200">
          <strong>Progress tracking</strong> to monitor your improvement
        </span>
      </div>
    ),
  },
  {
    key: 'plus-lifetime',
    content: (
      <div className="flex items-start gap-3">
        <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-teal-600" />
        <span className="text-gray-700 dark:text-gray-200">
          <strong>Lifetime access</strong> to all study materials
        </span>
      </div>
    ),
  },
  {
    key: 'plus-mobile',
    content: (
      <div className="flex items-start gap-3">
        <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-teal-600" />
        <span className="text-gray-700 dark:text-gray-200">
          <strong>Mobile-friendly</strong> study on any device
        </span>
      </div>
    ),
  },
];

const paywallPremiumFeatures: PlanCardFeature[] = [
  {
    key: 'premium-plus',
    content: (
      <div className="flex items-start gap-3">
        <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
        <span className="text-gray-800 dark:text-gray-100">
          <strong>Everything in Haven Plus</strong>
        </span>
      </div>
    ),
  },
  {
    key: 'premium-ai',
    content: (
      <div className="flex items-start gap-3">
        <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
        <span className="text-gray-800 dark:text-gray-100">
          <strong>AI-powered study assistant</strong> for instant answers to your questions
        </span>
      </div>
    ),
  },
  {
    key: 'premium-exams',
    content: (
      <div className="flex items-start gap-3">
        <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
        <span className="text-gray-800 dark:text-gray-100">
          <strong>4 full-length mock exams</strong> with detailed explanations
        </span>
      </div>
    ),
  },
  {
    key: 'premium-flashcards',
    content: (
      <div className="flex items-start gap-3">
        <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
        <span className="text-gray-800 dark:text-gray-100">
          <strong>Interactive flashcards</strong> for quick revision
        </span>
      </div>
    ),
  },
  {
    key: 'premium-analytics',
    content: (
      <div className="flex items-start gap-3">
        <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
        <span className="text-gray-800 dark:text-gray-100">
          <strong>Performance analytics</strong> to identify weak areas
        </span>
      </div>
    ),
  },
  {
    key: 'premium-support',
    content: (
      <div className="flex items-start gap-3">
        <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
        <span className="text-gray-800 dark:text-gray-100">
          <strong>Priority email support</strong> from our expert team
        </span>
      </div>
    ),
  },
];

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
          <PlanCard
            className="h-full"
            name="Free"
            price="£0"
            priceNote="forever"
            description="Try Haven and get started"
            features={paywallFreeFeatures}
            icon={
              <div className="mb-4 flex justify-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800">
                  <BookOpen className="h-8 w-8 text-gray-600 dark:text-gray-300" />
                </div>
              </div>
            }
            highlight={selectedPlan === 'free'}
            highlightColor="gray"
            buttonLabel="Get Started Free"
            buttonVariant="dark"
            footerNote="No credit card required"
            onButtonClick={() => handleSelectPlan('free')}
          />
          <PlanCard
            className="h-full"
            name="Haven Plus"
            price="£9.99"
            priceNote="one-time payment"
            description="Perfect for focused learners"
            features={paywallPlusFeatures}
            icon={
              <div className="mb-4 flex justify-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-teal-100 dark:bg-teal-500/20">
                  <Zap className="h-8 w-8 text-teal-600" />
                </div>
              </div>
            }
            highlight={selectedPlan === 'plus'}
            highlightColor="teal"
            buttonLabel="Get Haven Plus"
            buttonVariant="teal"
            footerNote="One-time payment • No recurring fees"
            onButtonClick={() => handleSelectPlan('plus')}
          />
          <PlanCard
            className="h-full"
            name="Haven Premium"
            price="£19.99"
            priceNote="one-time payment"
            description="Ultimate preparation package"
            features={paywallPremiumFeatures}
            icon={
              <div className="mb-4 flex justify-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-500/20">
                  <Crown className="h-8 w-8 text-amber-600" />
                </div>
              </div>
            }
            badgeText="MOST POPULAR"
            badgeVariant="amber"
            badgePosition="right"
            highlight={selectedPlan === 'premium'}
            highlightColor="amber"
            buttonLabel="Get Haven Premium"
            buttonVariant="amber"
            footerNote="One-time payment • Best value • No recurring fees"
            onButtonClick={() => handleSelectPlan('premium')}
          />
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
