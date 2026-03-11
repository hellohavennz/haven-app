import type { Handler } from '@netlify/functions';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-01-27.acacia' });

const FROM = 'Haven <hello@haven.study>';
const APP_URL = 'https://havenstudy.app/uk';

// Map Stripe price IDs → subscription tiers
function priceToTier(priceId: string): 'plus' | 'premium' | null {
  if (priceId === process.env.STRIPE_PLUS_PRICE_ID) return 'plus';
  if (priceId === process.env.STRIPE_PREMIUM_PRICE_ID) return 'premium';
  return null;
}

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  });
  if (!res.ok) console.error('Resend error:', await res.text());
}

function subscriptionConfirmationHtml(plan: 'plus' | 'premium', firstName: string): string {
  const planLabel = plan === 'premium' ? 'Haven Premium' : 'Haven Plus';
  const features = plan === 'premium'
    ? ['All 29 lessons & practice questions', 'Unlimited dynamic mock exams', 'AI study assistant Pippa', 'Performance analytics', 'Exam reminders', 'Resit Support']
    : ['All 29 lessons & practice questions', '2 mock exams per month', 'All flashcards', 'Progress tracking', 'Resit Support'];

  const featureRows = features
    .map(f => `<tr><td style="padding:5px 0;font-size:15px;color:#374151;line-height:1.5;">✓ ${f}</td></tr>`)
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Subscription confirmed</title></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
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
          <td style="padding:32px 32px 24px;">
            <h1 style="margin:0 0 12px;font-size:20px;font-weight:700;color:#111827;">You're on ${planLabel}, ${firstName}!</h1>
            <p style="margin:0 0 20px;font-size:15px;color:#4b5563;line-height:1.6;">
              Your subscription is active. Here's everything that's now unlocked:
            </p>
            <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;">${featureRows}</table>
            <a href="${APP_URL}/dashboard"
               style="display:inline-block;background:#4E8571;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 28px;border-radius:10px;">
              Start studying
            </a>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 32px 28px;border-top:1px solid #f0f0f0;text-align:center;">
            <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">
              Haven Study &middot; <a href="https://havenstudy.app" style="color:#4E8571;text-decoration:none;">havenstudy.app</a><br>
              Manage your subscription at <a href="${APP_URL}/profile" style="color:#4E8571;">your profile</a>.
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

  const sig = event.headers['stripe-signature'];
  if (!sig) {
    return { statusCode: 400, body: 'Missing stripe-signature header' };
  }

  let stripeEvent: Stripe.Event;
  try {
    stripeEvent = stripe.webhooks.constructEvent(
      event.body ?? '',
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err: any) {
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  switch (stripeEvent.type) {
    case 'checkout.session.completed': {
      const session = stripeEvent.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const plan = session.metadata?.plan as 'plus' | 'premium' | undefined;

      if (!userId || !plan) break;

      await supabase.from('profiles').upsert({
        id: userId,
        subscription_tier: plan,
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: session.subscription as string,
      }, { onConflict: 'id' });

      // Send subscription confirmation email
      const customerEmail = session.customer_email
        ?? (session.customer_details?.email ?? null);
      if (customerEmail) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', userId)
          .single();
        const firstName = (profile?.full_name as string | null)?.split(' ')[0] || 'there';
        await sendEmail(
          customerEmail,
          `You're now on ${plan === 'premium' ? 'Haven Premium' : 'Haven Plus'}!`,
          subscriptionConfirmationHtml(plan, firstName),
        ).catch(() => {}); // don't fail the webhook if email fails
      }

      break;
    }

    case 'customer.subscription.updated': {
      const sub = stripeEvent.data.object as Stripe.Subscription;
      const userId = sub.metadata?.userId;
      if (!userId) break;

      const priceId = sub.items.data[0]?.price?.id;
      const tier = priceId ? priceToTier(priceId) : null;
      if (!tier) break;

      await supabase.from('profiles').upsert({
        id: userId,
        subscription_tier: tier,
        stripe_subscription_id: sub.id,
      }, { onConflict: 'id' });

      break;
    }

    case 'customer.subscription.deleted': {
      const sub = stripeEvent.data.object as Stripe.Subscription;
      const userId = sub.metadata?.userId;
      if (!userId) break;

      await supabase.from('profiles').upsert({
        id: userId,
        subscription_tier: 'free',
        stripe_subscription_id: null,
      }, { onConflict: 'id' });

      break;
    }

    default:
      // Ignore unhandled event types
      break;
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) };
};
