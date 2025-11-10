export type StudySection = {
  heading: string;
  content: string;
};

export type SupportiveMessages = {
  high_score?: string;
  medium_score?: string;
  low_score?: string;
};

export type Question = {
  prompt: string;
  options: string[];
  correct_index: number;
  explanation?: string;
};

export type LessonJSON = {
  id: string;
  title: string;
  module_slug: string;
  overview?: string;
  study_sections?: StudySection[];
  key_facts?: string[];
  memory_hook?: string;
  questions?: Question[];
  flashcards?: [string, string][];
  supportive_messages?: SupportiveMessages;
  isPremium?: boolean; // Optional - defaults to false
};

export type Module = {
  slug: string;
  title: string;
  count: number;
};

export type SubscriptionTier = 'free' | 'plus' | 'premium';

export type UserSubscription = {
  tier: SubscriptionTier;
  email?: string;
};
