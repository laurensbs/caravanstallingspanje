'use client';

import { usePathname } from 'next/navigation';
import CookieBanner from './CookieBanner';

// Dunne client-wrapper die in de root layout draait en op basis van het
// pathname bepaalt of publieke chrome (skip-link + cookiebanner) gerenderd
// wordt. Admin- en API-routes krijgen 'm niet — daar gelden andere regels.

const ADMIN_PREFIXES = ['/admin'];

function isPublicRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  return !ADMIN_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export default function PublicChrome() {
  const pathname = usePathname();
  if (!isPublicRoute(pathname)) return null;
  return (
    <>
      <SkipLink />
      <CookieBanner />
    </>
  );
}

// WCAG 2.4.1 — visueel verborgen tot focus, dan een nette chip linksboven.
// Custom class i.p.v. utility-stack zodat 'ie ook zonder Tailwind-purge-quirks werkt.
function SkipLink() {
  return (
    <a href="#main" className="cs-skip-link">
      Skip to main content
    </a>
  );
}
