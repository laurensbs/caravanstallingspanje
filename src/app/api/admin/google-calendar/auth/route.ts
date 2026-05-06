import { NextRequest, NextResponse } from 'next/server';

// Eenmalige helper: redirect Laurens naar Google OAuth consent. Na consent
// gaat Google terug naar /api/admin/google-calendar/callback met een code,
// die we daar inwisselen voor een refresh_token. Dat token plak je dan
// in env var GOOGLE_REFRESH_TOKEN.
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: 'GOOGLE_CLIENT_ID ontbreekt.' }, { status: 503 });
  }
  const base = process.env.PUBLIC_BASE_URL || new URL(req.url).origin;
  const redirectUri = `${base}/api/admin/google-calendar/callback`;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/calendar.readonly',
    access_type: 'offline',
    prompt: 'consent',
    include_granted_scopes: 'true',
  });
  const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  return NextResponse.redirect(url);
}
