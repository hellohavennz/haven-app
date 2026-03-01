import { Link } from "react-router-dom";
import { Sparkles, CheckCircle2, Crown, Headphones, FileText, Zap, Trophy } from "lucide-react";

export default function Paywall() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-slate-50 text-gray-900 transition-colors dark:bg-slate-950 dark:text-gray-100">
      <div className="max-w-5xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full mb-4">
            <Trophy className="text-white" size={40} />
          </div>
          <h1 className="font-semibold text-gray-900 dark:text-white mb-3">
            Pass Your Test with Confidence
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Join thousands who passed on their first try
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Plus Plan */}
          <div className="bg-white border-2 border-teal-300 rounded-2xl p-8 relative transition-colors dark:border-teal-400/40 dark:bg-gray-900">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-teal-700 text-white text-sm font-semibold rounded-full">
              MOST POPULAR
            </div>
            
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 rounded-2xl mb-4">
                <Sparkles className="text-teal-600" size={32} />
              </div>
              <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Haven Plus</h2>
              <div className="flex items-baseline justify-center gap-2 mb-2">
                <span className="text-5xl font-semibold text-gray-900 dark:text-white">£9.99</span>
                <span className="text-gray-600 dark:text-gray-300">one-time</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Everything you need to pass
              </p>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="text-teal-600 flex-shrink-0 mt-0.5" size={20} />
                <span className="text-gray-700 dark:text-gray-200">All 20+ comprehensive lessons</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="text-teal-600 flex-shrink-0 mt-0.5" size={20} />
                <span className="text-gray-700 dark:text-gray-200">500+ practice questions with explanations</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="text-teal-600 flex-shrink-0 mt-0.5" size={20} />
                <span className="text-gray-700 dark:text-gray-200">Interactive flashcards</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="text-teal-600 flex-shrink-0 mt-0.5" size={20} />
                <span className="text-gray-700 dark:text-gray-200">Smart progress tracking</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="text-teal-600 flex-shrink-0 mt-0.5" size={20} />
                <span className="text-gray-700 dark:text-gray-200">Full-length mock exams</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="text-teal-600 flex-shrink-0 mt-0.5" size={20} />
                <span className="text-gray-700 dark:text-gray-200">Lifetime access</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="text-teal-600 flex-shrink-0 mt-0.5" size={20} />
                <span className="text-gray-700 dark:text-gray-100 font-semibold">Pass guarantee - fail after completing? Get refunded</span>
              </li>
            </ul>

            <Link
              to="/paywall"
              className="flex items-center justify-center gap-2 w-full px-8 py-4 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl font-semibold hover:opacity-90 transition-all"
            >
              Start Your Journey
              <Sparkles size={20} />
            </Link>
          </div>

          {/* Premium Plan */}
          <div className="bg-white border-2 border-amber-300 rounded-2xl p-8 relative transition-colors dark:border-amber-300/60 dark:bg-gray-900">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold rounded-full">
              COMING SOON
            </div>
            
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-2xl mb-4">
                <Crown className="text-amber-600" size={32} />
              </div>
              <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Haven Premium</h2>
              <div className="flex items-baseline justify-center gap-2 mb-2">
                <span className="text-5xl font-semibold text-gray-900 dark:text-white">£14.99</span>
                <span className="text-gray-600 dark:text-gray-300">one-time</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Ultimate learning experience
              </p>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
                <span className="text-gray-900 dark:text-gray-100 font-semibold">Everything in Haven Plus, and:</span>
              </li>
              <li className="flex items-start gap-3">
                <Headphones className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <span className="text-gray-900 dark:text-gray-100 font-semibold">Audio lessons</span>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Listen and learn on the go</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <FileText className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <span className="text-gray-900 dark:text-gray-100 font-semibold">Downloadable study guides</span>
                  <p className="text-sm text-gray-600 dark:text-gray-300">PDF versions for offline study</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Zap className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <span className="text-gray-900 dark:text-gray-100 font-semibold">Priority support</span>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Get help within 24 hours</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Crown className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <span className="text-gray-900 dark:text-gray-100 font-semibold">Early access</span>
                  <p className="text-sm text-gray-600 dark:text-gray-300">New features before everyone else</p>
                </div>
              </li>
            </ul>

            <div className="bg-amber-50 border-2 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/30 rounded-xl p-4 text-center">
              <p className="text-sm text-amber-900 dark:text-amber-200">
                🚀 Launching Next Month! Audio lessons coming soon.
              </p>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center">
          <Link
            to="/"
            className="inline-block px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800"
          >
            Back to Home
          </Link>
        </div>

        {/* Trust Indicators */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-300 mt-8">
          <p>✓ Secure payment • ✓ Instant access • ✓ No subscription, pay once</p>
        </div>
      </div>
    </div>
  );
}
