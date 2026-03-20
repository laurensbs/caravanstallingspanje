'use client';
import GuideCategoryPage from '@/components/GuideCategoryPage';
import { UtensilsCrossed } from 'lucide-react';

export default function RestaurantsPage() {
  return (
    <GuideCategoryPage
      config={{
        apiType: 'restaurants',
        title: 'Restaurants aan de Costa Brava',
        badge: 'Restaurants',
        subtitle: 'Van authentieke Catalaanse tapas tot verfijnde kust-gastronomie.',
        heroImage: '/images/costa-brava-restaurant.jpg',
        basePath: '/blog/restaurants',
        filters: [
          {
            key: 'cuisine_type',
            label: 'Alle keukens',
            options: [
              { value: 'Catalaans', label: 'Catalaans' },
              { value: 'Spaans', label: 'Spaans' },
              { value: 'Mediterraan', label: 'Mediterraan' },
              { value: 'Vis & Zeevruchten', label: 'Vis & Zeevruchten' },
              { value: 'Internationaal', label: 'Internationaal' },
              { value: 'Tapas', label: 'Tapas' },
            ],
          },
        ],
        renderBadges: (item) => (
          <>
            {item.cuisine_type && (
              <span className="bg-primary text-white text-[11px] font-semibold px-2 py-0.5 rounded-full shadow">
                {String(item.cuisine_type)}
              </span>
            )}
            {item.michelin_stars && Number(item.michelin_stars) > 0 && (
              <span className="bg-red-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow">
                ★ Michelin {String(item.michelin_stars)}
              </span>
            )}
          </>
        ),
        renderMeta: (item) => (
          <div className="flex items-center gap-1 text-xs text-warm-gray">
            {item.town && <span>{String(item.town)}</span>}
            {item.price_range && <span>· {String(item.price_range)}</span>}
          </div>
        ),
      }}
    />
  );
}
