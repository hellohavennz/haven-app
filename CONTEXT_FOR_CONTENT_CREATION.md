# Haven — Content Creation Context

_Last updated: 2026-03-03_

## Current status

All 29 lessons are complete and live in Supabase. This document describes the content schema and how to add or edit content.

---

## Architecture

Content is stored in **Supabase** (PostgreSQL), not local JSON files. The tables are:

| Table | Purpose |
|---|---|
| `modules` | Top-level grouping (5 modules) |
| `lessons` | One row per lesson (29 total) |
| `questions` | Practice questions linked to a lesson |
| `flashcards` | Flashcard pairs linked to a lesson |

Content is loaded client-side via `src/lib/content.ts` using Supabase queries with in-memory caching.

---

## Modules

| Slug | Title | Lessons |
|---|---|---|
| `life-in-uk-intro` | Introduction | ~2 |
| `history` | A Long and Illustrious History | ~8 |
| `government` | Government and Law | ~7 |
| `everyday-life` | Everyday Life | ~8 |
| `uk-today` | The UK Today | ~4 |

---

## Lesson schema (Supabase `lessons` table)

| Column | Type | Notes |
|---|---|---|
| `id` | text (PK) | kebab-case slug e.g. `lesson-1.2-becoming-permanent-resident` |
| `module_slug` | text | FK to `modules.slug` |
| `title` | text | Display title |
| `overview` | text | Multi-paragraph overview (use `\n\n` between paragraphs) |
| `key_facts` | text[] | Array of bullet-point facts |
| `memory_hook` | text | Memorable tip for retention |
| `sort_order` | int | Controls display order within a module |

---

## Question schema (`questions` table)

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Auto-generated |
| `lesson_id` | text | FK to `lessons.id` |
| `prompt` | text | The question — must make sense standalone (no "these values", "they said", etc.) |
| `options` | text[] | Exactly 4 options |
| `correct_index` | int | 0–3 |
| `explanation` | text | Why the correct answer is right |

### Question quality rules
- Every question must be self-contained — no pronoun references to other questions
- 4 options exactly, one unambiguously correct
- `correct_index` must be 0–3
- Explanation should reference the correct fact, not just restate the answer

---

## Flashcard schema (`flashcards` table)

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Auto-generated |
| `lesson_id` | text | FK to `lessons.id` |
| `front` | text | Question / prompt side |
| `back` | text | Answer side |
| `sort_order` | int | Display order within lesson |

---

## Adding or editing content

All content changes are made directly in **Supabase SQL editor** or via the Supabase Table Editor.

### To add a new lesson:
```sql
INSERT INTO lessons (id, module_slug, title, overview, key_facts, memory_hook, sort_order)
VALUES (
  'lesson-X.Y-slug-name',
  'module-slug',
  'Lesson Title',
  'Paragraph one.\n\nParagraph two.',
  ARRAY['Fact 1', 'Fact 2', 'Fact 3'],
  'Memory hook text',
  10
);
```

### To add questions:
```sql
INSERT INTO questions (lesson_id, prompt, options, correct_index, explanation)
VALUES (
  'lesson-X.Y-slug-name',
  'What is the question?',
  ARRAY['Option A', 'Option B', 'Option C', 'Option D'],
  0,
  'Option A is correct because...'
);
```

### To fix a question:
```sql
UPDATE questions
SET
  prompt = 'Rewritten question text?',
  explanation = 'Updated explanation.'
WHERE id = 'uuid-here';
```

---

## Content guidelines

### Overview text
- 3–6 paragraphs, conversational but factual
- Cover the main topic, historical context, and significance
- Use `\n\n` for paragraph breaks in the SQL string

### Key facts
- 8–15 bullet points per lesson
- Short, testable — dates, names, numbers, definitions
- Each fact should map to at least one question

### Questions
- 8–15 questions per lesson
- Mix difficulty: some direct recall, some require understanding
- Cover all key facts — no important fact should go untested
- Never phrase as "Which of these is NOT..." (avoid negative questions)

### Flashcards
- 10–20 per lesson
- Front: short, specific question ("What year did X happen?")
- Back: concise answer (1–2 sentences max)
- Prioritise dates, names, numbers — the hardest-to-remember facts

---

## Tech context

- Hosting: **Netlify** (NOT Bolt.new)
- Content: **Supabase** (NOT local JSON files)
- All 29 lessons are complete as of March 2026
- RLS policy: `lessons`, `modules`, `questions`, `flashcards` are public read; writes require service role key
