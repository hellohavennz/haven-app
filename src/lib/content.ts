import type { LessonJSON } from "../types";

const files = import.meta.glob("../content/lessons/*.json", { eager: true });
const lessons: LessonJSON[] = Object.values(files).map((m: any) => m.default as LessonJSON);

export function getAllLessons() {
  return lessons.slice().sort((a,b) => a.title.localeCompare(b.title));
}
export function getLessonById(id: string) {
  return lessons.find(l => l.id === id) || null;
}
export function getModules() {
  const map = new Map<string, { slug: string; title: string; count: number }>();
  for (const l of lessons) {
    const title = moduleTitleFromSlug(l.module_slug);
    const cur = map.get(l.module_slug);
    if (cur) cur.count += 1; else map.set(l.module_slug, { slug: l.module_slug, title, count: 1 });
  }
  return Array.from(map.values()).sort((a,b) => a.title.localeCompare(b.title));
}
export function getLessonsForModule(slug: string) {
  return getAllLessons().filter(l => l.module_slug === slug);
}
function moduleTitleFromSlug(slug: string) {
  const map: Record<string,string> = {
    "life-in-uk-overview": "Life in the UK Overview",
    "nations-symbols": "The UK’s Nations & Symbols",
    "history": "A Long and Illustrious History",
    "government": "Government and Law",
    "everyday-life": "Everyday Life",
  };
  return map[slug] || slug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}
