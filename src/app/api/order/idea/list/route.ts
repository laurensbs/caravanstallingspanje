import { NextResponse } from 'next/server';
import { listFeaturedIdeas } from '@/lib/db';

// Publieke lijst van ideeën waar admin op heeft gemarkeerd als featured /
// shortlist / in_progress. Niet alle inzendingen — anders krijg je
// rommel publiek.
export async function GET() {
  try {
    const ideas = await listFeaturedIdeas();
    return NextResponse.json({ ideas });
  } catch (err) {
    console.error('public ideas list:', err);
    return NextResponse.json({ ideas: [] });
  }
}
