'use client';

const BRANDS = [
  { name: 'Knaus', logo: '/brands/knaus.svg' },
  { name: 'Dethleffs', logo: '/brands/dethleffs.svg' },
  { name: 'Hobby', logo: '/brands/hobby.svg' },
  { name: 'Fendt', logo: '/brands/fendt.svg' },
  { name: 'Adria', logo: '/brands/adria.svg' },
  { name: 'Bürstner', logo: '/brands/burstner.svg' },
  { name: 'LMC', logo: '/brands/lmc.svg' },
  { name: 'Tabbert', logo: '/brands/tabbert.svg' },
  { name: 'Eriba', logo: '/brands/eriba.svg' },
  { name: 'ANWB', logo: '/brands/anwb.svg' },
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
                className="inline-flex items-center justify-center mx-5 sm:mx-7 shrink-0"
              >
                <div className="bg-card border border-sand-dark/10 rounded-xl px-5 py-3 hover:border-sand-dark/20 hover:shadow-sm transition-all flex items-center justify-center h-14 min-w-[100px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="h-7 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity"
                    loading="lazy"
                  />
                </div>
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
