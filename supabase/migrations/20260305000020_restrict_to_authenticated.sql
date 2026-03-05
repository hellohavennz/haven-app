-- ================================================================
-- Migration 000020: Restrict all sensitive RLS policies to
--                   the authenticated role only
-- ================================================================
--
-- The SELECT policy on profiles (and other tables) was scoped to
-- {public} (all roles). This means the anon role could potentially
-- read rows if auth.uid() evaluation behaves unexpectedly (e.g. via
-- Supabase's new API key model where gateway-level auth may differ
-- from JWT-based role resolution).
--
-- Fix: explicitly scope every policy on sensitive tables to
-- TO authenticated, so the anon role has NO applicable policy
-- and gets zero rows by default (PostgreSQL denies when no policy
-- matches for a non-superuser role with RLS enabled).
--
-- Content tables (lessons, questions, flashcards, study_sections,
-- modules) intentionally remain public-readable — their data is
-- gated at the application layer (subscription tier check).
-- ================================================================


-- ----------------------------------------------------------------
-- PROFILES
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = id);

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = id);


-- ----------------------------------------------------------------
-- USER_PROGRESS
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "user_progress_select_own" ON public.user_progress;
DROP POLICY IF EXISTS "user_progress_insert_own" ON public.user_progress;
DROP POLICY IF EXISTS "user_progress_update_own" ON public.user_progress;

CREATE POLICY "user_progress_select_own" ON public.user_progress
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "user_progress_insert_own" ON public.user_progress
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "user_progress_update_own" ON public.user_progress
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id);


-- ----------------------------------------------------------------
-- EXAM_ATTEMPTS
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "exam_attempts_select_own" ON public.exam_attempts;
DROP POLICY IF EXISTS "exam_attempts_insert_own" ON public.exam_attempts;

CREATE POLICY "exam_attempts_select_own" ON public.exam_attempts
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "exam_attempts_insert_own" ON public.exam_attempts
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);


-- ----------------------------------------------------------------
-- RESIT_CLAIMS
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "resit_claims_select_own" ON public.resit_claims;
DROP POLICY IF EXISTS "resit_claims_insert_own" ON public.resit_claims;

CREATE POLICY "resit_claims_select_own" ON public.resit_claims
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "resit_claims_insert_own" ON public.resit_claims
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);


-- ----------------------------------------------------------------
-- CONTENT_REPORTS
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "content_reports_insert_own" ON public.content_reports;

CREATE POLICY "content_reports_insert_own" ON public.content_reports
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);


-- ----------------------------------------------------------------
-- LOGIN_EVENTS
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "login_events_insert_own" ON public.login_events;

CREATE POLICY "login_events_insert_own" ON public.login_events
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);


-- ----------------------------------------------------------------
-- Verify: after this migration, test with:
--   curl 'https://auth.havenstudy.app/rest/v1/profiles?select=*&limit=5' \
--     -H 'apikey: <publishable_key>'
-- Should return [] (empty array).
-- ----------------------------------------------------------------
