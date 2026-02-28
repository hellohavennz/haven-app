import { supabase } from './supabase';

export type AdminOverview = {
  total_users: number;
  by_tier: { free?: number; plus?: number; premium?: number };
  new_7d: number;
  new_30d: number;
  dau: number;
  wau: number;
  mau: number;
  daily_logins: { date: string; count: number }[];
  daily_signups: { date: string; count: number }[];
  open_reports: number;
  exam_attempts: number;
  exam_pass_rate: number | null;
  upcoming_7d: number;
  upcoming_30d: number;
};

export type ContentReport = {
  id: string;
  lesson_id: string | null;
  content_type: 'lesson' | 'flashcard' | 'question' | 'exam';
  content_ref: string | null;
  message: string;
  status: 'open' | 'reviewed' | 'resolved';
  created_at: string;
  user_email: string | null;
};

export type AdminUser = {
  id: string;
  display_name: string | null;
  email: string;
  subscription_tier: 'free' | 'plus' | 'premium';
  exam_date: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  banned_until: string | null;
  lessons_completed: number;
  total_exams: number;
  exams_passed: number;
  avg_exam_score: number | null;
};

export type ExamStats = {
  total_attempts: number;
  pass_rate: number | null;
  avg_score_pct: number | null;
  avg_duration_seconds: number | null;
  recent: {
    id: string;
    completed_at: string;
    correct: number;
    total: number;
    passed: boolean;
    duration_seconds: number;
    user_email: string;
  }[];
};

export async function fetchAdminOverview(): Promise<AdminOverview> {
  const { data, error } = await supabase.rpc('admin_overview');
  if (error) throw error;
  return data as AdminOverview;
}

export async function fetchAdminReports(status: 'open' | 'reviewed' | 'resolved' | 'all' = 'open'): Promise<ContentReport[]> {
  const { data, error } = await supabase.rpc('admin_get_reports', { p_status: status });
  if (error) throw error;
  return (data ?? []) as ContentReport[];
}

export async function updateReportStatus(id: string, status: 'reviewed' | 'resolved'): Promise<void> {
  const { error } = await supabase.rpc('admin_update_report', { p_id: id, p_status: status });
  if (error) throw error;
}

export async function fetchAdminUsers(): Promise<AdminUser[]> {
  const { data, error } = await supabase.rpc('admin_get_users');
  if (error) throw error;
  return (data ?? []) as AdminUser[];
}

export async function fetchAdminExamStats(): Promise<ExamStats> {
  const { data, error } = await supabase.rpc('admin_get_exam_stats');
  if (error) throw error;
  return data as ExamStats;
}

// ── Resit claims ─────────────────────────────────────────────────────────

export type ResitClaim = {
  id: string;
  user_id: string;
  user_email: string | null;
  status: 'pending' | 'approved' | 'rejected';
  evidence_path: string;
  admin_notes: string | null;
  created_at: string;
  reviewed_at: string | null;
};

export async function fetchResitClaims(
  status: 'pending' | 'approved' | 'rejected' | 'all' = 'pending',
): Promise<ResitClaim[]> {
  let query = supabase
    .from('resit_claims')
    .select('*')
    .order('created_at', { ascending: false });
  if (status !== 'all') query = query.eq('status', status);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as ResitClaim[];
}

export async function approveResitClaim(
  claimId: string,
  token: string,
): Promise<{ stripeExtended: boolean }> {
  const res = await fetch('/.netlify/functions/approve-resit-claim', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ claim_id: claimId }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function rejectResitClaim(
  claimId: string,
  token: string,
  adminNotes?: string,
): Promise<void> {
  const res = await fetch('/.netlify/functions/reject-resit-claim', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ claim_id: claimId, admin_notes: adminNotes }),
  });
  if (!res.ok) throw new Error(await res.text());
}

export function getEvidenceUrl(path: string): string {
  return supabase.storage.from('resit-evidence').getPublicUrl(path).data.publicUrl;
}

export async function adminUserAction(
  action: 'freeze' | 'unfreeze' | 'delete',
  userId: string,
  token: string,
): Promise<void> {
  const res = await fetch('/.netlify/functions/admin-user-action', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ action, user_id: userId }),
  });
  if (!res.ok) throw new Error(await res.text());
}

/** Fire-and-forget — records today's login for the current user. */
export function recordLoginEvent(userId: string): void {
  const today = new Date().toISOString().split('T')[0];
  supabase
    .from('login_events')
    .upsert({ user_id: userId, date: today }, { onConflict: 'user_id,date', ignoreDuplicates: true })
    .then(() => {});
}
