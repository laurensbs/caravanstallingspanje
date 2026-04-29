import { NextRequest, NextResponse } from 'next/server';
import {
  getStallingRequestById, updateStallingRequest, deleteStallingRequest,
  markStallingCustomerNotified, getSettings,
  logActivity, getAdminInfo,
} from '@/lib/db';
import { sendMail, stallingApprovedHtml, stallingRejectedHtml } from '@/lib/email';
import { formatRef } from '@/lib/refs';

type StallingFields = { status?: string; email?: string; name?: string; start_date?: string; notified_status?: string | null };

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const entry = await getStallingRequestById(Number(id));
  if (!entry) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json({ entry });
}

export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const idNum = Number(id);
  const body = await req.json();
  const admin = getAdminInfo(req);

  const before = await getStallingRequestById(idNum) as StallingFields | null;
  await updateStallingRequest(idNum, body);
  await logActivity({
    actor: admin.name, role: admin.role,
    action: 'Stalling bijgewerkt',
    entityType: 'stalling_request',
    entityId: id,
  });

  const after = await getStallingRequestById(idNum) as StallingFields | null;

  // Klant-notificatie bij overgang naar 'akkoord'/'betaald' of 'afgewezen'.
  // Idempotent: alleen als notified_status nog niet matcht.
  if (after && before) {
    const prevStatus = before.status;
    const newStatus = after.status;
    const alreadyNotified = before.notified_status === newStatus;
    const notifiableStatuses = ['akkoord', 'betaald', 'afgewezen'];
    if (newStatus && newStatus !== prevStatus && notifiableStatuses.includes(newStatus) && !alreadyNotified) {
      try {
        const ref = formatRef('stalling', idNum);
        if (newStatus === 'akkoord' || newStatus === 'betaald') {
          const map = await getSettings(['stalling_address']);
          const address = typeof map.stalling_address === 'string'
            ? map.stalling_address
            : 'Stalling Cruïlles, Cruïlles (Girona), Spanje';
          const mail = stallingApprovedHtml({
            name: after.name || 'klant',
            address,
            startDate: after.start_date || '',
            reference: ref,
          });
          await sendMail({ to: after.email!, subject: mail.subject, html: mail.html, text: mail.text });
          await markStallingCustomerNotified(idNum, newStatus);
          await logActivity({
            actor: admin.name, role: admin.role,
            action: 'Stalling-mail verstuurd: akkoord',
            entityType: 'stalling_request',
            entityId: id,
            entityLabel: after.email,
          });
        } else if (newStatus === 'afgewezen') {
          const mail = stallingRejectedHtml({
            name: after.name || 'klant',
            reference: ref,
          });
          await sendMail({ to: after.email!, subject: mail.subject, html: mail.html, text: mail.text });
          await markStallingCustomerNotified(idNum, newStatus);
          await logActivity({
            actor: admin.name, role: admin.role,
            action: 'Stalling-mail verstuurd: afgewezen',
            entityType: 'stalling_request',
            entityId: id,
            entityLabel: after.email,
          });
        }
      } catch (err) {
        // Fail-soft: PUT slaagt nog steeds, alleen mail-fout in log.
        await logActivity({
          actor: admin.name, role: admin.role,
          action: 'Stalling-mail mislukt',
          entityType: 'stalling_request',
          entityId: id,
          details: err instanceof Error ? err.message : 'unknown',
        });
      }
    }
  }

  return NextResponse.json({ entry: after });
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const admin = getAdminInfo(req);
  await deleteStallingRequest(Number(id));
  await logActivity({
    actor: admin.name, role: admin.role,
    action: 'Stalling verwijderd',
    entityType: 'stalling_request',
    entityId: id,
  });
  return NextResponse.json({ success: true });
}
