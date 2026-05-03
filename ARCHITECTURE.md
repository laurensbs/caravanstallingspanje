# Architectuur

## Hoog niveau

```
                          ┌─────────────────┐
                          │   Public site   │
                          │  /, /diensten,  │
                          │  /koelkast …    │
                          └────────┬────────┘
                                   │
   ┌───────────────────────────────┼───────────────────────────────┐
   │                               │                               │
   ▼                               ▼                               ▼
┌────────┐                  ┌──────────────┐               ┌──────────────┐
│ Stripe │ ◄── webhook ──── │ Next.js API  │ ── insert ──► │ Neon Postgres│
└────┬───┘                  │ /api/order/* │               └──────┬───────┘
     │ checkout.completed   │ /api/webhooks│                      │
     └─────────────────────►│ /api/admin/* │                      │
                            └──────┬───────┘                      │
                                   │                              │
                ┌──────────────────┼──────────────────┐           │
                │                  │                  │           │
                ▼                  ▼                  ▼           │
          ┌──────────┐      ┌────────────┐     ┌────────────┐    │
          │  Holded  │      │   Resend   │     │  Activity  │    │
          │ (factuur)│      │  (e-mail)  │     │    log     │◄───┘
          └──────────┘      └────────────┘     └────────────┘

   ┌────────────────────┐
   │   Admin portaal    │ ── JWT cookie ─► API admin endpoints
   │   /admin/*         │    (verifyAdminToken in middleware)
   └────────────────────┘
```

## Payment flow

1. Klant submit een formulier (`/api/order/{fridge,stalling,transport,service}`).
2. API valideert via Zod, schrijft een **pending intake** of een directe booking,
   bouwt een `idempotencyKey = ${kind}_${refId}_${YYYYMMDD}` en roept
   `createCheckoutSession()` in [`src/lib/stripe.ts`](src/lib/stripe.ts).
3. Klant betaalt op Stripe Checkout (Apple/Google Pay automatisch).
4. Stripe stuurt `checkout.session.completed` naar `/api/webhooks/stripe`.
   - **Idempotent**: `recordStripeEventOnce(eventId)` zorgt dat een replay niet dubbel verwerkt.
   - DB-status update → Holded factuur (met retry/backoff op 429) → Resend bevestigingsmail
     → eventueel forward naar werkplaats-mail.
5. Mislukte Holded-calls worden gelogd in `activity_log`; een batch `/api/cron/holded-sync` haalt 'm later in.

## Auth

- **Admin/staff/customer** hebben elk een eigen JWT-secret in env.
- JWT zit in een HttpOnly-cookie (`admin_token`), 7 dagen geldig.
- `src/middleware.ts` verifieert het token op alle `/api/admin/*` routes (behalve `auth/*`)
  en zet `x-admin-id`/`x-admin-name`/`x-admin-role` headers door naar handlers.
- Rate-limit 60 req/min/IP op alle `/api/*`.

## Security headers

In `src/middleware.ts`:

- `Content-Security-Policy` (script/style self + Stripe-domeinen)
- `Strict-Transport-Security` (max-age 2 jaar, preload, includeSubDomains)
- `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

In `next.config.ts`:

- `Cache-Control: no-store` op `/admin/*` en `/api/*`
- `X-Robots-Tag: noindex` op `/api/*` en `noindex,nofollow,noarchive` op `/admin/*`
- Long-cache immutable op `/_next/static/*` en `/images/*`

## Database

- Neon Postgres (EU region), raw SQL via `@neondatabase/serverless`.
- `src/lib/db.ts::initDatabase()` voert `CREATE TABLE IF NOT EXISTS` uit per boot.
- **Toekomstig**: vervangen door versioned migrations onder `migrations/0001_*.sql`
  met een idempotente runner die bestaande prod-tabellen detecteert en als
  `applied` markeert (zie roadmap fase 10).

## i18n

- Custom lib in `src/lib/i18n.ts` (geen next-intl/lingui — flat 326-key dict).
- `LocaleProvider` schrijft de keuze naar cookie `cs_locale` (12 maanden).
- Browser-detect bij eerste bezoek (en/nl).
- Run `npx tsx scripts/i18n-diff.ts` om missende vertalingen / unused keys te vinden.

## GDPR

- `src/lib/consent.ts` beheert granulaire consent (essential / analytics / marketing).
- `CookieBanner` schrijft `cs_consent` cookie (12 maanden, versioned).
- Bij `CONSENT_VERSION` bump → banner verschijnt opnieuw.
- Componenten die op consent moeten wachten luisteren naar het
  `cs-consent-change` window-event.

## Observability

- **Nu**: `console.*` + `activity_log` tabel voor audit-trail.
- **Toekomstig**: Sentry of vergelijkbaar (zie roadmap fase 10).

## Deploy / runbook

Zie `RUNBOOK.md` (komt) voor:

- Stripe key-rotation procedure
- Webhook replay
- Holded outage / backlog draining
- DB-migratie rollout
