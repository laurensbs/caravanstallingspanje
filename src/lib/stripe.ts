import Stripe from 'stripe';

let _stripe: Stripe | null = null;

// Boot-check: voorkomt dat een test-key in production deploy gaat (of andersom).
// Gooit één keer bij eerste stripe()-aanroep; daarna gecachet.
function assertKeyMatchesEnv(secretKey: string): void {
  const isLiveKey = secretKey.startsWith('sk_live_');
  const isTestKey = secretKey.startsWith('sk_test_');
  if (!isLiveKey && !isTestKey) {
    throw new Error('STRIPE_SECRET_KEY heeft een onverwacht format (geen sk_live_ of sk_test_)');
  }
  if (process.env.NODE_ENV === 'production' && isTestKey) {
    // Vercel preview-deploys lopen ook met NODE_ENV=production maar zijn niet de live site;
    // VERCEL_ENV onderscheidt dat. Alleen op echte production breken.
    if (process.env.VERCEL_ENV === 'production') {
      throw new Error(
        'Stripe test-key in production. Zet STRIPE_SECRET_KEY op sk_live_ óf check je Vercel env.',
      );
    }
  }
  if (process.env.NODE_ENV !== 'production' && isLiveKey && process.env.VERCEL_ENV !== 'production') {
    // Live-key in dev/preview — laat door maar log een waarschuwing.
    // Throw zou local development frustreren als iemand prod-env per ongeluk pulled.
    console.warn('[stripe] WAARSCHUWING: live-key buiten productie. Dit kan echte betalingen veroorzaken.');
  }
}

export function stripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY ontbreekt');
  assertKeyMatchesEnv(key);
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
   *  zetten dit op ~23 uur zodat klant 'm dezelfde dag kan betalen.
   *  BELANGRIJK: Stripe Checkout Sessions staan max 24 uur expiry toe.
   *  Voor langere termijn moet je Payment Links gebruiken (andere API). */
  expiresInHours?: number;
  /** Idempotency-key voor Stripe — als dezelfde key binnen 24u opnieuw
   *  binnenkomt geeft Stripe dezelfde session terug i.p.v. een duplicaat.
   *  Caller-routes geven typisch `${kind}_${refId}_${YYYYMMDD}` mee. */
  idempotencyKey?: string;
  /** Locale voor Stripe-checkout UI. Default 'nl' (legacy). */
  locale?: 'nl' | 'en';
}): Promise<Stripe.Checkout.Session> {
  const expSec = Math.max(
    30 * 60,
    // Stripe-maximum is exact 24u — we capen op 23h59m om timing-races te
    // vermijden ("must be less than 24 hours").
    Math.min(23.9 * 3600, Math.round((input.expiresInHours ?? 0.5) * 3600)),
  );
  return stripe().checkout.sessions.create(
    {
      mode: 'payment',
      // Apple Pay / Google Pay / Link verschijnen automatisch wanneer 'card'
      // in de lijst staat én je domain in Stripe is geverifieerd. iDEAL +
      // Bancontact dekken NL/BE klanten zonder kaart.
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
      locale: input.locale ?? 'nl',
      automatic_tax: { enabled: false },
      expires_at: Math.floor(Date.now() / 1000) + expSec,
    },
    input.idempotencyKey ? { idempotencyKey: input.idempotencyKey } : undefined,
  );
}
