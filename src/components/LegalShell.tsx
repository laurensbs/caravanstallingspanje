'use client';

import { ReactNode } from 'react';
import MarketingPage from './marketing/MarketingPage';
import { useLocale } from './LocaleProvider';

// Read-modus shell voor /privacy, /cookies, /verwerkers.
// Brede leesbare kolom op cream-canvas met serif h1.
export default function LegalShell({
  title,
  lastUpdated,
  children,
}: {
  title: string;
  lastUpdated: string;
  children: ReactNode;
}) {
  const { t } = useLocale();
  return (
    <MarketingPage
      hero={{
        title,
        intro: `${t('legal.last-updated')}: ${lastUpdated}`,
        back: { href: '/', label: t('common.back-to-website') },
      }}
    >
      <article className="max-w-3xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
        <div className="prose-mk">{children}</div>
      </article>
    </MarketingPage>
  );
}
