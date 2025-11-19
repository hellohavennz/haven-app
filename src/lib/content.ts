import type { LessonJSON } from "../types";
import lessonIndex from "../content/lesson-index.json";

type LessonIndexModule = {
  slug: string;
  title: string;
  lessons: string[];
};

const files = import.meta.glob<{ default: LessonJSON }>("../content/lessons/*.json", { eager: true });

const lessonEntries = Object.values(files)
  .map((module) => module?.default)
  .filter((lesson): lesson is LessonJSON => Boolean(lesson?.id));

const lessonsById = new Map<string, LessonJSON>();
for (const lesson of lessonEntries) {
  lessonsById.set(lesson.id, lesson);
}

const indexModules = (lessonIndex.modules ?? []) as LessonIndexModule[];
const orderedLessonIds = indexModules.flatMap(module => module.lessons);

const orderedLessons: LessonJSON[] = orderedLessonIds
  .map(id => lessonsById.get(id))
  .filter((lesson): lesson is LessonJSON => Boolean(lesson));

const FIRST_FREE_LESSON = orderedLessonIds[0] ?? "lesson-1-values-principles";

const remainingLessons = lessonEntries.filter(lesson => !orderedLessonIds.includes(lesson.id));
if (remainingLessons.length) {
  orderedLessons.push(...remainingLessons.sort((a, b) => a.title.localeCompare(b.title)));
}

function withAccessFlag(lesson: LessonJSON): LessonJSON {
  return {
    ...lesson,
    isPremium: lesson.id !== FIRST_FREE_LESSON
  };
}

export function getAllLessons(): LessonJSON[] {
  return orderedLessons.map(withAccessFlag);
}

export function getLessonById(id: string): LessonJSON | null {
  const lesson = lessonsById.get(id);
  return lesson ? withAccessFlag(lesson) : null;
}

export function getModules() {
  return indexModules.map((module, order) => ({
    slug: module.slug,
    title: module.title,
    count: module.lessons.filter(id => lessonsById.has(id)).length,
    order,
  }));
}

export function getLessonsForModule(slug: string): LessonJSON[] {
  const module = indexModules.find(m => m.slug === slug);
  if (!module) {
    return orderedLessons
      .filter(lesson => lesson.module_slug === slug)
      .map(withAccessFlag);
  }

  return module.lessons
    .map(id => lessonsById.get(id))
    .filter((lesson): lesson is LessonJSON => Boolean(lesson))
    .map(withAccessFlag);
}
