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

        <tr>
          <td style="background:linear-gradient(135deg,#0d9488,#10b981);padding:28px 32px 22px;">
            <div style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">Haven</div>
            <div style="font-size:12px;color:rgba(255,255,255,0.8);margin-top:2px;">Life in the UK Test Prep</div>
          </td>
        </tr>

        <tr>
          <td style="padding:32px 32px 24px;">
            <h1 style="margin:0 0 12px;font-size:20px;font-weight:700;color:#111827;line-height:1.3;">Welcome, ${firstName}!</h1>
            <p style="margin:0 0 20px;font-size:15px;color:#4b5563;line-height:1.6;">
              You've taken the first step towards passing your Life in the UK test. Here's how to get started:
            </p>

            <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
              <tr><td style="padding:6px 0;font-size:15px;color:#374151;line-height:1.5;">• <strong>Study:</strong> read through each lesson at your own pace</td></tr>
              <tr><td style="padding:6px 0;font-size:15px;color:#374151;line-height:1.5;">• <strong>Practice:</strong> answer questions and review flashcards</td></tr>
              <tr><td style="padding:6px 0;font-size:15px;color:#374151;line-height:1.5;">• <strong>Exam:</strong> take a mock test when you feel ready</td></tr>
              <tr><td style="padding:6px 0;font-size:15px;color:#374151;line-height:1.5;">• <strong>Ask Pippa:</strong> your AI study assistant is always here to help</td></tr>
            </table>

            <a href="${APP_URL}/dashboard"
               style="display:inline-block;background:linear-gradient(135deg,#0d9488,#10b981);color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 28px;border-radius:10px;">
              Go to your Dashboard
            </a>

            <table cellpadding="0" cellspacing="0" style="margin-top:28px;width:100%;background:#f0fdf4;border-radius:10px;border:1px solid #bbf7d0;">
              <tr>
                <td style="padding:16px 20px;">
                  <p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#166534;">📱 Tip: Install Haven on your phone</p>
                  <p style="margin:0 0 10px;font-size:13px;color:#374151;line-height:1.5;">Add Haven to your home screen for quick access. No App Store needed, and it works offline.</p>
                  <p style="margin:0;font-size:13px;color:#374151;line-height:1.6;">
                    <strong>iPhone/iPad:</strong> Safari → Share button → Add to Home Screen<br>
                    <strong>Android:</strong> Chrome → ⋮ menu → Add to Home Screen<br>
                    <strong>Desktop:</strong> Look for the ⊕ icon in the address bar
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding:20px 32px 28px;border-top:1px solid #f0f0f0;text-align:center;">
            <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">
              Haven Study &middot; <a href="https://havenstudy.app" style="color:#0d9488;text-decoration:none;">havenstudy.app</a><br>
              Questions? Reply to this email or visit <a href="${APP_URL}/help" style="color:#0d9488;text-decoration:none;">our help page</a>.
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
