import { NextResponse } from 'next/server';
import { getAllReviews } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const published = searchParams.get('published');
    const pubFilter = published === 'true' ? true : published === 'false' ? false : undefined;
    const data = await getAllReviews(page, limit, pubFilter);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Reviews error:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}
