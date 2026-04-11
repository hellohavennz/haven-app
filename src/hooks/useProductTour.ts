/**
 * useProductTour
 *
 * Drives the Haven first-time onboarding tour using Intro.js.
 *
 * Tour is triggered automatically on the first dashboard visit.
 * It can be re-launched at any time by calling launchTour(true) (force=true).
 *
 * Step targeting:
 *   - Mobile: highlights MobileNav items at the bottom of the screen
 *   - Desktop: highlights Navbar links at the top
 *   - Flashcards has no desktop Navbar link, so desktop shows a floating step
 *   - Pippa step is silently omitted if the button doesn't exist in the DOM
 *     (i.e. user is not on the Premium tier)
 *
 * Scroll handling:
 *   Intro.js's built-in scroll targets window. Haven's scroll container is
 *   <main>. We disable Intro.js scrolling and handle it manually in onchange,
 *   using scrollIntoView (which respects the nearest scrollable ancestor).
 *   Fixed-position elements (nav items) are skipped since they're always visible.
 */

import { useCallback } from 'react';
import introJs from 'intro.js';

const TOUR_SEEN_KEY = 'haven-tour-seen';
const TOUR_VERSION  = '2'; // bump this string to re-show the tour to everyone

export function isTourSeen(): boolean {
  try {
    return localStorage.getItem(TOUR_SEEN_KEY) === TOUR_VERSION;
  } catch {
    return false;
  }
}

function markTourSeen(): void {
  try {
    localStorage.setItem(TOUR_SEEN_KEY, TOUR_VERSION);
  } catch { /* storage unavailable, ok */ }
}

/**
 * Returns the element if it exists AND has non-zero dimensions.
 * CSS-hidden elements (display:none, visibility:hidden) return null.
 */
function queryVisible(selector: string): HTMLElement | null {
  const el = document.querySelector<HTMLElement>(selector);
  if (!el) return null;
  const { width, height } = el.getBoundingClientRect();
  return width === 0 && height === 0 ? null : el;
}

type StepPosition = 'top' | 'bottom' | 'left' | 'right' | 'floating'
  | 'top-right-aligned' | 'top-left-aligned' | 'top-middle-aligned'
  | 'bottom-right-aligned' | 'bottom-left-aligned' | 'bottom-middle-aligned';

interface RawStep {
  selector?: string;   // undefined = floating/centered tooltip (no element highlight)
  title: string;
  intro: string;
  position?: StepPosition;
}

export function useProductTour() {
  const launchTour = useCallback((force = false) => {
    if (!force && isTourSeen()) return;

    const isMobile = window.innerWidth < 768;
    const navSuffix = isMobile ? '-mobile' : '-desktop';

    const rawSteps: RawStep[] = [
      // Step 1: Welcome — floating, no element
      {
        title: 'Welcome to Haven',
        intro:
          "A quick look at how Haven is structured. Takes about 30 seconds. Skip any time if you'd rather explore on your own.",
      },

      // Step 2: Dashboard stats
      {
        selector: '[data-tour="dashboard-stats"]',
        title: 'Your progress, at a glance',
        intro:
          "Your dashboard shows accuracy, lessons mastered, and how you're tracking against your exam date. It updates automatically as you study.",
        position: 'bottom',
      },

      // Step 3: Profile / account menu — always shown, both mobile and desktop
      {
        selector: '[data-tour="profile-btn"]',
        title: 'Your account menu',
        intro:
          "Tap your avatar to access your Profile, Dashboard, Help, and Sign Out. Premium users also see Analytics here.",
        position: 'bottom-left-aligned',
      },

      // Step 4: Mobile bottom nav overview — mobile only (filtered on desktop via queryVisible)
      {
        selector: '[data-tour="mobile-nav"]',
        title: 'Your study shortcuts',
        intro:
          "This bar at the bottom gives you one-tap access to Study, Practice, Flashcards, and Exam. It's always visible so you can switch sections instantly.",
        position: 'top',
      },

      // Step 5: Study
      {
        selector: `[data-tour="nav-study${navSuffix}"]`,
        title: 'Start with Study',
        intro:
          "Work through lessons covering each topic from the official syllabus. Start here if you're new, or when revisiting a topic.",
        position: isMobile ? 'top' : 'bottom',
      },

      // Step 6: Practice
      {
        selector: `[data-tour="nav-practice${navSuffix}"]`,
        title: 'Test what you know',
        intro:
          "Exam-style questions in the same format as the real test. Every answer includes a detailed explanation, so wrong answers become learning moments.",
        position: isMobile ? 'top' : 'bottom',
      },

      // Step 7: Flashcards
      // Mobile: targets the MobileNav item.
      // Desktop: floating step (no top-level Navbar link; Flashcards lives inside Practice).
      ...(isMobile
        ? [
            {
              selector: '[data-tour="nav-flashcards-mobile"]',
              title: 'Lock in the facts',
              intro:
                "Flashcards are for dates, names, and figures that need to stick. Most effective after reading the lesson, not instead of it.",
              position: 'top' as StepPosition,
            },
          ]
        : [
            {
              title: 'Lock in the facts',
              intro:
                "Flashcards live inside the Practice section, at the top of each lesson. Best used to lock in dates, names, and figures after reading the lesson first.",
            },
          ]),

      // Step 8: Mock exam
      {
        selector: `[data-tour="nav-exam${navSuffix}"]`,
        title: "When you're ready",
        intro:
          "Mock exam: 24 questions, 45 minutes, no hints. The real format. Take it once you've covered the material. Your first score is a baseline, not a verdict.",
        position: isMobile ? 'top' : 'bottom',
      },

      // Step 9: Module drawer — floating step so it always shows.
      // The burger button only appears on study/practice pages on mobile, so we
      // describe where to find it rather than targeting the element directly.
      {
        title: 'Jump between modules',
        intro:
          "On the Study, Practice, and Flashcard pages, tap the menu icon in the top left to see all modules. You can jump to any topic at any time without going back to the start.",
      },

      // Step 10: Pippa (conditionally shown — button only exists if tier === 'premium')
      {
        selector: '[data-tour="pippa-btn"]',
        title: 'Meet Pippa',
        intro:
          "Haven's AI study assistant. Ask her to explain something confusing, clarify a date, or give you a memory trick for a hard-to-remember fact.",
        position: 'top',
      },
    ];

    // Resolve elements, dropping any step whose selector finds nothing visible in the DOM
    const steps = rawSteps
      .filter(step => {
        if (!step.selector) return true;
        return queryVisible(step.selector) !== null;
      })
      .map(step => ({
        ...(step.selector
          ? { element: queryVisible(step.selector) as HTMLElement }
          : {}),
        title:    step.title,
        intro:    step.intro,
        position: step.position ?? 'floating',
      }));

    const tour = introJs();

    tour.setOptions({
      steps,
      showProgress:      true,
      showBullets:       false,
      exitOnOverlayClick: true,
      disableInteraction: false,
      // Disable built-in scrolling — we handle it manually below
      // because Haven's scroll container is <main>, not window.
      scrollToElement:   false,
      overlayOpacity:    0.4,
      nextLabel:         'Next',
      prevLabel:         'Back',
      skipLabel:         'Skip',
      doneLabel:         "Let's go",
    });

    // Scroll the target element into view using scrollIntoView, which
    // respects the nearest scrollable ancestor (<main> in Haven).
    // Fixed elements (nav items) are skipped — they're always visible.
    // NOTE: in intro.js v8 the callback receives the element as the first
    // argument; `this` is the Tour instance, NOT the element.
    tour.onchange(function(targetElement: HTMLElement) {
      const el = targetElement;
      if (!el || el === document.documentElement || el === document.body) return;
      const position = window.getComputedStyle(el).position;
      if (position === 'fixed' || position === 'sticky') return;
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    // Mark as seen whether the user completes or skips
    tour.oncomplete(markTourSeen);
    tour.onexit(markTourSeen);

    tour.start().catch((err: unknown) => {
      console.error('[Haven tour] start() failed:', err);
    });
  }, []);

  return { launchTour };
}
