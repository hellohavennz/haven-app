import { useState, useEffect } from 'react';
import { getCurrentUser } from './auth';
import { supabase } from './supabase';

export type SubscriptionTier = 'free' | 'plus' | 'premium';

export type SubscriptionStatus = {
  tier: SubscriptionTier;
  hasPlus: boolean;
  hasPremium: boolean;
  accessExpiresAt: string | null;
  isLoading: boolean;
};

// Module-level cache — populated by preloadSubscription() in RootLayout
// so useSubscription() can initialise synchronously with no flash.
let _cachedTier: SubscriptionTier | null = null;
// undefined = not yet loaded; null = loaded, no expiry set (old model or free)
let _cachedAccessExpiresAt: string | null | undefined = undefined;

export function clearSubscriptionCache(): void {
  _cachedTier = null;
  _cachedAccessExpiresAt = undefined;
}

// Check subscription from profiles table (source of truth)
export async function checkSubscriptionStatus(): Promise<SubscriptionTier> {
  if (_cachedTier !== null) return _cachedTier;

  const user = await getCurrentUser();

  if (!user) {
    // Don't cache for unauthenticated users — they may log in shortly after
    // and we need the cache to be empty so the real tier gets fetched.
    return 'free';
  }

  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('subscription_tier, access_expires_at')
      .eq('id', user.id)
      .single();

    if (!error && profile) {
      const tier = (profile.subscription_tier as SubscriptionTier) || 'free';
      const accessExpiresAt = (profile.access_expires_at as string | null) ?? null;

      _cachedAccessExpiresAt = accessExpiresAt;

      // New model: access_expires_at is set — check if it has expired
      if (accessExpiresAt !== null) {
        const expired = new Date(accessExpiresAt) <= new Date();
        _cachedTier = expired ? 'free' : tier;
        return _cachedTier;
      }

      // Legacy model: rely on subscription_tier directly (Stripe handles billing)
      _cachedTier = tier;
      return _cachedTier;
    }

    // PGRST116 = no rows — profile row missing (trigger didn't fire). Auto-create it.
    if (error?.code === 'PGRST116') {
      const displayName =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split('@')[0] ||
        'User';
      await supabase.from('profiles').insert({
        id: user.id,
        display_name: displayName,
        subscription_tier: 'free',
      });
    }

    _cachedTier = 'free';
    _cachedAccessExpiresAt = null;
    return _cachedTier;
  } catch {
    _cachedTier = 'free';
    _cachedAccessExpiresAt = null;
    return _cachedTier;
  }
}

export function useSubscription(): SubscriptionStatus {
  // Initialise synchronously from cache — no flash if preloaded
  const [tier, setTier] = useState<SubscriptionTier>(() => _cachedTier ?? 'free');
  const [accessExpiresAt, setAccessExpiresAt] = useState<string | null>(
    () => _cachedAccessExpiresAt ?? null,
  );
  const [isLoading, setIsLoading] = useState(() => _cachedTier === null);

  useEffect(() => {
    if (_cachedTier !== null) {
      setTier(_cachedTier);
      setAccessExpiresAt(_cachedAccessExpiresAt ?? null);
      setIsLoading(false);
      return;
    }
    checkSubscriptionStatus()
      .then(t => {
        setTier(t);
        setAccessExpiresAt(_cachedAccessExpiresAt ?? null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const hasPlus = tier === 'plus' || tier === 'premium';

  return {
    tier,
    hasPlus,
    hasPremium: tier === 'premium',
    accessExpiresAt,
    isLoading,
  };
}
