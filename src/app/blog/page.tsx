'use client';

import { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Search, Tent, MapPin, Waves, Mountain, UtensilsCrossed, BookOpen, Star, ChevronRight, Palmtree } from 'lucide-react';
import A from '@/components/AnimateIn';
import CtaSection from '@/components/CtaSection';

type Item = Record<string, any>;
type FeaturedData = {
  campings: Item[]; places: Item[]; beaches: Item[];
  attractions: Item[]; restaurants: Item[]; posts: Item[];
  stats: { campings: number; places: number; beaches: number; attractions: number; restaurants: number; blogPosts: number };
};

const CATEGORIES = [
  { key: 'campings', label: 'Campings', icon: Tent, href: '/blog/campings', color: 'from-accent to-accent-dark', bg: 'bg-accent/10', text: 'text-accent' },
  { key: 'places', label: 'Plaatsen', icon: MapPin, href: '/blog/plaatsen', color: 'from-ocean to-ocean-dark', bg: 'bg-ocean/10', text: 'text-ocean' },
  { key: 'beaches', label: 'Stranden', icon: Waves, href: '/blog/stranden', color: 'from-primary to-primary-dark', bg: 'bg-primary/10', text: 'text-primary' },
  { key: 'attractions', label: 'Bezienswaardigheden', icon: Mountain, href: '/blog/bezienswaardigheden', color: 'from-warning to-primary-dark', bg: 'bg-warning/10', text: 'text-warning' },
  { key: 'restaurants', label: 'Restaurants', icon: UtensilsCrossed, href: '/blog/restaurants', color: 'from-danger to-primary-dark', bg: 'bg-danger/10', text: 'text-danger' },
  { key: 'posts', label: 'Artikelen', icon: BookOpen, href: '/blog/artikelen', color: 'from-ocean to-accent', bg: 'bg-ocean/10', text: 'text-ocean' },
];

export default function HubPage() {
  const [data, setData] = useState<FeaturedData | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/guide/featured')
      .then(r => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  return (
    <>
      <Header />

      {/* Hero */}
      <section className="relative bg-primary text-white py-20 sm:py-36 overflow-hidden wave-divider">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=1920&q=80"
            alt="Costa Brava kustlijn"
            fill sizes="100vw"
            className="object-cover opacity-30"
            priority
          />
          <div className="hero-overlay absolute inset-0" />
        </div>
        <div className="absolute inset-0 dot-pattern opacity-15" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-float-slow" />
          <div className="absolute -bottom-32 -left-20 w-80 h-80 bg-accent/8 rounded-full blur-3xl animate-float-reverse" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.1 }} className="inline-flex items-center gap-2 bg-white/[0.07] border border-white/10 rounded-full px-4 py-1.5 mb-5">
              <Palmtree size={14} className="text-white/60" />
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-white/90">Costa Brava Gids</span>
            </motion.div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold leading-[1.08] mb-5">
              Ontdek de <span className="gradient-text">Costa Brava</span>
            </h1>
            <p className="text-white/65 max-w-2xl mx-auto text-sm sm:text-lg leading-relaxed mb-8">
              Campings, stranden, dorpen, bezienswaardigheden en restaurants. Alles wat u moet weten voor uw verblijf aan de prachtige Costa Brava.
            </p>

            {/* Search bar */}
            <div className="max-w-xl mx-auto relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500/50" />
              <input
                type="text"
                placeholder="Zoek campings, stranden, plaatsen..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && search.trim()) window.location.href = `/blog/campings?search=${encodeURIComponent(search)}`; }}
                className="w-full pl-11 pr-4 py-4 rounded-2xl bg-white/10 border border-white/15 text-white placeholder:text-white/35 text-sm outline-none focus:bg-white/15 focus:border-white/25 transition-all backdrop-blur-sm"
              />
            </div>

            {/* Quick category chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
              {CATEGORIES.map(c => (
                <Link key={c.key} href={c.href} className="inline-flex items-center gap-1.5 bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] rounded-full px-3.5 py-1.5 text-xs font-medium text-white/70 hover:text-white transition-all">
                  <c.icon size={13} /> {c.label}
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats bar */}
      {data?.stats && (
        <section className="bg-card border-b border-gray-200 -mt-1 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-3 sm:grid-cols-6 divide-x divide-gray-200-dark/15">
              {[
                { n: data.stats.campings, l: 'Campings' },
                { n: data.stats.places, l: 'Plaatsen' },
                { n: data.stats.beaches, l: 'Stranden' },
                { n: data.stats.attractions, l: 'Bezienswaardigheden' },
                { n: data.stats.restaurants, l: 'Restaurants' },
                { n: data.stats.blogPosts, l: 'Artikelen' },
              ].map(s => (
                <div key={s.l} className="py-4 sm:py-5 text-center">
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">{s.n}</p>
                  <p className="text-xs sm:text-xs text-gray-500 font-medium">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Category Carousels */}
      {data && CATEGORIES.map((cat, ci) => {
        const items = data[cat.key as keyof FeaturedData] as Item[];
        if (!items || items.length === 0) return null;
        return (
          <section key={cat.key} className={ci % 2 === 0 ? 'py-12 sm:py-16 bg-surface' : 'py-12 sm:py-16 bg-card'}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <A>
                <div className="flex items-center justify-between mb-6 sm:mb-8">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${cat.bg} flex items-center justify-center`}>
                      <cat.icon size={18} className={cat.text} />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{cat.label}</h2>
                      <div className="section-divider mt-1" />
                    </div>
                  </div>
                  <Link href={cat.href} className="inline-flex items-center gap-1.5 text-primary font-semibold text-sm hover:gap-2.5 transition-all">
                    Bekijk alles <ArrowRight size={14} />
                  </Link>
                </div>
              </A>
              <HorizontalScroll>
                {items.map((item, i) => (
                  <A key={item.slug as string || i} delay={i * 0.06}>
                    <GuideCard item={item} type={cat.key} />
                  </A>
                ))}
              </HorizontalScroll>
            </div>
          </section>
        );
      })}

      {/* Empty state when no data */}
      {data && Object.values(data.stats || {}).every(v => v === 0) && (
        <section className="py-20 bg-surface">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <Palmtree size={48} className="text-gray-500/30 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Hub wordt geladen</h2>
            <p className="text-gray-500 leading-relaxed">De Costa Brava gids wordt momenteel gevuld met informatie. Kom snel terug!</p>
          </div>
        </section>
      )}

      <CtaSection
        title="Caravan stallen aan de Costa Brava?"
        subtitle="Geniet van de regio terwijl wij voor uw caravan zorgen. Veilig, professioneel en op een toplocatie."
        primaryLabel="Direct reserveren"
        primaryHref="/reserveren"
        secondaryPhone={false}
        secondaryLabel="Meer informatie"
        secondaryHref="/stalling"
      />

      <Footer />
    </>
  );
}

function HorizontalScroll({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div className="relative -mx-4 sm:mx-0">
      <div ref={ref} className="flex gap-4 overflow-x-auto pb-4 px-4 sm:px-0 snap-x snap-mandatory scrollbar-hide sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:overflow-visible sm:pb-0">
        {children}
      </div>
    </div>
  );
}

function GuideCard({ item, type }: { item: Item; type: string }) {
  const slug = item.slug as string;
  const name = (item.name || item.title) as string;
  const cover = item.cover_image as string | null;
  const desc = (item.description || item.excerpt) as string | null;

  const hrefMap: Record<string, string> = {
    campings: `/blog/campings/${slug}`,
    places: `/blog/plaatsen/${slug}`,
    beaches: `/blog/stranden/${slug}`,
    attractions: `/blog/bezienswaardigheden/${slug}`,
    restaurants: `/blog/restaurants/${slug}`,
    posts: `/blog/artikelen/${slug}`,
  };

  return (
    <Link href={hrefMap[type] || '#'} className="group block min-w-[280px] sm:min-w-0 snap-start">
      <div className="bg-card rounded-2xl overflow-hidden border border-gray-200 h-full flex flex-col card-hover">
        <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
          {cover ? (
            <Image src={cover} alt={name} fill sizes="(max-width: 640px) 85vw, (max-width: 1024px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-300 flex items-center justify-center">
              <MapPin size={32} className="text-gray-500/30" />
            </div>
          )}
          <div className="absolute top-3 left-3 flex gap-1.5">
            {type === 'campings' && item.stars && (
              <span className="bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                <Star size={10} className="text-amber-500 fill-amber-500" /> {item.stars as number}
              </span>
            )}
            {type === 'beaches' && item.beach_type && (
              <span className="bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-bold px-2 py-0.5 rounded-full">
                {({ zand: 'Zand', kiezel: 'Kiezel', cala: 'Cala', rots: 'Rots' } as Record<string, string>)[item.beach_type as string] || item.beach_type as string}
              </span>
            )}
            {type === 'attractions' && item.category && (
              <span className="bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-bold px-2 py-0.5 rounded-full">
                {({ museum: 'Museum', natuur: 'Natuur', historisch: 'Historisch', activiteit: 'Activiteit', park: 'Park' } as Record<string, string>)[item.category as string] || item.category as string}
              </span>
            )}
            {type === 'restaurants' && item.price_range && (
              <span className="bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-bold px-2 py-0.5 rounded-full">
                {item.price_range as string}
              </span>
            )}
          </div>
        </div>
        <div className="p-5 flex flex-col flex-1">
          <h3 className="font-bold text-[15px] leading-snug text-gray-900 group-hover:text-primary transition-colors line-clamp-2 mb-1.5">{name}</h3>
          {(type === 'campings' || type === 'beaches' || type === 'restaurants') && (item.town || item.place_name) && (
            <p className="text-xs text-gray-500 flex items-center gap-1 mb-2"><MapPin size={10} /> {(item.town || item.place_name) as string}</p>
          )}
          {type === 'restaurants' && item.cuisine_type && (
            <p className="text-xs text-gray-500 mb-2">{item.cuisine_type as string}</p>
          )}
          {desc && <p className="text-sm text-gray-500 leading-relaxed flex-1 line-clamp-2 mb-3">{desc}</p>}
          <span className="inline-flex items-center gap-1 text-primary font-semibold text-xs group-hover:gap-2 transition-all mt-auto">
            Bekijk details <ChevronRight size={12} />
          </span>
        </div>
      </div>
    </Link>
  );
}
