'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { Heart, Eye, Users, Award } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Topbar from '@/components/marketing/Topbar';
import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';
import { useLocale } from '@/components/LocaleProvider';
import type { StringKey } from '@/lib/i18n';

const EASE = [0.16, 1, 0.3, 1] as const;
type T = (k: StringKey, ...a: (string | number)[]) => string;

export default function OverOnsPage() {
  const { t } = useLocale();
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <Topbar />
      <PublicHeader />
      <main id="main" className="flex-1">
        <Hero t={t} />
        <Timeline t={t} />
        <Team t={t} />
        <Values t={t} />
        <Certs t={t} />
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
          <motion.span {...fade(0)} className="eyebrow-mk">{t('abo1.hero-eyebrow')}</motion.span>
          <motion.h1 {...fade(0.06)} className="h1-mk" style={{ marginTop: 4 }}>{t('abo1.hero-h1')}</motion.h1>
          <motion.p {...fade(0.14)} className="lead-mk" style={{ marginTop: 14, maxWidth: 700 }}>{t('abo1.hero-lead')}</motion.p>
        </div>
      </div>
    </section>
  );
}

function Timeline({ t }: { t: T }) {
  const items: Array<{ yKey: StringKey; tKey: StringKey; dKey: StringKey }> = [
    { yKey: 'abo1.tl-1-y', tKey: 'abo1.tl-1-t', dKey: 'abo1.tl-1-d' },
    { yKey: 'abo1.tl-2-y', tKey: 'abo1.tl-2-t', dKey: 'abo1.tl-2-d' },
    { yKey: 'abo1.tl-3-y', tKey: 'abo1.tl-3-t', dKey: 'abo1.tl-3-d' },
    { yKey: 'abo1.tl-4-y', tKey: 'abo1.tl-4-t', dKey: 'abo1.tl-4-d' },
    { yKey: 'abo1.tl-5-y', tKey: 'abo1.tl-5-t', dKey: 'abo1.tl-5-d' },
  ];
  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-[1000px] mx-auto px-5 sm:px-10">
        <div className="text-center max-w-[720px] mx-auto mb-12">
          <span className="eyebrow-mk">{t('abo1.tl-eyebrow')}</span>
          <h2 className="h2-mk">{t('abo1.tl-h2')}</h2>
        </div>
        <div style={{ position: 'relative', paddingLeft: 32 }}>
          <div
            aria-hidden
            style={{
              position: 'absolute',
              left: 12,
              top: 8,
              bottom: 8,
              width: 2,
              background: 'linear-gradient(180deg, var(--orange) 0%, var(--sky) 100%)',
              borderRadius: 2,
            }}
          />
          {items.map((it) => (
            <div key={it.yKey} style={{ position: 'relative', paddingBottom: 28 }}>
              <span
                aria-hidden
                style={{
                  position: 'absolute',
                  left: -25,
                  top: 4,
                  width: 14,
                  height: 14,
                  borderRadius: 999,
                  background: 'var(--orange)',
                  border: '3px solid #fff',
                  boxShadow: '0 0 0 1px var(--line)',
                }}
              />
              <div style={{ fontFamily: 'var(--sora)', fontWeight: 700, fontSize: 13, color: 'var(--orange-d)', letterSpacing: 1, marginBottom: 4 }}>
                {t(it.yKey)}
              </div>
              <h3 style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 18, color: 'var(--navy)', margin: '0 0 6px' }}>
                {t(it.tKey)}
              </h3>
              <p style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.6, margin: 0, maxWidth: 600 }}>
                {t(it.dKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Team({ t }: { t: T }) {
  const team: Array<{ nameKey: StringKey; roleKey: StringKey; av: string; bg: string }> = [
    { nameKey: 'abo1.team-1-name', roleKey: 'abo1.team-1-role', av: 'L', bg: 'var(--orange)' },
    { nameKey: 'abo1.team-2-name', roleKey: 'abo1.team-2-role', av: 'C', bg: 'var(--navy)' },
    { nameKey: 'abo1.team-3-name', roleKey: 'abo1.team-3-role', av: 'A', bg: 'var(--sky)' },
    { nameKey: 'abo1.team-4-name', roleKey: 'abo1.team-4-role', av: 'D', bg: 'var(--green)' },
  ];
  return (
    <section className="py-16 sm:py-20 section-bg-grey">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-10">
        <div className="text-center max-w-[720px] mx-auto mb-12">
          <span className="eyebrow-mk">{t('abo1.team-eyebrow')}</span>
          <h2 className="h2-mk">{t('abo1.team-h2')}</h2>
          <p className="lead-mk" style={{ marginTop: 10 }}>{t('abo1.team-intro')}</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {team.map((m) => (
            <div key={m.nameKey} className="card-mk text-center" style={{ padding: 24 }}>
              <span
                aria-hidden
                style={{
                  display: 'grid', placeItems: 'center',
                  width: 72, height: 72, borderRadius: 999,
                  background: m.bg, color: m.bg === 'var(--sky)' ? 'var(--navy)' : '#fff',
                  margin: '0 auto 14px',
                  fontFamily: 'var(--sora)', fontWeight: 700, fontSize: 28,
                }}
              >
                {m.av}
              </span>
              <h3 style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 15, color: 'var(--navy)', margin: '0 0 4px' }}>
                {t(m.nameKey)}
              </h3>
              <p style={{ fontSize: 12.5, color: 'var(--muted)', margin: 0 }}>{t(m.roleKey)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Values({ t }: { t: T }) {
  const items: Array<{ icon: LucideIcon; tKey: StringKey; dKey: StringKey }> = [
    { icon: Eye, tKey: 'abo1.val-1-t', dKey: 'abo1.val-1-d' },
    { icon: Heart, tKey: 'abo1.val-2-t', dKey: 'abo1.val-2-d' },
    { icon: Users, tKey: 'abo1.val-3-t', dKey: 'abo1.val-3-d' },
  ];
  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-10">
        <div className="text-center max-w-[720px] mx-auto mb-12">
          <span className="eyebrow-mk">{t('abo1.val-eyebrow')}</span>
          <h2 className="h2-mk">{t('abo1.val-h2')}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {items.map(({ icon: Icon, tKey, dKey }) => (
            <div key={tKey} className="card-mk" style={{ padding: 28 }}>
              <span
                aria-hidden
                style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: 'var(--sky-soft)', color: 'var(--navy)',
                  display: 'grid', placeItems: 'center', marginBottom: 16,
                }}
              >
                <Icon size={22} />
              </span>
              <h3 style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 18, color: 'var(--navy)', margin: '0 0 8px' }}>
                {t(tKey)}
              </h3>
              <p style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.6, margin: 0 }}>
                {t(dKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Certs({ t }: { t: T }) {
  const certs = [
    { name: 'Securitas Direct', sub: '24/7 Alarm Partner' },
    { name: 'BOVAG aangesloten', sub: 'Garantie & service' },
    { name: 'Kifid', sub: 'Geschillencommissie' },
    { name: 'KvK Spanje', sub: 'B-17456789' },
  ];
  return (
    <section className="py-16 sm:py-20 section-bg-grey">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-10">
        <div className="text-center max-w-[720px] mx-auto mb-10">
          <span className="eyebrow-mk">{t('abo1.cert-eyebrow')}</span>
          <h2 className="h2-mk">{t('abo1.cert-h2')}</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-[900px] mx-auto">
          {certs.map((c) => (
            <div
              key={c.name}
              className="card-mk text-center"
              style={{ padding: 22, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
            >
              <Award size={26} style={{ color: 'var(--orange)' }} aria-hidden />
              <div style={{ fontFamily: 'var(--sora)', fontWeight: 700, fontSize: 13, color: 'var(--navy)' }}>
                {c.name}
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{c.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
