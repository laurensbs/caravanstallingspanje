import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

function getDb() {
  return neon(process.env.DATABASE_URL!);
}

// POST /api/customer/documents — upload a document
export async function POST(req: NextRequest) {
  const customerId = req.headers.get('x-customer-id');
  if (!customerId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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

    // For now, store metadata in DB — actual file storage would use Vercel Blob or S3
    // In production: const blob = await put(file.name, file, { access: 'public' });
    const sql = getDb();

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
      INSERT INTO documents (customer_id, file_name, file_type, document_type, file_size)
      VALUES (${customerId}, ${file.name}, ${file.type}, ${type}, ${file.size})
    `;

    return NextResponse.json({ success: true, message: 'Document geüpload' });
  } catch (error) {
    console.error('Document upload failed:', error);
    return NextResponse.json({ error: 'Upload mislukt' }, { status: 500 });
  }
}

// GET /api/customer/documents — list uploaded documents
export async function GET(req: NextRequest) {
  const customerId = req.headers.get('x-customer-id');
  if (!customerId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const sql = getDb();

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
      SELECT id, file_name, file_type, document_type, file_size, created_at
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
