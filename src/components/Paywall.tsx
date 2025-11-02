import { Link } from "react-router-dom";
import { Lock, Sparkles, CheckCircle2, Crown } from "lucide-react";

export default function Paywall() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Lock Icon Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full mb-4 shadow-xl">
            <Lock className="text-white" size={40} />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">
            Premium Content
          </h1>
          <p className="text-xl text-gray-600">
            Unlock all lessons and features to ace your Life in the UK test
          </p>
        </div>

        {/* Premium Benefits */}
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 mb-6 shadow-lg">
          <div className="flex items-center gap-2 mb-6">
            <Crown className="text-amber-600" size={28} />
            <h2 className="text-2xl font-bold text-gray-900">Premium Benefits</h2>
          </div>
          
          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-semibold text-gray-900">All 20+ Lessons</h3>
                <p className="text-sm text-gray-600">Complete coverage of the official Life in the UK handbook</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-semibold text-gray-900">Practice Questions</h3>
                <p className="text-sm text-gray-600">Hundreds of realistic exam-style questions with explanations</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-semibold text-gray-900">Interactive Flashcards</h3>
                <p className="text-sm text-gray-600">Memorize key facts with spaced repetition</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-semibold text-gray-900">Progress Tracking</h3>
                <p className="text-sm text-gray-600">See your mastery level and identify weak areas</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-semibold text-gray-900">Mock Exams</h3>
                <p className="text-sm text-gray-600">Full-length practice tests to ensure you're ready</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-semibold text-gray-900">Pass Guarantee</h3>
                <p className="text-sm text-gray-600">Complete the course and fail? Get your money back</p>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-200 rounded-xl p-6 mb-6">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-black text-gray-900">£12.99</span>
              <span className="text-lg text-gray-600">one-time</span>
            </div>
            <p className="text-sm text-gray-700">
              Full lifetime access • No subscription • Pass or get refunded
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <Link
              to="/paywall"
              className="flex items-center justify-center gap-2 w-full px-8 py-4 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl font-bold text-lg hover:opacity-90 transition-all shadow-lg"
            >
              <Sparkles size={24} />
              Upgrade to Premium
            </Link>
            
            <Link
              to="/"
              className="block text-center px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
            >
              Back to Home
            </Link>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="text-center text-sm text-gray-500">
          <p>✓ Secure payment • ✓ Instant access • ✓ Pass guarantee: Fail after completing? Get refunded</p>
        </div>
      </div>
    </div>
  );
}
