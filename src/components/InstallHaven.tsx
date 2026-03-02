import { useEffect } from 'react';
import { X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

// ── Inline SVG icons for iOS step illustrations ────────────────────────────

const ShareIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <polyline points="16 6 12 2 8 6" />
    <line x1="12" y1="2" x2="12" y2="15" />
  </svg>
);

const AddToScreenIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

const ConfirmIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// ── iOS instructions modal ─────────────────────────────────────────────────

const IOS_STEPS = [
  {
    icon: <ShareIcon />,
    title: 'Tap the Share button',
    detail: 'Find it at the bottom of Safari.',
  },
  {
    icon: <AddToScreenIcon />,
    title: 'Tap Add to Home Screen',
    detail: 'Scroll down in the menu if needed.',
  },
  {
    icon: <ConfirmIcon />,
    title: 'Tap Add to confirm',
    detail: 'It appears in the top right corner.',
  },
];

function IOSModal({
  onClose,
  onDismiss,
}: {
  onClose: () => void;
  onDismiss: () => void;
}) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ios-install-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-6">
          <div>
            <h2
              id="ios-install-title"
              className="font-semibold text-slate-900 dark:text-white"
            >
              Add to your Home Screen
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Follow these steps in Safari:
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            autoFocus
            className="flex-shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Steps */}
        <ol className="space-y-4">
          {IOS_STEPS.map((step, i) => (
            <li key={i} className="flex items-start gap-4">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/40 text-sm font-semibold text-teal-700 dark:text-teal-400">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {step.title}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {step.detail}
                </p>
              </div>
              <div className="flex-shrink-0 pt-0.5 text-slate-400 dark:text-slate-500">
                {step.icon}
              </div>
            </li>
          ))}
        </ol>

        {/* Primary CTA */}
        <button
          onClick={onClose}
          className="mt-6 w-full rounded-xl bg-teal-600 hover:bg-teal-700 py-3 text-sm font-semibold text-white transition-colors"
        >
          Got it
        </button>

        {/* Soft dismiss */}
        <button
          onClick={onDismiss}
          className="mt-3 w-full py-1.5 text-center text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        >
          Don't show this again
        </button>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export default function InstallHaven() {
  const { shouldShow, showIOSInstructions, install, dismiss, closeIOSInstructions } =
    usePWAInstall();

  if (!shouldShow) return null;

  return (
    <>
      {/* Install banner */}
      <div
        role="region"
        aria-label="Install Haven"
        className="flex gap-4 rounded-2xl border border-teal-100 bg-teal-50 px-5 py-4 dark:border-teal-800/50 dark:bg-teal-900/20"
      >
        {/* App icon */}
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-teal-600">
          <img src="/haven-icons/icon-512x512.png" alt="" className="h-full w-full" />
        </div>

        {/* Text + actions */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">
                Install Haven on your device
              </p>
              <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                Study offline, any time, without opening a browser.
              </p>
            </div>
            <button
              onClick={dismiss}
              aria-label="Dismiss install prompt"
              className="flex-shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-teal-100 hover:text-slate-600 dark:hover:bg-teal-800/40 dark:hover:text-slate-300 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={install}
            className="mt-3 rounded-lg bg-teal-600 hover:bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition-colors"
          >
            Install app
          </button>
        </div>
      </div>

      {/* iOS instructions overlay */}
      {showIOSInstructions && (
        <IOSModal onClose={closeIOSInstructions} onDismiss={dismiss} />
      )}
    </>
  );
}
