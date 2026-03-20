'use client';
import GuideDetailPage from '@/components/GuideDetailPage';
import { Star } from 'lucide-react';

export default function RestaurantDetailPage() {
  return (
    <GuideDetailPage
      config={{
        apiType: 'restaurants',
        backLabel: 'Alle restaurants',
        backHref: '/blog/restaurants',
        renderBadges: (item) => (
          <>
            {item.cuisine_type && (
              <span className="bg-primary text-white text-xs font-semibold px-2.5 py-0.5 rounded-full shadow">
                {String(item.cuisine_type)}
              </span>
            )}
            {item.michelin_stars && Number(item.michelin_stars) > 0 && (
              <span className="bg-red-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-full shadow">
                ★ Michelin {String(item.michelin_stars)}
              </span>
            )}
            {item.price_range && (
              <span className="bg-white/20 backdrop-blur text-white text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {String(item.price_range)}
              </span>
            )}
          </>
        ),
        renderInfo: (item) => (
          <div className="space-y-3 text-sm">
            {item.cuisine_type && <div className="flex justify-between"><span className="text-gray-500">Keuken</span><span className="font-semibold">{String(item.cuisine_type)}</span></div>}
            {item.price_range && <div className="flex justify-between"><span className="text-gray-500">Prijsklasse</span><span className="font-semibold">{String(item.price_range)}</span></div>}
            {item.town && <div className="flex justify-between"><span className="text-gray-500">Plaats</span><span className="font-semibold">{String(item.town)}</span></div>}
            {item.michelin_stars && Number(item.michelin_stars) > 0 && (
              <div className="flex justify-between"><span className="text-gray-500">Michelin</span><span className="font-semibold text-red-600">{'★'.repeat(Number(item.michelin_stars))}</span></div>
            )}
          </div>
        ),
        renderAmenities: (item) => {
          const specialties = Array.isArray(item.specialties) ? item.specialties as string[] : [];
          if (specialties.length === 0) return null;
          return (
            <>
              <h2 className="text-lg font-bold mb-3">Specialiteiten</h2>
              <div className="flex flex-wrap gap-2">
                {specialties.map(s => <span key={s} className="bg-primary/10 text-primary text-xs font-medium px-3 py-1.5 rounded-full">{s}</span>)}
              </div>
            </>
          );
        },
      }}
    />
  );
}
