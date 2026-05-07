'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, MapPin, Globe, Snowflake, Wind, Truck, Check } from 'lucide-react';
import Topbar from '@/components/marketing/Topbar';
import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';
import type { Camping } from '@/lib/campings-data';

const EASE = [0.16, 1, 0.3, 1] as const;

export default function CampingDetailClient({ camping }: { camping: Camping }) {
  const reduce = useReducedMotion();
  const photos = camping.photos?.length > 0 ? camping.photos : [];
  const [activeIdx, setActiveIdx] = useState(0);
  const activePhoto = photos[activeIdx];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <Topbar />
      <PublicHeader />
      <main id="main" className="flex-1">
        <section className="section-bg-sky-soft" style={{ paddingTop: 24, paddingBottom: 60 }}>
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
                    padding: 0,
                    overflow: 'hidden',
                    aspectRatio: '4 / 3',
                    position: 'relative',
                    background: activePhoto
                      ? 'transparent'
                      : 'linear-gradient(160deg, #E5F3FB 0%, #95D8FD 70%, #F2DDB6 100%)',
                  }}
                >
                  {activePhoto && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={activePhoto}
                      alt={camping.name}
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  )}
                </motion.div>

                {photos.length > 1 && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 12, overflowX: 'auto', paddingBottom: 4 }}>
                    {photos.map((url, idx) => (
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
                          background: 'transparent',
                          cursor: 'pointer',
                          position: 'relative',
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="" loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Info */}
              <motion.div
                initial={reduce ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}
              >
                <span className="eyebrow-mk">{camping.region}</span>
                <h1 className="h1-mk" style={{ marginTop: 4, fontSize: 'clamp(1.8rem, 3.6vw, 2.4rem)' }}>
                  {camping.name}
                </h1>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    color: 'var(--muted)',
                    fontSize: 14,
                    fontFamily: 'var(--inter)',
                    marginTop: 8,
                  }}
                >
                  <MapPin size={14} aria-hidden /> {camping.location}
                </div>

                <p style={{ fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.7, marginTop: 18 }}>
                  {camping.longDescription || camping.description}
                </p>

                {camping.facilities.length > 0 && (
                  <div style={{ marginTop: 24 }}>
                    <h3 style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 11, letterSpacing: 2.4, textTransform: 'uppercase', color: 'var(--muted)', margin: '0 0 12px' }}>
                      Faciliteiten
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {camping.facilities.map((f) => (
                        <span key={f} className="tag-mk">{f}</span>
                      ))}
                    </div>
                  </div>
                )}

                {camping.bestFor && camping.bestFor.length > 0 && (
                  <div style={{ marginTop: 18 }}>
                    <h3 style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 11, letterSpacing: 2.4, textTransform: 'uppercase', color: 'var(--muted)', margin: '0 0 12px' }}>
                      Ideaal voor
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {camping.bestFor.map((f) => (
                        <span key={f} className="tag-mk green">{f}</span>
                      ))}
                    </div>
                  </div>
                )}

                {camping.website && (
                  <div style={{ marginTop: 22 }}>
                    <a
                      href={camping.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-ghost"
                    >
                      <Globe size={14} aria-hidden /> Website camping <ArrowRight size={13} aria-hidden />
                    </a>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Onze diensten op deze camping */}
        <section className="py-16 sm:py-20">
          <div className="max-w-[1200px] mx-auto px-5 sm:px-10">
            <div className="text-center max-w-[720px] mx-auto mb-10">
              <span className="eyebrow-mk">Wij leveren hier</span>
              <h2 className="h2-mk">Boek je dienst voor {camping.name}</h2>
              <p className="lead-mk" style={{ marginTop: 10 }}>
                Vul bij &quot;Camping&quot; in het boekformulier &quot;{camping.name}&quot; in — wij bezorgen op je staanplaats.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <ServiceCard
                icon={Snowflake}
                title="Koelkast huren"
                desc="Grote of tafelmodel — bezorgd op je staanplaats vanaf 7 dagen."
                href={`/koelkast?camping=${encodeURIComponent(camping.name)}`}
              />
              <ServiceCard
                icon={Wind}
                title="Airco huren"
                desc="Mobiele 230V-unit — geïnstalleerd, klaar voor gebruik."
                href={`/diensten/airco?camping=${encodeURIComponent(camping.name)}`}
              />
              <ServiceCard
                icon={Truck}
                title="Transport"
                desc="Wij halen je caravan op vanaf deze camping naar onze stalling."
                href={`/diensten/transport?camping=${encodeURIComponent(camping.name)}`}
              />
            </div>
          </div>
        </section>

        {/* CTA-band */}
        <section className="py-12 sm:py-16">
          <div className="max-w-[1200px] mx-auto px-5 sm:px-10">
            <div className="cta-band-mk">
              <div>
                <h2 className="h2-mk on-navy" style={{ margin: 0 }}>
                  Vraag of suggestie over deze camping?
                </h2>
                <p style={{ marginTop: 8, color: 'rgba(255,255,255,0.78)', fontSize: 15, lineHeight: 1.55 }}>
                  We helpen je graag — bel of mail ons.
                </p>
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <Link
                  href={`/contact?topic=general&subject=${encodeURIComponent(`Vraag over ${camping.name}`)}`}
                  className="btn btn-primary"
                >
                  <Check size={15} aria-hidden /> Stuur een bericht
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}

function ServiceCard({
  icon: Icon, title, desc, href,
}: {
  icon: typeof Snowflake;
  title: string;
  desc: string;
  href: string;
}) {
  return (
    <Link href={href} className="service-card-mk block" style={{ textDecoration: 'none' }}>
      <div className="ic"><Icon size={20} aria-hidden /></div>
      <h3>{title}</h3>
      <p>{desc}</p>
      <span className="more">Boeken</span>
    </Link>
  );
}
