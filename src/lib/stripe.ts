import Stripe from 'stripe';

let _stripe: Stripe | null = null;

export function stripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY ontbreekt');
  _stripe = new Stripe(key);
  return _stripe;
}

export function publishableKey(): string {
  const key = process.env.STRIPE_PUBLISHABLE_KEY;
  if (!key) throw new Error('STRIPE_PUBLISHABLE_KEY ontbreekt');
  return key;
}

export function webhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error('STRIPE_WEBHOOK_SECRET ontbreekt');
  return secret;
}

// Stripe Checkout session shorthand for our flow.
// Always passes our internal id back via metadata so the webhook can match
// the payment to the right booking/request without trusting client input.
export async function createCheckoutSession(input: {
  description: string;
  amountEur: number;             // 45.72 euro → 4572 cents
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  metadata: Record<string, string>; // { kind: 'fridge_booking', refId: '12' }
  /** Override expiry. Default 30 minuten (web-flow); admin-betaallinks
   *  zetten dit op 24*30 zodat klant 'm in alle rust kan betalen.
   *  Stripe staat min 30 min tot max ~30 dagen toe. */
  expiresInHours?: number;
}): Promise<Stripe.Checkout.Session> {
  const expSec = Math.max(
    30 * 60,
    Math.min(30 * 24 * 3600, Math.round((input.expiresInHours ?? 0.5) * 3600)),
  );
  return stripe().checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card', 'ideal', 'bancontact'],
    line_items: [
      {
        price_data: {
          currency: 'eur',
          unit_amount: Math.round(input.amountEur * 100),
          product_data: {
            name: input.description,
          },
        },
        quantity: 1,
      },
    ],
    customer_email: input.customerEmail,
    metadata: input.metadata,
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
    locale: 'nl',
    automatic_tax: { enabled: false },
    expires_at: Math.floor(Date.now() / 1000) + expSec,
  });
}
