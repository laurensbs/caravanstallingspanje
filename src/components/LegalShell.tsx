'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import PublicFooter from './PublicFooter';
import LocaleSwitch from './LocaleSwitch';
import { useLocale } from './LocaleProvider';

const NAVY_BG = 'linear-gradient(180deg, #0A1929 0%, #050D18 100%)';

// Eenvoudige read-modus shell voor /privacy, /cookies, /verwerkers.
// Brede leesbare kolom, navy achtergrond, geen marketing-noise.
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
    <div className="min-h-screen flex flex-col" style={{ background: NAVY_BG, color: '#F1F5F9' }}>
      <header className="px-5 sm:px-8 pt-6 pb-2 max-w-3xl mx-auto w-full flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm hover:underline underline-offset-4"
          style={{ color: 'rgba(241,245,249,0.75)' }}
        >
          <ArrowLeft size={14} /> {t('common.back-to-website')}
        </Link>
        <LocaleSwitch />
      </header>

      <main className="flex-1 px-5 sm:px-8 py-8 sm:py-12">
        <article className="max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm" style={{ color: 'rgba(241,245,249,0.55)' }}>
            {t('legal.last-updated')}: {lastUpdated}
          </p>

          <div className="mt-8 prose-legal">{children}</div>
        </article>
      </main>

      <PublicFooter />
    </div>
  );
}
