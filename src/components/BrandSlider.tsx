'use client';

const BRANDS = [
  { name: 'Knaus', logo: '/brands/knaus.svg', h: 'h-16 sm:h-20' },
  { name: 'Dethleffs', logo: '/brands/dethleffs.svg', h: 'h-8 sm:h-10' },
  { name: 'Hobby', logo: '/brands/hobby.svg', h: 'h-10 sm:h-12' },
  { name: 'Fendt', logo: '/brands/fendt.svg', h: 'h-14 sm:h-18' },
  { name: 'Adria', logo: '/brands/adria.svg', h: 'h-16 sm:h-20' },
  { name: 'Bürstner', logo: '/brands/burstner.svg', h: 'h-7 sm:h-9' },
  { name: 'LMC', logo: '/brands/lmc.svg', h: 'h-14 sm:h-18' },
  { name: 'Tabbert', logo: '/brands/tabbert.svg', h: 'h-12 sm:h-16' },
  { name: 'Eriba', logo: '/brands/eriba.svg', h: 'h-8 sm:h-10' },
  { name: 'ANWB', logo: '/brands/anwb.svg', h: 'h-14 sm:h-18' },
];

export default function BrandSlider() {
  const items = [...BRANDS, ...BRANDS];

  return (
    <section className="py-8 sm:py-12 bg-surface overflow-hidden border-y border-sand-dark/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-6">
        <p className="text-xs font-bold tracking-[0.2em] uppercase text-warm-gray/50 text-center">
          Wij werken met alle merken
        </p>
      </div>
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-surface to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-surface to-transparent z-10" />
        <div className="brand-marquee">
          <div className="brand-marquee-track">
            {items.map((brand, i) => (
              <div
                key={`${brand.name}-${i}`}
                className="inline-flex items-center justify-center mx-6 sm:mx-10 shrink-0"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className={`${brand.h} w-auto object-contain opacity-40 hover:opacity-70 transition-opacity grayscale`}
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      <style jsx>{`
        .brand-marquee {
          overflow: hidden;
        }
        .brand-marquee-track {
          display: flex;
          align-items: center;
          width: max-content;
          animation: marquee 40s linear infinite;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .brand-marquee:hover .brand-marquee-track {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
