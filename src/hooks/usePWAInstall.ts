import { useEffect, useRef, useState } from 'react';
import {
  detectPlatform,
  hasDismissedInstall,
  isStandaloneMode,
  recordInstallDismissal,
  type InstallPlatform,
} from '../lib/pwaInstall';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

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
  const promptRef = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Never show if already installed or recently dismissed
    if (isStandaloneMode() || hasDismissedInstall()) return;

    if (platform === 'ios') {
      setShouldShow(true);
      return;
    }

    // Android and desktop: wait for the browser to offer install
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      promptRef.current = e as BeforeInstallPromptEvent;
      setShouldShow(true);
    };

    const onInstalled = () => {
      promptRef.current = null;
      setShouldShow(false);
    };

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

    if (!promptRef.current) return;

    await promptRef.current.prompt();
    const { outcome } = await promptRef.current.userChoice;
    promptRef.current = null;

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
