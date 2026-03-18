import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken, verifyStaffToken, verifyCustomerToken } from '@/lib/auth';

// ── Simple in-memory rate limiter ──
const rateMap = new Map<string, { count: number; reset: number }>();
const RATE_LIMIT = 60; // requests per window
const RATE_WINDOW = 60_000; // 1 minute

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

// ── Security headers ──
function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('Permissions-Policy', 'camera=(self), microphone=(), geolocation=(self)');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://images.unsplash.com https://*.googleapis.com https://*.gstatic.com blob:; frame-src https://www.google.com https://maps.google.com https://js.stripe.com; connect-src 'self' https://api.stripe.com https://*.neon.tech; object-src 'none'; base-uri 'self'"
  );
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // ── Rate limiting on API routes ──
  if (pathname.startsWith('/api/')) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: 'Te veel verzoeken. Probeer het later opnieuw.' }, { status: 429 });
    }
  }

  // ── Admin subdomain ──
  if (hostname.startsWith('admin.')) {
    if (pathname.startsWith('/api/')) return addSecurityHeaders(NextResponse.next());
    if (pathname === '/login') return addSecurityHeaders(NextResponse.next());
    const url = request.nextUrl.clone();
    url.pathname = `/admin${pathname}`;
    return addSecurityHeaders(NextResponse.rewrite(url));
  }

  // ── Staff subdomain ──
  if (hostname.startsWith('staff.')) {
    if (pathname.startsWith('/api/')) return addSecurityHeaders(NextResponse.next());
    if (pathname === '/login') return addSecurityHeaders(NextResponse.next());
    const url = request.nextUrl.clone();
    url.pathname = `/staff${pathname}`;
    return addSecurityHeaders(NextResponse.rewrite(url));
  }

  // ── Protect /api/admin/* (except auth) ──
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

  // ── Protect /api/staff/* (except auth) ──
  if (pathname.startsWith('/api/staff') && !pathname.startsWith('/api/staff/auth')) {
    const cookie = request.cookies.get('staff_token')?.value;
    const authHeader = request.headers.get('authorization');
    const token = cookie || (authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null);
    if (!token) return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 });
    const session = await verifyStaffToken(token);
    if (!session) return NextResponse.json({ error: 'Sessie verlopen' }, { status: 401 });
    const response = NextResponse.next();
    response.headers.set('x-staff-id', String(session.id));
    response.headers.set('x-staff-name', session.name);
    response.headers.set('x-staff-role', session.role);
    if (session.locationId) response.headers.set('x-staff-location', String(session.locationId));
    return addSecurityHeaders(response);
  }

  // ── Protect /api/customer/* (except auth) ──
  if (pathname.startsWith('/api/customer') && !pathname.startsWith('/api/customer/auth')) {
    const cookie = request.cookies.get('customer_token')?.value;
    const authHeader = request.headers.get('authorization');
    const token = cookie || (authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null);
    if (!token) return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 });
    const session = await verifyCustomerToken(token);
    if (!session) return NextResponse.json({ error: 'Sessie verlopen' }, { status: 401 });
    const response = NextResponse.next();
    response.headers.set('x-customer-id', String(session.id));
    response.headers.set('x-customer-email', session.email);
    response.headers.set('x-customer-name', session.name);
    return addSecurityHeaders(response);
  }

  return addSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images|manifest\\.json|sw\\.js).*)'],
};
