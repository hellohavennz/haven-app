-- ================================================================
-- Haven App — Schema Alignment
-- Migration: 20260224000003
--
-- The pre-existing content tables (modules, lessons, questions)
-- used UUIDs and different column names. Only test data (1 row
-- each). Drop and recreate with the correct schema.
-- user_progress lesson_id references are stale — truncate it.
-- ================================================================


-- ----------------------------------------------------------------
-- Drop old content tables (FK order: children first)
-- ----------------------------------------------------------------
DROP TABLE IF EXISTS public.questions      CASCADE;
DROP TABLE IF EXISTS public.study_sections CASCADE;
DROP TABLE IF EXISTS public.flashcards     CASCADE;
DROP TABLE IF EXISTS public.lessons        CASCADE;
DROP TABLE IF EXISTS public.modules        CASCADE;


-- ----------------------------------------------------------------
-- Truncate user_progress — lesson_id references are now stale
-- (only 5 test rows, no real user data)
-- ----------------------------------------------------------------
TRUNCATE TABLE public.user_progress;


-- ----------------------------------------------------------------
-- MODULES (recreated)
-- ----------------------------------------------------------------
CREATE TABLE public.modules (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT NOT NULL UNIQUE,
  title       TEXT NOT NULL,
  summary     TEXT,
  is_free     BOOLEAN NOT NULL DEFAULT FALSE,
  order_index INT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ----------------------------------------------------------------
-- LESSONS (recreated)
-- Uses text slug as PK — matches app code (e.g. "lesson-1.2-...")
-- ----------------------------------------------------------------
CREATE TABLE public.lessons (
  id                  TEXT PRIMARY KEY,
  module_id           UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  title               TEXT NOT NULL,
  overview            TEXT,
  key_facts           TEXT[],
  memory_hook         TEXT,
  supportive_messages JSONB,
  order_index         INT NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ----------------------------------------------------------------
-- STUDY SECTIONS
-- ----------------------------------------------------------------
CREATE TABLE public.study_sections (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id   TEXT NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  heading     TEXT NOT NULL,
  content     TEXT NOT NULL,
  order_index INT NOT NULL
);


-- ----------------------------------------------------------------
-- QUESTIONS
-- ----------------------------------------------------------------
CREATE TABLE public.questions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id     TEXT NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  prompt        TEXT NOT NULL,
  options       JSONB NOT NULL,
  correct_index INT NOT NULL,
  explanation   TEXT,
  order_index   INT NOT NULL
);


-- ----------------------------------------------------------------
-- FLASHCARDS
-- ----------------------------------------------------------------
CREATE TABLE public.flashcards (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id   TEXT NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  front       TEXT NOT NULL,
  back        TEXT NOT NULL,
  order_index INT NOT NULL
);


-- ----------------------------------------------------------------
-- user_progress: fix lesson_id type + add missing columns
-- ----------------------------------------------------------------
ALTER TABLE public.user_progress
  ALTER COLUMN lesson_id TYPE TEXT USING lesson_id::TEXT,
  ADD COLUMN IF NOT EXISTS attempts          INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS score             INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_attempt_date TIMESTAMPTZ;


-- ----------------------------------------------------------------
-- RLS
-- ----------------------------------------------------------------
ALTER TABLE public.modules        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards     ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "modules_public_read"        ON public.modules;
DROP POLICY IF EXISTS "lessons_public_read"        ON public.lessons;
DROP POLICY IF EXISTS "study_sections_public_read" ON public.study_sections;
DROP POLICY IF EXISTS "questions_public_read"      ON public.questions;
DROP POLICY IF EXISTS "flashcards_public_read"     ON public.flashcards;

CREATE POLICY "modules_public_read"        ON public.modules        FOR SELECT USING (true);
CREATE POLICY "lessons_public_read"        ON public.lessons        FOR SELECT USING (true);
CREATE POLICY "study_sections_public_read" ON public.study_sections FOR SELECT USING (true);
CREATE POLICY "questions_public_read"      ON public.questions      FOR SELECT USING (true);
CREATE POLICY "flashcards_public_read"     ON public.flashcards     FOR SELECT USING (true);


-- ----------------------------------------------------------------
-- Reload PostgREST schema cache
-- ----------------------------------------------------------------
NOTIFY pgrst, 'reload schema';
