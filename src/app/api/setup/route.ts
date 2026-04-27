import { NextRequest, NextResponse } from 'next/server';
import { initDatabase, getAdminByEmail, createAdmin } from '@/lib/db';
import { hashPassword } from '@/lib/passwords';

function verifySetupKey(request: NextRequest): boolean {
  const key = process.env.SETUP_SECRET_KEY || process.env.ADMIN_SECRET;
  if (!key) return false;
  const provided = request.headers.get('x-setup-key') || new URL(request.url).searchParams.get('key');
  if (!provided) return false;
  return key === provided;
}

async function handleSetup(request: NextRequest) {
  // Allow setup without key if no key is configured (first-time setup)
  const hasKey = !!(process.env.SETUP_SECRET_KEY || process.env.ADMIN_SECRET);
  if (hasKey && !verifySetupKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    await initDatabase();

    // Seed admin accounts
    const accounts = [
      { name: 'Jake', email: 'jake@caravanstalling-spanje.com', role: 'admin' },
      { name: 'Johan', email: 'johan@caravanstalling-spanje.com', role: 'admin' },
      { name: 'Laurens', email: 'laurens@caravanstalling-spanje.com', role: 'admin' },
    ];
    const defaultPassword = 'admin1234';

    for (const account of accounts) {
      const existing = await getAdminByEmail(account.email);
      if (!existing) {
        const hash = await hashPassword(defaultPassword);
        await createAdmin(account.name, account.email, hash, account.role);
      }
    }

    // Keep legacy default admin for backwards compatibility
    const defaultEmail = process.env.ADMIN_EMAIL || 'admin@caravanstalling-spanje.com';
    const defaultAdminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const existingDefault = await getAdminByEmail(defaultEmail);
    if (!existingDefault) {
      const hash = await hashPassword(defaultAdminPassword);
      await createAdmin('Admin', defaultEmail, hash, 'admin');
    }

    return NextResponse.json({ success: true, message: 'Database initialized successfully' });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json({ error: 'Failed to initialize database' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return handleSetup(request);
}

export async function POST(request: NextRequest) {
  return handleSetup(request);
}
