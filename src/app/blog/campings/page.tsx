'use client';
import GuideCategoryPage from '@/components/GuideCategoryPage';
import { Star, Tent } from 'lucide-react';

export default function CampingsPage() {
  return (
    <GuideCategoryPage
      config={{
        apiType: 'campings',
        title: 'Campings aan de Costa Brava',
        badge: 'Campings',
        subtitle: 'Ontdek de beste campings in de regio — van luxe resorts tot knusse familiecampings.',
        heroImage: '/images/costa-brava-camping.jpg',
        basePath: '/blog/campings',
        filters: [
          {
            key: 'stars',
            label: 'Alle sterren',
            options: [
              { value: '5', label: '5 sterren' },
              { value: '4', label: '4 sterren' },
              { value: '3', label: '3 sterren' },
              { value: '2', label: '2 sterren' },
              { value: '1', label: '1 ster' },
            ],
          },
        ],
        renderBadges: (item) => (
          <>
            {Number(item.stars) > 0 && (
              <span className="flex items-center gap-0.5 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full shadow">
                <Star size={10} fill="currentColor" /> {String(item.stars)}
              </span>
            )}
            {item.is_featured && (
              <span className="bg-primary text-white text-xs font-semibold px-2 py-0.5 rounded-full shadow">Aanbevolen</span>
            )}
          </>
        ),
        renderMeta: (item) => (
          <div className="flex items-center gap-1 text-xs text-warm-gray">
            {item.town && <span>{String(item.town)}</span>}
            {item.town && item.price_range && <span>·</span>}
            {item.price_range && <span>{String(item.price_range)}</span>}
          </div>
        ),
      }}
    />
  );
}
