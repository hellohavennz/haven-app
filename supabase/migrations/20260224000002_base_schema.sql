-- ================================================================
-- Haven App — Base Schema
-- Migration: 20260224000002
-- ================================================================


-- ----------------------------------------------------------------
-- PROFILES
-- The profiles table is created by Supabase auth or a prior step.
-- We create it IF NOT EXISTS, then add any missing columns.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id                  UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name        TEXT,
  subscription_tier   TEXT NOT NULL DEFAULT 'free',
  exam_date           DATE,
  study_goal          TEXT,
  onboarding_complete BOOLEAN NOT NULL DEFAULT FALSE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Idempotent column additions (migration 1 may have already added some)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS display_name        TEXT,
  ADD COLUMN IF NOT EXISTS subscription_tier   TEXT NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS exam_date           DATE,
  ADD COLUMN IF NOT EXISTS study_goal          TEXT,
  ADD COLUMN IF NOT EXISTS onboarding_complete BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW();


-- ----------------------------------------------------------------
-- MODULES
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.modules (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT NOT NULL UNIQUE,
  title       TEXT NOT NULL,
  summary     TEXT,
  is_free     BOOLEAN NOT NULL DEFAULT FALSE,
  order_index INT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ----------------------------------------------------------------
-- LESSONS
-- Uses the string slug as PK to match existing app code
-- e.g. "lesson-1.2-becoming-permanent-resident"
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.lessons (
  id                   TEXT PRIMARY KEY,
  module_id            UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  title                TEXT NOT NULL,
  overview             TEXT,
  key_facts            TEXT[],
  memory_hook          TEXT,
  supportive_messages  JSONB,
  order_index          INT NOT NULL,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ----------------------------------------------------------------
-- STUDY SECTIONS
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.study_sections (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id   TEXT NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  heading     TEXT NOT NULL,
  content     TEXT NOT NULL,
  order_index INT NOT NULL
);


-- ----------------------------------------------------------------
-- QUESTIONS
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.questions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id     TEXT NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  prompt        TEXT NOT NULL,
  options       JSONB NOT NULL,   -- stored as JSON array of strings
  correct_index INT NOT NULL,
  explanation   TEXT,
  order_index   INT NOT NULL
);


-- ----------------------------------------------------------------
-- FLASHCARDS
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.flashcards (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id   TEXT NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  front       TEXT NOT NULL,
  back        TEXT NOT NULL,
  order_index INT NOT NULL
);


-- ----------------------------------------------------------------
-- USER PROGRESS
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_progress (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id          TEXT NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  completed          BOOLEAN NOT NULL DEFAULT FALSE,
  score              INT NOT NULL DEFAULT 0,
  attempts           INT NOT NULL DEFAULT 0,
  correct_answers    INT NOT NULL DEFAULT 0,
  last_attempt_date  TIMESTAMPTZ,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);


-- ----------------------------------------------------------------
-- EXAM ATTEMPTS
-- id is supplied by the client (crypto.randomUUID()) to allow
-- cross-device deduplication
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.exam_attempts (
  id               UUID PRIMARY KEY,
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  completed_at     TIMESTAMPTZ NOT NULL,
  correct          INT NOT NULL DEFAULT 0,
  total            INT NOT NULL DEFAULT 24,
  passed           BOOLEAN NOT NULL DEFAULT FALSE,
  duration_seconds INT NOT NULL DEFAULT 0,
  module_scores    JSONB NOT NULL DEFAULT '{}',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ================================================================
-- ROW LEVEL SECURITY
-- ================================================================
ALTER TABLE public.profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_attempts  ENABLE ROW LEVEL SECURITY;


-- PROFILES
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);


-- CONTENT TABLES — public read, no client writes (service role only)
DROP POLICY IF EXISTS "modules_public_read" ON public.modules;
CREATE POLICY "modules_public_read" ON public.modules
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "lessons_public_read" ON public.lessons;
CREATE POLICY "lessons_public_read" ON public.lessons
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "study_sections_public_read" ON public.study_sections;
CREATE POLICY "study_sections_public_read" ON public.study_sections
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "questions_public_read" ON public.questions;
CREATE POLICY "questions_public_read" ON public.questions
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "flashcards_public_read" ON public.flashcards;
CREATE POLICY "flashcards_public_read" ON public.flashcards
  FOR SELECT USING (true);


-- USER PROGRESS
DROP POLICY IF EXISTS "user_progress_select_own" ON public.user_progress;
CREATE POLICY "user_progress_select_own" ON public.user_progress
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_progress_insert_own" ON public.user_progress;
CREATE POLICY "user_progress_insert_own" ON public.user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_progress_update_own" ON public.user_progress;
CREATE POLICY "user_progress_update_own" ON public.user_progress
  FOR UPDATE USING (auth.uid() = user_id);


-- EXAM ATTEMPTS
DROP POLICY IF EXISTS "exam_attempts_select_own" ON public.exam_attempts;
CREATE POLICY "exam_attempts_select_own" ON public.exam_attempts
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "exam_attempts_insert_own" ON public.exam_attempts;
CREATE POLICY "exam_attempts_insert_own" ON public.exam_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);


-- ================================================================
-- AUTH TRIGGER — auto-create profile row on signup
-- ================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    new.id,
    COALESCE(
      new.raw_user_meta_data->>'display_name',
      new.raw_user_meta_data->>'full_name'
    )
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
