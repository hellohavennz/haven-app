import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { getCurrentUser } from './auth';

export type SubscriptionTier = 'free' | 'plus' | 'premium';

export type SubscriptionStatus = {
  tier: SubscriptionTier;
  hasPlus: boolean;
  hasPremium: boolean;
  isLoading: boolean;
};

export type ProfileSubscriptionState = 'active' | 'pending' | 'trialing' | 'canceled';

export type ProfileRecord = {
  id: string;
  email: string | null;
  subscription_tier: SubscriptionTier | null;
  subscription_status: ProfileSubscriptionState | null;
};

const SUBSCRIPTION_TIERS: SubscriptionTier[] = ['free', 'plus', 'premium'];

function isSubscriptionTier(value: unknown): value is SubscriptionTier {
  return typeof value === 'string' && SUBSCRIPTION_TIERS.includes(value as SubscriptionTier);
}

export async function getProfile(userId: string): Promise<ProfileRecord | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id,email,subscription_tier,subscription_status')
    .eq('id', userId)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  return (data as ProfileRecord) ?? null;
}

export async function upsertProfile(profile: Partial<ProfileRecord> & { id: string }) {
  const { data, error } = await supabase
    .from('profiles')
    .upsert(profile, { onConflict: 'id' })
    .select('id,email,subscription_tier,subscription_status')
    .single();

  if (error) {
    throw error;
  }

  return data as ProfileRecord;
}

export async function updateProfileSubscription({
  userId,
  email,
  tier,
  status,
}: {
  userId: string;
  email?: string;
  tier: SubscriptionTier;
  status: ProfileSubscriptionState;
}) {
  return upsertProfile({
    id: userId,
    email: email ?? null,
    subscription_tier: tier,
    subscription_status: status,
  });
}

// This is a simplified version - in production, check Supabase for actual subscription
export async function checkSubscriptionStatus(): Promise<SubscriptionTier> {
  const user = await getCurrentUser();

  if (!user) return 'free';

  try {
    const profile = await getProfile(user.id);
    if (profile?.subscription_tier && isSubscriptionTier(profile.subscription_tier)) {
      return profile.subscription_tier;
    }
  } catch (error) {
    console.error('Failed to fetch subscription status from profile', error);
  }

  return 'free';
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
