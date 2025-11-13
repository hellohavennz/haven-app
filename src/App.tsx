import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  Brain,
  CheckCircle2,
  Clock,
  Sparkles,
  Star,
  Target,
} from "lucide-react";

import TestimonialCarousel from "./components/TestimonialCarousel";
import { getCurrentUser } from "./lib/auth";

const quickStats = [
  { label: "Lessons", value: "20+", detail: "Plain-English modules" },
  { label: "Practice questions", value: "500+", detail: "Exam-style" },
  { label: "Pass rate", value: "95%", detail: "Haven learners" },
];

const studyTiles = [
  {
    title: "Learning",
    description: "Structured lessons rewritten clearly with context and calm pacing.",
    icon: <BookOpen className="h-6 w-6" />,
    background: "var(--tile-learning)",
  },
  {
    title: "Practice",
    description: "500+ questions with gentle feedback and progress markers.",
    icon: <Target className="h-6 w-6" />,
    background: "var(--tile-practice)",
  },
  {
    title: "Flashcards",
    description: "Short, memorable prompts to keep facts fresh every day.",
    icon: <Brain className="h-6 w-6" />,
    background: "var(--tile-flashcards)",
  },
  {
    title: "Exams",
    description: "Timed mock exams mirroring the official experience.",
    icon: <Award className="h-6 w-6" />,
    background: "var(--tile-exams)",
  },
];

const featureHighlights = [
  {
    title: "Guided study path",
    description: "Follow a calm, step-by-step route that keeps you focused without overwhelm.",
    icon: <Sparkles className="h-5 w-5" />,
  },
  {
    title: "Progress visuals",
    description: "Lightweight charts help you understand mastery without noisy dashboards.",
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    title: "Smart reminders",
    description: "Stay gently on track with subtle prompts when it's time to review.",
    icon: <Clock className="h-5 w-5" />,
  },
];

const howItWorks = [
  {
    title: "Study each lesson",
    text: "Absorb every topic from the official handbook in refreshed, plain language.",
  },
  {
    title: "Practise with intent",
    text: "Build confidence through question sets that reinforce understanding, not guesswork.",
  },
  {
    title: "Review essentials",
    text: "Use flashcards and key fact lists to keep details close without cramming.",
  },
  {
    title: "Sit the exam",
    text: "Arrive calm, knowing you've met every target with a clear readiness signal.",
  },
];

const plans = [
  {
    name: "Haven Plus",
    price: "£9.99",
    description: "Everything you need for a calm, confident pass.",
    badge: "Most loved",
    badgeColor: "var(--accent-primary)",
    features: [
      "All lessons and practice questions",
      "Interactive flashcards",
      "Progress insights",
      "Full mock exams",
      "Pass assurance guidance",
    ],
    cta: "Get Haven Plus",
    link: "/paywall",
  },
  {
    name: "Haven Premium",
    price: "£14.99",
    description: "A future collection of supportive extras for every learner.",
    badge: "Coming soon",
    badgeColor: "var(--accent-secondary)",
    features: [
      "Everything in Haven Plus",
      "Audio lessons for on-the-go study",
      "Downloadable study journals",
      "Guided revision plans",
    ],
    cta: "Join the waitlist",
    link: "/paywall",
  },
];

export default function App() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getCurrentUser().then(currentUser => {
      setLoading(false);
      if (currentUser) {
        navigate("/dashboard");
      }
    });
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[var(--accent-primary)] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-20 pb-24">
      <section className="border-b bg-[var(--bg-section)]/70">
        <div className="mx-auto flex max-w-6xl flex-col gap-16 px-4 pb-16 pt-20 md:flex-row md:items-center">
          <div className="flex-1 space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold text-[var(--text-secondary)]">
              <Sparkles className="h-4 w-4" />
              Calm preparation for the Life in the UK Test
            </div>
            <h1 className="text-4xl font-bold leading-tight text-[var(--text-primary)] sm:text-5xl md:text-6xl">
              Study with clarity.
              <br />
              Pass with composure.
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-[var(--text-secondary)] md:text-xl">
              Haven turns the official handbook into a focused journey. Gentle explanations, structured practice, and light-touch
              guidance keep you moving forward without overwhelm.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to="/content"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--accent-primary)] px-8 py-3 text-base font-semibold text-[#1E293B] transition-colors hover:bg-[var(--accent-primary-hover)]"
              >
                Explore the first lesson
                <ArrowRight className="h-5 w-5" />
              </Link>
              <a
                href="#pricing"
                className="inline-flex items-center justify-center gap-2 rounded-full border px-8 py-3 text-base font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-section)]"
              >
                View plans
                <Star className="h-5 w-5" />
              </a>
            </div>
            <p className="text-sm text-[var(--text-secondary)]">
              No credit card required • First lesson free • Built-in readiness check
            </p>
          </div>
          <div className="flex flex-1 flex-col gap-6">
            <div className="rounded-3xl border bg-[var(--bg)] p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Your progress snapshot</h2>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                A light dashboard keeps your attention on the next best step.
              </p>
              <div className="mt-6 space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm font-medium text-[var(--text-secondary)]">
                    <span>Overall readiness</span>
                    <span className="text-base font-semibold text-[var(--text-primary)]">68%</span>
                  </div>
                  <div className="mt-2 h-2.5 w-full rounded-full bg-[var(--bg-section-alt)]">
                    <div className="h-2.5 rounded-full bg-[var(--accent-primary)]" style={{ width: "68%" }} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="rounded-2xl border bg-[var(--tile-learning)] p-4">
                    <p className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">Mastered</p>
                    <p className="mt-1 text-2xl font-semibold text-[var(--text-primary)]">12 lessons</p>
                  </div>
                  <div className="rounded-2xl border bg-[var(--tile-practice)] p-4">
                    <p className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">Accuracy</p>
                    <p className="mt-1 text-2xl font-semibold text-[var(--text-primary)]">85%</p>
                  </div>
                </div>
              </div>
            </div>
            <ul className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
              {quickStats.map(stat => (
                <li key={stat.label} className="rounded-2xl border bg-[var(--bg)] px-4 py-3 text-center">
                  <span className="text-2xl font-semibold text-[var(--text-primary)]">{stat.value}</span>
                  <p className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">{stat.label}</p>
                  <p className="mt-1 text-xs text-[var(--text-secondary)]">{stat.detail}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4">
        <div className="mb-10 max-w-3xl">
          <h2 className="text-3xl font-semibold text-[var(--text-primary)] md:text-4xl">Everything in one calm workspace</h2>
          <p className="mt-3 text-lg text-[var(--text-secondary)]">
            Haven balances structure and breathing room. Each area is built to help you stay composed while making steady progress.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {studyTiles.map(tile => (
            <div
              key={tile.title}
              className="surface-tile flex h-full flex-col gap-3 p-6 transition-colors"
              style={{ backgroundColor: tile.background }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-transparent bg-[var(--bg-section)] text-[var(--text-primary)]">
                {tile.icon}
              </div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">{tile.title}</h3>
              <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{tile.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4">
        <div className="grid gap-10 rounded-3xl border bg-[var(--bg-section)] p-10 md:grid-cols-2">
          <div className="space-y-6">
            <h2 className="text-3xl font-semibold text-[var(--text-primary)] md:text-4xl">A planner that keeps focus gentle</h2>
            <p className="text-lg text-[var(--text-secondary)]">
              Stay centred with a dashboard that favours clarity. Clear targets, soft colour cues, and readiness indicators help you
              understand exactly where to focus next.
            </p>
            <ul className="space-y-3 text-sm text-[var(--text-secondary)]">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="mt-1 h-5 w-5 text-[var(--success)]" />
                Personalised recommendations highlight topics for today.
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="mt-1 h-5 w-5 text-[var(--success)]" />
                Light progress rings show mastery without harsh visuals.
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="mt-1 h-5 w-5 text-[var(--success)]" />
                A readiness badge confirms when you are comfortably prepared.
              </li>
            </ul>
              <Link
                to="/content"
                className="inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--bg)]"
            >
              Try it free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-5">
            {featureHighlights.map(feature => (
              <div key={feature.title} className="rounded-2xl border bg-[var(--bg)] p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent-secondary)]/40 text-[var(--text-primary)]">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)]">{feature.title}</h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4">
        <div className="mb-10 max-w-3xl text-center md:mx-auto">
          <h2 className="text-3xl font-semibold text-[var(--text-primary)] md:text-4xl">Learners feel supported every step</h2>
          <p className="mt-3 text-lg text-[var(--text-secondary)]">
            Real stories from people who passed their Life in the UK Test feeling composed and prepared.
          </p>
        </div>
        <TestimonialCarousel />
      </section>

      <section className="mx-auto max-w-4xl px-4">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-semibold text-[var(--text-primary)] md:text-4xl">How it works</h2>
          <p className="mt-3 text-lg text-[var(--text-secondary)]">
            Four calm steps guide you from the first lesson to a confident exam day.
          </p>
        </div>
        <div className="space-y-6">
          {howItWorks.map((item, index) => (
            <div key={item.title} className="flex gap-4 rounded-2xl border bg-[var(--bg-section)] p-6">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[var(--accent-secondary)]/30 text-lg font-semibold text-[var(--text-primary)]">
                {index + 1}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[var(--text-primary)]">{item.title}</h3>
                <p className="mt-2 text-[var(--text-secondary)]">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-5xl px-4">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-semibold text-[var(--text-primary)] md:text-4xl">Choose the support you need</h2>
          <p className="mt-3 text-lg text-[var(--text-secondary)]">
            One-time payment. Lifetime access. Keep your study calm from start to finish.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {plans.map(plan => (
            <div key={plan.name} className="flex h-full flex-col rounded-3xl border bg-[var(--bg-section)] p-8">
              <div className="inline-flex items-center justify-center self-start rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-widest text-[var(--text-primary)]" style={{ backgroundColor: plan.badgeColor }}>
                {plan.badge}
              </div>
              <div className="mt-6 space-y-2">
                <h3 className="text-2xl font-semibold text-[var(--text-primary)]">{plan.name}</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-[var(--text-primary)]">{plan.price}</span>
                  <span className="text-sm text-[var(--text-secondary)]">one-time</span>
                </div>
                <p className="text-sm text-[var(--text-secondary)]">{plan.description}</p>
              </div>
              <ul className="mt-6 space-y-3 text-sm text-[var(--text-secondary)]">
                {plan.features.map(feature => (
                  <li key={feature} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-[var(--accent-secondary)]" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                to={plan.link}
                className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-[var(--accent-primary)] px-6 py-3 text-sm font-semibold text-[#1E293B] transition-colors hover:bg-[var(--accent-primary-hover)]"
              >
                {plan.cta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
