import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  listStockItems, createStockItem, logActivity, getAdminInfo,
} from '@/lib/db';

const createSchema = z.object({
  kind: z.enum(['caravan', 'camper']).default('caravan'),
  brand: z.string().min(1).max(150),
  model: z.string().min(1).max(200),
  year: z.number().int().min(1950).max(2100).optional().nullable(),
  km: z.number().int().min(0).max(2_000_000).optional().nullable(),
  length_m: z.number().min(0).max(20).optional().nullable(),
  price_eur: z.number().min(0).max(1_000_000).optional().nullable(),
  status: z.enum(['available', 'new', 'reserved', 'sold', 'draft']).default('available'),
  slug: z.string().max(160).optional().nullable(),
  description: z.string().max(5000).optional().nullable(),
  hero_photo_url: z.string().url().optional().nullable(),
  gallery_urls: z.array(z.string().url()).max(20).default([]),
});

function slugify(s: string): string {
  return s.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 160);
}

export async function GET() {
  try {
    const items = await listStockItems();
    return NextResponse.json({ items });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues.map((i) => i.message).join(', ') }, { status: 400 });
    }
    const d = parsed.data;
    const slug = d.slug || slugify(`${d.brand}-${d.model}-${d.year || ''}-${Date.now().toString(36)}`);
    const item = await createStockItem({ ...d, slug });
    const admin = getAdminInfo(req);
    await logActivity({
      actor: admin.name, role: admin.role,
      action: 'Voorraad toegevoegd',
      entityType: 'stock_item',
      entityId: String(item.id),
      entityLabel: `${item.brand} ${item.model}`,
    });
    return NextResponse.json({ item });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
