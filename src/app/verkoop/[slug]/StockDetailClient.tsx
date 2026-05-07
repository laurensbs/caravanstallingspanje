'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Phone, Mail } from 'lucide-react';
import Topbar from '@/components/marketing/Topbar';
import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';

const EASE = [0.16, 1, 0.3, 1] as const;

type DetailItem = {
  id: number;
  slug: string;
  kind: string;
  brand: string;
  model: string;
  year: number | null;
  km: number | null;
  length_m: number | null;
  price_eur: number | null;
  status: string;
  description: string | null;
  hero_photo_url: string | null;
  gallery_urls: string[];
};

export default function StockDetailClient({ item }: { item: DetailItem }) {
  const reduce = useReducedMotion();
  const allPhotos = [item.hero_photo_url, ...item.gallery_urls].filter((u): u is string => !!u);
  const [activeIdx, setActiveIdx] = useState(0);
  const activePhoto = allPhotos[activeIdx];

  const sold = item.status === 'sold';
  const reserved = item.status === 'reserved';
  const priceText = item.price_eur !== null
    ? `€${item.price_eur.toLocaleString('nl-NL')}`
    : 'Op aanvraag';

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <Topbar />
      <PublicHeader />
      <main id="main" className="flex-1">
        <section className="pt-12 pb-16 sm:pb-20 section-bg-sky-soft">
          <div className="max-w-[1200px] mx-auto px-5 sm:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 items-start">

              {/* Galerij */}
              <div>
                <motion.div
                  initial={reduce ? false : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: EASE }}
                  className="card-mk"
                  style={{
                    padding: 0, overflow: 'hidden',
                    aspectRatio: '4 / 3',
                    background: activePhoto
                      ? `url(${activePhoto}) center / cover no-repeat`
                      : 'linear-gradient(160deg, #E5F3FB 0%, #95D8FD 70%, #F2DDB6 100%)',
                  }}
                >
                  {!activePhoto && (
                    <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', color: 'var(--muted)', fontSize: 13 }}>
                      Geen foto&apos;s beschikbaar
                    </div>
                  )}
                </motion.div>

                {allPhotos.length > 1 && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 12, overflowX: 'auto', paddingBottom: 4 }}>
                    {allPhotos.map((url, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveIdx(idx)}
                        aria-label={`Foto ${idx + 1}`}
                        style={{
                          flex: '0 0 auto',
                          width: 96,
                          height: 72,
                          padding: 0,
                          borderRadius: 8,
                          overflow: 'hidden',
                          border: idx === activeIdx ? '2px solid var(--orange)' : '1px solid var(--line)',
                          background: `url(${url}) center / cover no-repeat`,
                          cursor: 'pointer',
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Info + CTA */}
              <motion.div
                initial={reduce ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}
              >
                <span className="eyebrow-mk">{item.kind === 'camper' ? 'Camper' : 'Caravan'}</span>
                <h1 className="h1-mk" style={{ marginTop: 4, fontSize: 'clamp(2rem, 4vw, 2.6rem)' }}>
                  {item.brand} {item.model}
                </h1>

                <div style={{ marginTop: 18, display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: 'var(--sora)', fontWeight: 700, fontSize: 32, color: 'var(--navy)' }}>
                    {priceText}
                  </span>
                  {sold && <span className="tag-mk navy">Verkocht</span>}
                  {reserved && <span className="tag-mk">Gereserveerd</span>}
                  {item.status === 'new' && <span className="tag-mk orange">Nieuw binnen</span>}
                </div>

                <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12 }}>
                  {item.year !== null && <Spec label="Bouwjaar" value={String(item.year)} />}
                  {item.km !== null && <Spec label="Kilometerstand" value={`${item.km.toLocaleString('nl-NL')} km`} />}
                  {item.length_m !== null && <Spec label="Lengte" value={`${item.length_m.toString().replace('.', ',')} m`} />}
                  <Spec label="Type" value={item.kind === 'camper' ? 'Camper' : 'Caravan'} />
                </div>

                {item.description && (
                  <div style={{ marginTop: 28 }}>
                    <h3 style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 11, letterSpacing: 2.4, textTransform: 'uppercase', color: 'var(--muted)', margin: '0 0 10px' }}>
                      Beschrijving
                    </h3>
                    <p style={{ fontSize: 14.5, color: 'var(--ink-2)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                      {item.description}
                    </p>
                  </div>
                )}

                <div style={{ marginTop: 28, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {!sold && (
                    <Link
                      href={`/contact?topic=sales&subject=${encodeURIComponent(`Bezichtiging ${item.brand} ${item.model}`)}`}
                      className="btn btn-primary"
                    >
                      <Mail size={15} aria-hidden /> Plan bezichtiging <ArrowRight size={14} aria-hidden />
                    </Link>
                  )}
                  <a href="tel:+34633778699" className="btn btn-ghost">
                    <Phone size={14} aria-hidden /> +34 633 77 86 99
                  </a>
                </div>
              </motion.div>

            </div>
          </div>
        </section>
      </main>
      <PublicFooter />

      {/* AnimatePresence stub voor toekomstige lightbox */}
      <AnimatePresence />
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="card-mk" style={{ padding: 14 }}>
      <div style={{ fontSize: 10.5, fontFamily: 'var(--sora)', fontWeight: 700, letterSpacing: 1.6, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 14, color: 'var(--navy)' }}>
        {value}
      </div>
    </div>
  );
}
