import { NextRequest, NextResponse } from 'next/server';
import { initDatabase } from '@/lib/db';

function verifySetupKey(request: NextRequest): boolean {
  const key = process.env.SETUP_SECRET_KEY;
  if (!key) return false;
  const provided = request.headers.get('x-setup-key') || new URL(request.url).searchParams.get('key');
  if (!provided) return false;
  return key === provided;
}

async function handleSetup(request: NextRequest) {
  if (!verifySetupKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    await initDatabase();
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
