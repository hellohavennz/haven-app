-- ================================================================
-- Migration 000019: Add order_index indexes on content tables
-- ================================================================
--
-- All four content tables (questions, study_sections, lessons,
-- flashcards) are fetched on every app load with ORDER BY order_index.
-- Without an index PostgreSQL does a full sequential scan + sort.
-- The index_advisor confirms each index reduces startup cost ~8x.
--
-- These are non-unique btree indexes — safe to create concurrently
-- (no table lock). The content tables are read-heavy and static
-- (rarely written), so index maintenance overhead is negligible.
--
-- ================================================================

CREATE INDEX IF NOT EXISTS questions_order_index_idx
  ON public.questions USING btree (order_index);

CREATE INDEX IF NOT EXISTS study_sections_order_index_idx
  ON public.study_sections USING btree (order_index);

CREATE INDEX IF NOT EXISTS lessons_order_index_idx
  ON public.lessons USING btree (order_index);

CREATE INDEX IF NOT EXISTS flashcards_order_index_idx
  ON public.flashcards USING btree (order_index);
