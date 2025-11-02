import type { LessonJSON } from "../types";

const files = import.meta.glob("../content/lessons/*.json", { eager: true });
const lessons: LessonJSON[] = Object.values(files).map((m: any) => m.default as LessonJSON);

export function getAllLessons(): LessonJSON[] {
  return lessons.slice().sort((a, b) => a.title.localeCompare(b.title));
}

export function getLessonById(id: string): LessonJSON | null {
  return lessons.find(l => l.id === id) || null;
}

export function getModules() {
  const map = new Map<string, { slug: string; title: string; count: number; order: number }>();
  
  // Define the correct order from the handbook
  const moduleOrder: Record<string, number> = {
    "life-in-uk-overview": 1,
    "nations-symbols": 2,
    "history": 3,
    "government": 4,
    "everyday-life": 5,
  };
  
  for (const lesson of lessons) {
    const title = moduleTitleFromSlug(lesson.module_slug);
    const order = moduleOrder[lesson.module_slug] || 999;
    const existing = map.get(lesson.module_slug);
    
    if (existing) {
      existing.count += 1;
    } else {
      map.set(lesson.module_slug, {
        slug: lesson.module_slug,
        title,
        count: 1,
        order
      });
    }
  }
  
  // Sort by order instead of alphabetically
  return Array.from(map.values()).sort((a, b) => a.order - b.order);
}

export function getLessonsForModule(slug: string): LessonJSON[] {
  return getAllLessons().filter(l => l.module_slug === slug);
}

function moduleTitleFromSlug(slug: string): string {
  const titleMap: Record<string, string> = {
    "life-in-uk-overview": "Life in the UK Overview",
    "nations-symbols": "The UK's Nations & Symbols",
    "history": "A Long and Illustrious History",
    "government": "Government and Law",
    "everyday-life": "Everyday Life",
  };
  
  return titleMap[slug] || slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, c => c.toUpperCase());
}
