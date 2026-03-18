'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// Track page views on route change
function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!GA_ID || !window.gtag) return;
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    window.gtag('config', GA_ID, { page_path: url });
  }, [pathname, searchParams]);

  return null;
}

export default function Analytics() {
  if (!GA_ID) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', { send_page_view: false });
        `}
      </Script>
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
    </>
  );
}

// ── Typed event helpers for use throughout the app ──
export function trackEvent(action: string, category: string, label?: string, value?: number) {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value,
  });
}

export function trackFormSubmission(formName: string) {
  trackEvent('form_submit', 'engagement', formName);
}

export function trackCTAClick(buttonName: string, destination?: string) {
  trackEvent('cta_click', 'engagement', buttonName, undefined);
  if (destination) {
    trackEvent('click', 'outbound', destination);
  }
}

export function trackBookingStart() {
  trackEvent('begin_checkout', 'ecommerce', 'booking_wizard');
}

export function trackBookingComplete(value?: number) {
  trackEvent('purchase', 'ecommerce', 'booking_complete', value);
}

// Add gtag type to window
declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}
