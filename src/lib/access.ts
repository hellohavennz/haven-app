import type { User } from '@supabase/supabase-js';

const FREE_MODULE_SLUGS = [
  'life-in-uk-overview',
  'british-history-depth'
];

type AuthenticatedUser = Pick<User, 'user_metadata'> | null;

export function hasAccessToLesson(lessonId: string, user: AuthenticatedUser): boolean {
  if (!user) {
    return false;
  }

  return user.user_metadata?.isPremium === true;
}

export function hasAccessToModule(moduleSlug: string, user: AuthenticatedUser): boolean {
  if (FREE_MODULE_SLUGS.includes(moduleSlug)) {
    return true;
  }

  if (!user) {
    return false;
  }

  return user.user_metadata?.isPremium === true;
}

export function isModuleFree(moduleSlug: string): boolean {
  return FREE_MODULE_SLUGS.includes(moduleSlug);
}

export function getFreeModuleSlugs(): string[] {
  return FREE_MODULE_SLUGS;
}
