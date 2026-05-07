'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, MapPin, Search, Snowflake, Wind, Truck } from 'lucide-react';
import Topbar from '@/components/marketing/Topbar';
import MotionPageTransition from '@/components/motion/MotionPageTransition';
import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';
import type { Camping } from '@/lib/campings-data';

const EASE = [0.16, 1, 0.3, 1] as const;
type Region = 'Alle' | Camping['region'];

const REGIONS: Region[] = ['Alle', 'Baix Empordà', 'Alt Empordà', 'La Selva'];

export default function CampingsClient({ campings }: { campings: Camping[] }) {
  const [region, setRegion] = useState<Region>('Alle');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return campings.filter((c) => {
      if (region !== 'Alle' && c.region !== region) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
      );
    });
  }, [campings, region, query]);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <Topbar />
      <PublicHeader />
      <main id="main" className="flex-1">
        <MotionPageTransition>
        <Hero campingCount={campings.length} />

        <section className="py-12 sm:py-16">
          <div className="max-w-[1200px] mx-auto px-5 sm:px-10">
            {/* Filters + search */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2">
                {REGIONS.map((r) => {
                  const active = region === r;
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRegion(r)}
                      style={{
                        fontFamily: 'var(--sora)',
                        fontWeight: 600,
                        fontSize: 13,
                        padding: '8px 16px',
                        borderRadius: 999,
                        border: active ? '1px solid var(--navy)' : '1px solid var(--line)',
                        background: active ? 'var(--navy)' : '#fff',
                        color: active ? '#fff' : 'var(--ink-2)',
                        cursor: 'pointer',
                      }}
                      aria-pressed={active}
                    >
                      {r}
                    </button>
                  );
                })}
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: '#fff',
                  border: '1px solid var(--line)',
                  borderRadius: 12,
                  padding: '6px 12px',
                  minWidth: 240,
                }}
              >
                <Search size={14} aria-hidden style={{ color: 'var(--muted)' }} />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Zoek op naam of plaats…"
                  aria-label="Zoek camping"
                  style={{
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    flex: 1,
                    fontFamily: 'var(--inter)',
                    fontSize: 14,
                    color: 'var(--ink)',
                    padding: '6px 0',
                  }}
                />
              </div>
            </div>

            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 18 }}>
              {filtered.length} {filtered.length === 1 ? 'camping' : 'campings'} gevonden
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((c) => (
                <CampingCard key={c.id} camping={c} />
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="card-mk text-center" style={{ padding: 40 }}>
                <p style={{ color: 'var(--muted)', fontSize: 14, margin: 0 }}>
                  Geen camping gevonden voor deze filters.
                </p>
              </div>
            )}
          </div>
        </section>

        <ServicesBand />
        </MotionPageTransition>
      </main>
      <PublicFooter />
    </div>
  );
}

function Hero({ campingCount }: { campingCount: number }) {
  const reduce = useReducedMotion();
  const fade = (delay = 0) =>
    reduce
      ? { initial: false, animate: { opacity: 1, y: 0 }, transition: { duration: 0 } }
      : { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, ease: EASE, delay } };

  return (
    <section className="section-bg-sky-soft">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-10 py-14 sm:py-20">
        <div className="max-w-[820px]">
          <motion.span {...fade(0)} className="eyebrow-mk">Aangesloten campings</motion.span>
          <motion.h1 {...fade(0.06)} className="h1-mk" style={{ marginTop: 4 }}>
            Wij leveren op {campingCount}+ campings aan de Costa Brava.
          </motion.h1>
          <motion.p {...fade(0.14)} className="lead-mk" style={{ marginTop: 14, maxWidth: 720 }}>
            Koelkasten, airco-units en transport — bezorgd op je staanplaats.
            Filter hieronder per regio of zoek je camping op naam.
          </motion.p>
          <motion.div {...fade(0.22)} className="flex flex-wrap gap-3 mt-7">
            <span className="spec-chip">
              <span className="v">{campingCount}+</span>
              <span className="l">Aangesloten campings</span>
            </span>
            <span className="spec-chip">
              <span className="v">3</span>
              <span className="l">Costa Brava-regio&apos;s</span>
            </span>
            <span className="spec-chip">
              <span className="v">24u</span>
              <span className="l">Bezorging na boeking</span>
            </span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function CampingCard({ camping }: { camping: Camping }) {
  const heroPhoto = camping.photos?.[0];
  return (
    <Link
      href={`/aangesloten-campings/${camping.slug}`}
      className="card-mk is-clickable"
      style={{
        padding: 0,
        overflow: 'hidden',
        textDecoration: 'none',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <div
        aria-hidden
        style={{
          aspectRatio: '4 / 3',
          background: heroPhoto
            ? 'transparent'
            : 'linear-gradient(160deg, #E5F3FB 0%, #95D8FD 70%, #F2DDB6 100%)',
          position: 'relative',
        }}
      >
        {heroPhoto && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={heroPhoto}
            alt={camping.name}
            loading="lazy"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
        )}
        <span
          className="tag-mk"
          style={{
            position: 'absolute',
            top: 14,
            left: 14,
            background: 'rgba(31, 42, 54, 0.85)',
            color: '#fff',
            backdropFilter: 'blur(4px)',
          }}
        >
          {camping.region}
        </span>
      </div>
      <div style={{ padding: 22, display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h3 style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 17, color: 'var(--navy)', margin: '0 0 6px' }}>
          {camping.name}
        </h3>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12.5, color: 'var(--muted)', marginBottom: 12 }}>
          <MapPin size={12} aria-hidden /> {camping.location}
        </div>
        <p
          style={{
            fontSize: 13.5,
            color: 'var(--ink-2)',
            margin: '0 0 12px',
            lineHeight: 1.5,
            // Clamp naar 3 regels zodat alle kaarten gelijk hoog zijn ongeacht
            // de variabele description-lengte uit de hub-API.
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: 'calc(13.5px * 1.5 * 3)',
          }}
        >
          {camping.description}
        </p>
        <div style={{ marginTop: 'auto' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              color: 'var(--orange-d)',
              fontFamily: 'var(--sora)',
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            Bekijk faciliteiten <ArrowRight size={13} aria-hidden />
          </span>
        </div>
      </div>
    </Link>
  );
}

function ServicesBand() {
  const services = [
    { icon: Snowflake, title: 'Koelkast huren', desc: 'Bezorgd op je staanplaats — vanaf 7 dagen.', href: '/koelkast' },
    { icon: Wind, title: 'Airco huren', desc: 'Mobiele unit, 230V — direct verkoeling.', href: '/diensten/airco' },
    { icon: Truck, title: 'Transport', desc: 'Caravan ophalen vanaf je camping naar onze stalling.', href: '/diensten/transport' },
  ];
  return (
    <section className="py-16 sm:py-20 section-bg-grey">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-10">
        <div className="text-center max-w-[720px] mx-auto mb-10">
          <span className="eyebrow-mk">Wat we bezorgen</span>
          <h2 className="h2-mk">Diensten op alle aangesloten campings</h2>
          <p className="lead-mk" style={{ marginTop: 10 }}>
            Boek online, wij regelen de levering op de afgesproken datum.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {services.map(({ icon: Icon, title, desc, href }) => (
            <Link key={href} href={href} className="service-card-mk block" style={{ textDecoration: 'none' }}>
              <div className="ic"><Icon size={20} aria-hidden /></div>
              <h3>{title}</h3>
              <p>{desc}</p>
              <span className="more">Boeken</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
