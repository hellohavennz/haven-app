import { useState, useEffect } from 'react';
import { getCurrentUser } from './auth';
import { supabase } from './supabase';

export type SubscriptionTier = 'free' | 'plus' | 'premium';

export type SubscriptionStatus = {
  tier: SubscriptionTier;
  hasPlus: boolean;
  hasPremium: boolean;
  isLoading: boolean;
};

// Module-level cache — populated by preloadSubscription() in RootLayout
// so useSubscription() can initialise synchronously with no flash.
let _cachedTier: SubscriptionTier | null = null;

export function clearSubscriptionCache(): void {
  _cachedTier = null;
}

// Check subscription from profiles table (source of truth)
export async function checkSubscriptionStatus(): Promise<SubscriptionTier> {
  if (_cachedTier !== null) return _cachedTier;

  const user = await getCurrentUser();

  if (!user) {
    _cachedTier = 'free';
    return 'free';
  }

  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single();

    if (!error && profile?.subscription_tier) {
      _cachedTier = profile.subscription_tier as SubscriptionTier;
      return _cachedTier;
    }

    // Fallback to user metadata if profile row doesn't exist yet
    const metadata = user.user_metadata || {};
    _cachedTier = (metadata.tier as SubscriptionTier) || 'free';
    return _cachedTier;
  } catch {
    const metadata = (await getCurrentUser())?.user_metadata || {};
    _cachedTier = (metadata.tier as SubscriptionTier) || 'free';
    return _cachedTier;
  }
}

export function useSubscription(): SubscriptionStatus {
  // Initialise synchronously from cache — no flash if preloaded
  const [tier, setTier] = useState<SubscriptionTier>(() => _cachedTier ?? 'free');
  const [isLoading, setIsLoading] = useState(() => _cachedTier === null);

  useEffect(() => {
    if (_cachedTier !== null) {
      setTier(_cachedTier);
      setIsLoading(false);
      return;
    }
    checkSubscriptionStatus()
      .then(setTier)
      .finally(() => setIsLoading(false));
  }, []);

  return {
    tier,
    hasPlus: tier === 'plus' || tier === 'premium',
    hasPremium: tier === 'premium',
    isLoading,
  };
}
