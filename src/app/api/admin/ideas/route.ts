import { NextRequest, NextResponse } from 'next/server';
import { listIdeas } from '@/lib/db';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const status = url.searchParams.get('status') || undefined;
  try {
    const ideas = await listIdeas(status);
    return NextResponse.json({ ideas });
  } catch (err) {
    console.error('ideas list error:', err);
    return NextResponse.json({ ideas: [] }, { status: 500 });
  }
}
