import { NextRequest, NextResponse } from 'next/server';
import { getAllContracts, createContract } from '@/lib/db';
import { validateBody, contractSchema } from '@/lib/validations';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const status = url.searchParams.get('status') || undefined;
    const contracts = await getAllContracts(status);
    return NextResponse.json({ contracts, total: contracts.length });
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
