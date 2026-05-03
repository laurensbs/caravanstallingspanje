// Locale-aware formatting helpers. Eén bron van waarheid voor €/datums/aantallen
// zodat we niet 30× `Intl.NumberFormat(...)` strooien door de codebase.

import type { Locale } from '@/lib/i18n';

const LOCALE_TAG: Record<Locale, string> = {
  nl: 'nl-NL',
  en: 'en-IE', // en-IE i.p.v. en-US: euro-symbool + Europese decimalen
};

/** Format a euro-amount. `digits` defaults to 0 (whole euros) — pas 2 voor cents. */
export function formatEur(eur: number, locale: Locale, digits = 0): string {
  return new Intl.NumberFormat(LOCALE_TAG[locale], {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(eur);
}

/** Format a date as "3 mei 2026" / "3 May 2026". */
export function formatDate(date: Date | string | number, locale: Locale): string {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  return new Intl.DateTimeFormat(LOCALE_TAG[locale], {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d);
}

/** Compact date "3 mei" / "3 May" — geen jaartal, voor inline-context. */
export function formatDateShort(date: Date | string | number, locale: Locale): string {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  return new Intl.DateTimeFormat(LOCALE_TAG[locale], {
    day: 'numeric',
    month: 'short',
  }).format(d);
}

/** Date + time "3 mei 2026, 14:32". */
export function formatDateTime(date: Date | string | number, locale: Locale): string {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  return new Intl.DateTimeFormat(LOCALE_TAG[locale], {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

/** Plural-aware count — gebruikt `Intl.PluralRules` voor correcte "1 dag / 2 dagen". */
export function formatCount(n: number, locale: Locale, one: string, other: string): string {
  const rules = new Intl.PluralRules(LOCALE_TAG[locale]);
  return `${n} ${rules.select(n) === 'one' ? one : other}`;
}
