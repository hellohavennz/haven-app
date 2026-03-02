import { useEffect, useState } from 'react';
import {
  detectPlatform,
  getDeferredPrompt,
  clearDeferredPrompt,
  hasDismissedInstall,
  isStandaloneMode,
  recordInstallDismissal,
  type InstallPlatform,
} from '../lib/pwaInstall';

export interface UsePWAInstallResult {
  shouldShow: boolean;
  platform: InstallPlatform;
  showIOSInstructions: boolean;
  install: () => Promise<void>;
  dismiss: () => void;
  closeIOSInstructions: () => void;
}

export function usePWAInstall(): UsePWAInstallResult {
  const platform = detectPlatform();
  const [shouldShow, setShouldShow] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    if (isStandaloneMode() || hasDismissedInstall()) return;

    if (platform === 'ios') {
      setShouldShow(true);
      return;
    }

    // Check if the event was captured before React mounted
    if (getDeferredPrompt()) {
      setShouldShow(true);
      return;
    }

    // Fall-through: event hasn't fired yet — listen for it
    const onBeforeInstall = () => {
      // pwaInstall.ts already called e.preventDefault() and stored the event
      setShouldShow(true);
    };
    const onInstalled = () => setShouldShow(false);

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, [platform]);

  async function install() {
    if (platform === 'ios') {
      setShowIOSInstructions(true);
      return;
    }

    const prompt = getDeferredPrompt();
    if (!prompt) return;

    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    clearDeferredPrompt();

    if (outcome === 'accepted') {
      setShouldShow(false);
    }
  }

  function dismiss() {
    recordInstallDismissal();
    setShouldShow(false);
    setShowIOSInstructions(false);
  }

  function closeIOSInstructions() {
    setShowIOSInstructions(false);
  }

  return { shouldShow, platform, showIOSInstructions, install, dismiss, closeIOSInstructions };
}
