# Design System — Caravanstalling Spanje

Single bron van waarheid voor styling-keuzes. Bij twijfel: pak een token, geen ad-hoc waarde.

## Brand-kompas

- **Sfeer**: warm, familiebedrijf, Costa Brava zomer-vibe — geen koude SaaS-look
- **Publiek**: 50+ vakantieganger, vertrouwt op persoonlijk contact, niet tech-savvy
- **Visuele anker**: deep navy (`#0A1929` → `#142F4D`) met warme amber-glow rechtsonder
- **Admin**: warm-monochrome stone-paper paleet (oklch hue 75) — voelt als notitieblok, niet als dashboard

## Tokens

Alle tokens leven in [`src/app/globals.css`](src/app/globals.css) `@theme`. Componenten gebruiken `var(--token)` of Tailwind utility-classes die er automatisch naar verwijzen.

### Kleur

| Token | Light (admin) | Donker (publiek) | Use-case |
|---|---|---|---|
| `--color-bg` | `oklch(0.985 0.002 75)` (warm white) | navy gradient inline | page background |
| `--cs-fg` | `--color-text` | `rgba(241,245,249,0.95)` | primary tekst |
| `--cs-fg-muted` | `--color-text-muted` | `rgba(241,245,249,0.65)` | meta tekst |
| `--cs-fg-subtle` | `--color-text-subtle` | `rgba(241,245,249,0.45)` | hint/placeholder |
| `--cs-surface` | wit | `rgba(255,255,255,0.06)` | cards, inputs |
| `--cs-surface-elevated` | wit | `#0F2238` | popovers, menus |
| `--cs-border` | warm grey | `rgba(255,255,255,0.12)` | dividers |
| `--cs-ring` | amber | navy-blue tint | focus-rings |
| `--color-amber` | `#F4B942` | idem | accent + reviews-stars |
| `--color-success` | `oklch(0.62 0.14 145)` | idem | paid/done badge |
| `--color-warning` | `oklch(0.72 0.13 60)` | idem | review/open badge |
| `--color-danger` | `oklch(0.52 0.21 25)` | idem | rejected badge |

**Regel**: gebruik `--cs-*` voor componenten die in beide contexten draaien (CampingPicker, dialogs). Direct `--color-*` voor admin-only of publiek-only.

### Type-scale

```
--text-micro    11px   (uppercase tracking, eyebrows)
--text-small    13px   (admin body)
--text-body     15px   (publieke body)
--text-lead     17px   (hero intro paragraph)
--text-h3       19px   (card title)
--text-h2       22px   (section heading)
--text-h1       26px   (admin page header)
--text-display  32px   (publiek page hero — secondary)
--text-hero     44px   (homepage hero h1)
```

Gebruik in Tailwind: `text-h1`, `text-body`, etc.

### Spacing

```
--space-field    8px    (gap binnen form-rij)
--space-card    16px    (padding card)
--space-section 24px    (tussen card/section)
--space-page    48px    (horizontale page-padding)
```

### Motion

Synchroon tussen TS (`src/lib/motion.ts`) en CSS-vars:

```
--dur-fast      180ms   (button press, badge tick)
--dur-base      320ms   (page elements fade/slide)
--dur-slow      500ms   (hero entrance, page transition)
--ease-out      cubic-bezier(0.16, 1, 0.3, 1)
--ease-in-out   cubic-bezier(0.4, 0, 0.2, 1)
--ease-spring   cubic-bezier(0.34, 1.56, 0.64, 1)
```

### Z-index

```
--z-base       1
--z-dropdown   20    (CampingPicker, select-menu)
--z-sticky     30    (page-header, density-toggle)
--z-drawer     40    (Drawer + backdrop)
--z-modal      50    (ConfirmDialog, ShortcutsPanel)
--z-toast      60    (Sonner)
--z-skip-link  70    (skip-to-main)
```

Geen ad-hoc `z-30/40/50` meer.

### Elevation

```
--shadow-sm        subtle hover-state
--shadow-md        list-item, navbar
--shadow-lg        not in use (gebruik popover/modal)
--shadow-card      paper-look met inset top-highlight
--shadow-popover   dropdown, command-palette
--shadow-modal     dialog (max blur, max offset)
--shadow-glow-amber/cyan/violet  service-card hover
```

### Gradients

```
--gradient-hero-navy       (radial, homepage)
--gradient-page-navy       (linear, /diensten/*)
--gradient-footer-navy     (linear, footer)
--gradient-hero-glow-amber (warme spotlight rechtsonder)
--gradient-hero-glow-cyan  (koele spotlight bovenaan)
```

## Componenten — wanneer welk

### Buttons (`src/components/ui.tsx`)

| Variant | Wanneer |
|---|---|
| `primary` | enige primaire actie per scherm (Stripe checkout, save) |
| `secondary` | alternatieve actie (cancel, edit) |
| `ghost` | tertiair, in toolbars / icon-buttons met label |
| `danger` | destructief (delete, reject) |

Sizes: `sm` (h-8) admin-density · `md` (h-10) default · `lg` (h-12) publieke CTA's

### Cards

- `card-surface` — paper-look, admin-default
- `cs-service-card` — homepage, krijgt outer-glow op hover via `--cs-card-glow` CSS-var

### Status (`src/components/admin/StatusBadge.tsx`)

Eén component voor alle workflow-statussen. Niet ad-hoc een nieuwe `Badge tone={...}` schrijven — voeg toe aan `STATUS_MAP` als de status nieuw is.

### Forms

- Publieke forms: `useZodForm` + `RhfContactFields` (5/6 forms migrated)
- Admin Drawer-forms: `<FormGrid>` + `<FormCol span={6}>` + `<FormSection title>` voor consistent ritme

### Empty-states

Altijd `<EmptyState icon={X} title description action />` — nooit inline `<div className="py-12 text-center">No items</div>`. EmptyState heeft auto-pulse op icoon (respecteert reduced-motion).

### Skeletons

Match content-shape:
- `Skeleton` — generic balk (legacy, prefer presets)
- `SkeletonText lines={2}` — variabele breedte regels
- `SkeletonCard` — avatar+text+actions
- `SkeletonRow cols={4}` — admin-tabel rij
- `SkeletonHero` — eyebrow+h1+intro+CTA met exacte ruimte (CLS-vriendelijk)

### Motion (`src/components/motion/MotionPrimitives.tsx`)

- `MotionFade` — generieke entry, standaard inView
- `MotionStagger` + `MotionItem` — lijst-entries cascading
- `MotionShake` — error-feedback (trigger-prop forces nieuwe shake)
- `MotionBounce` — success-checkmark (mount-driven spring)
- `MotionPageTransition` — route-changes, ≤300ms

Alle 5 respecteren `useReducedMotion()`.

### PhotoSlot

Reserveert layout-ruimte voor toekomstige fotografie. **Onzichtbaar** placeholder — alleen aspect-ratio. Wanneer foto's komen: vervang direct met `<Image>`, layout shift = 0.

## Do / don't

✅ **Do**

- Tokens overal: `var(--cs-fg)` voor text, `var(--space-card)` voor padding
- 1× h1 per pagina (skip-link springt erheen)
- `aria-hidden` op decoratieve iconen
- `useReducedMotion()` voor elke nieuwe animatie
- StatusBadge voor admin-statussen — zelfs als 't 1× wordt gebruikt
- Skip de hover-effecten op mobile (`@media (hover: hover)`)

❌ **Don't**

- `style={{ color: '#F4B942' }}` — gebruik `var(--color-amber)`
- `text-[44px]` — gebruik `text-hero` (of voeg een token toe als 't ontbreekt)
- `z-[60]` — gebruik `style={{ zIndex: 'var(--z-modal)' }}`
- `!important` toevoegen om Tailwind te overschrijven — herzie de cascade ipv
- Een nieuwe `STATUS_OPTIONS` array per pagina — extend `STATUS_MAP` in StatusBadge

## Donkere context regel

`.page-public-dark` herschrijft alle `--cs-*` tokens naar donkere waarden. Componenten die `var(--cs-*)` gebruiken hoeven niets te weten van light/dark — ze switchen automatisch. **Nooit** opnieuw een `!important`-cascade per component opzetten zoals voorheen voor `bg-surface`.

Tijdelijk staan de oude `!important`-overrides nog in `globals.css` totdat alle Tailwind-class consumers (bv. componenten met `className="bg-surface"`) gemigreerd zijn naar `style={{ background: 'var(--cs-surface)' }}`. Bij nieuwe componenten: gebruik direct de token.

## Verwijzingen

- Tokens: [`src/app/globals.css`](src/app/globals.css)
- Motion: [`src/lib/motion.ts`](src/lib/motion.ts) + [`src/components/motion/MotionPrimitives.tsx`](src/components/motion/MotionPrimitives.tsx)
- Focus-trap: [`src/lib/focusTrap.ts`](src/lib/focusTrap.ts)
- Form-helpers: [`src/lib/forms.ts`](src/lib/forms.ts)
- SEO/JSON-LD: [`src/lib/seo.ts`](src/lib/seo.ts)
- Format: [`src/lib/format.ts`](src/lib/format.ts)
- i18n: [`src/lib/i18n.ts`](src/lib/i18n.ts)
- Consent: [`src/lib/consent.ts`](src/lib/consent.ts)
- Logger: [`src/lib/log.ts`](src/lib/log.ts)
- UI primitives: [`src/components/ui.tsx`](src/components/ui.tsx)
- Admin primitives: [`src/components/admin/`](src/components/admin/)

## Roadmap

Volgende UI-passes (niet in deze branch):

- Mobile responsive deep-pass + tap-targets ≥44px op alle 13 admin h-8/h-9 buttons
- Hardcoded waarden volledige sweep (29 hex + 344 arbitrary text/h/w)
- StatusBadge uitrol vervangt 6 ad-hoc Badge-mappings in admin-pagina's
- FormGrid uitrol in Drawer-forms
- /koelkast publieke rhf-refactor (waitlist + sold-out flow)
- RBAC + versioned migrations

## Acceptatiecriteria voor toekomstige bijdragen

- 0 nieuwe arbitrary `text-[NNpx]/h-[NNpx]/w-[NNpx]`
- 0 nieuwe hex-kleuren onder `src/components/**` en `src/app/**`
- Elke nieuwe interactieve element ≥44×44px op mobile
- Elke nieuwe animatie respecteert `useReducedMotion()`
- Elke nieuwe dialog gebruikt `role="dialog"` + `aria-modal` + `useFocusTrap`
- Elke nieuwe status-rendering via `StatusBadge`
