export type LessonJSON = {
  id: string;
  title: string;
  module_slug: string;
  overview: string;
  key_facts: string[];
  memory_hook: string;
  questions: Question[];
  flashcards: [string, string][];
  isPremium?: boolean; // Optional - defaults to false
};

export type Question = {
  prompt: string;
  options: string[];
  correct_index: number;
  explanation: string;
};

export type Module = {
  slug: string;
  title: string;
  count: number;
};

export type UserSubscription = {
  isPremium: boolean;
  email?: string;
};
