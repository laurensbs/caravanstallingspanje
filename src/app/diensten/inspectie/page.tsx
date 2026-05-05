'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { Phone, FileText, Check } from 'lucide-react';
import Topbar from '@/components/marketing/Topbar';
import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';
import { useLocale } from '@/components/LocaleProvider';
import type { StringKey } from '@/lib/i18n';

const EASE = [0.16, 1, 0.3, 1] as const;
type T = (k: StringKey, ...a: (string | number)[]) => string;

export default function InspectiePage() {
  const { t } = useLocale();
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <Topbar />
      <PublicHeader />
      <main id="main" className="flex-1">
        <Hero t={t} />
        <Checklist t={t} />
        <Report t={t} />
        <CtaBand t={t} />
      </main>
      <PublicFooter />
    </div>
  );
}

function Hero({ t }: { t: T }) {
  const reduce = useReducedMotion();
  const fade = (delay = 0) =>
    reduce
      ? { initial: false, animate: { opacity: 1, y: 0 }, transition: { duration: 0 } }
      : { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, ease: EASE, delay } };

  return (
    <section className="section-bg-sky-soft">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-10 py-14 sm:py-20">
        <div className="max-w-[820px]">
          <motion.span {...fade(0)} className="eyebrow-mk">{t('ins1.hero-eyebrow')}</motion.span>
          <motion.h1 {...fade(0.06)} className="h1-mk" style={{ marginTop: 4 }}>{t('ins1.hero-h1')}</motion.h1>
          <motion.p {...fade(0.14)} className="lead-mk" style={{ marginTop: 14, maxWidth: 700 }}>{t('ins1.hero-lead')}</motion.p>
          <motion.div {...fade(0.22)} className="flex flex-wrap gap-3 mt-7">
            <span className="spec-chip">
              <span className="v">{t('ins1.chip-1-v')}</span>
              <span className="l">{t('ins1.chip-1-l')}</span>
            </span>
            <span className="spec-chip">
              <span className="v">{t('ins1.chip-2-v')}</span>
              <span className="l">{t('ins1.chip-2-l')}</span>
            </span>
            <span className="spec-chip">
              <span className="v">{t('ins1.chip-3-v')}</span>
              <span className="l">{t('ins1.chip-3-l')}</span>
            </span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Checklist({ t }: { t: T }) {
  const cats: Array<{ titleKey: StringKey; itemKeys: StringKey[] }> = [
    { titleKey: 'ins1.list-cat-1', itemKeys: ['ins1.list-cat-1-1', 'ins1.list-cat-1-2', 'ins1.list-cat-1-3', 'ins1.list-cat-1-4'] },
    { titleKey: 'ins1.list-cat-2', itemKeys: ['ins1.list-cat-2-1', 'ins1.list-cat-2-2', 'ins1.list-cat-2-3', 'ins1.list-cat-2-4'] },
    { titleKey: 'ins1.list-cat-3', itemKeys: ['ins1.list-cat-3-1', 'ins1.list-cat-3-2', 'ins1.list-cat-3-3', 'ins1.list-cat-3-4'] },
    { titleKey: 'ins1.list-cat-4', itemKeys: ['ins1.list-cat-4-1', 'ins1.list-cat-4-2', 'ins1.list-cat-4-3', 'ins1.list-cat-4-4'] },
  ];
  return (
    <section className="py-16 sm:py-20 section-bg-grey">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-10">
        <div className="text-center max-w-[720px] mx-auto mb-12">
          <span className="eyebrow-mk">{t('ins1.list-eyebrow')}</span>
          <h2 className="h2-mk">{t('ins1.list-h2')}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {cats.map((cat) => (
            <div key={cat.titleKey} className="card-mk" style={{ padding: 24 }}>
              <h3 style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 17, color: 'var(--navy)', margin: '0 0 14px' }}>
                {t(cat.titleKey)}
              </h3>
              <ul className="tick-list-mk">
                {cat.itemKeys.map((k) => (
                  <li key={k}>{t(k)}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Report({ t }: { t: T }) {
  const bullets: StringKey[] = ['ins1.report-bullet-1', 'ins1.report-bullet-2', 'ins1.report-bullet-3', 'ins1.report-bullet-4'];
  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-10 lg:gap-14 items-center">
          <div>
            <span className="eyebrow-mk">{t('ins1.report-eyebrow')}</span>
            <h2 className="h2-mk">{t('ins1.report-h2')}</h2>
            <ul className="checklist-mk" style={{ marginTop: 22 }}>
              {bullets.map((k) => (
                <li key={k}>
                  <span className="v" />
                  {t(k)}
                </li>
              ))}
            </ul>
          </div>
          <div className="card-mk card-lift" style={{ padding: 28, background: 'linear-gradient(180deg, #FAFCFD 0%, #FFFFFF 100%)' }} aria-hidden>
            <ReportMock t={t} />
          </div>
        </div>
      </div>
    </section>
  );
}

function ReportMock({ t }: { t: T }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, paddingBottom: 14, borderBottom: '1px solid var(--line)' }}>
        <span style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--sky)', color: 'var(--navy)', display: 'grid', placeItems: 'center' }}>
          <FileText size={20} />
        </span>
        <div>
          <div style={{ fontFamily: 'var(--sora)', fontWeight: 700, fontSize: 14, color: 'var(--navy)' }}>{t('ins1.report-mock-title')}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>{t('ins1.report-mock-sub')}</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, fontWeight: 600, color: 'var(--green)', marginBottom: 16 }}>
        <span style={{ width: 10, height: 10, borderRadius: 999, background: 'var(--green)' }} aria-hidden />
        {t('ins1.report-mock-score')}
      </div>
      <ScoreRow label="Constructie & carrosserie" status="green" />
      <ScoreRow label="Onderstel & wielen" status="green" />
      <ScoreRow label="Elektra & gas" status="amber" />
      <ScoreRow label="Interieur & afwerking" status="green" />
      <div style={{ marginTop: 18, padding: 14, background: 'var(--bg)', borderRadius: 10, fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.55 }}>
        <strong style={{ color: 'var(--navy)' }}>Advies:</strong> Vervang accu binnen 6 maanden; leverbaar via onze werkplaats voor €145 incl. plaatsing.
      </div>
    </div>
  );
}

function ScoreRow({ label, status }: { label: string; status: 'green' | 'amber' | 'red' }) {
  const color = status === 'green' ? 'var(--green)' : status === 'amber' ? '#D89B1A' : 'var(--red)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--line)', fontSize: 13 }}>
      <span style={{ color: 'var(--ink-2)' }}>{label}</span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 12, color }}>
        <span style={{ width: 8, height: 8, borderRadius: 999, background: color }} aria-hidden />
        {status === 'green' ? 'OK' : status === 'amber' ? 'Let op' : 'Vervangen'}
      </span>
    </div>
  );
}

function CtaBand({ t }: { t: T }) {
  return (
    <section className="py-12 sm:py-16">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-10">
        <div className="cta-band-mk">
          <div>
            <h2 className="h2-mk on-navy" style={{ margin: 0 }}>{t('ins1.cta-h2')}</h2>
            <p style={{ marginTop: 8, color: 'rgba(255,255,255,0.78)', fontSize: 15, lineHeight: 1.55 }}>{t('ins1.cta-sub')}</p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link href="/contact?subject=Inspectie-aanvraag" className="btn btn-primary">
              <Check size={15} aria-hidden /> Plan inspectie
            </Link>
            <a href="tel:+34633778699" className="btn btn-ghost-light">
              <Phone size={15} aria-hidden /> +34 633 77 86 99
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
