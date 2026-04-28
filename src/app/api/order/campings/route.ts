import { NextResponse } from 'next/server';
import { getCampingSuggestions } from '@/lib/db';

export async function GET() {
  try {
    const campings = await getCampingSuggestions();
    return NextResponse.json({ campings });
  } catch (error) {
    console.error('Campings GET error:', error);
    return NextResponse.json({ campings: [] });
  }
}
