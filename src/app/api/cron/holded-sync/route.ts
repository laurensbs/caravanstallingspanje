import { NextRequest, NextResponse } from 'next/server';
import {
  getInvoicedBookingsForSync,
  getInvoicedStallingForSync,
  getInvoicedTransportForSync,
  getInvoicedServiceIntakesForSync,
  setBookingInvoiceStatus,
  setStallingInvoiceStatus,
  setTransportInvoiceStatus,
  setPendingIntakeInvoiceStatus,
  logActivity,
} from '@/lib/db';
import { getInvoice } from '@/lib/holded';
import { log } from '@/lib/log';

// Vercel cron of admin-handmatig. Pakt batch facturen op die nog niet
// gesynced zijn (of ouder dan 50 min) en haalt status uit Holded.
// Authenticatie: Vercel cron stuurt een bearer-token in header
// `authorization: Bearer ${process.env.CRON_SECRET}`. Voor admin-handmatig
// aanroepen via knop: zelfde secret, ook in dev via .env.local.
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // dev: geen secret = open
  const auth = req.headers.get('authorization') || '';
  return auth === `Bearer ${secret}`;
}

type Row = { id: number | string; holded_invoice_id: string };

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  return runSync();
}

export async function POST(req: NextRequest) {
  // Admin kan handmatig triggeren vanuit dashboard.
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  return runSync();
}

async function runSync() {
  const summary = { bookings: 0, stalling: 0, transport: 0, services: 0, errors: 0 };

  const [bookings, stalling, transports, services] = await Promise.all([
    getInvoicedBookingsForSync().catch(() => []),
    getInvoicedStallingForSync().catch(() => []),
    getInvoicedTransportForSync().catch(() => []),
    getInvoicedServiceIntakesForSync().catch(() => []),
  ]);

  for (const r of bookings as unknown as Row[]) {
    try {
      const inv = await getInvoice(r.holded_invoice_id);
      await setBookingInvoiceStatus(Number(r.id), inv?.status ?? 'unknown', inv?.publicUrl ?? null);
      summary.bookings++;
    } catch (err) {
      summary.errors++;
      log.error('holded_sync_booking_failed', err, { booking_id: r.id });
    }
  }

  for (const r of stalling as unknown as Row[]) {
    try {
      const inv = await getInvoice(r.holded_invoice_id);
      await setStallingInvoiceStatus(Number(r.id), inv?.status ?? 'unknown', inv?.publicUrl ?? null);
      summary.stalling++;
    } catch (err) {
      summary.errors++;
      log.error('holded_sync_stalling_failed', err, { stalling_id: r.id });
    }
  }

  for (const r of transports as unknown as Row[]) {
    try {
      const inv = await getInvoice(r.holded_invoice_id);
      await setTransportInvoiceStatus(Number(r.id), inv?.status ?? 'unknown', inv?.publicUrl ?? null);
      summary.transport++;
    } catch (err) {
      summary.errors++;
      log.error('holded_sync_transport_failed', err, { transport_id: r.id });
    }
  }

  for (const r of services as unknown as Row[]) {
    try {
      const inv = await getInvoice(r.holded_invoice_id);
      await setPendingIntakeInvoiceStatus(Number(r.id), inv?.status ?? 'unknown', inv?.publicUrl ?? null);
      summary.services++;
    } catch (err) {
      summary.errors++;
      log.error('holded_sync_service_failed', err, { intake_id: r.id });
    }
  }

  await logActivity({
    action: 'Holded factuur-sync uitgevoerd',
    entityType: 'cron',
    details: `b=${summary.bookings} s=${summary.stalling} t=${summary.transport} sv=${summary.services} e=${summary.errors}`,
  }).catch(() => {});

  log.info('holded_sync_done', summary);
  return NextResponse.json({ ok: true, ...summary });
}
