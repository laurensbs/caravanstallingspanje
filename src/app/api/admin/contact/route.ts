import { NextRequest, NextResponse } from 'next/server';
import { listContactMessages } from '@/lib/db';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const status = url.searchParams.get('status') || undefined;
  try {
    const messages = await listContactMessages(status);
    return NextResponse.json({ messages });
  } catch (err) {
    console.error('contact list error:', err);
    return NextResponse.json({ messages: [] }, { status: 500 });
  }
}
