import VerkoopClient, { type PublicStockItem } from './VerkoopClient';
import { listStockItems } from '@/lib/db';

// Server-component zodat de voorraad live uit de DB komt en SEO-vriendelijk
// SSR'd wordt. Admin beheert items via /admin/voorraad.
export const dynamic = 'force-dynamic';

export default async function VerkoopPage() {
  let items: PublicStockItem[] = [];
  try {
    const rows = await listStockItems({ onlyVisible: true });
    items = rows
      .filter((r) => r.status !== 'draft')
      .map((r) => ({
        id: r.id,
        slug: r.slug || `item-${r.id}`,
        kind: r.kind,
        brand: r.brand,
        model: r.model,
        year: r.year,
        km: r.km,
        price_eur: r.price_eur ? Number(r.price_eur) : null,
        status: r.status,
        hero_photo_url: r.hero_photo_url,
      }));
  } catch (err) {
    console.warn('[verkoop] stock fetch failed, showing empty:', err);
  }
  return <VerkoopClient items={items} />;
}
