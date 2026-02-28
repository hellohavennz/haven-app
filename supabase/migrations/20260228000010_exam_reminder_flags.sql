-- ── Exam reminder flags ──────────────────────────────────────────────────────
--
-- Track which reminder emails have been sent so we never send duplicates.
-- Reset when the user updates their exam_date (handled in app logic).

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS exam_reminder_7d_sent BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS exam_reminder_1d_sent BOOLEAN NOT NULL DEFAULT FALSE;
