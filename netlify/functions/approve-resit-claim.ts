import type { Handler } from '@netlify/functions';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-01-27.acacia' });
const ADMIN_EMAIL = 'hello.haven.nz@gmail.com';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const token = (event.headers['authorization'] ?? '').replace(/^Bearer\s+/i, '');
  if (!token) return { statusCode: 401, body: 'Missing token' };

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user || user.email !== ADMIN_EMAIL) {
    return { statusCode: 403, body: 'Forbidden' };
  }

  const { claim_id } = JSON.parse(event.body ?? '{}');
  if (!claim_id) return { statusCode: 400, body: 'Missing claim_id' };

  const { data: claim } = await supabase
    .from('resit_claims')
    .select('id, user_id, status')
    .eq('id', claim_id)
    .single();

  if (!claim) return { statusCode: 404, body: 'Claim not found' };
  if (claim.status !== 'pending') return { statusCode: 409, body: 'Claim already reviewed' };

  // Look up user profile — check both new (access_expires_at) and legacy (stripe_subscription_id) models
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_subscription_id, access_expires_at')
    .eq('id', claim.user_id)
    .single();

  const subscriptionId = profile?.stripe_subscription_id as string | undefined;
  const accessExpiresAt = profile?.access_expires_at as string | null | undefined;
  let stripeExtended = false;
  let adminNotes = 'Approved';

  if (accessExpiresAt != null) {
    // New model: extend access_expires_at by 30 days
    const currentExpiry = new Date(accessExpiresAt);
    const now = new Date();
    const baseDate = currentExpiry > now ? currentExpiry : now;
    const newExpiry = new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000);

    await supabase
      .from('profiles')
      .update({ access_expires_at: newExpiry.toISOString() })
      .eq('id', claim.user_id);

    adminNotes = `Approved: access extended to ${newExpiry.toISOString().split('T')[0]}`;
  } else if (subscriptionId) {
    // Legacy model: extend via Stripe trial
    try {
      const sub = await stripe.subscriptions.retrieve(subscriptionId);
      if (sub.status === 'active' || sub.status === 'trialing') {
        const newTrialEnd = sub.current_period_end + 30 * 24 * 60 * 60;
        await stripe.subscriptions.update(subscriptionId, {
          trial_end: newTrialEnd,
          proration_behavior: 'none',
        });
        stripeExtended = true;
        adminNotes = 'Approved: Stripe subscription extended by 30 days';
      } else {
        adminNotes = `Approved: subscription status is "${sub.status}", manual extension required`;
      }
    } catch (e: any) {
      adminNotes = `Approved: Stripe error: ${e.message}. Manual extension needed.`;
    }
  } else {
    adminNotes = 'Approved: no active access found, manual extension needed';
  }

  await supabase
    .from('resit_claims')
    .update({
      status: 'approved',
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
      admin_notes: adminNotes,
    })
    .eq('id', claim_id);

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ok: true, stripeExtended }),
  };
};
