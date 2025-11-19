const FREE_MODULE_SLUGS = [
  'life-in-uk-overview',
  'british-history-depth'
];

export function hasAccessToLesson(lessonId: string, user: any): boolean {
  if (!user) {
    return false;
  }

  return user.user_metadata?.isPremium === true;
}

export function hasAccessToModule(moduleSlug: string, user: any): boolean {
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
