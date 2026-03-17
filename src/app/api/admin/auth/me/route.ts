import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const id = req.headers.get('x-admin-id');
  const name = req.headers.get('x-admin-name');
  const role = req.headers.get('x-admin-role');
  if (!id) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  return NextResponse.json({ id: Number(id), name, role });
}
