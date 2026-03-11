import type { Handler } from '@netlify/functions';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-01-27.acacia' });

const PRICE_IDS: Record<string, string> = {
  plus_1m: process.env.STRIPE_PLUS_1M_PRICE_ID!,
  plus_3m: process.env.STRIPE_PLUS_3M_PRICE_ID!,
  premium_6m: process.env.STRIPE_PREMIUM_6M_PRICE_ID!,
};

const DURATION_DAYS: Record<string, number> = {
  plus_1m: 30,
  plus_3m: 90,
  premium_6m: 180,
};

// Stripe coupon IDs for each discount level (set in Netlify env vars)
const COUPON_IDS: Record<number, string | undefined> = {
  10: process.env.STRIPE_COUPON_10,
  20: process.env.STRIPE_COUPON_20,
  30: process.env.STRIPE_COUPON_30,
};

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Verify caller is authenticated; derive userId/email from token (not client body)
  const token = (event.headers['authorization'] ?? '').replace(/^Bearer\s+/i, '');
  if (!token) return { statusCode: 401, body: 'Unauthorized' };

  const supabaseAdmin = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  const { data: { user: callerUser }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !callerUser) return { statusCode: 401, body: 'Unauthorized' };

  let body: { plan: string };
  try {
    body = JSON.parse(event.body ?? '{}');
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  const { plan } = body;
  const userId = callerUser.id;
  const email = callerUser.email ?? '';

  if (!plan) {
    return { statusCode: 400, body: 'Missing required field: plan' };
  }

  const priceId = PRICE_IDS[plan];
  if (!priceId) {
    return { statusCode: 400, body: `Unknown plan: ${plan}` };
  }

  const durationDays = DURATION_DAYS[plan];
  const siteUrl = process.env.URL ?? 'http://localhost:8888';

  // Look up existing Stripe customer to avoid duplicates on re-purchase
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', userId)
    .single();

  const existingCustomerId = profile?.stripe_customer_id as string | undefined;

  // Check for an active site-wide sale
  const { data: saleSetting } = await supabaseAdmin
    .from('app_settings')
    .select('value')
    .eq('key', 'sale')
    .single();

  const saleValue = saleSetting?.value as { active: boolean; discount: number } | null;
  const saleActive = saleValue?.active === true;
  const saleDiscount = saleValue?.discount ?? 0;
  const saleCouponId = saleActive ? COUPON_IDS[saleDiscount] : undefined;

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: 'payment',
    line_items: [{ price: priceId, quantity: 1 }],
    customer: existingCustomerId || undefined,
    customer_email: existingCustomerId ? undefined : email,
    customer_creation: existingCustomerId ? undefined : 'always',
    success_url: `${siteUrl}/uk/dashboard?upgraded=1`,
    cancel_url: `${siteUrl}/uk/paywall`,
    metadata: { userId, plan, duration_days: String(durationDays) },
  };

  if (saleActive && saleCouponId) {
    // Auto-apply the sale coupon
    sessionParams.discounts = [{ coupon: saleCouponId }];
  } else {
    // No active sale — let users enter promotion codes
    sessionParams.allow_promotion_codes = true;
  }

  const session = await stripe.checkout.sessions.create(sessionParams);

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: session.url }),
  };
};
