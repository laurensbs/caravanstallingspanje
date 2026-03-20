'use client';
import GuideCategoryPage from '@/components/GuideCategoryPage';
import { MapPin } from 'lucide-react';

export default function PlaatsenPage() {
  return (
    <GuideCategoryPage
      config={{
        apiType: 'places',
        title: 'Plaatsen aan de Costa Brava',
        badge: 'Plaatsen',
        subtitle: 'Van middeleeuwse dorpjes tot bruisende kuststeden — ontdek de mooiste plekken.',
        heroImage: '/images/costa-brava-places.jpg',
        basePath: '/blog/plaatsen',
        renderBadges: (item) => (
          <>
            {item.is_featured && (
              <span className="bg-primary text-white text-xs font-semibold px-2 py-0.5 rounded-full shadow">Aanbevolen</span>
            )}
          </>
        ),
        renderMeta: (item) => (
          <div className="flex items-center gap-1 text-xs text-warm-gray">
            {item.region && <span>{String(item.region)}</span>}
            {item.population && <span>· {Number(item.population).toLocaleString('nl-NL')} inwoners</span>}
          </div>
        ),
      }}
    />
  );
}
