-- ── Resit one-per-account enforcement ───────────────────────────────────────
--
-- Two partial unique indexes:
--   1. One approved claim per user (lifetime — no double-dipping)
--   2. One pending claim per user at a time (prevents queue spam)
--
-- Rejected claims are excluded so users can legitimately resubmit
-- with updated evidence after a rejection.

CREATE UNIQUE INDEX IF NOT EXISTS resit_claims_one_approved_per_user
  ON resit_claims (user_id)
  WHERE status = 'approved';

CREATE UNIQUE INDEX IF NOT EXISTS resit_claims_one_pending_per_user
  ON resit_claims (user_id)
  WHERE status = 'pending';
