import { NextResponse } from 'next/server';
import { getAdminByEmail, createAdmin, logActivity } from '@/lib/db';
import { hashPassword } from '@/lib/passwords';

// Idempotent endpoint om Helens account aan te maken op een al-gedeployde DB.
// Niet via /api/setup omdat die soms een SETUP_SECRET_KEY vereist; deze zit
// achter de gewone admin-auth (alleen ingelogde admins kunnen 'm triggeren).
export async function GET() {
  try {
    const email = 'helen@caravanstalling-spanje.com';
    const existing = await getAdminByEmail(email);
    if (existing) {
      return NextResponse.json({
        ok: true,
        already_exists: true,
        message: `Helen bestaat al (id ${existing.id}). Niets gedaan.`,
      });
    }
    const hash = await hashPassword('admin1234');
    await createAdmin('Helen', email, hash, 'admin', true);
    await logActivity({
      action: 'Admin Helen aangemaakt (must_change_password)',
      entityType: 'admin_user',
      entityLabel: email,
    });
    return NextResponse.json({
      ok: true,
      created: true,
      email,
      tempPassword: 'admin1234',
      message: 'Helen kan nu inloggen met admin1234. Bij eerste login moet ze een eigen wachtwoord kiezen.',
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
