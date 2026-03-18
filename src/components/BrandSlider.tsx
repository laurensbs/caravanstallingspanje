'use client';

const BRANDS = [
  { name: 'Knaus', color: '#1B3A6B' },
  { name: 'Dethleffs', color: '#C4161C' },
  { name: 'Hobby', color: '#003DA5' },
  { name: 'Fendt', color: '#4A8C2A' },
  { name: 'Adria', color: '#005CA9' },
  { name: 'Bürstner', color: '#1D1D1B' },
  { name: 'LMC', color: '#E30613' },
  { name: 'Tabbert', color: '#1A1A1A' },
  { name: 'Eriba', color: '#00529B' },
  { name: 'ANWB', color: '#F7A600' },
];

export default function BrandSlider() {
  const items = [...BRANDS, ...BRANDS];

  return (
    <section className="py-10 sm:py-14 bg-surface overflow-hidden border-y border-sand-dark/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-8">
        <p className="text-xs font-bold tracking-[0.2em] uppercase text-warm-gray/50 text-center">
          Wij werken met alle merken
        </p>
      </div>
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-surface to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-surface to-transparent z-10" />
        <div className="brand-marquee">
          <div className="brand-marquee-track">
            {items.map((brand, i) => (
              <div
                key={`${brand.name}-${i}`}
                className="inline-flex items-center justify-center mx-6 sm:mx-8 shrink-0"
              >
                <div className="bg-card border border-sand-dark/10 rounded-xl px-6 py-3 hover:border-sand-dark/20 hover:shadow-sm transition-all">
                  <span
                    className="text-lg sm:text-xl font-black tracking-tight select-none"
                    style={{ color: brand.color, opacity: 0.65 }}
                  >
                    {brand.name}
                  </span>
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
