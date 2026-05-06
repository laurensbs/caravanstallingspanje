import { NextRequest, NextResponse } from 'next/server';
import {
  listEvents, googleConfigStatus, type GoogleEvent,
} from '@/lib/google-calendar';
import {
  upsertCalendarEvent, deleteCalendarEvent, logActivity,
} from '@/lib/db';
import { log } from '@/lib/log';

// Sync Google Calendar → calendar_events tabel. Cron draait elk uur (Vercel)
// of admin-handmatig vanuit /admin/planning. Pakt events ±60 dagen rondom
// vandaag — ruim genoeg voor planning, en kort genoeg om geen gigantische
// historie binnen te halen.
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
  const cfg = googleConfigStatus();
  if (!cfg.hasClient) {
    return NextResponse.json({ error: 'GOOGLE_CLIENT_ID / SECRET ontbreken.' }, { status: 503 });
  }
  if (!cfg.hasRefreshToken) {
    return NextResponse.json({ error: 'GOOGLE_REFRESH_TOKEN ontbreekt — bezoek /api/admin/google-calendar/auth om consent te geven.' }, { status: 503 });
  }

  const calendarId = cfg.calendarId || 'primary';
  const now = new Date();
  const past = new Date(now); past.setDate(past.getDate() - 30);
  const future = new Date(now); future.setDate(future.getDate() + 90);

  const summary = { upserted: 0, deleted: 0, errors: 0, pages: 0 };

  try {
    let pageToken: string | undefined;
    do {
      const page = await listEvents({
        calendarId,
        timeMin: past.toISOString(),
        timeMax: future.toISOString(),
        pageToken,
        maxResults: 250,
      });
      summary.pages++;

      for (const ev of page.items) {
        try {
          if (ev.status === 'cancelled') {
            await deleteCalendarEvent(ev.id);
            summary.deleted++;
            continue;
          }
          await upsertCalendarEvent({
            google_event_id: ev.id,
            calendar_id: calendarId,
            summary: ev.summary || null,
            description: ev.description || null,
            location: ev.location || null,
            start_time: extractStart(ev),
            end_time: extractEnd(ev),
            all_day: Boolean(ev.start?.date && !ev.start?.dateTime),
            status: ev.status || null,
            html_link: ev.htmlLink || null,
            creator_email: ev.creator?.email || null,
            raw: ev as unknown as Record<string, unknown>,
          });
          summary.upserted++;
        } catch (err) {
          summary.errors++;
          log.error('calendar_sync_event_failed', err, { event_id: ev.id });
        }
      }
      pageToken = page.nextPageToken;
    } while (pageToken);
  } catch (err) {
    log.error('calendar_sync_failed', err);
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : 'sync failed', ...summary }, { status: 500 });
  }

  await logActivity({
    action: 'Google Calendar sync',
    entityType: 'cron',
    details: `upserted=${summary.upserted} deleted=${summary.deleted} err=${summary.errors}`,
  }).catch(() => {});

  log.info('calendar_sync_done', summary);
  return NextResponse.json({ ok: true, ...summary });
}

function extractStart(ev: GoogleEvent): string | null {
  return ev.start?.dateTime || (ev.start?.date ? `${ev.start.date}T00:00:00Z` : null);
}
function extractEnd(ev: GoogleEvent): string | null {
  return ev.end?.dateTime || (ev.end?.date ? `${ev.end.date}T00:00:00Z` : null);
}
