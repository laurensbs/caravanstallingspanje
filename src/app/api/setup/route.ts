import { NextResponse } from 'next/server';
import { initDatabase } from '@/lib/db';

async function handleSetup() {
  try {
    await initDatabase();
    return NextResponse.json({ success: true, message: 'Database initialized successfully' });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json({ error: 'Failed to initialize database' }, { status: 500 });
  }
}

export async function GET() {
  return handleSetup();
}

export async function POST() {
  return handleSetup();
}
