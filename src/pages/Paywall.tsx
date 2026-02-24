import { Link, useNavigate } from 'react-router-dom';
import { Check, Sparkles, Crown, Zap, ArrowRight, BookOpen, BadgeCheck } from 'lucide-react';
import { useSubscription } from '../lib/subscription';

type Plan = 'free' | 'plus' | 'premium';

const PLAN_ORDER: Plan[] = ['free', 'plus', 'premium'];

function isUpgrade(current: Plan, target: Plan) {
  return PLAN_ORDER.indexOf(target) > PLAN_ORDER.indexOf(current);
}

export default function Paywall() {
  const navigate = useNavigate();
  const { tier: currentTier, isLoading } = useSubscription();

  function handleSelectPlan(plan: Plan) {
    if (plan === currentTier) return;
    if (plan === 'free') {
      navigate('/signup?plan=free');
    } else {
      navigate('/signup', { state: { selectedPlan: plan } });
    }
  }

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
          <PlanCard
            plan="free"
            currentTier={currentTier}
            isLoading={isLoading}
            accentColor="teal"
            icon={<BookOpen className="h-6 w-6 text-teal-600" />}
            title="Free"
            subtitle="Try Haven and get started"
            price="£0"
            pricePeriod="forever"
            features={[
              { text: <><strong>First lesson</strong> (Values &amp; Principles)</> },
              { text: <><strong>2 free modules</strong> to explore</> },
              { text: <><strong>Practice questions</strong> to test yourself</> },
              { text: <><strong>Progress tracking</strong> basics</> },
            ]}
            footerNote="No credit card required"
            onSelect={handleSelectPlan}
          />

          {/* Haven Plus */}
          <PlanCard
            plan="plus"
            currentTier={currentTier}
            isLoading={isLoading}
            accentColor="emerald"
            icon={<Zap className="h-6 w-6 text-emerald-600" />}
            title="Haven Plus"
            subtitle="Perfect for focused learners"
            price="£9.99"
            pricePeriod="one-time payment"
            features={[
              { text: <><strong>31 comprehensive lessons</strong> covering all official handbook content</> },
              { text: <><strong>500+ practice questions</strong> matching the real test format</> },
              { text: <><strong>Mock exams</strong> to simulate the real test</> },
              { text: <><strong>Progress tracking</strong> to monitor your improvement</> },
              { text: <><strong>Lifetime access</strong> to all study materials</> },
            ]}
            footerNote="One-time payment • No recurring fees"
            onSelect={handleSelectPlan}
          />

          {/* Haven Premium */}
          <PlanCard
            plan="premium"
            currentTier={currentTier}
            isLoading={isLoading}
            accentColor="amber"
            icon={<Crown className="h-6 w-6 text-amber-600" />}
            title="Haven Premium"
            subtitle="Ultimate preparation package"
            price="£19.99"
            pricePeriod="one-time payment"
            badge="MOST POPULAR"
            features={[
              { text: <><strong>Everything in Haven Plus</strong></> },
              { text: <><strong>AI-powered study assistant</strong> for instant answers to your questions</> },
              { text: <><strong>4 full-length mock exams</strong> with detailed explanations</> },
              { text: <><strong>Interactive flashcards</strong> for quick revision</> },
              { text: <><strong>Performance analytics</strong> to identify weak areas</> },
              { text: <><strong>Priority email support</strong> from our expert team</> },
            ]}
            footerNote="One-time payment • Best value • No recurring fees"
            onSelect={handleSelectPlan}
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

// ── Plan card component ───────────────────────────────────────────────────

type AccentColor = 'teal' | 'emerald' | 'amber';

const ACCENT: Record<AccentColor, {
  ring: string;
  border: string;
  check: string;
  btnPrimary: string;
  btnSecondary: string;
  badge: string;
}> = {
  teal: {
    ring: 'ring-teal-100 border-teal-500',
    border: 'border-gray-200',
    check: 'text-teal-600',
    btnPrimary: 'bg-teal-600 text-white hover:bg-teal-700 shadow-md',
    btnSecondary: 'bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200',
    badge: 'bg-teal-500',
  },
  emerald: {
    ring: 'ring-emerald-100 border-emerald-500',
    border: 'border-gray-200',
    check: 'text-emerald-600',
    btnPrimary: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md',
    btnSecondary: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200',
    badge: 'bg-emerald-500',
  },
  amber: {
    ring: 'ring-amber-100 border-amber-500',
    border: 'border-amber-200',
    check: 'text-amber-600',
    btnPrimary: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg hover:from-amber-600 hover:to-orange-600',
    btnSecondary: 'bg-white text-amber-700 hover:bg-amber-50 border border-amber-200',
    badge: 'bg-gradient-to-r from-amber-500 to-orange-500',
  },
};

function PlanCard({
  plan,
  currentTier,
  isLoading,
  accentColor,
  icon,
  title,
  subtitle,
  price,
  pricePeriod,
  features,
  footerNote,
  badge,
  onSelect,
}: {
  plan: Plan;
  currentTier: Plan;
  isLoading: boolean;
  accentColor: AccentColor;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  price: string;
  pricePeriod: string;
  features: { text: React.ReactNode }[];
  footerNote: string;
  badge?: string;
  onSelect: (plan: Plan) => void;
}) {
  const a = ACCENT[accentColor];
  const isCurrent = !isLoading && currentTier === plan;
  const canUpgrade = !isLoading && isUpgrade(currentTier, plan);
  const isActive = isCurrent || canUpgrade; // clickable

  const borderClass = isCurrent
    ? `${a.ring} ring-4`
    : a.border;

  const bgClass = accentColor === 'amber'
    ? 'bg-gradient-to-br from-amber-50 to-orange-50'
    : 'bg-white';

  function buttonLabel() {
    if (isLoading) return 'Loading…';
    if (isCurrent) return 'Current Plan';
    if (canUpgrade) return `Upgrade to ${title}`;
    return `Get ${title}`;
  }

  function buttonClass() {
    if (isCurrent) return 'bg-gray-100 text-gray-500 cursor-default border border-gray-200';
    if (canUpgrade || !isLoading) return a.btnPrimary;
    return a.btnSecondary;
  }

  return (
    <div className={`group relative flex flex-col overflow-hidden rounded-3xl border-2 shadow-xl transition-all hover:-translate-y-1 hover:shadow-2xl ${borderClass} ${bgClass}`}>
      {/* Current plan badge */}
      {isCurrent && (
        <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-gray-900 px-3 py-1 text-xs font-semibold text-white">
          <BadgeCheck className="h-3.5 w-3.5" />
          Your Plan
        </div>
      )}

      {/* Most popular badge */}
      {badge && !isCurrent && (
        <div className={`absolute right-4 top-4 rounded-full px-4 py-1 text-xs font-semibold text-white shadow-lg ${a.badge}`}>
          {badge}
        </div>
      )}

      <div className="flex flex-1 flex-col p-8 md:p-10">
        {/* Header */}
        <div className={`mb-6 flex items-start justify-between ${isCurrent ? 'mt-8' : ''}`}>
          <div>
            <div className="mb-2 flex items-center gap-2">
              {icon}
              <h3 className="font-semibold text-gray-900">{title}</h3>
            </div>
            <p className="text-gray-600">{subtitle}</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-semibold text-gray-900">{price}</div>
            <div className="text-sm text-gray-500">{pricePeriod}</div>
          </div>
        </div>

        {/* Features */}
        <ul className="mb-8 flex-1 space-y-4">
          {features.map((f, i) => (
            <li key={i} className="flex items-start gap-3">
              <Check className={`mt-0.5 h-5 w-5 flex-shrink-0 ${a.check}`} />
              <span className="text-gray-700">{f.text}</span>
            </li>
          ))}
        </ul>

        {/* Button — pinned to bottom */}
        <div className="mt-auto">
          <button
            onClick={() => !isCurrent && onSelect(plan)}
            disabled={isCurrent || isLoading}
            className={`group/btn flex w-full items-center justify-center gap-2 rounded-xl px-8 py-4 font-semibold transition-all ${buttonClass()}`}
          >
            {buttonLabel()}
            {!isCurrent && !isLoading && (
              <ArrowRight className="h-5 w-5 transition-transform group-hover/btn:translate-x-1" />
            )}
          </button>
          <p className="mt-4 text-center text-sm text-gray-500">{footerNote}</p>
        </div>
      </div>
    </div>
  );
}
