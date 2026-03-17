import { NextRequest, NextResponse } from 'next/server';
import { getAllContracts, createContract } from '@/lib/db';

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
    const data = await req.json();
    const contract = await createContract(data);
    return NextResponse.json({ contract }, { status: 201 });
  } catch (error) {
    console.error('Contract POST error:', error);
    return NextResponse.json({ error: 'Failed to create contract' }, { status: 500 });
  }
}
