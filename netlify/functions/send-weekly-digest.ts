/**
 * Scheduled function — runs every Monday at 08:00 UTC.
 *
 * Sends a weekly admin digest to hello.haven.nz@gmail.com covering:
 *   • New signups in the last 7 days (with tier)
 *   • All-time user counts by tier
 *
 * Can also be triggered manually via POST /.netlify/functions/send-weekly-digest
 */

import { schedule } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const ADMIN_EMAIL = 'hello.haven.nz@gmail.com';
const FROM = 'Haven <hello@haven.study>';

// ── Helpers ──────────────────────────────────────────────────────────────────

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

function tierBadge(tier: string): string {
  const colours: Record<string, string> = {
    premium: 'background:#92400e;color:#fef3c7;',
    plus:    'background:#134e4a;color:#ccfbf1;',
    free:    'background:#374151;color:#f9fafb;',
  };
  const style = colours[tier] ?? colours.free;
  return `<span style="display:inline-block;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;${style}">${tier}</span>`;
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ── Email builder ─────────────────────────────────────────────────────────────

function buildEmail({
  newUsers,
  tierMap,
  tierCounts,
  totalUsers,
  weekStart,
  weekEnd,
}: {
  newUsers: { id: string; email?: string; created_at: string }[];
  tierMap: Map<string, string>;
  tierCounts: { free: number; plus: number; premium: number };
  totalUsers: number;
  weekStart: string;
  weekEnd: string;
}): string {
  const newFree    = newUsers.filter(u => (tierMap.get(u.id) ?? 'free') === 'free').length;
  const newPlus    = newUsers.filter(u => tierMap.get(u.id) === 'plus').length;
  const newPremium = newUsers.filter(u => tierMap.get(u.id) === 'premium').length;

  const userRows = newUsers.length > 0
    ? newUsers.map(u => `
        <tr>
          <td style="padding:10px 12px;font-size:13px;color:#374151;border-bottom:1px solid #f3f4f6;">${u.email ?? '—'}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;">${tierBadge(tierMap.get(u.id) ?? 'free')}</td>
          <td style="padding:10px 12px;font-size:13px;color:#6b7280;border-bottom:1px solid #f3f4f6;">${fmtDate(u.created_at)}</td>
        </tr>`).join('')
    : `<tr><td colspan="3" style="padding:16px 12px;font-size:13px;color:#9ca3af;text-align:center;">No new signups this week.</td></tr>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Haven weekly digest</title>
</head>
<body style="margin:0;padding:0;background:#F4F7F5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F7F5;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:#4E8571;padding:28px 32px 22px;">
            <div style="font-size:24px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">Haven<span style="color:#a8d5c2;">.</span></div>
            <div style="font-size:12px;color:rgba(255,255,255,0.75);margin-top:3px;">Weekly digest: ${weekStart} to ${weekEnd}</div>
          </td>
        </tr>

        <!-- New signups summary -->
        <tr>
          <td style="padding:28px 32px 0;">
            <h2 style="margin:0 0 16px;font-size:16px;font-weight:700;color:#111827;text-transform:uppercase;letter-spacing:0.05em;">New signups this week</h2>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
              <tr>
                <td style="text-align:center;padding:16px;background:#f0fdf4;border-radius:10px;margin-right:8px;">
                  <div style="font-size:28px;font-weight:700;color:#4E8571;">${newUsers.length}</div>
                  <div style="font-size:12px;color:#6b7280;margin-top:2px;">Total</div>
                </td>
                <td width="12"></td>
                <td style="text-align:center;padding:16px;background:#f9fafb;border-radius:10px;">
                  <div style="font-size:28px;font-weight:700;color:#374151;">${newFree}</div>
                  <div style="font-size:12px;color:#6b7280;margin-top:2px;">Free</div>
                </td>
                <td width="12"></td>
                <td style="text-align:center;padding:16px;background:#f0fdfa;border-radius:10px;">
                  <div style="font-size:28px;font-weight:700;color:#134e4a;">${newPlus}</div>
                  <div style="font-size:12px;color:#6b7280;margin-top:2px;">Plus</div>
                </td>
                <td width="12"></td>
                <td style="text-align:center;padding:16px;background:#fffbeb;border-radius:10px;">
                  <div style="font-size:28px;font-weight:700;color:#92400e;">${newPremium}</div>
                  <div style="font-size:12px;color:#6b7280;margin-top:2px;">Premium</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- New user table -->
        <tr>
          <td style="padding:20px 32px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:10px;overflow:hidden;border:1px solid #f3f4f6;">
              <thead>
                <tr style="background:#f9fafb;">
                  <th style="padding:10px 12px;font-size:11px;font-weight:600;color:#6b7280;text-align:left;text-transform:uppercase;letter-spacing:0.05em;">Email</th>
                  <th style="padding:10px 12px;font-size:11px;font-weight:600;color:#6b7280;text-align:left;text-transform:uppercase;letter-spacing:0.05em;">Plan</th>
                  <th style="padding:10px 12px;font-size:11px;font-weight:600;color:#6b7280;text-align:left;text-transform:uppercase;letter-spacing:0.05em;">Joined</th>
                </tr>
              </thead>
              <tbody>${userRows}</tbody>
            </table>
          </td>
        </tr>

        <!-- All-time totals -->
        <tr>
          <td style="padding:24px 32px 0;">
            <h2 style="margin:0 0 12px;font-size:16px;font-weight:700;color:#111827;text-transform:uppercase;letter-spacing:0.05em;">All-time totals</h2>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;">
                  <span style="font-size:14px;color:#374151;">Total users</span>
                </td>
                <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;text-align:right;">
                  <span style="font-size:14px;font-weight:600;color:#111827;">${totalUsers}</span>
                </td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;">
                  <span style="font-size:14px;color:#374151;">Free</span>
                </td>
                <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;text-align:right;">
                  <span style="font-size:14px;font-weight:600;color:#111827;">${tierCounts.free}</span>
                </td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;">
                  <span style="font-size:14px;color:#374151;">Plus</span>
                </td>
                <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;text-align:right;">
                  <span style="font-size:14px;font-weight:600;color:#111827;">${tierCounts.plus}</span>
                </td>
              </tr>
              <tr>
                <td style="padding:10px 0;">
                  <span style="font-size:14px;color:#374151;">Premium</span>
                </td>
                <td style="padding:10px 0;text-align:right;">
                  <span style="font-size:14px;font-weight:600;color:#111827;">${tierCounts.premium}</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:24px 32px 28px;border-top:1px solid #f0f0f0;margin-top:24px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">
              Haven Study admin digest &middot; <a href="https://havenstudy.app/uk/admin" style="color:#4E8571;text-decoration:none;">Open admin panel</a>
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

const digest = async () => {
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
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Fetch all auth users (up to 1000 — sufficient for early stage)
  const { data: { users }, error: usersErr } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  if (usersErr) {
    console.error('Failed to list users:', usersErr.message);
    return { statusCode: 500, body: usersErr.message };
  }

  const newUsers = users
    .filter(u => new Date(u.created_at) >= sevenDaysAgo)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Fetch subscription tiers for new users
  const tierMap = new Map<string, string>();
  if (newUsers.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, subscription_tier')
      .in('id', newUsers.map(u => u.id));
    for (const p of profiles ?? []) {
      tierMap.set(p.id, p.subscription_tier ?? 'free');
    }
  }

  // All-time tier breakdown
  const { data: allProfiles } = await supabase
    .from('profiles')
    .select('subscription_tier');

  const tierCounts = { free: 0, plus: 0, premium: 0 };
  for (const p of allProfiles ?? []) {
    const t = (p.subscription_tier ?? 'free') as keyof typeof tierCounts;
    if (t in tierCounts) tierCounts[t]++;
  }

  const weekStart = sevenDaysAgo.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });
  const weekEnd   = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  const subject = `Haven digest: ${newUsers.length} new signup${newUsers.length !== 1 ? 's' : ''} this week`;
  const html = buildEmail({ newUsers, tierMap, tierCounts, totalUsers: users.length, weekStart, weekEnd });

  await sendEmail(ADMIN_EMAIL, subject, html);

  console.log(`Weekly digest sent — ${newUsers.length} new users, ${tierCounts.plus} plus, ${tierCounts.premium} premium`);
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ newUsers: newUsers.length }),
  };
};

// Every Monday at 08:00 UTC
export const handler = schedule('0 8 * * 1', digest);
