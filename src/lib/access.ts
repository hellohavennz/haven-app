import { checkSubscriptionStatus } from './subscription';

// Define which modules are free vs paid
const FREE_MODULES = [
  'values-and-principles',  // Module 1 - Free
  'what-is-uk',            // Module 2 - Free
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

// Synchronous version for immediate checks (uses user object directly)
export function hasAccessToModuleSync(moduleSlug: string, user: any): boolean {
  // Not logged in = no access
  if (!user) {
    return false;
  }
  
  // Free modules always accessible
  if (FREE_MODULES.includes(moduleSlug)) {
    return true;
  }
  
  // Check tier from user metadata (for immediate rendering)
  const tier = user.user_metadata?.tier || 'free';
  return tier === 'plus' || tier === 'premium';
}
