'use client';

import { useEffect, useRef } from 'react';

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
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let animId: number;
    let pos = 0;
    const speed = 0.5;

    const animate = () => {
      pos += speed;
      const half = el.scrollWidth / 2;
      if (pos >= half) pos = 0;
      el.style.transform = `translateX(-${pos}px)`;
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  const items = [...BRANDS, ...BRANDS];

  return (
    <section className="py-12 sm:py-16 bg-surface overflow-hidden border-y border-sand-dark/[0.04]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-6">
        <p className="text-xs font-bold tracking-[0.2em] uppercase text-warm-gray/60 text-center">
          Wij werken met alle merken
        </p>
      </div>
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-surface to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-surface to-transparent z-10" />
        <div ref={scrollRef} className="flex items-center gap-12 sm:gap-16 whitespace-nowrap will-change-transform">
          {items.map((brand, i) => (
            <div
              key={`${brand.name}-${i}`}
              className="flex items-center justify-center px-4 shrink-0"
            >
              <span
                className="text-xl sm:text-2xl font-black tracking-tight opacity-40 hover:opacity-70 transition-opacity select-none"
                style={{ color: brand.color }}
              >
                {brand.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
