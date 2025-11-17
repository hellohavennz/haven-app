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
    <div className="mx-auto max-w-4xl space-y-12 px-4 py-8">
      <div className="space-y-4 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-2 text-sm font-semibold text-purple-700 dark:text-purple-800">
          <Trophy className="h-4 w-4" />
          Test Your Knowledge
        </div>

        <h1 className="font-semibold text-gray-900">
          Practice Exams
        </h1>

        <p className="text-gray-600 dark:text-gray-900">
          Simulate the real Life in the UK test with full-length practice exams.
          Get instant results and detailed explanations for every question.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="group relative overflow-hidden rounded-2xl border-2 border-gray-200 bg-white p-8 transition-all hover:border-purple-300 hover:shadow-lg">
          <div className="absolute right-4 top-4 rounded-full bg-purple-100 px-3 py-1 text-small font-semibold text-purple-700">
            24 Questions
          </div>

          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600">
            <FileCheck className="h-7 w-7 text-white" />
          </div>

          <h3 className="mb-2 font-semibold text-gray-900">Mock Exam 1</h3>
          <p className="mb-6 text-sm text-gray-600 dark:text-gray-900">
            Full practice test covering all topics. 45 minutes. Pass with 75% or higher.
          </p>

          <div className="mb-6 space-y-2 rounded-xl bg-gray-50 p-4">
            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-900">
              <Clock className="h-4 w-4 text-gray-500" />
              <span>45 minutes time limit</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-900">
              <Target className="h-4 w-4 text-gray-500" />
              <span>18/24 questions needed to pass</span>
            </div>
          </div>

          {hasAccess ? (
            <button
              disabled
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-200 px-6 py-3 font-semibold text-gray-500 transition-all"
            >
              <Lock className="h-5 w-5" />
              Coming Soon
            </button>
          ) : (
            <Link
              to="/paywall"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-6 py-3 font-semibold text-white transition-all hover:bg-gray-800"
            >
              <Lock className="h-5 w-5" />
              Sign up to unlock
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        <div className="group relative overflow-hidden rounded-2xl border-2 border-gray-200 bg-white p-8 transition-all hover:border-purple-300 hover:shadow-lg">
          <div className="absolute right-4 top-4 rounded-full bg-purple-100 px-3 py-1 text-small font-semibold text-purple-700">
            24 Questions
          </div>

          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600">
            <FileCheck className="h-7 w-7 text-white" />
          </div>

          <h3 className="mb-2 font-semibold text-gray-900">Mock Exam 2</h3>
          <p className="mb-6 text-sm text-gray-600 dark:text-gray-900">
            Second full practice test with all-new questions. Perfect for final preparation.
          </p>

          <div className="mb-6 space-y-2 rounded-xl bg-gray-50 p-4">
            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-900">
              <Clock className="h-4 w-4 text-gray-500" />
              <span>45 minutes time limit</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-900">
              <Target className="h-4 w-4 text-gray-500" />
              <span>18/24 questions needed to pass</span>
            </div>
          </div>

          {hasAccess ? (
            <button
              disabled
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-200 px-6 py-3 font-semibold text-gray-500 transition-all"
            >
              <Lock className="h-5 w-5" />
              Coming Soon
            </button>
          ) : (
            <Link
              to="/paywall"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-6 py-3 font-semibold text-white transition-all hover:bg-gray-800"
            >
              <Lock className="h-5 w-5" />
              Sign up to unlock
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-teal-50 to-emerald-50 p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900">
              Not ready for a full exam yet?
            </h3>
            <p className="text-gray-600 dark:text-gray-900">
              Keep practicing individual lessons and build your confidence first.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to="/content"
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-teal-600 bg-white px-6 py-3 font-semibold text-teal-700 transition-all hover:bg-teal-50"
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

      <div className="rounded-2xl border border-gray-200 bg-white p-8">
        <h2 className="mb-4 font-semibold text-gray-900">About the Exam</h2>

        <div className="space-y-4 text-gray-700 dark:text-gray-900">
          <p>
            The Life in the UK test consists of 24 multiple-choice questions about British
            traditions, history, and everyday life. You'll have 45 minutes to complete the test,
            and you need to answer at least 18 questions correctly (75%) to pass.
          </p>

          <div className="rounded-xl bg-gray-50 p-4">
            <h3 className="mb-2 font-semibold text-gray-900">What to Expect:</h3>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-900">
              <li className="flex items-start gap-2">
                <span className="text-teal-600">•</span>
                <span>Questions are randomly selected from the official test bank</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-600">•</span>
                <span>No negative marking - wrong answers don't reduce your score</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-600">•</span>
                <span>You can skip questions and come back to them later</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-600">•</span>
                <span>Instant results with detailed explanations for all questions</span>
              </li>
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
