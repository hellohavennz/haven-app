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
  
  // TODO: Check actual subscription status in Supabase
  // For now, check if user metadata has tier flag
  const metadata = user.user_metadata || {};
  return metadata.tier || 'free';
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
