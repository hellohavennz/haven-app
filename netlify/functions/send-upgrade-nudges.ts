/**
 * Scheduled function — runs daily at 09:00 UTC.
 *
 * Sends upgrade nudge emails to free-tier users:
 *   - Day 7:  friendly check-in, highlight what Plus unlocks
 *   - Day 14: gentle follow-up, emphasise mock exams + full content
 *
 * Each email is sent once per user (tracked via nudge flag on profile).
 * Can be triggered manually via POST /.netlify/functions/send-upgrade-nudges
 */

import { schedule } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const FROM = 'Haven <hello@haven.study>';
const APP_URL = 'https://havenstudy.app/uk';

// ── Email helper ──────────────────────────────────────────────────────────────

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

function nudge7dHtml(name: string): string {
  const greeting = name ? `Hi ${name},` : 'Hi there,';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#F4F7F5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F7F5;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">

        <tr>
          <td style="background:#4E8571;padding:28px 32px 22px;">
            <div style="font-size:24px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">Haven<span style="color:#a8d5c2;">.</span></div>
            <div style="font-size:12px;color:rgba(255,255,255,0.75);margin-top:3px;">Life in the UK Test Preparation</div>
          </td>
        </tr>

        <tr>
          <td style="padding:32px 32px 28px;">
            <p style="margin:0 0 16px;font-size:16px;font-weight:600;color:#111827;">${greeting}</p>
            <p style="margin:0 0 16px;font-size:15px;color:#4b5563;line-height:1.7;">
              You've been studying with Haven for a week now — great commitment. How's it going?
            </p>
            <p style="margin:0 0 24px;font-size:15px;color:#4b5563;line-height:1.7;">
              If you're finding the free lessons helpful, there's a lot more waiting for you when you're ready:
            </p>

            <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;width:100%;">
              <tr><td style="padding:8px 0;border-bottom:1px solid #f3f4f6;">
                <span style="font-size:15px;color:#374151;">&#128218;&nbsp; All 5 study modules</span>
                <span style="float:right;font-size:13px;color:#6b7280;">29 lessons total</span>
              </td></tr>
              <tr><td style="padding:8px 0;border-bottom:1px solid #f3f4f6;">
                <span style="font-size:15px;color:#374151;">&#128203;&nbsp; Full mock exams</span>
                <span style="float:right;font-size:13px;color:#6b7280;">Timed, 24 questions</span>
              </td></tr>
              <tr><td style="padding:8px 0;border-bottom:1px solid #f3f4f6;">
                <span style="font-size:15px;color:#374151;">&#129054;&nbsp; Flashcards for everything</span>
                <span style="float:right;font-size:13px;color:#6b7280;">All modules</span>
              </td></tr>
              <tr><td style="padding:8px 0;">
                <span style="font-size:15px;color:#374151;">&#128202;&nbsp; Progress tracking</span>
                <span style="float:right;font-size:13px;color:#6b7280;">See where you stand</span>
              </td></tr>
            </table>

            <p style="margin:0 0 24px;font-size:15px;color:#4b5563;line-height:1.7;">
              Haven Plus starts from just £4.99 — a one-off payment, no subscription.
            </p>

            <a href="${APP_URL}/paywall"
               style="display:inline-block;background:#4E8571;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 28px;border-radius:10px;">
              See what's included
            </a>
          </td>
        </tr>

        <tr>
          <td style="padding:20px 32px 28px;border-top:1px solid #f0f0f0;text-align:center;">
            <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">
              Haven Study &middot; <a href="https://havenstudy.app" style="color:#4E8571;text-decoration:none;">havenstudy.app</a><br>
              No pressure — your free account is always here when you need it.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function nudge14dHtml(name: string): string {
  const greeting = name ? `Hi ${name},` : 'Hi there,';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#F4F7F5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F7F5;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">

        <tr>
          <td style="background:#4E8571;padding:28px 32px 22px;">
            <div style="font-size:24px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">Haven<span style="color:#a8d5c2;">.</span></div>
            <div style="font-size:12px;color:rgba(255,255,255,0.75);margin-top:3px;">Life in the UK Test Preparation</div>
          </td>
        </tr>

        <tr>
          <td style="padding:32px 32px 28px;">
            <p style="margin:0 0 16px;font-size:16px;font-weight:600;color:#111827;">${greeting}</p>
            <p style="margin:0 0 16px;font-size:15px;color:#4b5563;line-height:1.7;">
              It's been a couple of weeks — hope the studying is going well.
            </p>
            <p style="margin:0 0 16px;font-size:15px;color:#4b5563;line-height:1.7;">
              A lot of people find that mock exams are the best way to really know if they're ready.
              They're a bit nerve-wracking, but they're the closest thing to the real test — and they
              show you exactly where to focus.
            </p>
            <p style="margin:0 0 24px;font-size:15px;color:#4b5563;line-height:1.7;">
              Mock exams, all five study modules, and full flashcard access are all included in
              Haven Plus from just £4.99. No subscription — pay once, study at your own pace.
            </p>

            <a href="${APP_URL}/paywall"
               style="display:inline-block;background:#4E8571;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 28px;border-radius:10px;">
              Explore Haven Plus
            </a>

            <p style="margin:24px 0 0;font-size:13px;color:#9ca3af;line-height:1.6;">
              Either way, good luck with your prep. You've got this.
            </p>
          </td>
        </tr>

        <tr>
          <td style="padding:20px 32px 28px;border-top:1px solid #f0f0f0;text-align:center;">
            <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">
              Haven Study &middot; <a href="https://havenstudy.app" style="color:#4E8571;text-decoration:none;">havenstudy.app</a><br>
              You're receiving this because you have a free Haven account.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── Main handler ──────────────────────────────────────────────────────────────

const nudge = async () => {
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY not set');
    return { statusCode: 500, body: 'RESEND_API_KEY not configured' };
  }

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const today = new Date();

  function daysAgo(n: number): string {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - n);
    return d.toISOString().split('T')[0];
  }

  let sent = 0;
  let errors = 0;

  // ── Day-7 nudge ───────────────────────────────────────────────────────────
  const { data: due7, error: err7 } = await supabase
    .from('profiles')
    .select('id')
    .eq('subscription_tier', 'free')
    .eq('upgrade_nudge_7d_sent', false)
    .filter('created_at', 'gte', `${daysAgo(7)}T00:00:00Z`)
    .filter('created_at', 'lt',  `${daysAgo(6)}T00:00:00Z`);

  if (err7) {
    console.error('Day-7 query failed:', err7.message);
  } else {
    for (const row of due7 ?? []) {
      try {
        const { data: { user }, error: uErr } = await supabase.auth.admin.getUserById(row.id);
        if (uErr || !user?.email) throw new Error(uErr?.message ?? 'no email');

        const name = user.user_metadata?.full_name?.split(' ')[0] ?? '';
        await sendEmail(user.email, "How's your studying going? A quick update from Haven", nudge7dHtml(name));
        await supabase.from('profiles').update({ upgrade_nudge_7d_sent: true }).eq('id', row.id);

        console.log(`7d nudge sent → ${user.email}`);
        sent++;
      } catch (err: any) {
        console.error(`7d nudge failed for ${row.id}:`, err.message);
        errors++;
      }
    }
  }

  // ── Day-14 nudge ──────────────────────────────────────────────────────────
  const { data: due14, error: err14 } = await supabase
    .from('profiles')
    .select('id')
    .eq('subscription_tier', 'free')
    .eq('upgrade_nudge_14d_sent', false)
    .filter('created_at', 'gte', `${daysAgo(14)}T00:00:00Z`)
    .filter('created_at', 'lt',  `${daysAgo(13)}T00:00:00Z`);

  if (err14) {
    console.error('Day-14 query failed:', err14.message);
  } else {
    for (const row of due14 ?? []) {
      try {
        const { data: { user }, error: uErr } = await supabase.auth.admin.getUserById(row.id);
        if (uErr || !user?.email) throw new Error(uErr?.message ?? 'no email');

        const name = user.user_metadata?.full_name?.split(' ')[0] ?? '';
        await sendEmail(user.email, 'Still studying? A note from Haven', nudge14dHtml(name));
        await supabase.from('profiles').update({ upgrade_nudge_14d_sent: true }).eq('id', row.id);

        console.log(`14d nudge sent → ${user.email}`);
        sent++;
      } catch (err: any) {
        console.error(`14d nudge failed for ${row.id}:`, err.message);
        errors++;
      }
    }
  }

  console.log(`Nudge run complete — sent: ${sent}, errors: ${errors}`);
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sent, errors }),
  };
};

// Every day at 09:00 UTC
export const handler = schedule('0 9 * * *', nudge);
