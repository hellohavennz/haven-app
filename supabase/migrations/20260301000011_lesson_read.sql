-- Add lesson_read flag to user_progress so users can mark a study lesson as
-- read without having to complete any practice questions.
-- This feeds into "Lessons started" counts across the app.

ALTER TABLE user_progress
  ADD COLUMN IF NOT EXISTS lesson_read BOOLEAN NOT NULL DEFAULT FALSE;
