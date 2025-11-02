# Haven - Life in the UK Test Preparation App - Content Creation Context

## Project Overview
Haven is a React + TypeScript web application for Life in the UK test preparation. It uses JSON files for content storage and features study lessons, practice questions, and flashcards.

---

## Current Technical Stack
- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router v6
- **Database:** Supabase (for auth & progress tracking)
- **Content Storage:** JSON files in `/src/content/lessons/`
- **Deployment:** Bolt.new (syncs from GitHub)

---

## Content Structure

### Lesson JSON Schema
Each lesson is stored as a JSON file in `/src/content/lessons/` with this structure:
```json
{
  "id": "lesson-X-slug-name",
  "title": "The Lesson Title",
  "module_slug": "module-name",
  "overview": "Multi-paragraph overview text with \\n\\n between paragraphs",
  "key_facts": [
    "Bullet point fact 1",
    "Bullet point fact 2"
  ],
  "memory_hook": "A memorable way to remember the key information",
  "questions": [
    {
      "prompt": "Question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_index": 0,
      "explanation": "Why this is correct"
    }
  ],
  "flashcards": [
    ["Question front", "Answer back"],
    ["Question front", "Answer back"]
  ]
}
```

### Available Modules
These are defined in `/src/lib/content.ts`:

1. **`life-in-uk-overview`** - Life in the UK Overview
2. **`nations-symbols`** - The UK's Nations & Symbols
3. **`history`** - A Long and Illustrious History
4. **`government`** - Government and Law
5. **`everyday-life`** - Everyday Life

---

## What's Already Done

### ✅ Completed Lessons
1. **`lesson-1-the-united-kingdom.json`** - Located in `/src/content/lessons/`
   - Module: `nations-symbols`
   - Title: "The United Kingdom and Its People"
   - Contains: Overview, 16 key facts, memory hook, 7 questions, 13 flashcards
   - **DO NOT RECREATE THIS LESSON**

### ✅ Technical Features Implemented
- User authentication (Supabase)
- Progress tracking (localStorage + Supabase)
- Study page with lesson content display
- Practice page with quiz functionality
- Flashcard system with auto-advance
- Responsive mobile design
- Score tracking and results page

---

## What We Need Now

### 🎯 Content Creation Task
We need to create **ALL remaining lessons** from the official Life in the UK handbook. Each lesson should:

1. **Cover a specific topic** from the handbook
2. **Follow the exact JSON schema** shown above
3. **Be comprehensive** - include all important facts from that section
4. **Have 5-10 questions** per lesson (realistic exam-style)
5. **Have 10-20 flashcards** per lesson
6. **Include a memorable memory hook** to help retention

### 📚 Module Distribution
Aim for approximately:
- **nations-symbols:** 3-5 lessons (1 already done)
- **history:** 8-12 lessons (longest section)
- **government:** 6-8 lessons
- **everyday-life:** 5-7 lessons
- **life-in-uk-overview:** 1-2 lessons (intro material)

---

## Content Creation Guidelines

### Writing Style
- **Clear and concise** - avoid complex academic language
- **Fact-focused** - stick to testable information
- **Structured** - use the overview → key facts → memory hook flow
- **Accurate** - based on official handbook content

### Question Quality
- **Realistic exam format** - 4 options, single correct answer
- **Mix difficulty levels** - some easy recall, some require understanding
- **Cover all key facts** - ensure every important point has a question
- **Detailed explanations** - help learners understand why an answer is correct

### Flashcard Design
- **Front:** Clear, specific question (avoid ambiguity)
- **Back:** Concise, accurate answer
- **Cover dates, names, numbers** - the "hard to remember" facts
- **Mix question types** - "What is...", "When did...", "Who was...", "How many..."

---

## File Naming Convention
- Pattern: `lesson-{number}-{slug}.json`
- Example: `lesson-2-scotland-wales-northern-ireland.json`
- Number sequentially starting from 2 (we have lesson-1)
- Use kebab-case for slugs

---

## How to Provide Content

### Ideal Format
For each lesson, provide the complete JSON content that can be saved directly to `/src/content/lessons/lesson-X-name.json`

### Batch Approach
You can provide:
1. **One lesson at a time** - for review and feedback
2. **One module at a time** - all lessons for a module together
3. **Full content dump** - all lessons in one go (if source document allows)

---

## Source Material
The user will upload the **official Life in the UK handbook PDF** or similar source document in this chat. Use this as the authoritative source for all content creation.

---

## Quality Checklist
Before submitting each lesson, verify:
- ✅ Valid JSON syntax (no trailing commas, proper quotes)
- ✅ All required fields present (id, title, module_slug, overview, key_facts, memory_hook, questions, flashcards)
- ✅ Questions have exactly 4 options
- ✅ `correct_index` is valid (0-3)
- ✅ Flashcards are in `[question, answer]` tuple format
- ✅ No special characters that break JSON (use proper escaping)
- ✅ Overview uses `\n\n` for paragraph breaks
- ✅ Facts are concise bullet points (not full paragraphs)

---

## Current File Structure
```
src/
├── content/
│   └── lessons/
│       └── lesson-1-the-united-kingdom.json  ✅ DONE
│       └── lesson-2-*.json                   ⬅️ START HERE
│       └── lesson-3-*.json
│       └── ...
├── lib/
│   ├── content.ts      (loads all JSON files)
│   ├── progress.ts     (tracks user progress)
│   └── auth.ts         (handles authentication)
├── pages/
│   ├── ContentLesson.tsx      (displays lesson content)
│   ├── PracticeLesson.tsx     (quiz functionality)
│   └── PracticeFlashcards.tsx (flashcard system)
└── components/
    ├── Navbar.tsx
    └── AuthButton.tsx
```

---

## Next Steps
1. **Upload the source document** (Life in the UK handbook)
2. **Confirm module priority** (which module to start with after nations-symbols)
3. **Begin content creation** - provide lessons in JSON format
4. **I will save them** to the repository and test in the app

---

## Notes for Claude
- Focus on **content accuracy** - this is for real exam preparation
- Maintain **consistent quality** across all lessons
- If source material is unclear, ask for clarification
- Suggest lesson titles and structure based on handbook sections
- Flag any sections that might need multiple lessons due to length

---

**Ready to start creating content!** 🚀

Please upload the source document and let me know which module you'd like to start with.
