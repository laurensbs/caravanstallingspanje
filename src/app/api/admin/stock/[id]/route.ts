import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  getStockItemById, updateStockItem, deleteStockItem, logActivity, getAdminInfo,
} from '@/lib/db';

const updateSchema = z.object({
  kind: z.enum(['caravan', 'camper']).optional(),
  brand: z.string().min(1).max(150).optional(),
  model: z.string().min(1).max(200).optional(),
  year: z.number().int().min(1950).max(2100).nullable().optional(),
  km: z.number().int().min(0).max(2_000_000).nullable().optional(),
  length_m: z.number().min(0).max(20).nullable().optional(),
  price_eur: z.number().min(0).max(1_000_000).nullable().optional(),
  status: z.enum(['available', 'new', 'reserved', 'sold', 'draft']).optional(),
  slug: z.string().max(160).nullable().optional(),
  description: z.string().max(5000).nullable().optional(),
  hero_photo_url: z.string().url().nullable().optional(),
  gallery_urls: z.array(z.string().url()).max(20).optional(),
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const idNum = Number(id);
  if (!Number.isFinite(idNum)) return NextResponse.json({ error: 'invalid id' }, { status: 400 });
  const item = await getStockItemById(idNum);
  if (!item) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json({ item });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const idNum = Number(id);
  if (!Number.isFinite(idNum)) return NextResponse.json({ error: 'invalid id' }, { status: 400 });
  try {
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues.map((i) => i.message).join(', ') }, { status: 400 });
    }
    const item = await updateStockItem(idNum, parsed.data);
    if (!item) return NextResponse.json({ error: 'not found' }, { status: 404 });
    const admin = getAdminInfo(req);
    await logActivity({
      actor: admin.name, role: admin.role,
      action: 'Voorraad gewijzigd',
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

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const idNum = Number(id);
  if (!Number.isFinite(idNum)) return NextResponse.json({ error: 'invalid id' }, { status: 400 });
  try {
    const ok = await deleteStockItem(idNum);
    if (!ok) return NextResponse.json({ error: 'not found' }, { status: 404 });
    const admin = getAdminInfo(req);
    await logActivity({
      actor: admin.name, role: admin.role,
      action: 'Voorraad verwijderd',
      entityType: 'stock_item',
      entityId: String(idNum),
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
