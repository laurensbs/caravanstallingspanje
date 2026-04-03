import { NextRequest, NextResponse } from 'next/server';
import { sql, logActivity, getAdminInfo } from '@/lib/db';

// Service packages — admin configurable, customer-visible

async function ensurePackagesTable() {
  await sql`CREATE TABLE IF NOT EXISTS service_packages (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL DEFAULT 'service',
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    price_type TEXT DEFAULT 'eenmalig',
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    features JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`;
  await sql`CREATE INDEX IF NOT EXISTS idx_packages_category ON service_packages(category)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_packages_active ON service_packages(is_active)`;
}

export async function GET(request: NextRequest) {
  try {
    await ensurePackagesTable();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const activeOnly = searchParams.get('active') !== 'false';

    let packages;
    if (category && activeOnly) {
      packages = await sql`SELECT * FROM service_packages WHERE category = ${category} AND is_active = true ORDER BY sort_order, name`;
    } else if (category) {
      packages = await sql`SELECT * FROM service_packages WHERE category = ${category} ORDER BY sort_order, name`;
    } else if (activeOnly) {
      packages = await sql`SELECT * FROM service_packages WHERE is_active = true ORDER BY sort_order, name`;
    } else {
      packages = await sql`SELECT * FROM service_packages ORDER BY category, sort_order, name`;
    }

    return NextResponse.json({ packages });
  } catch (error) {
    console.error('Packages GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch packages' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensurePackagesTable();
    const body = await request.json();
    const { name, slug, category, description, price, price_type, features, sort_order } = body;

    if (!name || !slug || !price) {
      return NextResponse.json({ error: 'name, slug, and price are required' }, { status: 400 });
    }

    const pkg = await sql`
      INSERT INTO service_packages (name, slug, category, description, price, price_type, features, sort_order)
      VALUES (${name}, ${slug}, ${category || 'service'}, ${description || null}, ${Number(price)}, ${price_type || 'eenmalig'}, ${JSON.stringify(features || [])}, ${sort_order || 0})
      RETURNING *
    `;

    const admin = getAdminInfo(request);
    await logActivity({ actor: admin.name, role: admin.role, action: 'Pakket aangemaakt', entityType: 'package', entityId: String(pkg[0].id), entityLabel: name });
    return NextResponse.json({ package: pkg[0] }, { status: 201 });
  } catch (error) {
    console.error('Packages POST error:', error);
    return NextResponse.json({ error: 'Failed to create package' }, { status: 500 });
  }
}
