import { NextRequest, NextResponse } from 'next/server';
import {
  getCustomersNeedingHoldedSync,
  setCustomerHoldedLink,
  setCustomerHoldedSnapshot,
  logActivity,
} from '@/lib/db';
import {
  findContactByEmail, pushContactToHolded, updateContactInHolded,
  getContactById,
} from '@/lib/holded';
import { log } from '@/lib/log';

// Periodieke twee-richtings sync klant ↔ Holded. Cron pakt 50 klanten
// die aandacht nodig hebben en handelt ze één voor één af:
//   1) holded_contact_id ontbreekt → match-by-email of create
//   2) holded_sync_failed = true → push huidige DB-state opnieuw
//   3) gewoon verlopen (>7 dagen) → pull snapshot terug naar DB
//
// Auth: Vercel cron stuurt Bearer ${CRON_SECRET}. Admin-handmatig POST
// zonder secret is alleen toegestaan in dev (dan is CRON_SECRET leeg).
//
// Idempotent: faalt 1 klant, gaat de volgende gewoon door. Status komt
// in summary.errors.
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  const auth = req.headers.get('authorization') || '';
  return auth === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  return run();
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  return run();
}

async function run() {
  const summary = { linked: 0, created: 0, pushed: 0, pulled: 0, errors: 0, processed: 0 };

  let customers;
  try {
    customers = await getCustomersNeedingHoldedSync(50);
  } catch (err) {
    log.error('holded_customers_sync_list_failed', err);
    return NextResponse.json({ ok: false, error: 'list failed' }, { status: 500 });
  }

  for (const c of customers) {
    summary.processed++;
    try {
      // Zonder email kunnen we niet matchen — overslaan, blijft staan tot
      // admin een email zet.
      if (!c.email) continue;

      // ─── Geval 1: nog niet gekoppeld
      if (!c.holded_contact_id) {
        const match = await findContactByEmail(c.email);
        if (match?.id) {
          await setCustomerHoldedLink(c.id, match.id, true);
          // Pull meteen snapshot zodat lokale row aansluit op Holded.
          await setCustomerHoldedSnapshot(c.id, match as unknown as Record<string, unknown>).catch(() => {});
          summary.linked++;
          continue;
        }
        // Geen match → aanmaken in Holded
        const newId = await pushContactToHolded({
          name: c.name,
          email: c.email,
          phone: c.phone,
          mobile: c.mobile,
          address: c.address,
          city: c.city,
          postal_code: c.postal_code,
          country: c.country,
          vat_number: c.vat_number,
        });
        await setCustomerHoldedLink(c.id, newId, true);
        summary.created++;
        continue;
      }

      // ─── Geval 2: vorige push faalde — retry push
      if (c.holded_sync_failed) {
        await updateContactInHolded(c.holded_contact_id, {
          name: c.name,
          email: c.email,
          phone: c.phone,
          mobile: c.mobile,
          address: c.address,
          city: c.city,
          postal_code: c.postal_code,
          country: c.country,
          vat_number: c.vat_number,
        });
        await setCustomerHoldedLink(c.id, c.holded_contact_id, true);
        summary.pushed++;
        continue;
      }

      // ─── Geval 3: snapshot verversen
      const live = await getContactById(c.holded_contact_id);
      if (live) {
        await setCustomerHoldedSnapshot(c.id, live as unknown as Record<string, unknown>);
        await setCustomerHoldedLink(c.id, c.holded_contact_id, true);
        summary.pulled++;
      } else {
        // Holded heeft contact niet meer — markeer faal, admin kan re-link.
        await setCustomerHoldedLink(c.id, c.holded_contact_id, false);
        summary.errors++;
      }
    } catch (err) {
      summary.errors++;
      log.error('holded_customers_sync_one_failed', err, { customer_id: c.id });
      try {
        if (c.holded_contact_id) {
          await setCustomerHoldedLink(c.id, c.holded_contact_id, false);
        }
      } catch { /* noop */ }
    }
  }

  await logActivity({
    action: 'Holded klant-sync uitgevoerd',
    entityType: 'cron',
    details: `processed=${summary.processed} linked=${summary.linked} created=${summary.created} pushed=${summary.pushed} pulled=${summary.pulled} err=${summary.errors}`,
  }).catch(() => {});

  log.info('holded_customers_sync_done', summary);
  return NextResponse.json({ ok: true, ...summary });
}
