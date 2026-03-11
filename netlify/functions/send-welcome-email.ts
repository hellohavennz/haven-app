import type { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const FROM = 'Haven <hello@haven.study>';
const APP_URL = 'https://havenstudy.app/uk';

function welcomeHtml(firstName: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Welcome to Haven Study</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:#4E8571;padding:28px 32px 22px;">
            <div style="font-size:24px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">Haven<span style="color:#a8d5c2;">.</span></div>
            <div style="font-size:12px;color:rgba(255,255,255,0.75);margin-top:3px;">Life in the UK Test Preparation</div>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px 32px 8px;">
            <h1 style="margin:0 0 12px;font-size:20px;font-weight:700;color:#111827;line-height:1.3;">Welcome, ${firstName}!</h1>
            <p style="margin:0 0 24px;font-size:15px;color:#4b5563;line-height:1.6;">
              Your free Haven account is ready. Here is what you can do to get started:
            </p>

            <!-- Free features -->
            <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;width:100%;background:#F4F7F5;border-radius:10px;">
              <tr><td style="padding:16px 20px;">
                <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#4E8571;text-transform:uppercase;letter-spacing:0.05em;">Your free account includes</p>
                <table cellpadding="0" cellspacing="0">
                  <tr><td style="padding:5px 0;font-size:14px;color:#374151;line-height:1.5;">&#10003;&nbsp; 3 free study modules to get you started</td></tr>
                  <tr><td style="padding:5px 0;font-size:14px;color:#374151;line-height:1.5;">&#10003;&nbsp; Practice questions and flashcards on free lessons</td></tr>
                  <tr><td style="padding:5px 0;font-size:14px;color:#374151;line-height:1.5;">&#10003;&nbsp; Progress tracking across all your study sessions</td></tr>
                </table>
              </td></tr>
            </table>

            <a href="${APP_URL}/dashboard"
               style="display:inline-block;background:#4E8571;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 28px;border-radius:10px;">
              Go to your Dashboard
            </a>

            <!-- Upgrade nudge -->
            <table cellpadding="0" cellspacing="0" style="margin-top:24px;width:100%;background:#fffbeb;border-radius:10px;border:1px solid #fde68a;">
              <tr>
                <td style="padding:16px 20px;">
                  <p style="margin:0 0 6px;font-size:14px;font-weight:700;color:#92400e;">Want the full Haven experience?</p>
                  <p style="margin:0 0 10px;font-size:13px;color:#374151;line-height:1.5;">Upgrade to unlock all 29 lessons, 500+ practice questions, mock exams, and Pippa — your personal AI study assistant.</p>
                  <a href="${APP_URL}/paywall" style="font-size:13px;font-weight:600;color:#4E8571;text-decoration:underline;">See Haven Plus and Premium plans</a>
                </td>
              </tr>
            </table>

            <!-- Blog links -->
            <p style="margin:28px 0 12px;font-size:14px;font-weight:700;color:#111827;">Helpful reading before you start</p>
            <table cellpadding="0" cellspacing="0" style="width:100%;">
              <tr><td style="padding:6px 0;border-bottom:1px solid #f0f0f0;">
                <a href="https://havenstudy.app/blog/life-in-the-uk-test-study-guide/" style="font-size:14px;color:#4E8571;text-decoration:none;font-weight:600;">The complete Life in the UK test guide &rarr;</a>
              </td></tr>
              <tr><td style="padding:6px 0;border-bottom:1px solid #f0f0f0;">
                <a href="https://havenstudy.app/blog/when-to-take-life-in-the-uk-test-before-ilr/" style="font-size:14px;color:#4E8571;text-decoration:none;font-weight:600;">When should you take the test before ILR? &rarr;</a>
              </td></tr>
              <tr><td style="padding:6px 0;">
                <a href="https://havenstudy.app/blog/life-in-the-uk-test-questions-that-surprise-people/" style="font-size:14px;color:#4E8571;text-decoration:none;font-weight:600;">5 questions that surprise most people &rarr;</a>
              </td></tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:24px 32px 28px;border-top:1px solid #f0f0f0;text-align:center;">
            <p style="margin:0 0 8px;font-size:12px;color:#9ca3af;line-height:1.6;">
              Haven Study &middot; <a href="https://havenstudy.app" style="color:#4E8571;text-decoration:none;">havenstudy.app</a><br>
              Questions? Reply to this email or visit <a href="${APP_URL}/help" style="color:#4E8571;text-decoration:none;">our help page</a>.
            </p>
            <p style="margin:0;font-size:11px;color:#c0c0c0;">
              You received this email because you created a Haven Study account.<br>
              <a href="${APP_URL}/profile" style="color:#c0c0c0;">Manage email preferences</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Verify caller is an authenticated user
  const token = (event.headers['authorization'] ?? '').replace(/^Bearer\s+/i, '');
  if (!token) return { statusCode: 401, body: 'Unauthorized' };

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return { statusCode: 401, body: 'Unauthorized' };

  let body: { email: string; name?: string };
  try {
    body = JSON.parse(event.body ?? '{}');
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  const { email, name } = body;
  if (!email) return { statusCode: 400, body: 'Missing email' };

  const firstName = name?.trim().split(' ')[0] || 'there';

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM,
      to: email,
      subject: `Welcome to Haven Study, ${firstName}!`,
      html: welcomeHtml(firstName),
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('Resend error:', text);
    return { statusCode: 500, body: 'Failed to send email' };
  }

  return { statusCode: 200, body: JSON.stringify({ sent: true }) };
};
