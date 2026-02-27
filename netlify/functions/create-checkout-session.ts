import type { Handler } from '@netlify/functions';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-01-27.acacia' });

const PRICE_IDS: Record<string, string> = {
  plus: process.env.STRIPE_PLUS_PRICE_ID!,
  premium: process.env.STRIPE_PREMIUM_PRICE_ID!,
};

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let body: { plan: string; userId: string; email: string };
  try {
    body = JSON.parse(event.body ?? '{}');
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  const { plan, userId, email } = body;

  if (!plan || !userId || !email) {
    return { statusCode: 400, body: 'Missing required fields: plan, userId, email' };
  }

  const priceId = PRICE_IDS[plan];
  if (!priceId) {
    return { statusCode: 400, body: `Unknown plan: ${plan}` };
  }

  const siteUrl = process.env.URL ?? 'http://localhost:8888';

  // Look up existing Stripe customer to avoid duplicates on re-purchase
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', userId)
    .single();

  const existingCustomerId = profile?.stripe_customer_id as string | undefined;

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    customer: existingCustomerId || undefined,
    customer_email: existingCustomerId ? undefined : email,
    success_url: `${siteUrl}/uk/dashboard?upgraded=1`,
    cancel_url: `${siteUrl}/uk/paywall`,
    metadata: { userId, plan },
    subscription_data: {
      metadata: { userId, plan },
    },
  });

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: session.url }),
  };
};
