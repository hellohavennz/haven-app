-- ================================================================
-- Migration 000016: Fix RLS performance warnings
-- ================================================================
--
-- Fixes three classes of Supabase advisor warnings:
--
-- 1. auth_rls_initplan — auth.uid() / auth.jwt() called directly in
--    USING/WITH CHECK causes PostgreSQL to re-evaluate it for every row.
--    Fix: wrap in (select auth.uid()) so it is evaluated once per query.
--
-- 2. multiple_permissive_policies — duplicate policies accumulated across
--    migrations (different names, same effect). Drop all and recreate one
--    canonical policy per operation per table.
--
-- 3. duplicate_index — user_progress has two identical unique indexes.
--    Drop the redundant one.
--
-- NOTE: Two tables flagged by the advisor (public.attempts,
-- public.purchases) are not part of Haven's schema — they appear to be
-- legacy test tables. Drop them if they are unused:
--   DROP TABLE IF EXISTS public.attempts;
--   DROP TABLE IF EXISTS public.purchases;
-- ================================================================


-- ----------------------------------------------------------------
-- PROFILES
-- Drop every existing policy (catches both migration-created names
-- and any manually-created legacy names) then recreate cleanly.
-- ----------------------------------------------------------------
DO $$
DECLARE pol text;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol);
  END LOOP;
END $$;

CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING ((select auth.uid()) = id);

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING ((select auth.uid()) = id);


-- ----------------------------------------------------------------
-- USER_PROGRESS
-- Multiple migrations created overlapping policies with different
-- names. Drop all and replace with three clean policies.
-- ----------------------------------------------------------------
DO $$
DECLARE pol text;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_progress'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_progress', pol);
  END LOOP;
END $$;

CREATE POLICY "user_progress_select_own" ON public.user_progress
  FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "user_progress_insert_own" ON public.user_progress
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "user_progress_update_own" ON public.user_progress
  FOR UPDATE USING ((select auth.uid()) = user_id);


-- ----------------------------------------------------------------
-- EXAM_ATTEMPTS
-- Legacy "own exam attempts" ALL policy covered DELETE+UPDATE,
-- making the later USING(false) deny policies redundant permissive
-- policies that triggered the multiple_permissive_policies warning.
-- Replace everything with SELECT+INSERT only; no UPDATE/DELETE
-- policies means those operations are denied by default under RLS.
-- ----------------------------------------------------------------
DO $$
DECLARE pol text;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'exam_attempts'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.exam_attempts', pol);
  END LOOP;
END $$;

CREATE POLICY "exam_attempts_select_own" ON public.exam_attempts
  FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "exam_attempts_insert_own" ON public.exam_attempts
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

-- No UPDATE or DELETE policies — denied implicitly by RLS.


-- ----------------------------------------------------------------
-- CONTENT_REPORTS
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "users can insert reports"     ON public.content_reports;
DROP POLICY IF EXISTS "service role read"            ON public.content_reports;

CREATE POLICY "content_reports_insert_own" ON public.content_reports
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- SELECT remains blocked for non-service-role (admin reads via service role).


-- ----------------------------------------------------------------
-- LOGIN_EVENTS
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "users can insert own login" ON public.login_events;

CREATE POLICY "login_events_insert_own" ON public.login_events
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);


-- ----------------------------------------------------------------
-- RESIT_CLAIMS
-- "Admin manages resit claims" (FOR ALL) overlapped with user
-- SELECT and INSERT policies, causing multiple_permissive_policies.
-- The admin portal uses the service role key which bypasses RLS
-- entirely, so the admin RLS policy is unnecessary.
-- ----------------------------------------------------------------
DO $$
DECLARE pol text;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'resit_claims'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.resit_claims', pol);
  END LOOP;
END $$;

CREATE POLICY "resit_claims_select_own" ON public.resit_claims
  FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "resit_claims_insert_own" ON public.resit_claims
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

-- Admin access is via service role (approve/reject Netlify functions).


-- ----------------------------------------------------------------
-- APP_SETTINGS
-- Two SELECT policies for authenticated role. Consolidate: keep
-- one public read (anon + authenticated), one admin write.
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "public_read_app_settings"  ON public.app_settings;
DROP POLICY IF EXISTS "admin_write_app_settings"  ON public.app_settings;

CREATE POLICY "app_settings_public_read" ON public.app_settings
  FOR SELECT USING (true);

CREATE POLICY "app_settings_admin_write" ON public.app_settings
  FOR ALL TO authenticated
  USING     ((select auth.jwt() ->> 'email') = 'hello.haven.nz@gmail.com')
  WITH CHECK ((select auth.jwt() ->> 'email') = 'hello.haven.nz@gmail.com');


-- ----------------------------------------------------------------
-- DROP DUPLICATE INDEX on user_progress
-- user_progress_user_id_lesson_id_key is the constraint index
-- (from UNIQUE(user_id, lesson_id)); the other is a redundant copy.
-- ----------------------------------------------------------------
DROP INDEX IF EXISTS public.user_progress_user_lesson_unique;
