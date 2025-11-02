export type LessonJSON = {
  id: string;
  title: string;
  module_slug: string;
  overview: string;
  key_facts: string[];
  memory_hook: string;
  questions: {
    prompt: string;
    options: string[];
    correct_index: number;
    explanation?: string;  // ← new
  }[];
  flashcards: [string, string][];
};
