-- ================================================================
-- Migration 000017: Fix remaining security warnings
-- ================================================================
--
-- Fixes three classes of Supabase advisor warnings:
--
-- 1. function_search_path_mutable — functions without a fixed
--    search_path can be exploited via search-path injection if an
--    attacker can create objects in a schema that appears earlier in
--    the search path. Fix: ALTER FUNCTION ... SET search_path = ''
--    (empty search_path forces all references to be schema-qualified,
--    which they already are throughout Haven's functions).
--
-- 2. rls_policy_always_true — "Service role can update all" on
--    profiles uses USING(true) for UPDATE, which is a no-op since the
--    service role already bypasses RLS. Drop it.
--
-- 3. auth_leaked_password_protection — UI-only toggle in Supabase
--    Dashboard → Authentication → Settings → "Enable leaked password
--    protection". Cannot be changed via SQL. See note at end.
--
-- ================================================================


-- ----------------------------------------------------------------
-- 1. Fix search_path on all flagged functions
-- ----------------------------------------------------------------

-- Trigger function: sets updated_at = now()
ALTER FUNCTION public.update_updated_at_column()
  SET search_path = '';

-- Trigger function: inserts a profiles row on new auth.users signup
ALTER FUNCTION public.handle_new_user()
  SET search_path = '';

-- Extension trigger function (moddatetime contrib)
ALTER FUNCTION public.moddatetime()
  SET search_path = '';

-- Helper: returns true if the calling user is the admin
ALTER FUNCTION public.is_admin()
  SET search_path = '';

-- Admin RPC: aggregated dashboard stats
ALTER FUNCTION public.admin_overview()
  SET search_path = '';

-- Admin RPC: list content reports filtered by status
ALTER FUNCTION public.admin_get_reports(text)
  SET search_path = '';

-- Admin RPC: update a content report's status
ALTER FUNCTION public.admin_update_report(uuid, text)
  SET search_path = '';

-- Admin RPC: list all users with profile + auth data
ALTER FUNCTION public.admin_get_users()
  SET search_path = '';

-- Admin RPC: exam attempt aggregate stats
ALTER FUNCTION public.admin_get_exam_stats()
  SET search_path = '';


-- ----------------------------------------------------------------
-- 2. Drop the always-true UPDATE policy on profiles
--
-- "Service role can update all" uses USING(true) for UPDATE.
-- The service role already bypasses RLS entirely, so this policy
-- is both unnecessary and triggers the rls_policy_always_true lint.
-- Netlify functions that update profiles use the service role key
-- and are unaffected by this removal.
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "Service role can update all" ON public.profiles;


-- ----------------------------------------------------------------
-- 3. Leaked password protection (ACTION REQUIRED — not SQL)
--
-- Go to: Supabase Dashboard → Authentication → Settings
-- Enable: "Leaked password protection (HaveIBeenPwned.org)"
-- This cannot be enabled via SQL/migration.
-- ----------------------------------------------------------------
