import type { Handler } from '@netlify/functions';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-01-27.acacia' });

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Verify Supabase JWT from Authorization header
  const authHeader = event.headers['authorization'] ?? '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  if (!token) {
    return { statusCode: 401, body: 'Missing Authorization header' };
  }

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return { statusCode: 401, body: 'Invalid or expired token' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single();

  const customerId = profile?.stripe_customer_id as string | undefined;
  if (!customerId) {
    return { statusCode: 404, body: 'No Stripe customer found for this user' };
  }

  const siteUrl = process.env.URL ?? 'http://localhost:8888';

  try {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${siteUrl}/uk/profile`,
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: portalSession.url }),
    };
  } catch (err: any) {
    // Stripe customer no longer exists (e.g. test/live mode mismatch or deleted customer)
    if (err?.code === 'resource_missing') {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'billing_account_not_found',
          message: 'We could not find your billing account. Please contact support at support@haven.study so we can fix this for you.',
        }),
        headers: { 'Content-Type': 'application/json' },
      };
    }
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'stripe_error', message: err?.message ?? 'Unexpected error' }),
      headers: { 'Content-Type': 'application/json' },
    };
  }
};
