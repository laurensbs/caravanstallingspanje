import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import crypto from 'crypto';

// Digital contract signing API
// Creates a signing token, verifies signature, stores signed contract

async function ensureSigningTable() {
  await sql`CREATE TABLE IF NOT EXISTS contract_signatures (
    id SERIAL PRIMARY KEY,
    contract_id INTEGER NOT NULL REFERENCES contracts(id),
    customer_id INTEGER NOT NULL REFERENCES customers(id),
    sign_token TEXT UNIQUE NOT NULL,
    signed_at TIMESTAMP,
    ip_address TEXT,
    user_agent TEXT,
    signature_data TEXT,
    status TEXT DEFAULT 'pending',
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
  )`;
  await sql`CREATE INDEX IF NOT EXISTS idx_sign_token ON contract_signatures(sign_token)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_sign_contract ON contract_signatures(contract_id)`;
}

// POST: Create signing request for a contract
export async function POST(request: NextRequest) {
  try {
    await ensureSigningTable();
    const body = await request.json();
    const { contract_id } = body;

    if (!contract_id) {
      return NextResponse.json({ error: 'contract_id is required' }, { status: 400 });
    }

    // Get contract + customer info
    const contract = await sql`
      SELECT co.*, cu.id as cust_id, cu.first_name, cu.last_name, cu.email
      FROM contracts co
      JOIN customers cu ON co.customer_id = cu.id
      WHERE co.id = ${Number(contract_id)}
    `;
    if (!contract[0]) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    // Generate secure token
    const signToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 day expiry

    await sql`
      INSERT INTO contract_signatures (contract_id, customer_id, sign_token, expires_at)
      VALUES (${Number(contract_id)}, ${contract[0].cust_id}, ${signToken}, ${expiresAt.toISOString()})
    `;

    const signingUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://caravanstalling-spanje.com'}/contract/ondertekenen?token=${signToken}`;

    // Notify customer
    await sql`
      INSERT INTO notifications (user_type, user_id, title, message, link)
      VALUES ('customer', ${contract[0].cust_id}, 'Contract ter ondertekening', 
              ${'Contract ' + contract[0].contract_number + ' staat klaar om te ondertekenen.'}, 
              ${'/contract/ondertekenen?token=' + signToken})
    `;

    return NextResponse.json({
      signing_url: signingUrl,
      sign_token: signToken,
      expires_at: expiresAt.toISOString(),
      contract: {
        id: contract[0].id,
        contract_number: contract[0].contract_number,
        customer_name: contract[0].first_name + ' ' + contract[0].last_name,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Contract signing POST error:', error);
    return NextResponse.json({ error: 'Failed to create signing request' }, { status: 500 });
  }
}

// GET: Verify token and get contract details for signing page
export async function GET(request: NextRequest) {
  try {
    await ensureSigningTable();
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const sig = await sql`
      SELECT cs.*, co.contract_number, co.start_date, co.end_date, co.monthly_rate, co.deposit, co.auto_renew,
             cu.first_name, cu.last_name, cu.email, cu.address, cu.city, cu.postal_code,
             l.name as location_name,
             ca.brand as caravan_brand, ca.model as caravan_model, ca.license_plate
      FROM contract_signatures cs
      JOIN contracts co ON cs.contract_id = co.id
      JOIN customers cu ON cs.customer_id = cu.id
      LEFT JOIN locations l ON co.location_id = l.id
      LEFT JOIN caravans ca ON co.caravan_id = ca.id
      WHERE cs.sign_token = ${token}
    `;

    if (!sig[0]) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 404 });
    }

    if (sig[0].status === 'signed') {
      return NextResponse.json({ error: 'Contract already signed', signed_at: sig[0].signed_at }, { status: 409 });
    }

    if (new Date(sig[0].expires_at) < new Date()) {
      return NextResponse.json({ error: 'Signing link expired' }, { status: 410 });
    }

    return NextResponse.json({
      contract: {
        contract_number: sig[0].contract_number,
        start_date: sig[0].start_date,
        end_date: sig[0].end_date,
        monthly_rate: sig[0].monthly_rate,
        deposit: sig[0].deposit,
        auto_renew: sig[0].auto_renew,
        location_name: sig[0].location_name,
        caravan: `${sig[0].caravan_brand} ${sig[0].caravan_model || ''}`.trim(),
        license_plate: sig[0].license_plate,
      },
      customer: {
        name: `${sig[0].first_name} ${sig[0].last_name}`,
        email: sig[0].email,
        address: sig[0].address,
        city: sig[0].city,
        postal_code: sig[0].postal_code,
      },
      expires_at: sig[0].expires_at,
    });
  } catch (error) {
    console.error('Contract signing GET error:', error);
    return NextResponse.json({ error: 'Failed to verify signing link' }, { status: 500 });
  }
}
