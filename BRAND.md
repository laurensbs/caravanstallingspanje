# Caravanstalling Spanje — Brand

Praktische gids voor visuele identiteit, copy-tone en componentgebruik. Voor token-detail zie [`DESIGN.md`](DESIGN.md); deze file gaat over **gevoel** en **richting**.

## Wie zijn we

Caravan Storage Spain S.L., familiebedrijf aan de Costa Brava (Sant Climent de Peralta, Girona). >25 jaar in caravanstalling, reparatie, transport, koelkast/airco-verhuur. Vast personeel, eigen werkplaats, 24/7 beveiligd, 4.9★ op 25 Google reviews. Klanten: Nederlanders en Belgen die hier elke zomer terugkomen.

## Brand-kompas

- **Warm, niet koud**: stone-paper paleet voor admin, deep navy + warme amber-glow voor publiek. Geen pure SaaS-blauw.
- **Persoonlijk, niet corporate**: vast team, je weet bij wie je bent. Geen agency-spreektaal.
- **Direct, niet zalverig**: kort, je-vorm, concreet. Geen "we doen ons best om te streven naar".
- **Costa Brava-vibe**: zomer, zon, zee — subtiel via amber-glow, niet via stockfoto's met flamingo's.

## Kleurpalet

### Publiek (donker)
- **Deep navy** `#0A1929` → `#142F4D` (hero gradient)
- **Warm amber** `#F4B942` (accent, sterren, callouts)
- **Soft cyan** voor service-tag "Vanaf één week" / koel
- **Amber** voor "Direct verkoeling" / warmte / vertrouwen
- **Violet** voor service-tag "Stalling ↔ camping" / beweging

### Admin (licht)
- **Stone paper** `oklch(0.985 0.002 75)` (warm wit)
- **Stone borders** `oklch(0.91 0.004 75)`
- **Near-black accent** voor primary CTA's (Stripe-stijl)
- **Quiet amber** voor focus-rings

Alle kleuren als tokens in [`src/app/globals.css`](src/app/globals.css). Gebruik `var(--color-*)` of `var(--cs-*)` voor context-aware switch tussen light en dark.

## Logo

- Master: `/public/images/logo.png` (420×95 transparant)
- Treatment op donker: `drop-shadow(0 0 18px rgba(255,255,255,0.14))` voor zachte gloed
- Treatment op licht (admin): geen drop-shadow
- E-mail (Outlook/Gmail): solid logo zonder filter
- Minimum-grootte: 32px hoogte (header, mobile)

**Roadmap**: 1-kleur SVG fallback voor donkere e-mail-headers. Plek gereserveerd: `/public/brand/logo-mono.svg`.

## Typografie

- **Geist Sans** voor alles (UI, body, hero)
- **Geist Mono** alleen voor codes/IDs (factuur-nummer, werkbon-code)
- Tracking: `-0.011em` body, `-0.018em` headings
- Schaal in tokens (zie DESIGN.md): `--text-micro` t/m `--text-hero` (11–44px)

## Tone-of-voice

### Do

- **Je-vorm**: "Vul je naam in" → "Hoe heten we je aanspreken?"
- **Concreet**: "Bezorgd op je staanplaats" niet "Wij verzorgen levering ter plaatse"
- **Costa Brava context**: "op je camping", "in het seizoen" voelt eigen
- **Korte zinnen**: 1-2 regels per bullet
- **NL-eerst**, EN-vertaling matchend (geen automatische vertaling)

### Don't

- **U-vorm** (te formeel voor 50+ vakantie-context, behalve in juridische teksten)
- **Marketing-taal** zonder substantie ("Beste service van Spanje", "Premium experience")
- **Engelse leenwoorden** waar NL beter werkt ("checkout" → "betaalpagina", "support" → "hulp")
- **Negatieve framing**: "Niet vergeten te bellen" → "Geef ons een belletje"

### Voorbeelden

| Situatie | ❌ Te stijf | ✅ Onze stem |
|---|---|---|
| Form-error | "Het veld 'naam' is verplicht" | "Hoe heten we je aanspreken?" |
| Confirmatie | "Uw aanvraag is succesvol verwerkt" | "Bedankt! We pakken 'm op." |
| Footer | "Family-run business since 1998" | "Familiebedrijf, vast team, 24/7 beveiligd" |
| Sold-out | "Er zijn momenteel geen units beschikbaar" | "Voor deze periode zit alles vol — laat je gegevens achter en we bellen zodra er ruimte is." |

## Iconografie

- **Lucide** voor alle UI-iconen — consistent en gewicht-matchend
- **Custom SVG** alleen voor brand-elementen (camping-logo, zomer-illustraties) onder `public/brand/` — nog niet ingevuld, slots klaar
- Decoratieve iconen: altijd `aria-hidden`
- Functionele icon-only buttons: `aria-label` verplicht

## Foto-richting

Bewust **nog geen foto's**. Wanneer je ze maakt:

- **Echte werkplek, geen stock**: vast personeel zichtbaar (gezicht of handen aan het werk)
- **Zon, lange schaduwen**: gouden uur op stalling-terrein
- **Detail boven grote panorama's**: caravan-deur openend, sleutel overdracht, koelkast op staanplaats
- **Vermijd**: posed groepsfoto's, koud blauw licht, gehyped composities
- **Format**: AVIF/WebP via `next/image` (in `next.config.ts` al ingesteld)
- **Ratio's**:
  - `hero` (5:4) — homepage hero rechts naast h1
  - `4/3` — service-detail-pages header
  - `3/2` — over-ons grid
  - `1/1` — team-portretten

### PhotoSlots

Component `src/components/PhotoSlot.tsx` reserveert layout-ruimte zonder CLS bij later vullen.

```tsx
// Onzichtbare placeholder (ratio reserveert ruimte)
<PhotoSlot ratio="hero" />

// Met foto (later)
<PhotoSlot
  ratio="hero"
  src="/brand/workshop-hero.jpg"
  alt="Onze werkplaats aan de Costa Brava"
  priority
/>
```

**Aanbevolen mount-points** (toekomst):

| Slot | Ratio | Type foto |
|---|---|---|
| Homepage hero rechts | hero | Caravan op stalling-terrein bij gouden uur |
| /diensten/service header | 4/3 | Werkplaats-detail (waxen, ozonbehandeling) |
| /diensten/transport header | 4/3 | Caravan onderweg naar camping |
| /diensten/airco header | 4/3 | Airco-installatie op staanplaats |
| /diensten/stalling header | 4/3 | Beveiligd terrein vanuit drone-perspectief |
| /diensten/reparatie header | 4/3 | Monteur aan het werk, gezicht zichtbaar |
| /diensten/inspectie header | 4/3 | Checklist + caravan-detail |
| /contact | 1/1 of 4/3 | Receptie / kantoor met team |

Externe URL's later: voeg domein toe aan `next.config.ts` `images.remotePatterns`.

## Motion

- **Subtiel, niet decoratief**: animatie heeft een functie (entry-stagger leidt oog, hover-glow signaleert klikbaar)
- **Duur**: `--dur-fast` (180ms) voor micro-interactions, `--dur-base` (320ms) voor entry, `--dur-slow` (500ms) voor hero
- **Easing**: `--ease-out` voor de meeste UI, `--ease-spring` voor button-press
- **Reduced motion**: respecteer `prefers-reduced-motion: reduce` overal — `useReducedMotion()` hook + globale CSS-rule

Primitieven: `MotionFade`, `MotionStagger`, `MotionShake`, `MotionBounce`, `MotionPageTransition` in [`src/components/motion/MotionPrimitives.tsx`](src/components/motion/MotionPrimitives.tsx).

## Componenten

Voor de complete component-index zie [`DESIGN.md`](DESIGN.md). Korte recap van brand-kritieke:

- `PublicHero` — eyebrow + h1 + intro + accent-glow
- `PublicFooter` — i18n-aware, NL-eerst, drie kolommen
- `ServiceCard` (homepage) — accent (cyan/amber/violet) per dienst, hover-glow
- `ServiceInfoPage` — voor diensten zonder online-flow (reparatie/inspectie/stalling), CTA naar /contact + telefoon
- `CookieBanner` — granulaire consent, equal weiger-knop
- `EmptyState` — admin, met breathe-animatie op icoon
- `StatusBadge` — uniforme status-rendering admin

## Off-brand vermijden

- **Geen** flamingo, palmboom, tropisch-cliché iconen
- **Geen** hero-gradient die paars/roze is — altijd navy + amber
- **Geen** Comic Sans, Papyrus, of andere "leuke" fonts (Geist blijft)
- **Geen** stockfoto's met smiling-business-people-in-suits
- **Geen** "Premium", "Exclusief", "Luxury" — wij zijn vakmensen, geen luxe-merk
- **Geen** dropshadow op icons of cards behalve hover-glow

## Roadmap brand-werk

Niet in scope nu, voor latere PR's:

- Custom SVG-illustratie-set onder `public/brand/` (camping, zon, zee, caravan)
- 1-kleur logo voor e-mail-headers
- E-mail-template-richting (header-banner met brand-glow)
- Foto-shoot Costa Brava + werkplaats (jij regelt fotograaf, wij vullen URL's in)
- Open Graph-image variants per locale (NL/EN met juiste tagline)
