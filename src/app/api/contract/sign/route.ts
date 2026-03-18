import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

// Sign a contract with digital signature
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, signature_data, agreed_terms } = body;

    if (!token || !signature_data || !agreed_terms) {
      return NextResponse.json({ error: 'Token, signature and terms agreement required' }, { status: 400 });
    }

    const sig = await sql`
      SELECT cs.*, co.contract_number, co.customer_id
      FROM contract_signatures cs
      JOIN contracts co ON cs.contract_id = co.id
      WHERE cs.sign_token = ${token} AND cs.status = 'pending'
    `;

    if (!sig[0]) {
      return NextResponse.json({ error: 'Invalid or already signed' }, { status: 404 });
    }

    if (new Date(sig[0].expires_at) < new Date()) {
      return NextResponse.json({ error: 'Signing link expired' }, { status: 410 });
    }

    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const ua = request.headers.get('user-agent') || 'unknown';

    // Store signature  
    await sql`
      UPDATE contract_signatures 
      SET status = 'signed', signed_at = NOW(), ip_address = ${ip}, user_agent = ${ua}, signature_data = ${signature_data}
      WHERE id = ${sig[0].id}
    `;

    // Update contract status to actief (if not already)
    await sql`UPDATE contracts SET status = 'actief', updated_at = NOW() WHERE id = ${sig[0].contract_id}`;

    // Log activity
    await sql`
      INSERT INTO activity_log (actor, role, action, entity_type, entity_id, entity_label, details)
      VALUES ('Klant', 'customer', 'Contract digitaal ondertekend', 'contract', ${String(sig[0].contract_id)}, ${sig[0].contract_number}, ${'IP: ' + ip})
    `;

    // Notify admin
    await sql`
      INSERT INTO notifications (user_type, user_id, title, message, link)
      VALUES ('admin', 1, 'Contract ondertekend', ${'Contract ' + sig[0].contract_number + ' is digitaal ondertekend.'}, '/admin/contracten')
    `;

    return NextResponse.json({ 
      success: true, 
      contract_number: sig[0].contract_number,
      signed_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Sign contract error:', error);
    return NextResponse.json({ error: 'Failed to sign contract' }, { status: 500 });
  }
}
