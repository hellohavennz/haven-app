// src/lib/api.ts
import { supabase } from "./supabase";

export async function fetchModules() {
  const { data, error } = await supabase
    .from("modules")
    .select("id, slug, title, summary, order_index")
    .order("order_index", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function fetchLessonsForModule(moduleSlug: string) {
  // get the module id from the slug
  const { data: mod, error: merr } = await supabase
    .from("modules")
    .select("id")
    .eq("slug", moduleSlug)
    .single();
  if (merr) throw merr;

  const { data: lessons, error: lerr } = await supabase
    .from("lessons")
    .select("id, title, body, order_index")
    .eq("module_id", mod.id)
    .order("order_index", { ascending: true });

  if (lerr) throw lerr;
  return lessons ?? [];
}

export async function fetchLessonWithQuestionsById(lessonId: string) {
  const { data: lesson, error: lerr } = await supabase
    .from("lessons")
    .select("id, title, body")
    .eq("id", lessonId)
    .single();
  if (lerr) throw lerr;

  const { data: questions, error: qerr } = await supabase
    .from("questions")
    .select("id, prompt, options, correct_index, rationale")
    .eq("lesson_id", lessonId);
  if (qerr) throw qerr;

  return { lesson, questions: questions ?? [] };
}
