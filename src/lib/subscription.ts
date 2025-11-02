import { useState, useEffect } from 'react';
import { getCurrentUser } from './auth';

export type SubscriptionTier = 'free' | 'plus' | 'premium';

export type SubscriptionStatus = {
  tier: SubscriptionTier;
  hasPlus: boolean;
  hasPremium: boolean;
  isLoading: boolean;
};

// This is a simplified version - in production, check Supabase for actual subscription
export async function checkSubscriptionStatus(): Promise<SubscriptionTier> {
  const user = await getCurrentUser();
  
  if (!user) return 'free';
  
  // Check user metadata for tier
  const metadata = user.user_metadata || {};
  const tier = metadata.tier as SubscriptionTier;
  
  // For testing: if user is logged in and has no tier set, give them 'plus' access
  // Remove this in production!
  if (!tier) {
    console.log('⚠️ No tier found - defaulting to Plus for testing. Set tier in Supabase user metadata.');
    return 'plus';
  }
  
  return tier;
}

export function useSubscription(): SubscriptionStatus {
  const [tier, setTier] = useState<SubscriptionTier>('free');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkSubscriptionStatus()
      .then(setTier)
      .finally(() => setIsLoading(false));
  }, []);

  return { 
    tier,
    hasPlus: tier === 'plus' || tier === 'premium',
    hasPremium: tier === 'premium',
    isLoading 
  };
}
