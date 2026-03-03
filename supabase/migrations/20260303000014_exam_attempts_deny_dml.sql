-- Explicitly deny UPDATE and DELETE on exam_attempts for all users.
-- PostgreSQL's default when RLS is enabled and no policy exists is to deny,
-- but explicit deny policies make the intent clear and guard against future changes.

DROP POLICY IF EXISTS "exam_attempts_deny_delete" ON public.exam_attempts;
CREATE POLICY "exam_attempts_deny_delete" ON public.exam_attempts
  FOR DELETE USING (false);

DROP POLICY IF EXISTS "exam_attempts_deny_update" ON public.exam_attempts;
CREATE POLICY "exam_attempts_deny_update" ON public.exam_attempts
  FOR UPDATE USING (false);
