import { usePageTitle } from '../hooks/usePageTitle';

export default function Privacy() {
  usePageTitle('Privacy Policy');
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 space-y-8 text-gray-700 dark:text-gray-300">
      <div>
        <h1 className="font-semibold text-gray-900 dark:text-white mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Last updated: 28 February 2026</p>
      </div>

      <p>
        Haven ("we", "us", "our") operates the Haven Study app available at{' '}
        <a href="https://havenstudy.app" className="text-teal-600 hover:underline dark:text-teal-400">havenstudy.app</a>{' '}
        and{' '}
        <a href="https://haven.study" className="text-teal-600 hover:underline dark:text-teal-400">haven.study</a>.
        This policy explains what personal data we collect, why we collect it, and how we use it.
      </p>

      <section className="space-y-3">
        <h2 className="font-semibold text-gray-900 dark:text-white">1. Data we collect</h2>
        <ul className="list-disc pl-5 space-y-2 text-sm leading-relaxed">
          <li><strong>Account data</strong> — your name and email address when you register.</li>
          <li><strong>Study progress</strong> — which lessons you have completed, practice question scores, flashcard activity, and mock exam results.</li>
          <li><strong>Login activity</strong> — the dates on which you sign in, used to calculate usage statistics for our internal dashboard.</li>
          <li><strong>Exam date</strong> — your intended Life in the UK test date, if you choose to enter it.</li>
          <li><strong>Payment data</strong> — billing details are processed by Stripe and never stored on our servers. We receive only a subscription status and customer reference.</li>
          <li><strong>Resit Support evidence</strong> — if you submit a Resit Support claim, you upload a photo of your test result letter. This is stored securely and deleted once your claim is resolved.</li>
          <li><strong>Technical data</strong> — standard server logs including IP address, browser type, and pages visited.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold text-gray-900 dark:text-white">2. How we use your data</h2>
        <ul className="list-disc pl-5 space-y-2 text-sm leading-relaxed">
          <li>To provide and improve the Haven Study service.</li>
          <li>To track your study progress and personalise your experience.</li>
          <li>To manage your subscription and process payments via Stripe.</li>
          <li>To send transactional emails (account creation, password reset, subscription receipts).</li>
          <li>To review Resit Support claims and extend subscriptions where eligible.</li>
          <li>To analyse aggregate usage patterns and improve our content.</li>
        </ul>
        <p className="text-sm">We do not sell your personal data to third parties.</p>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold text-gray-900 dark:text-white">3. Third-party services</h2>
        <ul className="list-disc pl-5 space-y-2 text-sm leading-relaxed">
          <li><strong>Supabase</strong> — database and authentication hosting (EU region).</li>
          <li><strong>Stripe</strong> — payment processing. Stripe's privacy policy applies to payment data.</li>
          <li><strong>Netlify</strong> — website hosting and serverless functions.</li>
          <li><strong>Google Sign-In</strong> — optional third-party authentication. Google's privacy policy applies if you use this option.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold text-gray-900 dark:text-white">4. Data retention</h2>
        <p className="text-sm leading-relaxed">
          We retain your account data for as long as your account is active. If you delete your account,
          your personal data is permanently removed within 30 days. Anonymised aggregate statistics
          (e.g. total exam pass rates) may be retained indefinitely.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold text-gray-900 dark:text-white">5. Your rights (UK GDPR)</h2>
        <p className="text-sm leading-relaxed">Under UK data protection law you have the right to:</p>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>Access the personal data we hold about you.</li>
          <li>Correct inaccurate data.</li>
          <li>Request deletion of your data ("right to be forgotten").</li>
          <li>Object to or restrict certain processing.</li>
          <li>Receive your data in a portable format.</li>
        </ul>
        <p className="text-sm">
          To exercise any of these rights, email us at{' '}
          <a href="mailto:support@haven.study" className="text-teal-600 hover:underline dark:text-teal-400">support@haven.study</a>.
          We will respond within 30 days.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold text-gray-900 dark:text-white">6. Cookies</h2>
        <p className="text-sm leading-relaxed">
          We use only essential cookies required for authentication and session management.
          We do not use advertising or tracking cookies.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold text-gray-900 dark:text-white">7. Changes to this policy</h2>
        <p className="text-sm leading-relaxed">
          We may update this policy from time to time. Material changes will be notified by email
          or by a prominent notice in the app. The date at the top of this page shows when it was
          last revised.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold text-gray-900 dark:text-white">8. Contact</h2>
        <p className="text-sm">
          Questions about this policy?{' '}
          <a href="mailto:support@haven.study" className="text-teal-600 hover:underline dark:text-teal-400">support@haven.study</a>
        </p>
      </section>
    </div>
  );
}
