'use client';
import GuideCategoryPage from '@/components/GuideCategoryPage';
import { Waves } from 'lucide-react';

const beachTypeLabels: Record<string, string> = {
  zand: 'Zandstrand',
  kiezel: 'Kiezelstrand',
  cala: "Cala",
  rots: 'Rotsstrand',
};

export default function StrandenPage() {
  return (
    <GuideCategoryPage
      config={{
        apiType: 'beaches',
        title: 'Stranden aan de Costa Brava',
        badge: 'Stranden',
        subtitle: "Van verborgen cala's tot uitgestrekte zandstranden — de mooiste kust van Spanje.",
        heroImage: '/images/costa-brava-beach.jpg',
        basePath: '/blog/stranden',
        filters: [
          {
            key: 'beach_type',
            label: 'Alle types',
            options: [
              { value: 'zand', label: 'Zandstrand' },
              { value: 'kiezel', label: 'Kiezelstrand' },
              { value: 'cala', label: "Cala" },
              { value: 'rots', label: 'Rotsstrand' },
            ],
          },
        ],
        renderBadges: (item) => (
          <>
            {item.beach_type && (
              <span className="bg-ocean text-white text-xs font-semibold px-2 py-0.5 rounded-full shadow">
                {beachTypeLabels[String(item.beach_type)] || String(item.beach_type)}
              </span>
            )}
            {item.blue_flag && (
              <span className="bg-blue-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full shadow">🏴 Blue Flag</span>
            )}
          </>
        ),
        renderMeta: (item) => (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            {item.town && <span>{String(item.town)}</span>}
            {item.length_meters && <span>· {Number(item.length_meters)}m</span>}
          </div>
        ),
      }}
    />
  );
}
