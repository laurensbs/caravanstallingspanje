'use client';

import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import {
  type Locale, type StringKey, LOCALES, DEFAULT_LOCALE, COOKIE_NAME, translate,
} from '@/lib/i18n';

type Ctx = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: StringKey, ...args: (string | number)[]) => string;
};

const LocaleCtx = createContext<Ctx | null>(null);

function readCookie(): Locale | null {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(new RegExp(`(^|;\\s*)${COOKIE_NAME}=([^;]+)`));
  const v = m?.[2];
  return v && (LOCALES as string[]).includes(v) ? (v as Locale) : null;
}

function writeCookie(l: Locale) {
  if (typeof document === 'undefined') return;
  // 1 year, path=/ so it persists across the whole site.
  const oneYear = 60 * 60 * 24 * 365;
  document.cookie = `${COOKIE_NAME}=${l}; path=/; max-age=${oneYear}; samesite=lax`;
}

function detectBrowser(): Locale {
  if (typeof navigator === 'undefined') return DEFAULT_LOCALE;
  const lang = (navigator.language || '').toLowerCase();
  if (lang.startsWith('en')) return 'en';
  return DEFAULT_LOCALE;
}

export function LocaleProvider({ children, initialLocale }: { children: ReactNode; initialLocale?: Locale }) {
  // Start with whatever the server passed (typically default), then sync with
  // cookie/browser on mount so SSR HTML doesn't flip to a different language.
  const [locale, setLocaleState] = useState<Locale>(initialLocale || DEFAULT_LOCALE);

  useEffect(() => {
    const fromCookie = readCookie();
    if (fromCookie) {
      if (fromCookie !== locale) setLocaleState(fromCookie);
      return;
    }
    const detected = detectBrowser();
    if (detected !== locale) setLocaleState(detected);
    writeCookie(detected);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    writeCookie(l);
  }, []);

  const t = useCallback(
    (key: StringKey, ...args: (string | number)[]) => translate(locale, key, ...args),
    [locale],
  );

  return <LocaleCtx.Provider value={{ locale, setLocale, t }}>{children}</LocaleCtx.Provider>;
}

export function useLocale(): Ctx {
  const ctx = useContext(LocaleCtx);
  if (!ctx) {
    // Sane fallback so a misplaced component still renders Dutch instead of crashing.
    return {
      locale: DEFAULT_LOCALE,
      setLocale: () => { /* noop */ },
      t: (key, ...args) => translate(DEFAULT_LOCALE, key, ...args),
    };
  }
  return ctx;
}
