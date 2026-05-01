import { NextRequest, NextResponse } from 'next/server';
import {
  listAllContacts, type HoldedContact,
} from '@/lib/holded';
import {
  getCustomerByEmail, getCustomerByHoldedId, createCustomer, updateCustomer,
  logActivity, getAdminInfo,
} from '@/lib/db';

export const maxDuration = 60;

// Eenmalige import / her-sync van alle Holded-contacten naar onze lokale
// customers-tabel. Idempotent: bestaande matches worden bijgewerkt, geen
// dubbels.
export async function POST(req: NextRequest) {
  const admin = getAdminInfo(req);
  let imported = 0;
  let updated = 0;
  let skipped = 0;
  const errors: { email: string | undefined; reason: string }[] = [];
  try {
    const contacts: HoldedContact[] = await listAllContacts();
    for (const c of contacts) {
      if (!c.id || !c.name) { skipped++; continue; }

      // 1. Match op holded_contact_id (snelste pad).
      let existing = await getCustomerByHoldedId(c.id);
      // 2. Anders match op email.
      if (!existing && c.email) {
        existing = await getCustomerByEmail(c.email);
      }

      const addr = c.address;
      try {
        if (existing) {
          await updateCustomer(existing.id, {
            name: c.name,
            email: c.email || null,
            phone: c.phone || null,
            mobile: c.mobile || null,
            address: addr?.address || null,
            city: addr?.city || null,
            postal_code: addr?.postalCode || null,
            country: addr?.country || null,
            vat_number: c.vatnumber || null,
            holded_contact_id: c.id,
          });
          updated++;
        } else {
          await createCustomer({
            name: c.name,
            email: c.email || null,
            phone: c.phone || null,
            mobile: c.mobile || null,
            address: addr?.address || null,
            city: addr?.city || null,
            postal_code: addr?.postalCode || null,
            country: addr?.country || 'ES',
            vat_number: c.vatnumber || null,
            holded_contact_id: c.id,
            source: 'holded_import',
          });
          imported++;
        }
      } catch (err) {
        // Duplicate-key (bv. dubbele email in Holded zelf) of andere
        // per-rij-fout: skippen en doorgaan, niet de hele import killen.
        const msg = err instanceof Error ? err.message : 'unknown';
        errors.push({ email: c.email, reason: msg });
        skipped++;
      }
    }
    await logActivity({
      actor: admin.name, role: admin.role,
      action: 'Klanten geïmporteerd uit Holded',
      entityType: 'customer',
      details: `imported=${imported} updated=${updated} skipped=${skipped}`,
    });
    return NextResponse.json({
      imported, updated, skipped, total: contacts.length,
      errors: errors.slice(0, 20),
    });
  } catch (err) {
    console.error('holded import error:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'import failed' }, { status: 500 });
  }
}
