CREATE TABLE public.content_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  lesson_id TEXT,
  content_type TEXT NOT NULL CHECK (content_type IN ('lesson', 'flashcard', 'question', 'exam')),
  content_ref TEXT,   -- e.g. flashcard index, question index
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reviewed', 'resolved')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.content_reports ENABLE ROW LEVEL SECURITY;

-- Users can insert their own reports
CREATE POLICY "users can insert reports" ON public.content_reports
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Only service role can read (for admin dashboard later)
CREATE POLICY "service role read" ON public.content_reports
  FOR SELECT USING (false);  -- will be relaxed when admin dashboard is built
