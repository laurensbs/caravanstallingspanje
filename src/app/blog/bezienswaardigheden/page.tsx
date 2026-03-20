'use client';
import GuideCategoryPage from '@/components/GuideCategoryPage';

const categoryLabels: Record<string, string> = {
  museum: 'Museum',
  natuur: 'Natuur',
  historisch: 'Historisch',
  activiteit: 'Activiteit',
  park: 'Park',
};

const categoryColors: Record<string, string> = {
  museum: 'bg-purple-500',
  natuur: 'bg-accent',
  historisch: 'bg-amber-600',
  activiteit: 'bg-primary',
  park: 'bg-accent',
};

export default function BezienswaardigheidPage() {
  return (
    <GuideCategoryPage
      config={{
        apiType: 'attractions',
        title: 'Bezienswaardigheden',
        badge: 'Bezienswaardigheden',
        subtitle: 'Musea, natuur, historische dorpen en meer — de highlights van de Costa Brava.',
        heroImage: '/images/costa-brava-attraction.jpg',
        basePath: '/blog/bezienswaardigheden',
        filters: [
          {
            key: 'category',
            label: 'Alle categorieën',
            options: [
              { value: 'museum', label: 'Museum' },
              { value: 'natuur', label: 'Natuur' },
              { value: 'historisch', label: 'Historisch' },
              { value: 'activiteit', label: 'Activiteit' },
              { value: 'park', label: 'Park' },
            ],
          },
        ],
        renderBadges: (item) => (
          <>
            {item.category && (
              <span className={`${categoryColors[String(item.category)] || 'bg-warm-gray'} text-white text-[11px] font-semibold px-2 py-0.5 rounded-full shadow`}>
                {categoryLabels[String(item.category)] || String(item.category)}
              </span>
            )}
            {item.is_featured && (
              <span className="bg-primary text-white text-[11px] font-semibold px-2 py-0.5 rounded-full shadow">Aanbevolen</span>
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
