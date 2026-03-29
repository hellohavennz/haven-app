/**
 * Scheduled function — runs daily at 10:00 UTC.
 *
 * Sends a re-engagement email to any user (free or paid) who hasn't
 * logged in for 7+ days. Sends at most once every 30 days per user.
 *
 * Two variants:
 *   - Exam upcoming (within 60 days): study-urgency tone
 *   - No exam / exam far away: general encouragement
 *
 * Can be triggered manually via POST /.netlify/functions/send-re-engagement
 */

import { schedule } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const FROM    = 'Haven <hello@haven.study>';
const APP_URL = 'https://havenstudy.app/uk';

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Resend error ${res.status}: ${text}`);
  }
}

// ── Email templates ───────────────────────────────────────────────────────────

function withExamHtml(name: string, daysUntil: number): string {
  const greeting = name ? `Hi ${name},` : 'Hi there,';
  const urgency = daysUntil <= 14
    ? `Your test is coming up in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}.`
    : `Your test is in ${daysUntil} days.`;

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F4F7F5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F7F5;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">
        <tr><td style="background:#4E8571;padding:28px 32px 22px;">
          <div style="font-size:24px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">Haven<span style="color:#a8d5c2;">.</span></div>
          <div style="font-size:12px;color:rgba(255,255,255,0.75);margin-top:3px;">Life in the UK Test Preparation</div>
        </td></tr>
        <tr><td style="padding:32px 32px 28px;">
          <p style="margin:0 0 16px;font-size:16px;font-weight:600;color:#111827;">${greeting}</p>
          <p style="margin:0 0 16px;font-size:15px;color:#4b5563;line-height:1.7;">
            We noticed you haven't studied in a little while. ${urgency}
          </p>
          <p style="margin:0 0 24px;font-size:15px;color:#4b5563;line-height:1.7;">
            Even a short session helps — 15 minutes of flashcards or a quick practice round
            can make a real difference to how confident you feel on the day.
          </p>
          <a href="${APP_URL}/dashboard"
             style="display:inline-block;background:#4E8571;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 28px;border-radius:10px;">
            Pick up where you left off
          </a>
        </td></tr>
        <tr><td style="padding:20px 32px 28px;border-top:1px solid #f0f0f0;text-align:center;">
          <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">
            Haven Study &middot; <a href="https://havenstudy.app" style="color:#4E8571;text-decoration:none;">havenstudy.app</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function generalHtml(name: string): string {
  const greeting = name ? `Hi ${name},` : 'Hi there,';
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F4F7F5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F7F5;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">
        <tr><td style="background:#4E8571;padding:28px 32px 22px;">
          <div style="font-size:24px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">Haven<span style="color:#a8d5c2;">.</span></div>
          <div style="font-size:12px;color:rgba(255,255,255,0.75);margin-top:3px;">Life in the UK Test Preparation</div>
        </td></tr>
        <tr><td style="padding:32px 32px 28px;">
          <p style="margin:0 0 16px;font-size:16px;font-weight:600;color:#111827;">${greeting}</p>
          <p style="margin:0 0 16px;font-size:15px;color:#4b5563;line-height:1.7;">
            Just checking in — it's been a little while since you last studied with Haven.
          </p>
          <p style="margin:0 0 24px;font-size:15px;color:#4b5563;line-height:1.7;">
            Whenever you're ready to pick it back up, everything is exactly where you left it.
            No pressure — just a friendly nudge in case life got busy.
          </p>
          <a href="${APP_URL}/dashboard"
             style="display:inline-block;background:#4E8571;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 28px;border-radius:10px;">
            Continue studying
          </a>
        </td></tr>
        <tr><td style="padding:20px 32px 28px;border-top:1px solid #f0f0f0;text-align:center;">
          <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">
            Haven Study &middot; <a href="https://havenstudy.app" style="color:#4E8571;text-decoration:none;">havenstudy.app</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

// ── Main handler ──────────────────────────────────────────────────────────────

const reEngage = async () => {
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY not set');
    return { statusCode: 500, body: 'RESEND_API_KEY not configured' };
  }

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const now = new Date();
  const cutoff7d     = new Date(now.getTime() - 7  * 86400000).toISOString().split('T')[0];
  const cutoff30d    = new Date(now.getTime() - 30 * 86400000).toISOString();

  // Find users who haven't logged in for 7+ days
  // and haven't been re-engaged in the last 30 days
  const { data: candidates, error } = await supabase
    .from('profiles')
    .select('id, exam_date, re_engagement_last_sent')
    .or(`re_engagement_last_sent.is.null,re_engagement_last_sent.lt.${cutoff30d}`);

  if (error) {
    console.error('Failed to fetch candidates:', error.message);
    return { statusCode: 500, body: error.message };
  }

  let sent = 0;
  let errors = 0;

  for (const profile of candidates ?? []) {
    try {
      // Check last login event
      const { data: lastLogin } = await supabase
        .from('login_events')
        .select('date')
        .eq('user_id', profile.id)
        .order('date', { ascending: false })
        .limit(1)
        .single();

      // Skip if logged in within last 7 days
      if (lastLogin?.date && lastLogin.date >= cutoff7d) continue;

      // Get user's email and name
      const { data: { user }, error: uErr } = await supabase.auth.admin.getUserById(profile.id);
      if (uErr || !user?.email) continue;

      const name = user.user_metadata?.full_name?.split(' ')[0] ?? '';

      // Choose email variant
      let subject: string;
      let html: string;

      if (profile.exam_date) {
        const daysUntil = Math.ceil(
          (new Date(profile.exam_date).getTime() - now.getTime()) / 86400000
        );
        if (daysUntil > 0 && daysUntil <= 60) {
          subject = `Your Life in the UK test is coming up — time to get back to it`;
          html = withExamHtml(name, daysUntil);
        } else {
          subject = `Haven misses you — come back when you're ready`;
          html = generalHtml(name);
        }
      } else {
        subject = `Haven misses you — come back when you're ready`;
        html = generalHtml(name);
      }

      await sendEmail(user.email, subject, html);
      await supabase
        .from('profiles')
        .update({ re_engagement_last_sent: now.toISOString() })
        .eq('id', profile.id);

      console.log(`Re-engagement sent → ${user.email}`);
      sent++;
    } catch (err: any) {
      console.error(`Re-engagement failed for ${profile.id}:`, err.message);
      errors++;
    }
  }

  console.log(`Re-engagement run complete — sent: ${sent}, errors: ${errors}`);
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sent, errors }),
  };
};

// Every day at 10:00 UTC
export const handler = schedule('0 10 * * *', reEngage);
