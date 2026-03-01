/**
 * Scheduled function — runs daily at 08:00 UTC.
 *
 * Sends two reminder emails per user:
 *   • 7-day reminder  (exam_date = today + 7, exam_reminder_7d_sent = false)
 *   • 1-day reminder  (exam_date = today + 1, exam_reminder_1d_sent = false)
 *
 * Uses Resend for email delivery. Requires RESEND_API_KEY in env.
 *
 * Set up:
 *   1. Sign up at resend.com (free — 3 000 emails/month)
 *   2. Add & verify haven.study as a sending domain
 *   3. Add RESEND_API_KEY to Netlify environment variables
 */

import type { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const FROM = 'Haven <reminders@haven.study>';
const APP_URL = 'https://havenstudy.app/uk';

// ── Helpers ─────────────────────────────────────────────────────────────────

function isoDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

function addDays(d: Date, n: number): Date {
  const out = new Date(d);
  out.setUTCDate(out.getUTCDate() + n);
  return out;
}

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
    const body = await res.text();
    throw new Error(`Resend error ${res.status}: ${body}`);
  }
}

// ── Email templates ──────────────────────────────────────────────────────────

function emailHtml({
  heading,
  intro,
  tips,
  ctaText,
  ctaUrl,
}: {
  heading: string;
  intro: string;
  tips: string[];
  ctaText: string;
  ctaUrl: string;
}): string {
  const tipRows = tips
    .map(t => `<tr><td style="padding:6px 0;font-size:15px;color:#374151;line-height:1.5;">• ${t}</td></tr>`)
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${heading}</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#0d9488,#10b981);padding:28px 32px 22px;">
            <div style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">Haven</div>
            <div style="font-size:12px;color:rgba(255,255,255,0.8);margin-top:2px;">Life in the UK Test Prep</div>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px 32px 24px;">
            <h1 style="margin:0 0 12px;font-size:20px;font-weight:700;color:#111827;line-height:1.3;">${heading}</h1>
            <p style="margin:0 0 24px;font-size:15px;color:#4b5563;line-height:1.6;">${intro}</p>

            <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
              ${tipRows}
            </table>

            <a href="${ctaUrl}"
               style="display:inline-block;background:linear-gradient(135deg,#0d9488,#10b981);color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 28px;border-radius:10px;">
              ${ctaText}
            </a>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 32px 28px;border-top:1px solid #f0f0f0;text-align:center;">
            <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">
              Haven Study &middot; <a href="https://havenstudy.app" style="color:#0d9488;text-decoration:none;">havenstudy.app</a><br>
              You're receiving this because you set an exam date in Haven.<br>
              <a href="${APP_URL}/profile" style="color:#0d9488;">Update or remove your exam date</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function sevenDayEmail(): { subject: string; html: string } {
  return {
    subject: 'Your Life in the UK test is in 7 days — final prep tips',
    html: emailHtml({
      heading: 'One week to go — you\'ve got this!',
      intro: 'Your Life in the UK test is coming up in 7 days. Here\'s how to make the most of this final week:',
      tips: [
        'Take a full mock exam today to see where you stand',
        'Focus your practice on your weakest modules',
        'Use flashcards for facts that are hard to remember',
        'Read through any lessons you haven\'t finished yet',
        'Get a good night\'s sleep the night before',
      ],
      ctaText: 'Open Haven and start studying',
      ctaUrl: `${APP_URL}/dashboard`,
    }),
  };
}

function oneDayEmail(): { subject: string; html: string } {
  return {
    subject: 'Your Life in the UK test is tomorrow — good luck!',
    html: emailHtml({
      heading: 'Tomorrow\'s the day — you\'re ready!',
      intro: 'Your Life in the UK test is tomorrow. Here are a few last-minute tips to help you do your best:',
      tips: [
        'Do a quick flashcard session to refresh key facts',
        'Remember: 18 out of 24 correct (75%) is the pass mark',
        'You have 45 minutes — read each question carefully',
        'If you\'re unsure, rule out wrong answers and make your best guess',
        'Get a good night\'s sleep and eat well before you go',
      ],
      ctaText: 'Quick flashcard review',
      ctaUrl: `${APP_URL}/flashcards`,
    }),
  };
}

// ── Main handler ─────────────────────────────────────────────────────────────
// Schedule is defined in netlify.toml: [functions.send-exam-reminders] schedule = "0 8 * * *"

export const handler: Handler = async () => {
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not set — skipping reminder run');
    return { statusCode: 500, body: 'RESEND_API_KEY not configured' };
  }

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const today = new Date();
  const date7 = isoDate(addDays(today, 7));
  const date1 = isoDate(addDays(today, 1));

  let sent = 0;
  let errors = 0;

  // ── 7-day reminders ────────────────────────────────────────────────────────
  const { data: users7d, error: err7d } = await supabase
    .from('profiles')
    .select('id')
    .eq('exam_date', date7)
    .eq('exam_reminder_7d_sent', false);

  if (err7d) {
    console.error('Failed to query 7-day candidates:', err7d.message);
  } else {
    for (const row of users7d ?? []) {
      try {
        const { data: { user }, error: userErr } = await supabase.auth.admin.getUserById(row.id);
        if (userErr || !user?.email) throw new Error(userErr?.message ?? 'no email');

        const { subject, html } = sevenDayEmail();
        await sendEmail(user.email, subject, html);
        await supabase.from('profiles').update({ exam_reminder_7d_sent: true }).eq('id', row.id);

        console.log(`7d reminder sent → ${user.email}`);
        sent++;
      } catch (err: any) {
        console.error(`7d reminder failed for ${row.id}:`, err.message);
        errors++;
      }
    }
  }

  // ── 1-day reminders ────────────────────────────────────────────────────────
  const { data: users1d, error: err1d } = await supabase
    .from('profiles')
    .select('id')
    .eq('exam_date', date1)
    .eq('exam_reminder_1d_sent', false);

  if (err1d) {
    console.error('Failed to query 1-day candidates:', err1d.message);
  } else {
    for (const row of users1d ?? []) {
      try {
        const { data: { user }, error: userErr } = await supabase.auth.admin.getUserById(row.id);
        if (userErr || !user?.email) throw new Error(userErr?.message ?? 'no email');

        const { subject, html } = oneDayEmail();
        await sendEmail(user.email, subject, html);
        await supabase.from('profiles').update({ exam_reminder_1d_sent: true }).eq('id', row.id);

        console.log(`1d reminder sent → ${user.email}`);
        sent++;
      } catch (err: any) {
        console.error(`1d reminder failed for ${row.id}:`, err.message);
        errors++;
      }
    }
  }

  console.log(`Reminder run complete — sent: ${sent}, errors: ${errors}`);
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sent, errors }),
  };
};
