import { NextRequest, NextResponse } from 'next/server';
import { getAllContracts, createContract } from '@/lib/db';
import { validateBody, contractSchema } from '@/lib/validations';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const limit = Math.min(500, Math.max(1, parseInt(url.searchParams.get('limit') || '50')));
    const status = url.searchParams.get('status') || undefined;
    const search = url.searchParams.get('search') || undefined;
    const result = await getAllContracts(page, limit, status, search);
    return NextResponse.json({ contracts: result.contracts, total: result.total, page, limit });
  } catch (error) {
    console.error('Contracts GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch contracts' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = validateBody(contractSchema, body);
    if (!validated.success) return NextResponse.json({ error: validated.error }, { status: 400 });
    const contract = await createContract(validated.data);
    return NextResponse.json({ contract }, { status: 201 });
  } catch (error) {
    console.error('Contract POST error:', error);
    return NextResponse.json({ error: 'Failed to create contract' }, { status: 500 });
  }
}
