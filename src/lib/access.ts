import { checkSubscriptionStatus, SubscriptionTier } from './subscription';

// Define which modules are free vs paid
const FREE_MODULES = [
  'values-and-principles',  // Module 1 - Free
  'what-is-uk',            // Module 2 - Free
  'modern-society',        // Module 4 - Free
];

// Check if a user has access to a specific module
export async function hasAccessToModule(moduleSlug: string, user: any): Promise<boolean> {
  // Not logged in = no access to anything
  if (!user) {
    return false;
  }
  
  // Free modules are always accessible to logged-in users
  if (FREE_MODULES.includes(moduleSlug)) {
    return true;
  }
  
  // For paid modules, check subscription tier
  const tier = await checkSubscriptionStatus();
  
  // Plus and Premium users have full access
  return tier === 'plus' || tier === 'premium';
}

// Synchronous version for immediate checks.
// Pass the tier from useSubscription() — do NOT use user_metadata,
// which can be self-modified by any authenticated user.
export function hasAccessToModuleSync(moduleSlug: string, user: any, tier: SubscriptionTier = 'free'): boolean {
  // Not logged in = no access
  if (!user) {
    return false;
  }

  // Free modules always accessible
  if (FREE_MODULES.includes(moduleSlug)) {
    return true;
  }

  return tier === 'plus' || tier === 'premium';
}
