import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken, verifyStaffToken } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // ── Admin subdomain ──
  if (hostname.startsWith('admin.')) {
    if (pathname.startsWith('/api/')) return NextResponse.next();
    if (pathname === '/login') return NextResponse.next();
    // Rewrite all admin subdomain requests to /admin/*
    const url = request.nextUrl.clone();
    url.pathname = `/admin${pathname}`;
    return NextResponse.rewrite(url);
  }

  // ── Staff subdomain ──
  if (hostname.startsWith('staff.')) {
    if (pathname.startsWith('/api/')) return NextResponse.next();
    if (pathname === '/login') return NextResponse.next();
    const url = request.nextUrl.clone();
    url.pathname = `/staff${pathname}`;
    return NextResponse.rewrite(url);
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
    return response;
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
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images/).*)'],
};
