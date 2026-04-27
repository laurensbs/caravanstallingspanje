import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value;
  if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const session = await verifyAdminToken(token);
  if (!session) return NextResponse.json({ error: 'Session expired' }, { status: 401 });
  return NextResponse.json({ id: session.id, name: session.name, role: session.role });
}
