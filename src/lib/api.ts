import { supabase } from "./supabase";

export type ModuleRecord = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  order_index: number | null;
};

export type LessonRecord = {
  id: string;
  title: string;
  body: string;
  order_index: number | null;
};

export type QuestionRecord = {
  id: string;
  prompt: string;
  options: string[];
  correct_index: number;
  rationale: string | null;
};

export async function fetchModules(): Promise<ModuleRecord[]> {
  const { data, error } = await supabase
    .from("modules")
    .select("id, slug, title, summary, order_index")
    .order("order_index", { ascending: true });
    
  if (error) {
    console.error('Error fetching modules:', error);
    throw new Error(`Failed to fetch modules: ${error.message}`);
  }
  
  return (data as ModuleRecord[] | null) ?? [];
}

export async function fetchLessonsForModule(moduleSlug: string): Promise<LessonRecord[]> {
  const { data: module, error: moduleError } = await supabase
    .from("modules")
    .select("id")
    .eq("slug", moduleSlug)
    .single();
    
  if (moduleError) {
    console.error('Error fetching module:', moduleError);
    throw new Error(`Failed to fetch module "${moduleSlug}": ${moduleError.message}`);
  }

  const { data: lessons, error: lessonsError } = await supabase
    .from("lessons")
    .select("id, title, body, order_index")
    .eq("module_id", module.id)
    .order("order_index", { ascending: true });

  if (lessonsError) {
    console.error('Error fetching lessons:', lessonsError);
    throw new Error(`Failed to fetch lessons: ${lessonsError.message}`);
  }
  
  return (lessons as LessonRecord[] | null) ?? [];
}

export async function fetchLessonWithQuestionsById(lessonId: string) {
  const { data: lesson, error: lessonError } = await supabase
    .from("lessons")
    .select("id, title, body")
    .eq("id", lessonId)
    .single();
    
  if (lessonError) {
    console.error('Error fetching lesson:', lessonError);
    throw new Error(`Failed to fetch lesson: ${lessonError.message}`);
  }

  const { data: questions, error: questionsError } = await supabase
    .from("questions")
    .select("id, prompt, options, correct_index, rationale")
    .eq("lesson_id", lessonId);
    
  if (questionsError) {
    console.error('Error fetching questions:', questionsError);
    throw new Error(`Failed to fetch questions: ${questionsError.message}`);
  }

  return {
    lesson: lesson as LessonRecord,
    questions: (questions as QuestionRecord[] | null) ?? []
  };
}
