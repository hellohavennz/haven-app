-- ================================================================
-- Migration 000018: Fix remaining app_settings RLS warnings
-- ================================================================
--
-- Two warnings remain on app_settings after migration 000016:
--
-- 1. auth_rls_initplan — "app_settings_admin_write" uses auth.jwt()
--    in its USING/WITH CHECK. The advisor flags this even when wrapped
--    in (select ...). Fix: use public.is_admin() instead, which is
--    SECURITY DEFINER + STABLE and doesn't expose auth.jwt() directly
--    in the policy expression.
--
-- 2. multiple_permissive_policies — "app_settings_admin_write" was
--    FOR ALL, which includes SELECT. For authenticated users doing
--    SELECT, both "app_settings_admin_write" (USING: admin check) and
--    "app_settings_public_read" (USING: true) were evaluated, causing
--    the multiple permissive policies warning. Fix: split into
--    INSERT-only and UPDATE-only policies so SELECT is covered only by
--    app_settings_public_read.
--
-- ================================================================

DROP POLICY IF EXISTS "app_settings_admin_write" ON public.app_settings;

-- Admin INSERT (no USING clause for INSERT; WITH CHECK only)
CREATE POLICY "app_settings_admin_insert" ON public.app_settings
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

-- Admin UPDATE
CREATE POLICY "app_settings_admin_update" ON public.app_settings
  FOR UPDATE TO authenticated
  USING     (public.is_admin())
  WITH CHECK (public.is_admin());

-- SELECT: covered by app_settings_public_read (USING true, all roles)
-- DELETE: no policy needed — app_settings rows are permanent config
