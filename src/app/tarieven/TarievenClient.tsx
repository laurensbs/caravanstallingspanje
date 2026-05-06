'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Phone, Info } from 'lucide-react';
import Topbar from '@/components/marketing/Topbar';
import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';
import MotionPageTransition from '@/components/motion/MotionPageTransition';
import { useLocale } from '@/components/LocaleProvider';
import type { StringKey } from '@/lib/i18n';
import type { PublicService } from '@/lib/services-catalog';

const EASE = [0.16, 1, 0.3, 1] as const;
type T = (k: StringKey, ...a: (string | number)[]) => string;

interface Props {
  fridgeLarge: number;
  fridgeTable: number;
  airco: number;
  transportWij: number;
  transportZelf: number;
  repairHourly: number;
  cleaning: PublicService[];
  maintenance: PublicService[];
  inspection: PublicService[];
  repair: PublicService[];
  other: PublicService[];
}

function fmtEur(n: number, suffix?: string) {
  const formatted = new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(n);
  return suffix ? `${formatted} ${suffix}` : formatted;
}

export default function TarievenClient(props: Props) {
  const { t } = useLocale();
  const onRequest = t('pri1.on-request');

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <Topbar />
      <PublicHeader />
      <main id="main" className="flex-1">
        <MotionPageTransition>
        <Hero t={t} />

        <section className="py-16 sm:py-20">
          <div className="max-w-[1080px] mx-auto px-5 sm:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Stalling — op aanvraag → reservering via configurator */}
              <CategoryTable
                titleKey="pri1.cat-storage"
                t={t}
                rows={[
                  { label: t('pri1.cat-storage-row-1'), price: onRequest },
                  { label: t('pri1.cat-storage-row-2'), price: onRequest, featured: true },
                  { label: t('pri1.cat-storage-row-3'), price: onRequest },
                ]}
                ctaHref="/reserveren/configurator"
                ctaLabel="Reserveer plek"
              />

              {/* Verhuur — uit app_settings → bestelling via /koelkast */}
              <CategoryTable
                titleKey="pri1.cat-rental"
                t={t}
                rows={[
                  { label: t('pri1.cat-rental-row-1'), price: fmtEur(props.fridgeLarge, '/ wk') },
                  { label: t('pri1.cat-rental-row-2'), price: fmtEur(props.fridgeTable, '/ wk') },
                  { label: t('pri1.cat-rental-row-3'), price: fmtEur(props.airco, '/ wk') },
                ]}
                ctaHref="/koelkast"
                ctaLabel="Bestel koelkast/airco"
              />

              {/* Schoonmaak — uit reparatie-paneel master, per-rij directe boek-flow */}
              <ServiceCategoryTable
                titleKey="pri1.cat-clean"
                t={t}
                services={props.cleaning}
                emptyHint="Schoonmaak-tarieven krijg je in een offerte op maat."
                perRowHrefTemplate="/diensten/service?type={slug}"
                ctaHref="/diensten/service"
                ctaLabel="Plan schoonmaak"
              />

              {/* Onderhoud — uit master */}
              <ServiceCategoryTable
                titleKey="pri1.cat-maint"
                t={t}
                services={props.maintenance}
                emptyHint="Onderhoud-tarieven krijg je in een offerte op maat."
                perRowHrefTemplate="/diensten/service?type={slug}"
                ctaHref="/diensten/service"
                ctaLabel="Plan onderhoud"
              />

              {/* Inspectie — uit master */}
              <ServiceCategoryTable
                titleKey="pri1.cat-inspection"
                t={t}
                services={props.inspection}
                emptyHint="Inspectie-tarieven krijg je in een offerte op maat."
                ctaHref="/diensten/inspectie"
                ctaLabel="Plan inspectie"
              />

              {/* Transport — uit app_settings */}
              <CategoryTable
                titleKey="pri1.cat-transport"
                t={t}
                rows={[
                  { label: t('pri1.cat-transport-row-1'), price: fmtEur(props.transportWij) },
                  { label: t('pri1.cat-transport-row-2'), price: fmtEur(props.transportZelf) },
                  { label: t('pri1.cat-transport-row-3'), price: onRequest },
                ]}
                ctaHref="/diensten/transport"
                ctaLabel="Boek transport"
              />

              {/* Reparatie — uit master als specifieke services bestaan; anders uurtarief */}
              {props.repair.length > 0 && (
                <ServiceCategoryTable
                  titleNl="Reparatie"
                  t={t}
                  services={props.repair}
                  emptyHint=""
                  ctaHref="/diensten/reparatie"
                  ctaLabel="Plan reparatie"
                />
              )}

              {/* Overig — uit master als categorie 'overig' bestaat */}
              {props.other.length > 0 && (
                <ServiceCategoryTable
                  titleNl="Overige diensten"
                  t={t}
                  services={props.other}
                  emptyHint=""
                  ctaHref="/contact?subject=Offerte-aanvraag"
                  ctaLabel="Vraag offerte"
                />
              )}
            </div>
          </div>
        </section>

        <Notes t={t} repairHourly={props.repairHourly} />
        </MotionPageTransition>
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
          <motion.span {...fade(0)} className="eyebrow-mk">{t('pri1.hero-eyebrow')}</motion.span>
          <motion.h1 {...fade(0.06)} className="h1-mk" style={{ marginTop: 4 }}>{t('pri1.hero-h1')}</motion.h1>
          <motion.p {...fade(0.14)} className="lead-mk" style={{ marginTop: 14, maxWidth: 700 }}>{t('pri1.hero-lead')}</motion.p>
        </div>
      </div>
    </section>
  );
}

interface CategoryTableProps {
  t: T;
  titleKey?: StringKey;
  titleNl?: string;
  rows: Array<{ label: string; price: string; featured?: boolean }>;
  /** CTA-knop in footer voor directe bestel-/aanvraag-flow. */
  ctaHref?: string;
  ctaLabel?: string;
}

function CategoryTable({ t, titleKey, titleNl, rows, ctaHref, ctaLabel }: CategoryTableProps) {
  void t;
  const title = titleKey ? t(titleKey) : (titleNl || '');
  return (
    <div className="tbl-wrap-mk" style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--line)', background: 'var(--bg)' }}>
        <h3 style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 16, color: 'var(--navy)', margin: 0 }}>
          {title}
        </h3>
      </div>
      <table className="tbl-mk">
        <tbody>
          {rows.map((r) => (
            <tr key={r.label} className={r.featured ? 'featured' : undefined}>
              <td>{r.label}</td>
              <td className="price" style={{ textAlign: 'right' }}>{r.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {ctaHref && (
        <div style={{ marginTop: 'auto', padding: '14px 18px', borderTop: '1px solid var(--line)', background: 'var(--bg)' }}>
          <Link href={ctaHref} className="btn btn-primary btn-block" style={{ fontSize: 13.5 }}>
            {ctaLabel || 'Bestel direct'} <ArrowRight size={14} aria-hidden />
          </Link>
        </div>
      )}
    </div>
  );
}

interface ServiceCategoryTableProps {
  t: T;
  titleKey?: StringKey;
  titleNl?: string;
  services: PublicService[];
  /** Tekst die getoond wordt als services leeg is. */
  emptyHint?: string;
  /** CTA-knop in footer + per-rij booking-link (gebruikt service-id). */
  ctaHref?: string;
  ctaLabel?: string;
  /** URL-template voor per-service booking, met {id} placeholder voor upstreamId. */
  perRowHrefTemplate?: string;
}

function ServiceCategoryTable({
  t, titleKey, titleNl, services, emptyHint = '', ctaHref, ctaLabel, perRowHrefTemplate,
}: ServiceCategoryTableProps) {
  void t;
  const title = titleKey ? t(titleKey) : (titleNl || '');
  if (services.length === 0) {
    if (!emptyHint) return null;
    return (
      <div className="tbl-wrap-mk" style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--line)', background: 'var(--bg)' }}>
          <h3 style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 16, color: 'var(--navy)', margin: 0 }}>
            {title}
          </h3>
        </div>
        <div style={{ padding: '20px 22px', fontSize: 13.5, color: 'var(--muted)', flex: 1 }}>
          {emptyHint}
        </div>
        {ctaHref && (
          <div style={{ padding: '14px 18px', borderTop: '1px solid var(--line)', background: 'var(--bg)' }}>
            <Link href={ctaHref} className="btn btn-ghost btn-block" style={{ fontSize: 13.5 }}>
              {ctaLabel || 'Vraag offerte'} <ArrowRight size={14} aria-hidden />
            </Link>
          </div>
        )}
      </div>
    );
  }
  return (
    <div className="tbl-wrap-mk" style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--line)', background: 'var(--bg)' }}>
        <h3 style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 16, color: 'var(--navy)', margin: 0 }}>
          {title}
        </h3>
      </div>
      <table className="tbl-mk">
        <tbody>
          {services.map((s) => {
            const href = perRowHrefTemplate
              ? perRowHrefTemplate
                  .replace('{id}', encodeURIComponent(String(s.upstreamId)))
                  .replace('{slug}', encodeURIComponent(s.slug))
              : null;
            return (
              <tr key={s.upstreamId}>
                <td>
                  <div style={{ fontWeight: 500 }}>{s.name}</div>
                  {s.description && (
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                      {s.description}
                    </div>
                  )}
                </td>
                <td className="price" style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <span>{fmtEur(s.priceEur)}</span>
                    {href && (
                      <Link
                        href={href}
                        style={{
                          fontSize: 11.5, color: 'var(--orange-d)', fontWeight: 600,
                          fontFamily: 'var(--sora)', textDecoration: 'none',
                          display: 'inline-flex', alignItems: 'center', gap: 3,
                        }}
                      >
                        Bestel <ArrowRight size={11} aria-hidden />
                      </Link>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {ctaHref && (
        <div style={{ marginTop: 'auto', padding: '14px 18px', borderTop: '1px solid var(--line)', background: 'var(--bg)' }}>
          <Link href={ctaHref} className="btn btn-primary btn-block" style={{ fontSize: 13.5 }}>
            {ctaLabel || 'Bestel direct'} <ArrowRight size={14} aria-hidden />
          </Link>
        </div>
      )}
    </div>
  );
}

function Notes({ t, repairHourly }: { t: T; repairHourly: number }) {
  const notes: StringKey[] = ['pri1.note-1', 'pri1.note-2', 'pri1.note-3', 'pri1.note-4'];
  const hourlyText = repairHourly > 0
    ? `Reparatie wordt op uurbasis afgerekend (${fmtEur(repairHourly, '/u')}) of via een vaste prijs in offerte.`
    : null;
  return (
    <section className="py-12 sm:py-16 section-bg-grey">
      <div className="max-w-[1080px] mx-auto px-5 sm:px-10">
        <div className="card-mk" style={{ padding: 28 }}>
          <h3 style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 17, color: 'var(--navy)', margin: '0 0 16px', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <Info size={18} aria-hidden style={{ color: 'var(--orange)' }} /> {t('pri1.note-h3')}
          </h3>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: 10, margin: 0, padding: 0, listStyle: 'none', fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.6 }}>
            {notes.map((k) => (
              <li key={k} style={{ paddingLeft: 18, position: 'relative' }}>
                <span aria-hidden style={{ position: 'absolute', left: 0, top: '0.55em', width: 6, height: 6, borderRadius: 999, background: 'var(--orange)' }} />
                {t(k)}
              </li>
            ))}
            {hourlyText && (
              <li style={{ paddingLeft: 18, position: 'relative' }}>
                <span aria-hidden style={{ position: 'absolute', left: 0, top: '0.55em', width: 6, height: 6, borderRadius: 999, background: 'var(--orange)' }} />
                {hourlyText}
              </li>
            )}
          </ul>
          <div style={{ marginTop: 22, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link href="/contact?subject=Offerte-aanvraag" className="btn btn-primary">
              Vraag offerte op maat <ArrowRight size={14} aria-hidden />
            </Link>
            <a href="tel:+34633778699" className="btn btn-ghost">
              <Phone size={14} aria-hidden /> +34 633 77 86 99
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
