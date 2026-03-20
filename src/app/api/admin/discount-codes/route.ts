import { NextResponse } from 'next/server';
import { getAllDiscountCodes, createDiscountCode } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const data = await getAllDiscountCodes(page, limit);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Discount codes error:', error);
    return NextResponse.json({ error: 'Failed to fetch discount codes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.code || !body.type || !body.value) {
      return NextResponse.json({ error: 'Code, type en waarde zijn verplicht' }, { status: 400 });
    }
    const code = await createDiscountCode(body);
    return NextResponse.json({ code }, { status: 201 });
  } catch (error) {
    console.error('Create discount code error:', error);
    return NextResponse.json({ error: 'Failed to create discount code' }, { status: 500 });
  }
}
