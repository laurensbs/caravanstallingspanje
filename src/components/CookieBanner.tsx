'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { X, Check } from 'lucide-react';
import { useLocale } from '@/components/LocaleProvider';
import {
  CONSENT_VERSION,
  type ConsentState,
  DEFAULT_CONSENT,
  hasConsentDecision,
  readConsentCookie,
  writeConsentCookie,
} from '@/lib/consent';

// Granulaire consent met equal "weiger"-knop (eis vanuit EU/AVG/ePrivacy).
// Geen pre-ticked boxes — analytics/marketing default uit tot expliciete keuze.
// Visueel afgestemd op de navy publieke site én leesbaar op admin (lichte BG).

function emit(state: ConsentState) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<ConsentState>('cs-consent-change', { detail: state }));
}

export default function CookieBanner() {
  const { t } = useLocale();
  const [state, setState] = useState<ConsentState>(DEFAULT_CONSENT);
  const [show, setShow] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const current = readConsentCookie();
    setState(current);
    setShow(!hasConsentDecision(current));
  }, []);

  function persist(next: ConsentState) {
    const stamped: ConsentState = { ...next, decidedAt: new Date().toISOString(), version: CONSENT_VERSION };
    writeConsentCookie(stamped);
    setState(stamped);
    emit(stamped);
    setShow(false);
  }

  function acceptAll() {
    persist({ essential: true, analytics: true, marketing: true, decidedAt: null, version: CONSENT_VERSION });
  }
  function rejectAll() {
    persist({ essential: true, analytics: false, marketing: false, decidedAt: null, version: CONSENT_VERSION });
  }
  function saveCustom() {
    persist(state);
  }

  if (!show) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-banner-title"
      className="fixed inset-x-0 bottom-0 z-[60] p-3 sm:p-5 pointer-events-none"
    >
      <div
        className="pointer-events-auto max-w-3xl mx-auto rounded-[var(--radius-2xl)] shadow-2xl"
        style={{
          background: 'rgba(10, 25, 41, 0.96)',
          color: '#F1F5F9',
          border: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <h2 id="cookie-banner-title" className="text-base sm:text-lg font-semibold">
              {t('cookies.title')}
            </h2>
            <button
              type="button"
              onClick={rejectAll}
              aria-label={t('cookies.reject-all')}
              className="shrink-0 -mt-1 -mr-1 p-1.5 rounded-md hover:bg-white/10 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <p className="mt-2 text-sm leading-relaxed" style={{ color: 'rgba(241,245,249,0.78)' }}>
            {t('cookies.body')}{' '}
            <Link href="/privacy" className="underline underline-offset-4 hover:text-white">
              {t('cookies.privacy-link')}
            </Link>
            {' · '}
            <Link href="/cookies" className="underline underline-offset-4 hover:text-white">
              {t('cookies.policy-link')}
            </Link>
          </p>

          {expanded && (
            <fieldset className="mt-5 space-y-3">
              <ConsentRow
                label={t('cookies.cat-essential')}
                desc={t('cookies.cat-essential-desc')}
                checked
                disabled
                onChange={() => { /* essential is locked on */ }}
              />
              <ConsentRow
                label={t('cookies.cat-analytics')}
                desc={t('cookies.cat-analytics-desc')}
                checked={state.analytics}
                onChange={(v) => setState((s) => ({ ...s, analytics: v }))}
              />
              <ConsentRow
                label={t('cookies.cat-marketing')}
                desc={t('cookies.cat-marketing-desc')}
                checked={state.marketing}
                onChange={(v) => setState((s) => ({ ...s, marketing: v }))}
              />
            </fieldset>
          )}

          <div className="mt-5 flex flex-col-reverse sm:flex-row sm:items-center gap-2 sm:gap-3">
            {expanded ? (
              <button
                type="button"
                onClick={saveCustom}
                className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-[var(--radius-md)] bg-white text-slate-900 text-sm font-medium hover:bg-slate-100 transition-colors"
              >
                <Check size={14} /> {t('cookies.save')}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setExpanded(true)}
                className="inline-flex items-center justify-center h-10 px-4 rounded-[var(--radius-md)] bg-transparent border border-white/20 text-sm hover:bg-white/5 transition-colors"
              >
                {t('cookies.customize')}
              </button>
            )}

            <div className="flex gap-2 sm:ml-auto">
              <button
                type="button"
                onClick={rejectAll}
                className="inline-flex-1 sm:flex-none inline-flex items-center justify-center h-10 px-4 rounded-[var(--radius-md)] bg-transparent border border-white/20 text-sm hover:bg-white/5 transition-colors"
              >
                {t('cookies.reject-all')}
              </button>
              <button
                type="button"
                onClick={acceptAll}
                className="flex-1 sm:flex-none inline-flex items-center justify-center h-10 px-4 rounded-[var(--radius-md)] bg-white text-slate-900 text-sm font-medium hover:bg-slate-100 transition-colors"
              >
                {t('cookies.accept-all')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConsentRow({
  label,
  desc,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  desc: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className={`flex items-start gap-3 p-3 rounded-[var(--radius-md)] border border-white/10 ${disabled ? 'opacity-70' : 'hover:border-white/20 cursor-pointer'} transition-colors`}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 accent-white"
      />
      <span className="flex-1">
        <span className="block text-sm font-medium">{label}</span>
        <span className="block mt-0.5 text-xs leading-relaxed" style={{ color: 'rgba(241,245,249,0.65)' }}>
          {desc}
        </span>
      </span>
    </label>
  );
}
