import { usePageTitle } from '../hooks/usePageTitle';

export default function Terms() {
  usePageTitle('Terms of Service', 'Haven Study\'s terms of service: the rules and conditions for using Haven Study.');
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 space-y-8 text-slate-700 dark:text-slate-300">
      <div>
        <h1 className="font-semibold text-slate-900 dark:text-white mb-2">Terms of Service</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Last updated: 28 February 2026</p>
      </div>

      <p className="text-sm leading-relaxed">
        By creating an account or using Haven Study ("the Service"), you agree to these terms.
        Please read them carefully. If you do not agree, do not use the Service.
      </p>

      <section className="space-y-3">
        <h2 className="font-semibold text-slate-900 dark:text-white">1. The Service</h2>
        <p className="text-sm leading-relaxed">
          Haven Study is an online study tool to help people prepare for the Life in the UK test.
          It provides lessons, practice questions, flashcards, and mock exams. The Service is
          provided by Haven and is available at{' '}
          <a href="https://havenstudy.app" className="text-teal-600 hover:underline dark:text-teal-400">havenstudy.app</a>.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold text-slate-900 dark:text-white">2. Accounts</h2>
        <ul className="list-disc pl-5 space-y-2 text-sm leading-relaxed">
          <li>You must be 18 or older to create an account.</li>
          <li>You are responsible for keeping your password secure and for all activity under your account.</li>
          <li>You must provide accurate information when registering.</li>
          <li>We may suspend or terminate accounts that violate these terms.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold text-slate-900 dark:text-white">3. Subscriptions and payments</h2>
        <ul className="list-disc pl-5 space-y-2 text-sm leading-relaxed">
          <li><strong>Free plan:</strong> access to three free modules at no charge.</li>
          <li><strong>Haven Plus:</strong> one-off access pass for 30 days (£4.99) or 90 days (£9.99). Full access to all lessons, practice questions, flashcards, and 2 mock exams per month. No auto-renewal.</li>
          <li><strong>Haven Premium:</strong> one-off access pass for 180 days (£24.99). Everything in Plus, plus dynamic exams, Pippa AI, performance analytics, exam date reminders, and offline access. No auto-renewal.</li>
          <li>Payments are processed by Stripe. By subscribing you authorise recurring charges to your payment method.</li>
          <li>You may cancel your subscription at any time via your Profile page. Access continues until the end of the current billing period.</li>
          <li>Prices are shown inclusive of any applicable taxes.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold text-slate-900 dark:text-white">4. Refunds</h2>
        <p className="text-sm leading-relaxed">
          If you are not satisfied with your subscription, contact us at{' '}
          <a href="mailto:support@haven.study" className="text-teal-600 hover:underline dark:text-teal-400">support@haven.study</a>{' '}
          within 14 days of your first payment and we will issue a full refund. After 14 days,
          refunds are at our discretion.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold text-slate-900 dark:text-white">5. Resit Support</h2>
        <ul className="list-disc pl-5 space-y-2 text-sm leading-relaxed">
          <li>Resit Support is available to active Plus and Premium subscribers.</li>
          <li>
            To be eligible you must: have completed all study lessons, achieved an average
            practice score of 75% or higher, passed at least one mock exam, and sat your
            real Life in the UK test within the previous 14 days.
          </li>
          <li>You must submit photo evidence of your failed test result for verification.</li>
          <li>If approved, your subscription will be extended by 30 days at no charge.</li>
          <li>Resit Support does not cover the cost of rebooking your test.</li>
          <li>Each account may claim Resit Support once.</li>
          <li>We reserve the right to decline claims that do not meet the eligibility criteria.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold text-slate-900 dark:text-white">6. Acceptable use</h2>
        <p className="text-sm leading-relaxed">You agree not to:</p>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>Share your account credentials with others.</li>
          <li>Copy, distribute, or republish our content without permission.</li>
          <li>Attempt to reverse-engineer or scrape the Service.</li>
          <li>Use the Service for any unlawful purpose.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold text-slate-900 dark:text-white">7. Intellectual property</h2>
        <p className="text-sm leading-relaxed">
          All content in the Service, including lessons, questions, flashcards, and software,
          is owned by Haven or its licensors. The official Life in the UK study material is
          published by the Home Office and is used in accordance with Open Government Licence v3.0.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold text-slate-900 dark:text-white">8. Disclaimer</h2>
        <p className="text-sm leading-relaxed">
          Haven Study is a revision tool and does not guarantee that you will pass the Life in the
          UK test. We make every effort to keep content accurate and up to date, but we cannot
          guarantee it is complete or error-free. The Service is provided "as is" without warranty
          of any kind.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold text-slate-900 dark:text-white">9. Limitation of liability</h2>
        <p className="text-sm leading-relaxed">
          To the fullest extent permitted by law, Haven is not liable for any indirect, incidental,
          or consequential damages arising from your use of the Service. Our total liability to you
          shall not exceed the amount you paid us in the 12 months prior to the claim.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold text-slate-900 dark:text-white">10. Governing law</h2>
        <p className="text-sm leading-relaxed">
          These terms are governed by the laws of England and Wales. Any disputes will be subject
          to the exclusive jurisdiction of the courts of England and Wales.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold text-slate-900 dark:text-white">11. Changes to these terms</h2>
        <p className="text-sm leading-relaxed">
          We may update these terms from time to time. Continued use of the Service after changes
          are posted constitutes acceptance of the new terms. We will notify you of material changes
          by email.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold text-slate-900 dark:text-white">12. Contact</h2>
        <p className="text-sm">
          Questions about these terms?{' '}
          <a href="mailto:support@haven.study" className="text-teal-600 hover:underline dark:text-teal-400">support@haven.study</a>
        </p>
      </section>
    </div>
  );
}
