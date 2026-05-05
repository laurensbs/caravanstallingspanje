'use client';

import Link from 'next/link';
import { useLocale } from '../LocaleProvider';

// Smalle amber-shimmer banner uit mockup p01: "Nog 4 plekken vrij voor het
// hoogseizoen". Wordt enkel op de homepage onder de hoofd-nav gemount.

interface ScarcityBarProps {
  /** Aantal plekken; default 4 (zelfde als mockup-copy). */
  spots?: number;
  /** Doel-link voor de CTA — default: configurator. */
  href?: string;
}

export default function ScarcityBar({ spots = 4, href = '/reserveren/configurator' }: ScarcityBarProps) {
  const { t } = useLocale();
  return (
    <div className="scarcity-bar" role="status" aria-live="polite">
      <div className="left">
        <span className="num-pill">{spots}</span>
        <strong>{t('scarcity.text')}</strong>
      </div>
      <div className="right">
        <Link href={href}>{t('scarcity.cta')} →</Link>
      </div>
    </div>
  );
}
