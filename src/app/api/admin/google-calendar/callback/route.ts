import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForRefreshToken } from '@/lib/google-calendar';

// Callback van /auth — wisselt code om voor refresh_token en toont 'm in
// een simpele HTML-pagina zodat Laurens 'm kan kopiëren naar Vercel env.
// Daarna nooit meer nodig (tenzij token revoked).
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');
  if (error) {
    return new NextResponse(`<pre>OAuth error: ${error}</pre>`, {
      status: 400, headers: { 'Content-Type': 'text/html' },
    });
  }
  if (!code) {
    return new NextResponse('<pre>No code in callback.</pre>', {
      status: 400, headers: { 'Content-Type': 'text/html' },
    });
  }

  const base = process.env.PUBLIC_BASE_URL || url.origin;
  const redirectUri = `${base}/api/admin/google-calendar/callback`;

  try {
    const tokens = await exchangeCodeForRefreshToken(code, redirectUri);
    const refreshToken = tokens.refresh_token || '⚠️ NIET ONTVANGEN — je had al eerder consent gegeven. Revoke de access in https://myaccount.google.com/permissions en probeer opnieuw.';
    const html = `<!DOCTYPE html>
<html lang="nl"><head><meta charset="utf-8"><title>Google Calendar gekoppeld</title>
<style>
  body { font-family: -apple-system, system-ui, sans-serif; max-width: 720px; margin: 60px auto; padding: 0 20px; color: #1F2A36; }
  h1 { font-size: 22px; margin-bottom: 8px; }
  p { line-height: 1.6; }
  code, pre { background: #F5F7F9; padding: 12px 14px; border-radius: 8px; display: block; font-size: 13px; overflow-x: auto; word-break: break-all; }
  .ok { background: #DCFCE7; color: #166534; padding: 8px 12px; border-radius: 6px; display: inline-block; }
  .next { background: #FEF3C7; padding: 14px 16px; border-radius: 8px; margin-top: 20px; }
</style></head>
<body>
  <span class="ok">✓ Consent ontvangen</span>
  <h1>Google Calendar gekoppeld</h1>
  <p>Plak het refresh_token hieronder in Vercel als env var <strong>GOOGLE_REFRESH_TOKEN</strong>:</p>
  <pre>${refreshToken}</pre>
  <p>Plus deze andere als nog niet gezet:</p>
  <ul>
    <li><strong>GOOGLE_CALENDAR_ID</strong>: 'primary' (of een specifieke calendar-id uit Google Calendar settings)</li>
    <li><strong>GOOGLE_CLIENT_ID</strong> + <strong>GOOGLE_CLIENT_SECRET</strong>: al gezet</li>
  </ul>
  <div class="next">
    <strong>Volgende stap:</strong> na env-update redeploy je Vercel, dan triggert de cron <code style="display:inline;padding:2px 6px">/api/cron/calendar-sync</code> elk uur — of klik handmatig "Sync agenda" in <a href="/admin/planning">/admin/planning</a>.
  </div>
</body></html>`;
    return new NextResponse(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    return new NextResponse(`<pre>Token exchange failed:\n${msg}</pre>`, {
      status: 500, headers: { 'Content-Type': 'text/html' },
    });
  }
}
