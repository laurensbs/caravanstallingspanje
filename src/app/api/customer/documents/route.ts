import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getCustomerSession } from '@/lib/auth';
import { put, del } from '@vercel/blob';

// POST /api/customer/documents — upload a document
export async function POST(req: NextRequest) {
  const token = req.cookies.get('customer_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const session = await getCustomerSession(token);
  if (!session) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  const customerId = session.id;

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const type = formData.get('type') as string || 'anders';

    if (!file) {
      return NextResponse.json({ error: 'Geen bestand geüpload' }, { status: 400 });
    }

    // Validate file
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Bestand te groot (max 10MB)' }, { status: 400 });
    }

    const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Ongeldig bestandstype. Alleen PDF, JPG en PNG zijn toegestaan.' }, { status: 400 });
    }

    // Upload to Vercel Blob storage
    const blob = await put(`documents/${customerId}/${Date.now()}-${file.name}`, file, {
      access: 'public',
      contentType: file.type,
    });

    // Create documents table if not exists
    await sql`
      CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER NOT NULL,
        file_name TEXT NOT NULL,
        file_type TEXT NOT NULL,
        document_type TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        file_url TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`
      INSERT INTO documents (customer_id, file_name, file_type, document_type, file_size, file_url)
      VALUES (${customerId}, ${file.name}, ${file.type}, ${type}, ${file.size}, ${blob.url})
    `;

    return NextResponse.json({ success: true, message: 'Document geüpload' });
  } catch (error) {
    console.error('Document upload failed:', error);
    return NextResponse.json({ error: 'Upload mislukt' }, { status: 500 });
  }
}

// GET /api/customer/documents — list uploaded documents
export async function GET(req: NextRequest) {
  const token = req.cookies.get('customer_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const session = await getCustomerSession(token);
  if (!session) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  const customerId = session.id;

  try {
    // Ensure table exists
    await sql`
      CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER NOT NULL,
        file_name TEXT NOT NULL,
        file_type TEXT NOT NULL,
        document_type TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        file_url TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    const documents = await sql`
      SELECT id, file_name, file_type, document_type, file_size, file_url, created_at
      FROM documents
      WHERE customer_id = ${customerId}
      ORDER BY created_at DESC
    `;

    return NextResponse.json({ documents });
  } catch (error) {
    console.error('Failed to fetch documents:', error);
    return NextResponse.json({ error: 'Kon documenten niet laden' }, { status: 500 });
  }
}

// DELETE /api/customer/documents — delete a document
export async function DELETE(req: NextRequest) {
  const token = req.cookies.get('customer_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const session = await getCustomerSession(token);
  if (!session) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

  try {
    const { id } = await req.json();
    const doc = await sql`SELECT file_url FROM documents WHERE id = ${id} AND customer_id = ${session.id}`;
    if (!doc.length) return NextResponse.json({ error: 'Document niet gevonden' }, { status: 404 });

    // Delete from Vercel Blob if it's a blob URL
    if (doc[0].file_url && !doc[0].file_url.startsWith('data:')) {
      try { await del(doc[0].file_url); } catch { /* blob may already be deleted */ }
    }

    await sql`DELETE FROM documents WHERE id = ${id} AND customer_id = ${session.id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete document failed:', error);
    return NextResponse.json({ error: 'Verwijderen mislukt' }, { status: 500 });
  }
}
