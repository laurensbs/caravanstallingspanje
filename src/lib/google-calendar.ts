// Google Calendar API client. Server-to-server (offline) via OAuth refresh-
// token flow. Eenmalige consent door Laurens via /api/admin/google-calendar/auth
// genereert een refresh_token, daarna draait de cron geheel autonoom.
//
// Env vars (zet in Vercel + .env.local):
//   GOOGLE_CLIENT_ID
//   GOOGLE_CLIENT_SECRET
//   GOOGLE_REFRESH_TOKEN     ← na eerste consent invullen
//   GOOGLE_CALENDAR_ID       ← 'primary' of een specifieke calendar-id
//   GOOGLE_OAUTH_REDIRECT    ← bv https://caravanstallingspanje.vercel.app/api/admin/google-calendar/callback

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const CAL_BASE = 'https://www.googleapis.com/calendar/v3';

export function googleConfigStatus(): {
  hasClient: boolean;
  hasRefreshToken: boolean;
  calendarId: string | null;
} {
  return {
    hasClient: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    hasRefreshToken: Boolean(process.env.GOOGLE_REFRESH_TOKEN),
    calendarId: process.env.GOOGLE_CALENDAR_ID || null,
  };
}

let cachedAccessToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedAccessToken && cachedAccessToken.expiresAt > Date.now() + 30_000) {
    return cachedAccessToken.token;
  }
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Google Calendar niet geconfigureerd (GOOGLE_CLIENT_ID / SECRET / REFRESH_TOKEN ontbreken).');
  }
  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  });
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google token refresh failed: ${res.status} ${text}`);
  }
  const data = await res.json() as { access_token: string; expires_in: number };
  cachedAccessToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return data.access_token;
}

// Wissel authorization-code (uit consent-callback) om voor refresh_token.
// Gebruikt door /api/admin/google-calendar/callback.
export async function exchangeCodeForRefreshToken(code: string, redirectUri: string): Promise<{
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope: string;
}> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET ontbreken.');
  }
  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code,
    grant_type: 'authorization_code',
    redirect_uri: redirectUri,
  });
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Code exchange failed: ${res.status} ${text}`);
  }
  return res.json();
}

export type GoogleEvent = {
  id: string;
  status: string;
  summary?: string;
  description?: string;
  location?: string;
  htmlLink?: string;
  creator?: { email?: string };
  start?: { dateTime?: string; date?: string; timeZone?: string };
  end?: { dateTime?: string; date?: string; timeZone?: string };
};

// List events tussen 2 datums. updatedMin gebruiken we voor incremental sync.
// orderBy=updated zodat verwijderde events eerst komen (status=cancelled).
export async function listEvents(opts: {
  calendarId: string;
  timeMin?: string;
  timeMax?: string;
  updatedMin?: string;
  pageToken?: string;
  maxResults?: number;
}): Promise<{ items: GoogleEvent[]; nextPageToken?: string; nextSyncToken?: string }> {
  const token = await getAccessToken();
  const params = new URLSearchParams({
    singleEvents: 'true',
    orderBy: 'startTime',
    showDeleted: 'true',
    maxResults: String(opts.maxResults ?? 250),
  });
  if (opts.timeMin) params.set('timeMin', opts.timeMin);
  if (opts.timeMax) params.set('timeMax', opts.timeMax);
  if (opts.updatedMin) params.set('updatedMin', opts.updatedMin);
  if (opts.pageToken) params.set('pageToken', opts.pageToken);

  const url = `${CAL_BASE}/calendars/${encodeURIComponent(opts.calendarId)}/events?${params.toString()}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google list events failed: ${res.status} ${text}`);
  }
  return res.json();
}
