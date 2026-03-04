import { useState, useEffect, useRef } from "react";
import { usePageTitle } from '../hooks/usePageTitle';
import {
  BookOpen,
  Brain,
  Trophy,
  BarChart3,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Mail,
  Flag,
  BookMarked,
  ArrowUp,
} from "lucide-react";
import { keyFactGroups } from '../data/keyFacts';

type FAQItem = {
  question: string;
  answer: string;
};

const faqs: FAQItem[] = [
  {
    question: "How do I use this app to prepare for the test?",
    answer:
      "Start by working through the Study lessons to learn all the key facts. Then use Practice mode to test your knowledge with questions. Review your progress on the Dashboard and use Flashcards for quick revision. When you're consistently scoring 75% or higher, you're ready for the real test!",
  },
  {
    question: "What's the difference between Study and Practice?",
    answer:
      "Study mode presents lessons with all the information you need to learn, organized by topic. Practice mode tests your knowledge with multiple-choice questions similar to the real exam. Use Study to learn, then Practice to test yourself.",
  },
  {
    question: "How many questions do I need to get right to pass?",
    answer:
      "You need to answer at least 18 out of 24 questions correctly (75%) to pass the Life in the UK test. The test is 45 minutes long.",
  },
  {
    question: "Can I track my progress?",
    answer:
      "Yes! The Dashboard shows your overall progress, including lessons completed, practice accuracy, and areas that need improvement. Each lesson also shows two separate indicators: a 'Read' badge appears once you click 'Mark as read' at the bottom of a lesson, and a percentage (e.g. 90%) shows your practice accuracy, meaning how many questions you answered correctly in that lesson's practice session. These are independent: reading a lesson doesn't affect your practice score, and doing practice questions doesn't mark a lesson as read.",
  },
  {
    question: "Do I need to complete the lessons in order?",
    answer:
      "No, you can access any lesson in any order. However, we recommend following the suggested path as topics build on each other. The first two modules are free to try.",
  },
  {
    question: "What happens when I get a question wrong?",
    answer:
      "When you answer a practice question, you'll immediately see if it's correct or incorrect, along with a detailed explanation. This helps you learn from mistakes and understand why the correct answer is right.",
  },
  {
    question: "How often should I practice?",
    answer:
      "Regular practice is key! We recommend studying for 20-30 minutes daily rather than long cramming sessions. Use flashcards for quick 5-10 minute review sessions throughout the day.",
  },
  {
    question: "Is the content up to date?",
    answer:
      "Yes! Our content is regularly updated to align with the official 'Life in the United Kingdom: A Guide for New Residents' handbook and the latest test requirements.",
  },
  {
    question: "What if I'm not ready for the full exam?",
    answer:
      "Take your time! Focus on completing all the lessons and practicing until you consistently score 75% or higher. The mock exams are there when you're ready to test yourself under exam conditions.",
  },
  {
    question: "Can I use this on my phone?",
    answer:
      "Absolutely! The app is fully responsive and works great on phones, tablets, and computers. Study and practice wherever you are.",
  },
  {
    question: "How do I install Haven on my phone or computer?",
    answer:
      "Haven can be installed like an app, no App Store needed. On iPhone or iPad: open the site in Safari, tap the Share button (box with arrow) at the bottom of the screen, then tap 'Add to Home Screen' and confirm. On Android: open in Chrome, tap the ⋮ menu in the top-right corner, then tap 'Add to Home Screen' or 'Install app'. On desktop (Chrome or Edge): look for the install icon (⊕) at the right end of the address bar and click Install. Once installed, Haven works offline; lessons are cached so you can study anywhere, even without an internet connection.",
  },
  {
    question: "What is Resit Support?",
    answer:
      "Resit Support is included in Haven Plus and Haven Premium. If you sit the Life in the UK test and don't pass, you can submit a photo of your result letter through your Profile page. Once approved, we'll extend your subscription by one free month so you have extra time to prepare for your resit, at no charge to you.",
  },
  {
    question: "What are the requirements to claim Resit Support?",
    answer:
      "To be eligible you must: (1) have completed all 24 study lessons, (2) have achieved an average practice score of 75% or higher across those lessons, (3) have passed at least one mock exam, and (4) have sat your real test within the last 14 days. These checks are shown automatically on your Profile page; the claim form only unlocks once all conditions are met. Each account can only claim Resit Support once.",
  },
  {
    question: "How do I report an error or unclear content?",
    answer:
      "If you spot a mistake, unclear wording, or anything that doesn't look right, tap the flag icon (Report issue) that appears at the bottom of lessons, practice questions, and flashcards. Describe the problem briefly and submit. Our team will review it and fix it. You need to be logged in to send a report.",
  },
];

function FAQAccordion({ item }: { item: FAQItem }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-xl border border-slate-200 bg-white transition-all hover:border-teal-300 dark:border-slate-800 dark:bg-slate-900">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-6 text-left"
      >
        <span className="pr-4 font-semibold text-slate-900 dark:text-white">{item.question}</span>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 flex-shrink-0 text-teal-500" />
        ) : (
          <ChevronDown className="h-5 w-5 flex-shrink-0 text-slate-400 dark:text-slate-500" />
        )}
      </button>

      {isOpen && (
        <div className="border-t border-slate-100 px-6 pb-6 pt-4 dark:border-slate-800">
          <p className="leading-relaxed text-slate-600 dark:text-slate-200">{item.answer}</p>
        </div>
      )}
    </div>
  );
}

export default function Help() {
  usePageTitle('Help & Support', 'Answers to common questions about Haven Study, plus contact details if you need more support.');
  const [activeTab, setActiveTab] = useState<'help' | 'facts'>('help');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // The scroll container is <main overflow-y-auto> in RootLayout, not window.
  // Use IntersectionObserver on a sentinel at the top of the page — fires
  // whenever the sentinel leaves the viewport regardless of which element scrolls.
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setShowScrollTop(!entry.isIntersecting),
      { root: document.querySelector('main'), threshold: 0 }
    );
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
      {/* Sentinel: observed by IntersectionObserver to detect scroll position */}
      <div ref={sentinelRef} aria-hidden="true" />
      <div className="space-y-4 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-teal-100 px-4 py-2 text-sm font-semibold text-teal-700 dark:bg-teal-900/30 dark:text-teal-100">
          <HelpCircle className="h-4 w-4" />
          Help & Resources
        </div>

        <h1 className="font-semibold text-slate-900 dark:text-white">
          Help & Support
        </h1>

        <p className="text-slate-600 dark:text-slate-200">
          Everything you need to know about using Haven, plus a full key facts reference for quick revision.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-800 dark:bg-slate-900">
        <button
          onClick={() => setActiveTab('help')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
            activeTab === 'help'
              ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white'
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <HelpCircle className="h-4 w-4" />
          Help & FAQ
        </button>
        <button
          onClick={() => setActiveTab('facts')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
            activeTab === 'facts'
              ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white'
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <BookMarked className="h-4 w-4" />
          Key Facts & Dates
        </button>
      </div>

      {activeTab === 'facts' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-teal-200 bg-teal-50 px-6 py-4 dark:border-teal-900/50 dark:bg-teal-900/20">
            <p className="text-sm text-teal-800 dark:text-teal-200 leading-relaxed">
              A summary of key dates and facts extracted from the e-publication <em>Life in the United Kingdom: A Guide for New Residents, 3rd Edition</em>. We recommend reading the full source material for context; these facts are for quick revision only.
            </p>
          </div>
          {keyFactGroups.map((group) => (
            <div key={group.heading} className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
              <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/60">
                <h2 className="font-semibold text-slate-900 dark:text-white">{group.heading}</h2>
              </div>
              <ul className="divide-y divide-gray-50 dark:divide-gray-800">
                {group.facts.map((fact, i) => (
                  <li key={i} className="flex items-start gap-3 px-6 py-3">
                    <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-teal-100 text-[10px] font-bold text-teal-700 dark:bg-teal-900/40 dark:text-teal-300">
                      {i + 1}
                    </span>
                    <span className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{fact}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'help' && (
      <div className="space-y-12">

      <div className="rounded-2xl border border-slate-200 bg-teal-50 p-8 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-6 font-semibold text-slate-900 dark:text-white">How to Use Haven</h2>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl bg-white p-6 shadow-sm dark:border dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100 dark:bg-teal-900/40">
              <BookOpen className="h-6 w-6 text-teal-600 dark:text-teal-200" />
            </div>
            <h3 className="mb-2 font-semibold text-slate-900 dark:text-white">1. Study Lessons</h3>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Start by reading through the lessons in Study mode. Each lesson covers essential
              facts you need to know, organized by topic. Take your time to understand and absorb
              the information.
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm dark:border dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/40">
              <Brain className="h-6 w-6 text-emerald-600 dark:text-emerald-200" />
            </div>
            <h3 className="mb-2 font-semibold text-slate-900 dark:text-white">2. Practice Questions</h3>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Test your knowledge with realistic practice questions. Get instant feedback and
              detailed explanations. Keep practicing until you consistently score 75% or higher.
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm dark:border dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-sky-100 dark:bg-sky-900/40">
              <BarChart3 className="h-6 w-6 text-sky-600 dark:text-sky-200" />
            </div>
            <h3 className="mb-2 font-semibold text-slate-900 dark:text-white">3. Track Progress</h3>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Monitor your progress on the Dashboard. See which topics you've mastered and which
              need more work. Focus your study time where it matters most.
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm dark:border dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/40">
              <Trophy className="h-6 w-6 text-purple-600 dark:text-purple-200" />
            </div>
            <h3 className="mb-2 font-semibold text-slate-900 dark:text-white">4. Take Mock Exams</h3>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              When you're ready, take a full mock exam under timed conditions. This simulates the
              real test experience and helps you verify you're fully prepared.
            </p>
          </div>
        </div>
      </div>

      {/* Report issue callout */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 flex items-start gap-4">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-red-50 dark:bg-red-900/20">
          <Flag className="h-6 w-6 text-red-500" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Found an error?</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Every lesson, practice question, and flashcard has a small <strong>Report issue</strong> link at the bottom.
            If something looks wrong or confusing, tap it to send us a quick note. We review all reports and update the content.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="font-semibold text-slate-900 dark:text-white">Frequently Asked Questions</h2>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <FAQAccordion key={index} item={faq} />
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-teal-600">
            <Mail className="h-8 w-8 text-white" />
          </div>

          <div className="flex-1 space-y-2">
            <h3 className="font-semibold text-slate-900 dark:text-white">Still have questions?</h3>
            <p className="text-slate-600 dark:text-slate-300">
              Can't find the answer you're looking for? Our support team is here to help.
            </p>
          </div>

          <a
            href="mailto:support@haven.study"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 px-6 py-3 font-semibold text-white transition-all hover:shadow-lg"
          >
            Contact Support
          </a>
        </div>
      </div>

      <div className="rounded-xl bg-slate-50 p-6 dark:border dark:border-slate-800 dark:bg-slate-900">
        <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">Tips for Success</h3>
        <ul className="space-y-3 text-sm text-slate-700 dark:text-slate-200">
          <li className="flex items-start gap-3">
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-teal-100 text-small font-semibold text-teal-600 dark:bg-teal-900/40 dark:text-teal-100">
              1
            </span>
            <span>
              <strong>Study consistently:</strong> Short, regular study sessions are more
              effective than cramming. Aim for 20-30 minutes daily.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-teal-100 text-small font-semibold text-teal-600 dark:bg-teal-900/40 dark:text-teal-100">
              2
            </span>
            <span>
              <strong>Focus on weak areas:</strong> Use your Dashboard to identify topics where
              you're scoring below 75% and spend extra time on those.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-teal-100 text-small font-semibold text-teal-600 dark:bg-teal-900/40 dark:text-teal-100">
              3
            </span>
            <span>
              <strong>Read explanations:</strong> When you get a question wrong, read the
              explanation carefully to understand why the correct answer is right.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-teal-100 text-small font-semibold text-teal-600 dark:bg-teal-900/40 dark:text-teal-100">
              4
            </span>
            <span>
              <strong>Practice under pressure:</strong> Take mock exams with a timer to simulate
              the real test conditions and build confidence.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-teal-100 text-small font-semibold text-teal-600 dark:bg-teal-900/40 dark:text-teal-100">
              5
            </span>
            <span>
              <strong>Review regularly:</strong> Use flashcards for quick daily reviews to keep
              information fresh in your memory.
            </span>
          </li>
        </ul>
      </div>
      </div>
      )}

      {/* Scroll to top */}
      {showScrollTop && (
        <button
          onClick={() => document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-40 right-4 md:bottom-24 md:right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-teal-600 text-white shadow-lg transition hover:bg-teal-700"
          aria-label="Back to top"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
