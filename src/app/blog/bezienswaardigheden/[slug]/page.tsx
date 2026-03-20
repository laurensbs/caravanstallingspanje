'use client';
import GuideDetailPage from '@/components/GuideDetailPage';

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

export default function AttractionDetailPage() {
  return (
    <GuideDetailPage
      config={{
        apiType: 'attractions',
        backLabel: 'Alle bezienswaardigheden',
        backHref: '/blog/bezienswaardigheden',
        renderBadges: (item) => (
          <>
            {item.category && (
              <span className={`${categoryColors[String(item.category)] || 'bg-warm-gray'} text-white text-xs font-semibold px-2.5 py-0.5 rounded-full shadow`}>
                {categoryLabels[String(item.category)] || String(item.category)}
              </span>
            )}
          </>
        ),
        renderInfo: (item) => (
          <div className="space-y-3 text-sm">
            {item.category && <div className="flex justify-between"><span className="text-warm-gray">Categorie</span><span className="font-semibold">{categoryLabels[String(item.category)] || String(item.category)}</span></div>}
            {item.town && <div className="flex justify-between"><span className="text-warm-gray">Plaats</span><span className="font-semibold">{String(item.town)}</span></div>}
            {item.region && <div className="flex justify-between"><span className="text-warm-gray">Regio</span><span className="font-semibold">{String(item.region)}</span></div>}
            {item.price_range && <div className="flex justify-between"><span className="text-warm-gray">Prijs</span><span className="font-semibold">{String(item.price_range)}</span></div>}
          </div>
        ),
        renderAmenities: (item) => {
          const highlights = Array.isArray(item.highlights) ? item.highlights as string[] : [];
          if (highlights.length === 0) return null;
          return (
            <>
              <h2 className="text-lg font-black mb-3">Highlights</h2>
              <div className="flex flex-wrap gap-2">
                {highlights.map(h => <span key={h} className="bg-primary/10 text-primary text-xs font-medium px-3 py-1.5 rounded-full">{h}</span>)}
              </div>
            </>
          );
        },
      }}
    />
  );
}
