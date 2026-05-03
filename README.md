# Caravanstalling Spanje

Public site + admin portaal voor Caravan Storage Spain S.L. (Costa Brava).

- **Stack**: Next.js 15 (App Router) · React 19 · TypeScript strict · Tailwind 4 · Neon Postgres · Stripe Checkout · Holded · Resend
- **Deploy**: Vercel
- **Live**: https://caravanstalling-spanje.com

## Quick start

```bash
npm install
cp .env.example .env.local   # vul in
npm run dev                  # http://localhost:3000
```

## Scripts

| Command | Doel |
|---|---|
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Production server (na build) |
| `npm run lint` | `next lint` |
| `npx tsx scripts/i18n-diff.ts` | Audit NL↔EN i18n volledigheid |

## Environment variables

Zie `.env.example` voor de complete lijst. Verplichte sleutels:

- `DATABASE_URL` — Neon Postgres connection string
- `ADMIN_JWT_SECRET`, `STAFF_JWT_SECRET`, `CUSTOMER_JWT_SECRET` — generate met `openssl rand -base64 32`
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PUBLISHABLE_KEY`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`
- `NEXT_PUBLIC_BASE_URL`
- `CRON_SECRET` — voor `/api/cron/*` endpoints

> ⚠️ Stripe boot-check: in production (Vercel `VERCEL_ENV=production`) wordt
> de app geweigerd te starten als `STRIPE_SECRET_KEY` een `sk_test_…` key is.
> Local dev mag wel test-keys gebruiken.

## Structuur

```
src/
├── app/
│   ├── (publiek)         # /, /diensten/*, /contact, /koelkast, /ideeen
│   ├── admin/            # JWT-protected portaal
│   ├── api/              # order/*, admin/*, webhooks/stripe, cron/holded-sync
│   ├── privacy/          # GDPR-pagina's
│   ├── cookies/
│   └── verwerkers/
├── components/
│   ├── ui.tsx            # Button/Input/Select/Textarea/Spinner/Badge/Skeleton
│   ├── CookieBanner.tsx  # Granulaire consent (essentieel/analytics/marketing)
│   ├── PublicChrome.tsx  # Mount-guard voor publieke chrome o.b.v. pathname
│   ├── LegalShell.tsx    # Layout voor /privacy, /cookies, /verwerkers
│   ├── LocaleProvider.tsx
│   └── …
├── lib/
│   ├── stripe.ts         # Boot-check + createCheckoutSession met idempotency
│   ├── holded.ts         # Pro forma + retry/backoff
│   ├── email.ts          # Resend templates
│   ├── consent.ts        # Cookie-based consent state
│   ├── format.ts         # Locale-aware €/datum/aantal formatting
│   ├── i18n.ts           # 326-key flat dict (NL/EN)
│   ├── validations.ts    # Zod schemas
│   └── db.ts             # Raw SQL via @neondatabase/serverless
├── middleware.ts         # CSP/HSTS/rate-limit + admin-token guard
└── …
baseline/REPORT.md        # Pre-upgrade audit (zie /Users/.../plans/enumerated-dreaming-dawn.md)
scripts/i18n-diff.ts      # Audit i18n-volledigheid
```

## GDPR

- Cookiebanner met granulaire consent (essential / analytics / marketing).
- `essential` is altijd aan (taal, sessie, consent zelf).
- Analytics/marketing zetten **niets** tot expliciete opt-in.
- Pagina's: [`/privacy`](src/app/privacy/page.tsx), [`/cookies`](src/app/cookies/page.tsx), [`/verwerkers`](src/app/verwerkers/page.tsx).
- Privacyverklaring is best-effort AVG-conform — laat finale tekst altijd door een AVG-jurist nakijken vóór publicatie.

## Roadmap

Zie `/Users/laurens/.claude/plans/enumerated-dreaming-dawn.md` voor de gefaseerde upgrade.
Korte versie van wat nog komt:

1. Forms-overhaul met `react-hook-form` + Zod
2. Responsive & motion polish (mobile→tablet→desktop)
3. WCAG 2.2 AA pass
4. Performance pass (alle `<img>` → `next/image`, font-subset, bundle-analyse)
5. SEO unlock (sitemap, JSON-LD, hreflang, OG, robots flip naar allow)
6. Backend versioned migrations + structured logger + health endpoints
7. Admin RBAC + bulk-actions + order-timeline
8. E2E tests uitbreiden (Stripe testmode + GDPR-flow)

## Contact

Issues of vragen: laurens@caravanstalling-spanje.com
