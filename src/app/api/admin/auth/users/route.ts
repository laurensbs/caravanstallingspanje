import { NextResponse } from 'next/server';
import { getActiveAdmins } from '@/lib/db';

export async function GET() {
  try {
    const admins = await getActiveAdmins();
    const list = (admins as unknown as { id: number; name: string; role: string }[]).map(a => ({
      id: a.id,
      name: a.name,
      role: a.role,
    }));
    return NextResponse.json({ admins: list });
  } catch (error) {
    console.error('Auth users GET error:', error);
    return NextResponse.json({ error: 'Kon gebruikers niet ophalen' }, { status: 500 });
  }
}
