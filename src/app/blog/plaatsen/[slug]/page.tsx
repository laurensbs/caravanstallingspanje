'use client';
import GuideDetailPage from '@/components/GuideDetailPage';
import { Users } from 'lucide-react';

export default function PlaatsDetailPage() {
  return (
    <GuideDetailPage
      config={{
        apiType: 'places',
        backLabel: 'Alle plaatsen',
        backHref: '/blog/plaatsen',
        renderBadges: (item) => (
          <>
            {item.is_featured && (
              <span className="bg-primary text-white text-xs font-semibold px-2.5 py-0.5 rounded-full shadow">Aanbevolen</span>
            )}
          </>
        ),
        renderInfo: (item) => (
          <div className="space-y-3 text-sm">
            {item.region && <div className="flex justify-between"><span className="text-gray-500">Regio</span><span className="font-semibold">{String(item.region)}</span></div>}
            {item.population && <div className="flex justify-between"><span className="text-gray-500">Inwoners</span><span className="font-semibold">{Number(item.population).toLocaleString('nl-NL')}</span></div>}
          </div>
        ),
        renderAmenities: (item) => {
          const highlights = Array.isArray(item.highlights) ? item.highlights as string[] : [];
          if (highlights.length === 0) return null;
          return (
            <>
              <h2 className="text-lg font-bold mb-3">Bezienswaardigheden</h2>
              <div className="flex flex-wrap gap-2">
                {highlights.map(h => <span key={h} className="bg-accent/10 text-accent text-xs font-medium px-3 py-1.5 rounded-full">{h}</span>)}
              </div>
            </>
          );
        },
      }}
    />
  );
}
