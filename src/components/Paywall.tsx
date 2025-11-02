import { Link } from "react-router-dom";
import { Sparkles, CheckCircle2, Crown, Headphones, FileText, Zap, Trophy } from "lucide-react";

export default function Paywall() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
      <div className="max-w-5xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full mb-4 shadow-xl">
            <Trophy className="text-white" size={40} />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-3">
            Pass Your Test with Confidence
          </h1>
          <p className="text-xl text-gray-600">
            Join thousands who passed on their first try
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Plus Plan */}
          <div className="bg-white border-2 border-teal-300 rounded-2xl p-8 shadow-lg relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-teal-600 text-white text-sm font-bold rounded-full">
              MOST POPULAR
            </div>
            
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 rounded-2xl mb-4">
                <Sparkles className="text-teal-600" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Haven Plus</h2>
              <div className="flex items-baseline justify-center gap-2 mb-2">
                <span className="text-5xl font-black text-gray-900">£12.99</span>
                <span className="text-gray-600">one-time</span>
              </div>
              <p className="text-sm text-gray-600">
                Everything you need to pass
              </p>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="text-teal-600 flex-shrink-0 mt-0.5" size={20} />
                <span className="text-gray-700">All 20+ comprehensive lessons</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="text-teal-600 flex-shrink-0 mt-0.5" size={20} />
                <span className="text-gray-700">500+ practice questions with explanations</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="text-teal-600 flex-shrink-0 mt-0.5" size={20} />
                <span className="text-gray-700">Interactive flashcards</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="text-teal-600 flex-shrink-0 mt-0.5" size={20} />
                <span className="text-gray-700">Smart progress tracking</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="text-teal-600 flex-shrink-0 mt-0.5" size={20} />
                <span className="text-gray-700">Full-length mock exams</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="text-teal-600 flex-shrink-0 mt-0.5" size={20} />
                <span className="text-gray-700">Lifetime access</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="text-teal-600 flex-shrink-0 mt-0.5" size={20} />
                <span className="text-gray-700 font-semibold">Pass guarantee - fail after completing? Get refunded</span>
              </li>
            </ul>

            <Link
              to="/paywall"
              className="flex items-center justify-center gap-2 w-full px-8 py-4 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl font-bold text-lg hover:opacity-90 transition-all shadow-lg"
            >
              Start Your Journey
              <Sparkles size={20} />
            </Link>
          </div>

          {/* Premium Plan */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-2xl p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500 rounded-full blur-3xl opacity-20"></div>
            
            <div className="relative z-10">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-500/20 backdrop-blur rounded-2xl mb-4">
                  <Crown className="text-amber-400" size={32} />
                </div>
                <h2 className="text-2xl font-bold mb-2">Haven Premium</h2>
                <div className="flex items-baseline justify-center gap-2 mb-2">
                  <span className="text-5xl font-black">£19.99</span>
                  <span className="text-gray-400">one-time</span>
                </div>
                <p className="text-sm text-gray-400">
                  Ultimate learning experience
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="text-amber-400 flex-shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-200 font-semibold">Everything in Plus, plus:</span>
                </li>
                <li className="flex items-start gap-3">
                  <Headphones className="text-amber-400 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <span className="text-white font-semibold">Audio lessons</span>
                    <p className="text-sm text-gray-400">Listen and learn on the go</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <FileText className="text-amber-400 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <span className="text-white font-semibold">Downloadable study guides</span>
                    <p className="text-sm text-gray-400">PDF versions for offline study</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Zap className="text-amber-400 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <span className="text-white font-semibold">Priority support</span>
                    <p className="text-sm text-gray-400">Get help within 24 hours</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Crown className="text-amber-400 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <span className="text-white font-semibold">Early access</span>
                    <p className="text-sm text-gray-400">New features before everyone else</p>
                  </div>
                </li>
              </ul>

              <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-4 mb-6 text-center">
                <p className="text-sm text-gray-300 font-medium">
                  🚀 Coming Soon! Audio lessons launching next month.
                </p>
              </div>

              <button
                disabled
                className="flex items-center justify-center gap-2 w-full px-8 py-4 bg-white/10 text-white/50 rounded-xl font-bold text-lg cursor-not-allowed"
              >
                Coming Soon
              </button>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center">
          <Link
            to="/"
            className="inline-block px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
          >
            Back to Home
          </Link>
        </div>

        {/* Trust Indicators */}
        <div className="text-center text-sm text-gray-500 mt-8">
          <p>✓ Secure payment • ✓ Instant access • ✓ No subscription, pay once</p>
        </div>
      </div>
    </div>
  );
}
