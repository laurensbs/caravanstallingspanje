import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken, verifyCustomerToken, verifyCustomerTokenWithExp, createCustomerToken } from '@/lib/auth';

// Sliding-session: als customer_token binnen REFRESH_THRESHOLD_S verloopt,
// re-issue 'm zodat actieve klanten niet ineens uitgelogd worden bij een
// 7-daagse JWT die net is verlopen. Drempel: laatste 24u van de geldigheid.
const REFRESH_THRESHOLD_S = 24 * 60 * 60;
const COOKIE_MAX_AGE_S = 7 * 24 * 60 * 60;

async function maybeRefreshCustomerCookie(token: string, response: NextResponse): Promise<void> {
  const session = await verifyCustomerTokenWithExp(token);
  if (!session) return;
  const remaining = session.exp - Math.floor(Date.now() / 1000);
  if (remaining > REFRESH_THRESHOLD_S) return;
  // Re-issue met dezelfde payload — exp wordt automatisch +7d.
  const fresh = await createCustomerToken({
    id: session.id, email: session.email, name: session.name,
  });
  response.cookies.set('customer_token', fresh, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE_S,
    path: '/',
  });
}

const rateMap = new Map<string, { count: number; reset: number }>();
const RATE_LIMIT = 60;
const RATE_WINDOW = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now > entry.reset) {
    rateMap.set(ip, { count: 1, reset: now + RATE_WINDOW });
    return true;
  }
  entry.count++;
  return entry.count <= RATE_LIMIT;
}

function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  // CSP. img-src is ruim om alle externe foto-bronnen te accepteren:
  //  - cubeupload (admin uploadt camping- en logo-foto's daar)
  //  - caravanverhuurspanje.com (zustersite host eigen foto's)
  //  - Gumlet (video-thumbnails op /caravan-huren)
  //  - Wikimedia (locatie-foto's bij bestemmingen)
  //  - https: in algemene zin als veiligheidsnet zodat 1 nieuwe host
  //    niet meteen de site sloopt; wij optimaliseren tóch alleen wat
  //    Next/Image whitelist toelaat in next.config.
  // connect-src bevat Open-Meteo (weer-api topbar) + caravanverhuur-hub
  // (live campings/services) + Gumlet (HLS-stream).
  // media-src is nieuw voor de mp4/HLS video op /caravan-huren.
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self' data:",
    "img-src 'self' data: blob: https:",
    "media-src 'self' blob: https://*.gumlet.io https://*.gumlet.com",
    "connect-src 'self' https://*.neon.tech https://api.holded.com https://api.stripe.com https://checkout.stripe.com https://api.open-meteo.com https://caravanverhuurspanje.com https://*.gumlet.io https://*.gumlet.com",
    "frame-src 'self' https://checkout.stripe.com https://js.stripe.com https://play.gumlet.io https://www.google.com",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; ');
  response.headers.set('Content-Security-Policy', csp);
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api/')) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: 'Te veel verzoeken. Probeer het later opnieuw.' }, { status: 429 });
    }
  }

  if (pathname.startsWith('/api/admin') && !pathname.startsWith('/api/admin/auth')) {
    const cookie = request.cookies.get('admin_token')?.value;
    const authHeader = request.headers.get('authorization');
    const token = cookie || (authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null);
    if (!token) return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 });
    const session = await verifyAdminToken(token);
    if (!session) return NextResponse.json({ error: 'Sessie verlopen' }, { status: 401 });
    const response = NextResponse.next();
    response.headers.set('x-admin-id', String(session.id));
    response.headers.set('x-admin-name', session.name);
    response.headers.set('x-admin-role', session.role);
    return addSecurityHeaders(response);
  }

  // Customer-portal page-routes: redirect naar /account/login als geen
  // geldige customer-sessie. /login en /wachtwoord-wijzigen zelf zijn vrij.
  if (
    pathname.startsWith('/account')
    && !pathname.startsWith('/account/login')
    && !pathname.startsWith('/account/welkom')
    && !pathname.startsWith('/account/wachtwoord-vergeten')
    && !pathname.startsWith('/account/wachtwoord-wijzigen')
  ) {
    const token = request.cookies.get('customer_token')?.value;
    const session = token ? await verifyCustomerToken(token) : null;
    if (!session) {
      const url = request.nextUrl.clone();
      url.pathname = '/account/login';
      url.search = '';
      return NextResponse.redirect(url);
    }
    // Sliding-session: refresh cookie als 'm bijna verloopt zodat actieve
    // klanten niet ineens uitgelogd raken.
    const response = NextResponse.next();
    if (token) await maybeRefreshCustomerCookie(token, response);
    return addSecurityHeaders(response);
  }

  // Customer-portal API: alle endpoints vereisen sessie behalve /login
  // en /logout. /me en /change-password etc. checken zelf nog een keer
  // (defense in depth) maar middleware geeft een snelle 401 zonder DB-hit.
  if (
    pathname.startsWith('/api/account')
    && !pathname.startsWith('/api/account/login')
    && !pathname.startsWith('/api/account/logout')
    && !pathname.startsWith('/api/account/welcome-password')
    && !pathname.startsWith('/api/account/forgot-password')
  ) {
    const token = request.cookies.get('customer_token')?.value;
    const session = token ? await verifyCustomerToken(token) : null;
    if (!session) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
    // Sliding-session: ook bij API-calls cookie verlengen indien bijna afgelopen.
    const response = NextResponse.next();
    if (token) await maybeRefreshCustomerCookie(token, response);
    return addSecurityHeaders(response);
  }

  return addSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
