import type { Handler } from '@netlify/functions';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-01-27.acacia' });

// Map Stripe price IDs → subscription tiers
function priceToTier(priceId: string): 'plus' | 'premium' | null {
  if (priceId === process.env.STRIPE_PLUS_PRICE_ID) return 'plus';
  if (priceId === process.env.STRIPE_PREMIUM_PRICE_ID) return 'premium';
  return null;
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
