'use client';
import GuideDetailPage from '@/components/GuideDetailPage';

const beachTypeLabels: Record<string, string> = {
  zand: 'Zandstrand',
  kiezel: 'Kiezelstrand',
  cala: "Cala",
  rots: 'Rotsstrand',
};

export default function StrandDetailPage() {
  return (
    <GuideDetailPage
      config={{
        apiType: 'beaches',
        backLabel: 'Alle stranden',
        backHref: '/blog/stranden',
        renderBadges: (item) => (
          <>
            {item.beach_type && (
              <span className="bg-ocean text-white text-xs font-semibold px-2.5 py-0.5 rounded-full shadow">
                {beachTypeLabels[String(item.beach_type)] || String(item.beach_type)}
              </span>
            )}
            {item.blue_flag && (
              <span className="bg-blue-500 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full shadow">🏴 Blue Flag</span>
            )}
          </>
        ),
        renderInfo: (item) => (
          <div className="space-y-3 text-sm">
            {item.beach_type && <div className="flex justify-between"><span className="text-gray-500">Type</span><span className="font-semibold">{beachTypeLabels[String(item.beach_type)] || String(item.beach_type)}</span></div>}
            {item.length_meters && <div className="flex justify-between"><span className="text-gray-500">Lengte</span><span className="font-semibold">{Number(item.length_meters)}m</span></div>}
            {item.town && <div className="flex justify-between"><span className="text-gray-500">Plaats</span><span className="font-semibold">{String(item.town)}</span></div>}
            {item.blue_flag && <div className="flex justify-between"><span className="text-gray-500">Blue Flag</span><span className="font-semibold text-blue-500">Ja</span></div>}
          </div>
        ),
        renderAmenities: (item) => {
          const facilities = Array.isArray(item.facilities) ? item.facilities as string[] : [];
          if (facilities.length === 0) return null;
          return (
            <>
              <h2 className="text-lg font-bold mb-3">Voorzieningen</h2>
              <div className="flex flex-wrap gap-2">
                {facilities.map(f => <span key={f} className="bg-ocean/10 text-ocean text-xs font-medium px-3 py-1.5 rounded-full">{f}</span>)}
              </div>
            </>
          );
        },
      }}
    />
  );
}
