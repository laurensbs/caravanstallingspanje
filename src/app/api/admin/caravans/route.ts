import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  createCustomerCaravan, logActivity, getAdminInfo,
} from '@/lib/db';

const schema = z.object({
  customer_id: z.number().int().positive(),
  kind: z.enum(['caravan', 'camper']).default('caravan'),
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues.map((i) => i.message).join(', ') }, { status: 400 });
    }
    const item = await createCustomerCaravan(parsed.data);
    const admin = getAdminInfo(req);
    await logActivity({
      actor: admin.name, role: admin.role,
      action: 'Caravan gekoppeld aan klant',
      entityType: 'customer_caravan',
      entityId: String(item.id),
      entityLabel: `${item.brand || ''} ${item.model || ''}`.trim() || `caravan #${item.id}`,
    });
    return NextResponse.json({ item });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
