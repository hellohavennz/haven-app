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

// Check subscription from profiles table (source of truth)
export async function checkSubscriptionStatus(): Promise<SubscriptionTier> {
  const user = await getCurrentUser();
  
  if (!user) return 'free';
  
  try {
    // First, try to get tier from profiles table (most reliable)
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single();
    
    if (!error && profile?.subscription_tier) {
      return profile.subscription_tier as SubscriptionTier;
    }
    
    // Fallback to user metadata if profile doesn't exist yet
    const metadata = user.user_metadata || {};
    const tier = metadata.tier as SubscriptionTier;
    
    return tier || 'free';
  } catch (error) {
    console.error('Error checking subscription:', error);
    
    // Final fallback to metadata
    const metadata = user.user_metadata || {};
    return (metadata.tier as SubscriptionTier) || 'free';
  }
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
