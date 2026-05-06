import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  updateCustomerCaravan, deleteCustomerCaravan, logActivity, getAdminInfo,
} from '@/lib/db';

const schema = z.object({
  kind: z.enum(['caravan', 'camper']).optional(),
  brand: z.string().max(150).nullable().optional(),
  model: z.string().max(200).nullable().optional(),
  year: z.number().int().min(1950).max(2100).nullable().optional(),
  registration: z.string().max(40).nullable().optional(),
  length_m: z.number().min(0).max(20).nullable().optional(),
  spot_code: z.string().max(40).nullable().optional(),
  storage_type: z.enum(['binnen', 'overdekt', 'buiten']).nullable().optional(),
  contract_start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  contract_renew: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  insurance_provider: z.string().max(150).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const idNum = Number(id);
  if (!Number.isFinite(idNum)) return NextResponse.json({ error: 'invalid id' }, { status: 400 });
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues.map((i) => i.message).join(', ') }, { status: 400 });
    }
    const item = await updateCustomerCaravan(idNum, parsed.data);
    if (!item) return NextResponse.json({ error: 'not found' }, { status: 404 });
    const admin = getAdminInfo(req);
    await logActivity({
      actor: admin.name, role: admin.role,
      action: 'Caravan-koppeling bijgewerkt',
      entityType: 'customer_caravan',
      entityId: String(item.id),
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
    const ok = await deleteCustomerCaravan(idNum);
    if (!ok) return NextResponse.json({ error: 'not found' }, { status: 404 });
    const admin = getAdminInfo(req);
    await logActivity({
      actor: admin.name, role: admin.role,
      action: 'Caravan-koppeling verwijderd',
      entityType: 'customer_caravan',
      entityId: String(idNum),
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
