import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const id = req.headers.get('x-staff-id');
  const name = req.headers.get('x-staff-name');
  const role = req.headers.get('x-staff-role');
  if (!id) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  return NextResponse.json({ id: Number(id), name, role });
}
