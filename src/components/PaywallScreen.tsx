import { Link } from "react-router-dom";
import { Lock, Star, CheckCircle2, Zap, Trophy } from "lucide-react";

export default function PaywallScreen() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full mb-6 shadow-lg">
          <Lock className="text-white" size={36} />
        </div>
        <h1 className="font-semibold text-slate-900 mb-4">
          Unlock Full Access
        </h1>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Get unlimited access to all lessons, practice questions, and flashcards. 
          Pass your Life in the UK test with confidence.
        </p>
      </div>

      {/* Pricing Card */}
      <div className="max-w-md mx-auto mb-12">
        <div className="bg-gradient-to-br from-white to-teal-50 border-2 border-teal-200 rounded-2xl p-8 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-slate-900">Premium Access</h3>
              <p className="text-slate-600">Complete test preparation</p>
            </div>
            <div className="flex items-center gap-2">
              <Star className="text-amber-500 fill-amber-500" size={24} />
              <Star className="text-amber-500 fill-amber-500" size={24} />
              <Star className="text-amber-500 fill-amber-500" size={24} />
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-semibold text-slate-900">£29</span>
              <span className="text-slate-600">one-time</span>
            </div>
            <p className="text-sm text-slate-500 mt-1">Lifetime access • No subscription</p>
          </div>

          <Link
            to="/paywall"
            className="block w-full px-8 py-4 text-center rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 text-white font-semibold hover:opacity-90 transition-all shadow-lg mb-6"
          >
            Upgrade to Premium
          </Link>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-slate-700">
              <CheckCircle2 className="text-green-600 flex-shrink-0" size={20} />
              <span>All {/* Total lesson count will be dynamic */} lessons unlocked</span>
            </div>
            <div className="flex items-center gap-3 text-slate-700">
              <CheckCircle2 className="text-green-600 flex-shrink-0" size={20} />
              <span>Unlimited practice questions</span>
            </div>
            <div className="flex items-center gap-3 text-slate-700">
              <CheckCircle2 className="text-green-600 flex-shrink-0" size={20} />
              <span>Interactive flashcards</span>
            </div>
            <div className="flex items-center gap-3 text-slate-700">
              <CheckCircle2 className="text-green-600 flex-shrink-0" size={20} />
              <span>Progress tracking & dashboard</span>
            </div>
            <div className="flex items-center gap-3 text-slate-700">
              <CheckCircle2 className="text-green-600 flex-shrink-0" size={20} />
              <span>Full mock exams</span>
            </div>
            <div className="flex items-center gap-3 text-slate-700">
              <CheckCircle2 className="text-green-600 flex-shrink-0" size={20} />
              <span>Money-back guarantee</span>
            </div>
          </div>
        </div>
      </div>

      {/* Why Premium */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white border-2 border-slate-200 rounded-xl p-6 text-center">
          <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="text-teal-600" size={24} />
          </div>
          <h3 className="font-semibold text-slate-900 mb-2">Comprehensive Coverage</h3>
          <p className="text-sm text-slate-600">
            Every test topic covered, written in plain English
          </p>
        </div>

        <div className="bg-white border-2 border-slate-200 rounded-xl p-6 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="text-green-600" size={24} />
          </div>
          <h3 className="font-semibold text-slate-900 mb-2">Proven Results</h3>
          <p className="text-sm text-slate-600">
            Practice questions mirror the real test. Pass with confidence.
          </p>
        </div>

        <div className="bg-white border-2 border-slate-200 rounded-xl p-6 text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="text-blue-600" size={24} />
          </div>
          <h3 className="font-semibold text-slate-900 mb-2">One-Time Payment</h3>
          <p className="text-sm text-slate-600">
            Pay once. Access lasts 30 to 180 days. No recurring fees.
          </p>
        </div>
      </div>

      {/* Free Preview Notice */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 text-center">
        <p className="text-slate-700">
          <span className="font-semibold">Enjoying the free preview?</span> You've tried 2 lessons. 
          Upgrade now to access all content and pass your test.
        </p>
      </div>
    </div>
  );
}
