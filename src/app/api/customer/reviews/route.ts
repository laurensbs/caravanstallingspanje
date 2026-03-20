import { NextRequest, NextResponse } from 'next/server';
import { createReview, getPublishedReviews } from '@/lib/db';
import { getCustomerSession } from '@/lib/auth';

export async function GET() {
  try {
    const reviews = await getPublishedReviews(20);
    return NextResponse.json({ reviews });
  } catch (error) {
    console.error('Reviews error:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('customer_token')?.value;
    if (!token) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
    const session = await getCustomerSession(token);
    if (!session) return NextResponse.json({ error: 'Ongeldige sessie' }, { status: 401 });
    const body = await req.json();
    if (!body.rating || body.rating < 1 || body.rating > 5) {
      return NextResponse.json({ error: 'Beoordeling tussen 1 en 5 is verplicht' }, { status: 400 });
    }
    const review = await createReview({ customer_id: session.id, service_request_id: body.service_request_id, rating: body.rating, title: body.title, comment: body.comment });
    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    console.error('Create review error:', error);
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}
