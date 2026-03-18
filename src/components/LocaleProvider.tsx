'use client';

import { useState, useEffect, ReactNode, useMemo } from 'react';
import { LocaleContext, Locale } from '@/lib/i18n';

function getSavedLocale(): Locale {
  if (typeof window === 'undefined') return 'nl';
  try {
    const saved = localStorage.getItem('locale') as Locale | null;
    if (saved && ['nl', 'en', 'es', 'de'].includes(saved)) return saved;
  } catch {}
  return 'nl';
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('nl');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = getSavedLocale();
    setLocaleState(saved);
    document.documentElement.lang = saved;
    setHydrated(true);
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    localStorage.setItem('locale', l);
    document.documentElement.lang = l;
  };

  const value = useMemo(() => ({ locale, setLocale }), [locale]);

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  );
}
