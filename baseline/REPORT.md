# Baseline Audit — Caravanstalling Spanje

Date: 2026-05-03
Scope: nulmeting vóór de gefaseerde upgrade in `/Users/laurens/.claude/plans/enumerated-dreaming-dawn.md`.

## Stack snapshot

- Next.js 15.1.6 (App Router), React 19, TypeScript 5 strict, Tailwind 4
- Neon Postgres (raw SQL, geen ORM), `src/lib/db.ts` (1971 regels — initDatabase met `CREATE IF NOT EXISTS`)
- Stripe Checkout Sessions, Holded (pro forma), Resend, custom JWT (jose)
- Framer Motion 12 (beperkt gebruikt: `AnimatedServiceIcon`)
- Geen ESLint config, geen unit tests (Vitest/Jest), Playwright E2E aanwezig in CI
- 125 TS/TSX bestanden onder `src/`

## Kritieke bevindingen (must-fix vóór SEO-flip)

| # | Issue | Locatie | Impact |
|---|---|---|---|
| 1 | Root layout is "Beheerportaal" + `robots: noindex, nofollow` voor de hele site, ook publieke routes | `src/app/layout.tsx` | SEO geblokkeerd; sociale shares falen |
| 2 | `.env.example` zegt `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` maar code leest `STRIPE_PUBLISHABLE_KEY` | `.env.example` vs `src/lib/stripe.ts:14` | Onboarding-bug; nieuwe envs falen |
| 3 | Privacy-link in publieke footer wijst naar externe Wix-site | `src/components/PublicFooter.tsx` | Geen GDPR-conforme privacy/cookies pagina's binnen app |
| 4 | Geen cookiebanner / consent management | n.v.t. | GDPR-blokker; analytics/marketing-cookies zonder consent |
| 5 | `next.config.ts` is leeg op headers/caching/image-config | `next.config.ts` | Geen long-cache `_next/static`, geen security-extra's |
| 6 | DB-init via `CREATE IF NOT EXISTS` zonder versioned migrations | `src/lib/db.ts` | Schema-drift onmogelijk te traceren tussen omgevingen |
| 7 | Geen Stripe key-mismatch boot-check (live key in dev, test key in prod) | `src/lib/stripe.ts` | Makkelijk om verkeerde mode te shippen |
| 8 | `<img>` in `PublicFooter` gebruikt `next/image` ✓; restant van site mix — moet audit | grep `<img` | Performance / CLS |
| 9 | Geen sitemap, robots, JSON-LD, hreflang | n.v.t. | Search niet ontdekbaar |
| 10 | `i18n.ts` heeft inconsistente `landing.cta-airco-*` keys onderaan (buiten airco-blok) | `src/lib/i18n.ts:332-335` | Cosmetisch, geen bug |

## Goede dingen (behouden)

- **Security headers** in `src/middleware.ts`: CSP, HSTS, X-Frame, Permissions-Policy, rate-limit 60/min/IP. Sterk.
- **Stripe webhook idempotency** via `recordStripeEventOnce` + caller `idempotencyKey`. Solide.
- **Holded retry/backoff** met `Retry-After`-respect (`src/lib/holded.ts`).
- **Design tokens** in `src/app/globals.css` met OkLCh — uitstekende basis, alleen incompleet uitgerold.
- **i18n** custom 326-key dict, NL+EN, cookie-persisted. Geen lib-overhead.
- **TypeScript strict** aan, `paths: { "@/*": ["./src/*"] }`.
- **CI workflow** met lint + typecheck + build + Playwright.

## Bestaande utilities (hergebruiken)

- `src/components/ui.tsx` — Button/Input/Select/Textarea/Spinner/Badge/Skeleton met variant+size API
- `src/components/PublicShell.tsx` + `PublicCard` — wrapt publieke pagina's in navy gradient
- `src/components/PublicFooter.tsx`, `PublicHero.tsx`
- `src/components/LocaleProvider.tsx`, `LocaleSwitch.tsx`
- `src/components/AnimatedServiceIcon.tsx` — uitbreidbaar Framer-motion-patroon
- `src/lib/i18n.ts::translate(locale, key, ...args)` met positional `{0}/{1}`
- `src/lib/validations.ts` — Zod-schemas (loginSchema, fridgeSchema, fridgeBookingSchema, waitlistSchema, fridgeOrderSchema)
- `src/lib/stripe.ts::createCheckoutSession` met idempotency
- `src/lib/holded.ts` — retry-backoff, suppress welcome-mails
- `src/lib/email.ts` — Resend templates
- `src/lib/auth.ts` — admin/staff/customer JWT
- `src/lib/pricing.ts` — server-side price source

## Routes-inventaris

**Publiek (10):** `/`, `/contact`, `/diensten`, `/diensten/{reparatie,inspectie,service,transport,stalling,airco}`, `/koelkast`, `/ideeen` + `/diensten/bedankt`, `/koelkast/bedankt`.

**Admin (10):** `/admin/{dashboard,klanten,klanten/[id],stalling,transport,koelkasten,planning,contact,ideeen,instellingen,wachtlijst}`.

**API (40+):** `api/order/*` (10 endpoints), `api/admin/*` (15), `api/webhooks/stripe`, `api/cron/holded-sync`, `api/setup`.

## Aanbevolen volgorde slice 1 (deze sessie)

1. Fix root metadata (split admin vs public, robots tag in layout heroverwegen)
2. Fix `.env.example` Stripe-key naming
3. Stripe boot-check: throw bij test/live key-mismatch tegen `NODE_ENV` + iDEAL/Bancontact behouden, automatic_payment_methods overwegen
4. Format-helper `src/lib/format.ts` (currency/date) — vervangt ad-hoc `Intl.NumberFormat`-calls in `page.tsx` en formulieren
5. i18n-diff script `scripts/i18n-diff.ts`
6. GDPR: `CookieBanner` component + `src/app/(legal)/{privacy,cookies,verwerkers}/page.tsx` + footer-link aanpassen
7. `next.config.ts` hardening: `Cache-Control` immutable, `images.formats: ['image/avif','image/webp']`, `poweredByHeader: false`
8. README + ARCHITECTURE schets
9. Latere PR's: forms-overhaul, motion polish, SEO-flip (gate), backend migrations, RBAC

Geen DB-migraties of webhook-aanpassingen in deze slice — die krijgen aparte PR met staging-test.
