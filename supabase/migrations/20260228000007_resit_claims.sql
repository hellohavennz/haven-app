-- ── Resit claims table ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS resit_claims (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email    TEXT,
  status        TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'approved', 'rejected')),
  evidence_path TEXT NOT NULL,
  admin_notes   TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at   TIMESTAMPTZ,
  reviewed_by   UUID REFERENCES auth.users(id)
);

ALTER TABLE resit_claims ENABLE ROW LEVEL SECURITY;

-- Users can view their own claims
CREATE POLICY "Users view own resit claims"
  ON resit_claims FOR SELECT
  USING (auth.uid() = user_id);

-- Users can submit their own claims
CREATE POLICY "Users submit resit claims"
  ON resit_claims FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admin can read and update all claims (checked by email from JWT)
CREATE POLICY "Admin manages resit claims"
  ON resit_claims FOR ALL
  USING ((auth.jwt() ->> 'email') = 'hello.haven.nz@gmail.com');

-- ── Storage policies for resit-evidence bucket ─────────────────────────────
-- (Bucket itself is already created as public via API)

-- Authenticated users can upload to their own folder only
CREATE POLICY "Users upload own evidence"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'resit-evidence'
    AND auth.role() = 'authenticated'
    AND name LIKE (auth.uid()::text || '/%')
  );
