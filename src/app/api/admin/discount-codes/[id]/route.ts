import { NextResponse } from 'next/server';
import { updateDiscountCode } from '@/lib/db';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    await updateDiscountCode(parseInt(id), body);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Discount code update error:', error);
    return NextResponse.json({ error: 'Failed to update discount code' }, { status: 500 });
  }
}
