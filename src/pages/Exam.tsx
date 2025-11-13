import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Clock, FileCheck, Trophy, Target, ArrowRight, Lock } from "lucide-react";
import { getCurrentUser } from "../lib/auth";

export default function Exam() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    getCurrentUser().then(setUser);
  }, []);

  const hasAccess = user && user.user_metadata?.isPremium === true;

  return (
    <div className="mx-auto max-w-4xl space-y-12 px-4 py-8 text-[var(--text-secondary)]">
      <div className="space-y-4 text-center">
        <div
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
          style={{
            backgroundColor: "color-mix(in srgb, #a855f7 18%, var(--bg))",
            color: "color-mix(in srgb, #a855f7 70%, var(--text-primary) 30%)",
          }}
        >
          <Trophy className="h-4 w-4" />
          Test Your Knowledge
        </div>

        <h1 className="text-4xl font-extrabold text-[var(--text-primary)] md:text-5xl">
          Practice Exams
        </h1>

        <p className="text-lg">
          Simulate the real Life in the UK test with full-length practice exams.
          Get instant results and detailed explanations for every question.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="group relative overflow-hidden rounded-2xl border-2 border-[var(--divider)] bg-[var(--bg-section)] p-8 transition-all hover:border-[color:color-mix(in_srgb,#a855f7_45%,var(--divider))] hover:shadow-lg">
          <div
            className="absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-semibold"
            style={{
              backgroundColor: "color-mix(in srgb, #a855f7 18%, var(--bg))",
              color: "color-mix(in srgb, #a855f7 70%, var(--text-primary) 30%)",
            }}
          >
            24 Questions
          </div>

          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600">
            <FileCheck className="h-7 w-7 text-white" />
          </div>

          <h3 className="mb-2 text-2xl font-bold text-[var(--text-primary)]">Mock Exam 1</h3>
          <p className="mb-6 text-sm">
            Full practice test covering all topics. 45 minutes. Pass with 75% or higher.
          </p>

          <div className="mb-6 space-y-2 rounded-xl bg-[var(--bg-section-alt)] p-4">
            <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
              <Clock className="h-4 w-4 text-[color:color-mix(in_srgb,var(--text-secondary)_70%,#a855f7_30%)]" />
              <span>45 minutes time limit</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
              <Target className="h-4 w-4 text-[color:color-mix(in_srgb,var(--text-secondary)_70%,#a855f7_30%)]" />
              <span>18/24 questions needed to pass</span>
            </div>
          </div>

          {hasAccess ? (
            <button
              disabled
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--divider)] bg-[var(--bg-section-alt)] px-6 py-3 font-semibold text-[var(--text-secondary)] transition-all"
            >
              <Lock className="h-5 w-5" />
              Coming Soon
            </button>
          ) : (
            <Link
              to="/paywall"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[color:color-mix(in_srgb,#312e81_80%,#111827_20%)] px-6 py-3 font-semibold text-white transition-all hover:bg-[color:color-mix(in_srgb,#312e81_65%,#111827_35%)]"
            >
              <Lock className="h-5 w-5" />
              Sign up to unlock
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        <div className="group relative overflow-hidden rounded-2xl border-2 border-[var(--divider)] bg-[var(--bg-section)] p-8 transition-all hover:border-[color:color-mix(in_srgb,#a855f7_45%,var(--divider))] hover:shadow-lg">
          <div
            className="absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-semibold"
            style={{
              backgroundColor: "color-mix(in srgb, #a855f7 18%, var(--bg))",
              color: "color-mix(in srgb, #a855f7 70%, var(--text-primary) 30%)",
            }}
          >
            24 Questions
          </div>

          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600">
            <FileCheck className="h-7 w-7 text-white" />
          </div>

          <h3 className="mb-2 text-2xl font-bold text-[var(--text-primary)]">Mock Exam 2</h3>
          <p className="mb-6 text-sm">
            Second full practice test with all-new questions. Perfect for final preparation.
          </p>

          <div className="mb-6 space-y-2 rounded-xl bg-[var(--bg-section-alt)] p-4">
            <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
              <Clock className="h-4 w-4 text-[color:color-mix(in_srgb,var(--text-secondary)_70%,#a855f7_30%)]" />
              <span>45 minutes time limit</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
              <Target className="h-4 w-4 text-[color:color-mix(in_srgb,var(--text-secondary)_70%,#a855f7_30%)]" />
              <span>18/24 questions needed to pass</span>
            </div>
          </div>

          {hasAccess ? (
            <button
              disabled
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--divider)] bg-[var(--bg-section-alt)] px-6 py-3 font-semibold text-[var(--text-secondary)] transition-all"
            >
              <Lock className="h-5 w-5" />
              Coming Soon
            </button>
          ) : (
            <Link
              to="/paywall"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[color:color-mix(in_srgb,#312e81_80%,#111827_20%)] px-6 py-3 font-semibold text-white transition-all hover:bg-[color:color-mix(in_srgb,#312e81_65%,#111827_35%)]"
            >
              <Lock className="h-5 w-5" />
              Sign up to unlock
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>

      <div
        className="rounded-2xl border bg-gradient-to-br p-8"
        style={{
          borderColor: "var(--divider)",
          backgroundImage:
            "linear-gradient(135deg, color-mix(in srgb, var(--accent-secondary) 12%, var(--bg) 88%), color-mix(in srgb, var(--accent-primary) 14%, var(--bg) 86%))",
        }}
      >
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-[var(--text-primary)]">
              Not ready for a full exam yet?
            </h3>
            <p>
              Keep practicing individual lessons and build your confidence first.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to="/content"
              className="inline-flex items-center justify-center gap-2 rounded-xl border px-6 py-3 font-semibold transition-all"
              style={{
                borderColor: "color-mix(in srgb, var(--accent-secondary) 65%, var(--divider) 35%)",
                color: "color-mix(in srgb, var(--accent-secondary) 70%, var(--text-primary) 30%)",
              }}
            >
              Study Lessons
            </Link>
            <Link
              to="/practice"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 px-6 py-3 font-semibold text-white transition-all hover:shadow-lg"
            >
              Practice Questions
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--divider)] bg-[var(--bg-section)] p-8">
        <h2 className="mb-4 text-2xl font-bold text-[var(--text-primary)]">About the Exam</h2>

        <div className="space-y-4">
          <p>
            The Life in the UK test consists of 24 multiple-choice questions about British
            traditions, history, and everyday life. You'll have 45 minutes to complete the test,
            and you need to answer at least 18 questions correctly (75%) to pass.
          </p>

          <div className="rounded-xl bg-[var(--bg-section-alt)] p-4">
            <h3 className="mb-2 font-semibold text-[var(--text-primary)]">What to Expect:</h3>
            <ul className="space-y-2 text-sm">
              {[
                "Questions are randomly selected from the official test bank",
                "No negative marking - wrong answers don't reduce your score",
                "You can skip questions and come back to them later",
                "Instant results with detailed explanations for all questions",
              ].map(point => (
                <li key={point} className="flex items-start gap-2">
                  <span
                    className="pt-1 text-sm"
                    style={{ color: "color-mix(in srgb, var(--accent-secondary) 70%, var(--text-primary) 30%)" }}
                  >
                    •
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-sm">
            Our mock exams are designed to replicate the actual test experience, helping you
            prepare with confidence. Practice as many times as you need until you consistently
            score 75% or higher.
          </p>
        </div>
      </div>
    </div>
  );
}
