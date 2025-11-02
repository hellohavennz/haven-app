import { useState, useEffect } from 'react';
import { getCurrentUser } from './auth';

export type SubscriptionStatus = {
  isPremium: boolean;
  isLoading: boolean;
};

// This is a simplified version - in production, check Supabase for actual subscription
export async function checkSubscriptionStatus(): Promise<boolean> {
  const user = await getCurrentUser();
  
  if (!user) return false;
  
  // TODO: Check actual subscription status in Supabase
  // For now, check if user metadata has premium flag
  // You can set this manually in Supabase for testing
  const metadata = user.user_metadata || {};
  return metadata.isPremium === true;
}

export function useSubscription(): SubscriptionStatus {
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkSubscriptionStatus()
      .then(setIsPremium)
      .finally(() => setIsLoading(false));
  }, []);

  return { isPremium, isLoading };
}
