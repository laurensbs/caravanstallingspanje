'use client';
import GuideDetailPage from '@/components/GuideDetailPage';
import { Star } from 'lucide-react';

export default function CampingDetailPage() {
  return (
    <GuideDetailPage
      config={{
        apiType: 'campings',
        backLabel: 'Alle campings',
        backHref: '/blog/campings',
        renderBadges: (item) => (
          <>
            {Number(item.stars) > 0 && (
              <span className="flex items-center gap-0.5 bg-yellow-400 text-yellow-900 text-xs font-bold px-2.5 py-0.5 rounded-full shadow">
                <Star size={10} fill="currentColor" /> {String(item.stars)} sterren
              </span>
            )}
            {item.price_range && (
              <span className="bg-white/20 backdrop-blur text-white text-xs font-semibold px-2.5 py-0.5 rounded-full">{String(item.price_range)}</span>
            )}
          </>
        ),
        renderInfo: (item) => (
          <div className="space-y-3 text-sm">
            {Number(item.stars) > 0 && (
              <div className="flex justify-between"><span className="text-gray-500">Sterren</span><span className="font-semibold flex items-center gap-1">{Array.from({ length: Number(item.stars) }).map((_, i) => <Star key={i} size={12} fill="#EAB308" className="text-yellow-500" />)}</span></div>
            )}
            {item.price_range && <div className="flex justify-between"><span className="text-gray-500">Prijsklasse</span><span className="font-semibold">{String(item.price_range)}</span></div>}
            {item.town && <div className="flex justify-between"><span className="text-gray-500">Plaats</span><span className="font-semibold">{String(item.town)}</span></div>}
            {item.region && <div className="flex justify-between"><span className="text-gray-500">Regio</span><span className="font-semibold">{String(item.region)}</span></div>}
          </div>
        ),
        renderAmenities: (item) => {
          const amenities = Array.isArray(item.amenities) ? item.amenities as string[] : [];
          const highlights = Array.isArray(item.highlights) ? item.highlights as string[] : [];
          if (amenities.length === 0 && highlights.length === 0) return null;
          return (
            <>
              {amenities.length > 0 && (
                <>
                  <h2 className="text-lg font-bold mb-3">Voorzieningen</h2>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {amenities.map(a => <span key={a} className="bg-gray-100 text-gray-900 text-xs font-medium px-3 py-1.5 rounded-full">{a}</span>)}
                  </div>
                </>
              )}
              {highlights.length > 0 && (
                <>
                  <h2 className="text-lg font-bold mb-3">Highlights</h2>
                  <div className="flex flex-wrap gap-2">
                    {highlights.map(h => <span key={h} className="bg-primary/10 text-primary text-xs font-medium px-3 py-1.5 rounded-full">{h}</span>)}
                  </div>
                </>
              )}
            </>
          );
        },
      }}
    />
  );
}
