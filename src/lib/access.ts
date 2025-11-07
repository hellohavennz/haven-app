// Define which lessons are free
const FREE_LESSON_IDS = [
  'lesson-1-values-and-principles',
  'lesson-2-becoming-responsible-citizen'
];

export function hasAccessToLesson(lessonId: string, user: any): boolean {
  // Free lessons are always accessible
  if (FREE_LESSON_IDS.includes(lessonId)) {
    return true;
  }
  
  // Premium lessons require authentication and premium status
  if (!user) {
    return false;
  }
  
  // Check if user has premium access
  // For now, we'll check if user metadata has premium flag
  // Later, you can integrate with Stripe or payment system
  return user.user_metadata?.isPremium === true;
}

export function getFreePreviewCount(): number {
  return FREE_LESSON_IDS.length;
}

export function isLessonFree(lessonId: string): boolean {
  return FREE_LESSON_IDS.includes(lessonId);
}
