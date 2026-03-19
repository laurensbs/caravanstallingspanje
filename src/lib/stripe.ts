import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY not set — payment features disabled');
}

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-01-27.acacia' as Stripe.LatestApiVersion })
  : null;

// ── Pricing ──
export const STORAGE_PRICES = {
  buiten: { monthly: 6500, label: 'Buitenstalling', stripePriceId: process.env.STRIPE_PRICE_OUTDOOR },
  binnen: { monthly: 9500, label: 'Binnenstalling', stripePriceId: process.env.STRIPE_PRICE_INDOOR },
} as const;

export const EXTRAS = [
  { id: 'cleaning_basic', label: 'Basis schoonmaak', price: 7500 },
  { id: 'cleaning_premium', label: 'Premium schoonmaak', price: 14500 },
  { id: 'ready_service', label: 'Klaarzet-service', price: 5000 },
  { id: 'maintenance_check', label: 'Technische keuring', price: 12500 },
  { id: 'tire_pressure', label: 'Bandenspanning controle', price: 1500 },
  { id: 'battery_charge', label: 'Accu opladen', price: 2500 },
  { id: 'mover_check', label: 'Mover controle', price: 3500 },
] as const;

// ── Create Checkout Session ──
export async function createCheckoutSession(params: {
  customerEmail: string;
  storageType: keyof typeof STORAGE_PRICES;
  extras: string[];
  successUrl: string;
  cancelUrl: string;
  metadata: Record<string, string>;
}) {
  if (!stripe) throw new Error('Stripe niet geconfigureerd');

  const storage = STORAGE_PRICES[params.storageType];
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
    {
      price_data: {
        currency: 'eur',
        product_data: { name: storage.label, description: 'Maandelijkse stallingskosten inclusief beveiliging en verzekering' },
        unit_amount: storage.monthly,
        recurring: { interval: 'month' },
      },
      quantity: 1,
    },
  ];

  for (const extraId of params.extras) {
    const extra = EXTRAS.find(e => e.id === extraId);
    if (extra) {
      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: { name: extra.label },
          unit_amount: extra.price,
        },
        quantity: 1,
      });
    }
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer_email: params.customerEmail,
    line_items: lineItems,
    payment_method_types: ['card', 'sepa_debit'],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: params.metadata,
    subscription_data: { metadata: params.metadata },
    locale: 'nl',
    allow_promotion_codes: true,
  });

  return session;
}

// ── Create Customer Portal ──
export async function createPortalSession(stripeCustomerId: string, returnUrl: string) {
  if (!stripe) throw new Error('Stripe niet geconfigureerd');

  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: returnUrl,
  });

  return session;
}

// ── Verify Webhook Signature ──
export function constructWebhookEvent(payload: string | Buffer, signature: string) {
  if (!stripe) throw new Error('Stripe niet geconfigureerd');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) throw new Error('STRIPE_WEBHOOK_SECRET niet ingesteld');

  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

// ── Format amount ──
export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(cents / 100);
}
