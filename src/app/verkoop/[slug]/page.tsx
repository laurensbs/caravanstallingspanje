import { notFound } from 'next/navigation';
import { getStockItemBySlug } from '@/lib/db';
import StockDetailClient from './StockDetailClient';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function StockDetailPage({ params }: Props) {
  const { slug } = await params;
  const row = await getStockItemBySlug(slug);
  if (!row || row.status === 'draft') notFound();

  const gallery = Array.isArray(row.gallery_urls) ? row.gallery_urls as string[] : [];

  return (
    <StockDetailClient
      item={{
        id: row.id,
        slug: row.slug || `item-${row.id}`,
        kind: row.kind,
        brand: row.brand,
        model: row.model,
        year: row.year,
        km: row.km,
        length_m: row.length_m ? Number(row.length_m) : null,
        price_eur: row.price_eur ? Number(row.price_eur) : null,
        status: row.status,
        description: row.description,
        hero_photo_url: row.hero_photo_url,
        gallery_urls: gallery,
      }}
    />
  );
}
