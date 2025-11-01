import type { LessonJSON } from "../types";

/**
 * Lazy map of lesson JSON files. Nothing is loaded until you call loadLessonById().
 */
const files = import.meta.glob("../content/lessons/*.json");

/** Load the small metadata index for fast module/lesson lists. */
export async function loadIndex(): Promise<{id:string;title:string;module_slug:string}[]> {
  const index = (await import("../content/index.json")).default as {
    id:string; title:string; module_slug:string
  }[];
  // Keep a stable, nice ordering
  return index.slice().sort((a,b) => a.title.localeCompare(b.title));
}

/** Load a single lesson by id (lazy). */
export async function loadLessonById(id: string): Promise<LessonJSON | null> {
  const entry = Object.entries(files).find(([path]) => path.includes(`/${id}.json`));
  if (!entry) return null;
  const mod: any = await entry[1](); // dynamic import
  return mod.default as LessonJSON;
}

/** Module helpers that use only the cheap index metadata. */
export async function getModules() {
  const index = await loadIndex();
  const map = new Map<string, { slug:string; title:string; count:number }>();
  for (const row of index) {
    const title = moduleTitleFromSlug(row.module_slug);
    const cur = map.get(row.module_slug);
    if (cur) cur.count += 1; else map.set(row.module_slug, { slug: row.module_slug, title, count: 1 });
  }
  return Array.from(map.values()).sort((a,b) => a.title.localeCompare(b.title));
}

export async function getLessonsForModule(slug: string) {
  const index = await loadIndex();
  return index.filter(r => r.module_slug === slug)
              .sort((a,b) => a.title.localeCompare(b.title));
}

function moduleTitleFromSlug(slug: string) {
  const map: Record<string,string> = {
    "life-in-uk-overview": "Life in the UK Overview",
    "nations-symbols": "The UK’s Nations & Symbols",
    "history": "A Long and Illustrious History",
    "government": "Government and Law",
    "everyday-life": "Everyday Life"
  };
  return map[slug] || slug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}
