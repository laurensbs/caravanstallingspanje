import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL || 'postgresql://placeholder:placeholder@localhost/placeholder');

// Schema Setup
export async function initDatabase() {
  await sql`CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    is_active BOOLEAN DEFAULT true,
    failed_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
  )`;
  // Add columns if missing (for existing deployments)
  await sql`ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS failed_attempts INTEGER DEFAULT 0`;
  await sql`ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP`;

  await sql`CREATE TABLE IF NOT EXISTS staff (
    id SERIAL PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'medewerker',
    location_id INTEGER,
    is_active BOOLEAN DEFAULT true,
    failed_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`;
  await sql`ALTER TABLE staff ADD COLUMN IF NOT EXISTS failed_attempts INTEGER DEFAULT 0`;
  await sql`ALTER TABLE staff ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP`;

  await sql`CREATE TABLE IF NOT EXISTS locations (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT,
    city TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'ES',
    phone TEXT,
    email TEXT,
    capacity_inside INTEGER DEFAULT 0,
    capacity_outside INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
  )`;

  await sql`CREATE TABLE IF NOT EXISTS spots (
    id SERIAL PRIMARY KEY,
    location_id INTEGER NOT NULL REFERENCES locations(id),
    label TEXT NOT NULL,
    zone TEXT DEFAULT 'A',
    spot_type TEXT DEFAULT 'buiten',
    status TEXT DEFAULT 'vrij',
    notes TEXT,
    UNIQUE(location_id, label)
  )`;

  await sql`CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    customer_number TEXT UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'NL',
    company_name TEXT,
    notes TEXT,
    referral_token TEXT UNIQUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`;

  await sql`CREATE TABLE IF NOT EXISTS caravans (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(id),
    brand TEXT NOT NULL,
    model TEXT,
    year INTEGER,
    license_plate TEXT,
    length_m DECIMAL(4,1),
    weight_kg INTEGER,
    has_mover BOOLEAN DEFAULT false,
    location_id INTEGER REFERENCES locations(id),
    spot_id INTEGER REFERENCES spots(id),
    status TEXT DEFAULT 'gestald',
    insurance_expiry DATE,
    apk_expiry DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`;

  await sql`CREATE TABLE IF NOT EXISTS contracts (
    id SERIAL PRIMARY KEY,
    contract_number TEXT UNIQUE,
    customer_id INTEGER NOT NULL REFERENCES customers(id),
    caravan_id INTEGER NOT NULL REFERENCES caravans(id),
    location_id INTEGER NOT NULL REFERENCES locations(id),
    spot_id INTEGER REFERENCES spots(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    monthly_rate DECIMAL(10,2) NOT NULL,
    deposit DECIMAL(10,2) DEFAULT 0,
    auto_renew BOOLEAN DEFAULT true,
    status TEXT DEFAULT 'actief',
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`;

  await sql`CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    invoice_number TEXT UNIQUE NOT NULL,
    customer_id INTEGER NOT NULL REFERENCES customers(id),
    contract_id INTEGER REFERENCES contracts(id),
    description TEXT,
    subtotal DECIMAL(10,2) NOT NULL,
    tax_rate DECIMAL(5,2) DEFAULT 21.00,
    tax_amount DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'open',
    due_date DATE NOT NULL,
    paid_date DATE,
    payment_method TEXT,
    stripe_payment_id TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`;

  await sql`CREATE TABLE IF NOT EXISTS inspections (
    id SERIAL PRIMARY KEY,
    caravan_id INTEGER NOT NULL REFERENCES caravans(id),
    inspected_by INTEGER REFERENCES staff(id),
    inspection_type TEXT DEFAULT 'tweewekelijks',
    status TEXT DEFAULT 'gepland',
    checklist JSONB DEFAULT '{}',
    notes TEXT,
    photos JSONB DEFAULT '[]',
    inspected_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
  )`;

  await sql`CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'normaal',
    status TEXT DEFAULT 'open',
    assigned_to INTEGER REFERENCES staff(id),
    location_id INTEGER REFERENCES locations(id),
    due_date DATE,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`;

  await sql`CREATE TABLE IF NOT EXISTS transport_orders (
    id SERIAL PRIMARY KEY,
    caravan_id INTEGER NOT NULL REFERENCES caravans(id),
    pickup_address TEXT,
    delivery_address TEXT,
    scheduled_date DATE NOT NULL,
    completed_date TIMESTAMP,
    assigned_staff INTEGER REFERENCES staff(id),
    status TEXT DEFAULT 'aangevraagd',
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`;

  await sql`CREATE TABLE IF NOT EXISTS service_requests (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(id),
    caravan_id INTEGER REFERENCES caravans(id),
    service_type TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'aangevraagd',
    estimated_cost DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    scheduled_date DATE,
    completed_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`;

  await sql`CREATE TABLE IF NOT EXISTS activity_log (
    id SERIAL PRIMARY KEY,
    actor TEXT,
    role TEXT,
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id TEXT,
    entity_label TEXT,
    details TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  )`;

  await sql`CREATE TABLE IF NOT EXISTS contact_messages (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    replied_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
  )`;

  await sql`CREATE TABLE IF NOT EXISTS leads (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL,
    name TEXT,
    phone TEXT,
    interest TEXT,
    storage_type TEXT,
    caravan_brand TEXT,
    caravan_length TEXT,
    services TEXT,
    timeframe TEXT,
    source TEXT DEFAULT 'quiz',
    status TEXT DEFAULT 'nieuw',
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  )`;
  await sql`CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at DESC)`;

  // Guide Hub tables
  await sql`CREATE TABLE IF NOT EXISTS guide_campings (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    region TEXT DEFAULT 'Costa Brava',
    town TEXT,
    address TEXT,
    lat DECIMAL(10,7),
    lng DECIMAL(10,7),
    stars INTEGER DEFAULT 3,
    website TEXT,
    phone TEXT,
    price_range TEXT DEFAULT '€€',
    amenities JSONB DEFAULT '[]',
    highlights JSONB DEFAULT '[]',
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`;

  await sql`CREATE TABLE IF NOT EXISTS guide_places (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    region TEXT DEFAULT 'Costa Brava',
    lat DECIMAL(10,7),
    lng DECIMAL(10,7),
    highlights JSONB DEFAULT '[]',
    best_season TEXT,
    population TEXT,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`;

  await sql`CREATE TABLE IF NOT EXISTS guide_beaches (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    place_id INTEGER REFERENCES guide_places(id),
    region TEXT DEFAULT 'Costa Brava',
    beach_type TEXT DEFAULT 'zand',
    lat DECIMAL(10,7),
    lng DECIMAL(10,7),
    facilities JSONB DEFAULT '[]',
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`;

  await sql`CREATE TABLE IF NOT EXISTS guide_attractions (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    place_id INTEGER REFERENCES guide_places(id),
    region TEXT DEFAULT 'Costa Brava',
    category TEXT DEFAULT 'bezienswaardigheid',
    address TEXT,
    lat DECIMAL(10,7),
    lng DECIMAL(10,7),
    website TEXT,
    price_info TEXT,
    opening_hours TEXT,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`;

  await sql`CREATE TABLE IF NOT EXISTS guide_restaurants (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    place_id INTEGER REFERENCES guide_places(id),
    region TEXT DEFAULT 'Costa Brava',
    cuisine_type TEXT,
    price_range TEXT DEFAULT '€€',
    address TEXT,
    lat DECIMAL(10,7),
    lng DECIMAL(10,7),
    website TEXT,
    phone TEXT,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`;

  await sql`CREATE TABLE IF NOT EXISTS guide_blog_posts (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT,
    category TEXT DEFAULT 'Algemeen',
    read_time TEXT DEFAULT '5 min',
    author TEXT DEFAULT 'Caravanstalling Spanje',
    is_featured BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`;

  await sql`CREATE TABLE IF NOT EXISTS guide_images (
    id SERIAL PRIMARY KEY,
    entity_type TEXT NOT NULL,
    entity_id INTEGER NOT NULL,
    url TEXT NOT NULL,
    alt_text TEXT,
    is_cover BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
  )`;

  await sql`CREATE INDEX IF NOT EXISTS idx_guide_campings_slug ON guide_campings(slug)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_guide_campings_region ON guide_campings(region)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_guide_campings_featured ON guide_campings(is_featured) WHERE is_featured = true`;
  await sql`CREATE INDEX IF NOT EXISTS idx_guide_places_slug ON guide_places(slug)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_guide_places_featured ON guide_places(is_featured) WHERE is_featured = true`;
  await sql`CREATE INDEX IF NOT EXISTS idx_guide_beaches_slug ON guide_beaches(slug)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_guide_beaches_place ON guide_beaches(place_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_guide_attractions_slug ON guide_attractions(slug)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_guide_attractions_place ON guide_attractions(place_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_guide_attractions_category ON guide_attractions(category)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_guide_restaurants_slug ON guide_restaurants(slug)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_guide_restaurants_place ON guide_restaurants(place_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_guide_blog_slug ON guide_blog_posts(slug)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_guide_blog_published ON guide_blog_posts(is_published, published_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_guide_images_entity ON guide_images(entity_type, entity_id)`;

  // Add missing columns (idempotent ALTER TABLE)
  await sql`ALTER TABLE guide_beaches ADD COLUMN IF NOT EXISTS town TEXT`;
  await sql`ALTER TABLE guide_beaches ADD COLUMN IF NOT EXISTS length_meters INTEGER`;
  await sql`ALTER TABLE guide_beaches ADD COLUMN IF NOT EXISTS blue_flag BOOLEAN DEFAULT false`;
  await sql`ALTER TABLE guide_attractions ADD COLUMN IF NOT EXISTS town TEXT`;
  await sql`ALTER TABLE guide_attractions ADD COLUMN IF NOT EXISTS highlights JSONB DEFAULT '[]'`;
  await sql`ALTER TABLE guide_attractions ADD COLUMN IF NOT EXISTS price_range TEXT`;
  await sql`ALTER TABLE guide_restaurants ADD COLUMN IF NOT EXISTS town TEXT`;
  await sql`ALTER TABLE guide_restaurants ADD COLUMN IF NOT EXISTS michelin_stars INTEGER DEFAULT 0`;
  await sql`ALTER TABLE guide_restaurants ADD COLUMN IF NOT EXISTS specialties JSONB DEFAULT '[]'`;
  await sql`ALTER TABLE guide_blog_posts ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'`;
  await sql`ALTER TABLE guide_places ADD COLUMN IF NOT EXISTS town TEXT`;

  await sql`CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_type TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    message TEXT,
    link TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
  )`;

  await sql`CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id),
    service_request_id INTEGER REFERENCES service_requests(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    comment TEXT,
    is_published BOOLEAN DEFAULT false,
    admin_reply TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  )`;

  await sql`CREATE TABLE IF NOT EXISTS discount_codes (
    id SERIAL PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    type TEXT NOT NULL DEFAULT 'percentage',
    value NUMERIC(10,2) NOT NULL,
    min_months INTEGER DEFAULT 1,
    max_uses INTEGER,
    used_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    valid_from DATE,
    valid_until DATE,
    created_at TIMESTAMP DEFAULT NOW()
  )`;

  // Indexes
  await sql`CREATE INDEX IF NOT EXISTS idx_caravans_customer ON caravans(customer_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_caravans_location ON caravans(location_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_caravans_spot ON caravans(spot_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_spots_location ON spots(location_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_contracts_customer ON contracts(customer_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_contracts_caravan ON contracts(caravan_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_contracts_location ON contracts(location_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_invoices_customer ON invoices(customer_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_inspections_caravan ON inspections(caravan_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_tasks_location ON tasks(location_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON tasks(assigned_to)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_transport_caravan ON transport_orders(caravan_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_type, user_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_activity_log_created ON activity_log(created_at DESC)`;

  // Additional performance indexes
  await sql`CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_caravans_status ON caravans(status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_inspections_status ON inspections(status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_transport_status ON transport_orders(status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_reviews_customer ON reviews(customer_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_reviews_published ON reviews(is_published)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_discount_codes_code ON discount_codes(code)`;

  return { success: true };
}

// Admin Users
export async function getAdminByEmail(email: string) {
  const rows = await sql`SELECT * FROM admin_users WHERE email = ${email} AND is_active = true LIMIT 1`;
  return rows[0] || null;
}

export async function createAdmin(name: string, email: string, hash: string, role = 'admin') {
  await sql`INSERT INTO admin_users (name, email, password_hash, role) VALUES (${name}, ${email}, ${hash}, ${role})`;
}

export async function recordLoginSuccess(table: 'admin_users' | 'staff', id: number) {
  if (table === 'admin_users') {
    await sql`UPDATE admin_users SET failed_attempts = 0, locked_until = NULL, last_login = NOW() WHERE id = ${id}`;
  } else {
    await sql`UPDATE staff SET failed_attempts = 0, locked_until = NULL, last_login = NOW() WHERE id = ${id}`;
  }
}

export async function recordLoginFailure(table: 'admin_users' | 'staff', id: number) {
  const MAX_ATTEMPTS = 5;
  if (table === 'admin_users') {
    await sql`UPDATE admin_users SET failed_attempts = failed_attempts + 1,
      locked_until = CASE WHEN failed_attempts + 1 >= ${MAX_ATTEMPTS} THEN NOW() + INTERVAL '15 minutes' ELSE locked_until END
      WHERE id = ${id}`;
  } else {
    await sql`UPDATE staff SET failed_attempts = failed_attempts + 1,
      locked_until = CASE WHEN failed_attempts + 1 >= ${MAX_ATTEMPTS} THEN NOW() + INTERVAL '15 minutes' ELSE locked_until END
      WHERE id = ${id}`;
  }
}

export async function isAccountLocked(table: 'admin_users' | 'staff', id: number): Promise<boolean> {
  const rows = table === 'admin_users'
    ? await sql`SELECT locked_until FROM admin_users WHERE id = ${id}`
    : await sql`SELECT locked_until FROM staff WHERE id = ${id}`;
  if (!rows[0]?.locked_until) return false;
  return new Date(rows[0].locked_until) > new Date();
}

// Staff
export async function getStaffByEmail(email: string) {
  const rows = await sql`SELECT * FROM staff WHERE email = ${email} AND is_active = true LIMIT 1`;
  return rows[0] || null;
}

export async function getAllStaff() {
  return sql`SELECT s.*, l.name as location_name FROM staff s LEFT JOIN locations l ON s.location_id = l.id ORDER BY s.first_name, s.last_name`;
}

export async function createStaff(data: { first_name: string; last_name: string; email: string; password_hash: string; role?: string; location_id?: number; phone?: string }) {
  await sql`INSERT INTO staff (first_name, last_name, email, password_hash, role, location_id, phone) VALUES (${data.first_name}, ${data.last_name}, ${data.email}, ${data.password_hash}, ${data.role || 'medewerker'}, ${data.location_id || null}, ${data.phone || null})`;
}

// Locations
export async function getAllLocations() {
  return sql`SELECT l.*, (SELECT COUNT(*) FROM spots WHERE location_id = l.id) as total_spots, (SELECT COUNT(*) FROM spots WHERE location_id = l.id AND status = 'bezet') as occupied_spots FROM locations l WHERE l.is_active = true ORDER BY l.name`;
}

export async function getLocationById(id: number) {
  const rows = await sql`SELECT * FROM locations WHERE id = ${id}`;
  return rows[0] || null;
}

// Spots
export async function getSpotsByLocation(locationId: number) {
  return sql`SELECT s.*, c.brand as caravan_brand, c.model as caravan_model, c.license_plate as caravan_license_plate, cu.first_name || ' ' || cu.last_name as customer_name FROM spots s LEFT JOIN caravans c ON c.spot_id = s.id AND c.status = 'gestald' LEFT JOIN customers cu ON c.customer_id = cu.id WHERE s.location_id = ${locationId} ORDER BY s.zone, s.label`;
}

export async function bulkCreateSpots(locationId: number, zone: string, spotType: string, prefix: string, count: number) {
  for (let i = 1; i <= count; i++) {
    const label = prefix + String(i).padStart(3, '0');
    await sql`INSERT INTO spots (location_id, label, zone, spot_type) VALUES (${locationId}, ${label}, ${zone}, ${spotType}) ON CONFLICT DO NOTHING`;
  }
}

// Customers
export async function getAllCustomers(page = 1, limit = 50, search = '') {
  const offset = (page - 1) * limit;
  if (search) {
    const q = '%' + search + '%';
    const rows = await sql`SELECT * FROM customers WHERE first_name ILIKE ${q} OR last_name ILIKE ${q} OR email ILIKE ${q} OR customer_number ILIKE ${q} OR phone ILIKE ${q} ORDER BY last_name, first_name LIMIT ${limit} OFFSET ${offset}`;
    const countRes = await sql`SELECT COUNT(*) as total FROM customers WHERE first_name ILIKE ${q} OR last_name ILIKE ${q} OR email ILIKE ${q} OR customer_number ILIKE ${q} OR phone ILIKE ${q}`;
    return { customers: rows, total: Number(countRes[0].total) };
  }
  const rows = await sql`SELECT * FROM customers ORDER BY last_name, first_name LIMIT ${limit} OFFSET ${offset}`;
  const countRes = await sql`SELECT COUNT(*) as total FROM customers`;
  return { customers: rows, total: Number(countRes[0].total) };
}

export async function getCustomerById(id: number) {
  const rows = await sql`SELECT * FROM customers WHERE id = ${id}`;
  return rows[0] || null;
}

export async function getCustomerByEmail(email: string) {
  const rows = await sql`SELECT * FROM customers WHERE email = ${email} LIMIT 1`;
  return rows[0] || null;
}

export async function createCustomer(data: Record<string, unknown>) {
  const countRes = await sql`SELECT COUNT(*) as count FROM customers`;
  const num = 'KL-' + String(Number(countRes[0].count) + 1).padStart(6, '0');
  const res = await sql`INSERT INTO customers (customer_number, first_name, last_name, email, password_hash, phone, address, city, postal_code, country, company_name, notes) VALUES (${num}, ${data.first_name as string}, ${data.last_name as string}, ${data.email as string}, ${data.password_hash as string || null}, ${data.phone as string || null}, ${data.address as string || null}, ${data.city as string || null}, ${data.postal_code as string || null}, ${data.country as string || 'NL'}, ${data.company_name as string || null}, ${data.notes as string || null}) RETURNING *`;
  return res[0];
}

export async function updateCustomer(id: number, data: Record<string, unknown>) {
  await sql`UPDATE customers SET first_name=${data.first_name as string}, last_name=${data.last_name as string}, email=${data.email as string}, phone=${data.phone as string||null}, address=${data.address as string||null}, city=${data.city as string||null}, postal_code=${data.postal_code as string||null}, country=${data.country as string||'NL'}, company_name=${data.company_name as string||null}, notes=${data.notes as string||null}, updated_at=NOW() WHERE id=${id}`;
}

// Caravans
export async function getAllCaravans(page = 1, limit = 50, search = '', status?: string) {
  const offset = (page - 1) * limit;
  if (search) {
    const q = '%' + search + '%';
    if (status) {
      const rows = await sql`SELECT c.*, cu.first_name || ' ' || cu.last_name as customer_name, cu.email as customer_email, l.name as location_name, s.label as spot_label FROM caravans c LEFT JOIN customers cu ON c.customer_id = cu.id LEFT JOIN locations l ON c.location_id = l.id LEFT JOIN spots s ON c.spot_id = s.id WHERE (c.brand ILIKE ${q} OR c.model ILIKE ${q} OR c.license_plate ILIKE ${q} OR cu.first_name ILIKE ${q} OR cu.last_name ILIKE ${q}) AND c.status = ${status} ORDER BY c.created_at DESC LIMIT ${limit} OFFSET ${offset}`;
      const cnt = await sql`SELECT COUNT(*) as total FROM caravans c LEFT JOIN customers cu ON c.customer_id = cu.id WHERE (c.brand ILIKE ${q} OR c.model ILIKE ${q} OR c.license_plate ILIKE ${q} OR cu.first_name ILIKE ${q} OR cu.last_name ILIKE ${q}) AND c.status = ${status}`;
      return { caravans: rows, total: Number(cnt[0].total) };
    }
    const rows = await sql`SELECT c.*, cu.first_name || ' ' || cu.last_name as customer_name, cu.email as customer_email, l.name as location_name, s.label as spot_label FROM caravans c LEFT JOIN customers cu ON c.customer_id = cu.id LEFT JOIN locations l ON c.location_id = l.id LEFT JOIN spots s ON c.spot_id = s.id WHERE c.brand ILIKE ${q} OR c.model ILIKE ${q} OR c.license_plate ILIKE ${q} OR cu.first_name ILIKE ${q} OR cu.last_name ILIKE ${q} ORDER BY c.created_at DESC LIMIT ${limit} OFFSET ${offset}`;
    const cnt = await sql`SELECT COUNT(*) as total FROM caravans c LEFT JOIN customers cu ON c.customer_id = cu.id WHERE c.brand ILIKE ${q} OR c.model ILIKE ${q} OR c.license_plate ILIKE ${q} OR cu.first_name ILIKE ${q} OR cu.last_name ILIKE ${q}`;
    return { caravans: rows, total: Number(cnt[0].total) };
  }
  if (status) {
    const rows = await sql`SELECT c.*, cu.first_name || ' ' || cu.last_name as customer_name, cu.email as customer_email, l.name as location_name, s.label as spot_label FROM caravans c LEFT JOIN customers cu ON c.customer_id = cu.id LEFT JOIN locations l ON c.location_id = l.id LEFT JOIN spots s ON c.spot_id = s.id WHERE c.status = ${status} ORDER BY c.created_at DESC LIMIT ${limit} OFFSET ${offset}`;
    const cnt = await sql`SELECT COUNT(*) as total FROM caravans WHERE status = ${status}`;
    return { caravans: rows, total: Number(cnt[0].total) };
  }
  const rows = await sql`SELECT c.*, cu.first_name || ' ' || cu.last_name as customer_name, cu.email as customer_email, l.name as location_name, s.label as spot_label FROM caravans c LEFT JOIN customers cu ON c.customer_id = cu.id LEFT JOIN locations l ON c.location_id = l.id LEFT JOIN spots s ON c.spot_id = s.id ORDER BY c.created_at DESC LIMIT ${limit} OFFSET ${offset}`;
  const cnt = await sql`SELECT COUNT(*) as total FROM caravans`;
  return { caravans: rows, total: Number(cnt[0].total) };
}

export async function getCaravansByCustomer(customerId: number) {
  return sql`SELECT c.*, l.name as location_name, s.label as spot_label FROM caravans c LEFT JOIN locations l ON c.location_id = l.id LEFT JOIN spots s ON c.spot_id = s.id WHERE c.customer_id = ${customerId} ORDER BY c.brand`;
}

// Contracts
export async function getAllContracts(page = 1, limit = 50, status?: string, search?: string) {
  const offset = (page - 1) * limit;
  if (status && search) {
    const q = `%${search}%`;
    const rows = await sql`SELECT co.*, cu.first_name || ' ' || cu.last_name as customer_name, ca.brand || ' ' || COALESCE(ca.model,'') as caravan_name, ca.license_plate, l.name as location_name FROM contracts co LEFT JOIN customers cu ON co.customer_id = cu.id LEFT JOIN caravans ca ON co.caravan_id = ca.id LEFT JOIN locations l ON co.location_id = l.id WHERE co.status = ${status} AND (co.contract_number ILIKE ${q} OR cu.first_name ILIKE ${q} OR cu.last_name ILIKE ${q} OR ca.license_plate ILIKE ${q}) ORDER BY co.end_date DESC LIMIT ${limit} OFFSET ${offset}`;
    const cnt = await sql`SELECT COUNT(*) as total FROM contracts co LEFT JOIN customers cu ON co.customer_id = cu.id LEFT JOIN caravans ca ON co.caravan_id = ca.id WHERE co.status = ${status} AND (co.contract_number ILIKE ${q} OR cu.first_name ILIKE ${q} OR cu.last_name ILIKE ${q} OR ca.license_plate ILIKE ${q})`;
    return { contracts: rows, total: Number(cnt[0].total) };
  }
  if (status) {
    const rows = await sql`SELECT co.*, cu.first_name || ' ' || cu.last_name as customer_name, ca.brand || ' ' || COALESCE(ca.model,'') as caravan_name, ca.license_plate, l.name as location_name FROM contracts co LEFT JOIN customers cu ON co.customer_id = cu.id LEFT JOIN caravans ca ON co.caravan_id = ca.id LEFT JOIN locations l ON co.location_id = l.id WHERE co.status = ${status} ORDER BY co.end_date DESC LIMIT ${limit} OFFSET ${offset}`;
    const cnt = await sql`SELECT COUNT(*) as total FROM contracts WHERE status = ${status}`;
    return { contracts: rows, total: Number(cnt[0].total) };
  }
  if (search) {
    const q = `%${search}%`;
    const rows = await sql`SELECT co.*, cu.first_name || ' ' || cu.last_name as customer_name, ca.brand || ' ' || COALESCE(ca.model,'') as caravan_name, ca.license_plate, l.name as location_name FROM contracts co LEFT JOIN customers cu ON co.customer_id = cu.id LEFT JOIN caravans ca ON co.caravan_id = ca.id LEFT JOIN locations l ON co.location_id = l.id WHERE co.contract_number ILIKE ${q} OR cu.first_name ILIKE ${q} OR cu.last_name ILIKE ${q} OR ca.license_plate ILIKE ${q} ORDER BY co.end_date DESC LIMIT ${limit} OFFSET ${offset}`;
    const cnt = await sql`SELECT COUNT(*) as total FROM contracts co LEFT JOIN customers cu ON co.customer_id = cu.id LEFT JOIN caravans ca ON co.caravan_id = ca.id WHERE co.contract_number ILIKE ${q} OR cu.first_name ILIKE ${q} OR cu.last_name ILIKE ${q} OR ca.license_plate ILIKE ${q}`;
    return { contracts: rows, total: Number(cnt[0].total) };
  }
  const rows = await sql`SELECT co.*, cu.first_name || ' ' || cu.last_name as customer_name, ca.brand || ' ' || COALESCE(ca.model,'') as caravan_name, ca.license_plate, l.name as location_name FROM contracts co LEFT JOIN customers cu ON co.customer_id = cu.id LEFT JOIN caravans ca ON co.caravan_id = ca.id LEFT JOIN locations l ON co.location_id = l.id ORDER BY co.end_date DESC LIMIT ${limit} OFFSET ${offset}`;
  const cnt = await sql`SELECT COUNT(*) as total FROM contracts`;
  return { contracts: rows, total: Number(cnt[0].total) };
}

export async function getContractsByCustomer(customerId: number) {
  return sql`SELECT co.*, ca.brand || ' ' || COALESCE(ca.model,'') as caravan_name, l.name as location_name FROM contracts co LEFT JOIN caravans ca ON co.caravan_id = ca.id LEFT JOIN locations l ON co.location_id = l.id WHERE co.customer_id = ${customerId} ORDER BY co.end_date DESC`;
}

export async function createContract(data: Record<string, unknown>) {
  const num = 'CON-' + new Date().getFullYear() + '-' + String(Date.now()).slice(-5);
  const res = await sql`INSERT INTO contracts (contract_number, customer_id, caravan_id, location_id, spot_id, start_date, end_date, monthly_rate, deposit, auto_renew, status, notes) VALUES (${num}, ${data.customer_id as number}, ${data.caravan_id as number}, ${data.location_id as number}, ${data.spot_id as number || null}, ${data.start_date as string}, ${data.end_date as string}, ${data.monthly_rate as number}, ${data.deposit as number || 0}, ${data.auto_renew !== false}, ${data.status as string || 'actief'}, ${data.notes as string || null}) RETURNING *`;
  return res[0];
}

export async function updateContractStatus(id: number, status: string) {
  await sql`UPDATE contracts SET status = ${status}, updated_at = NOW() WHERE id = ${id}`;
}

// Invoices
export async function getAllInvoices(page = 1, limit = 50, status?: string) {
  const offset = (page - 1) * limit;
  if (status) {
    const rows = await sql`SELECT i.*, cu.first_name || ' ' || cu.last_name as customer_name, cu.email as customer_email FROM invoices i LEFT JOIN customers cu ON i.customer_id = cu.id WHERE i.status = ${status} ORDER BY i.created_at DESC LIMIT ${limit} OFFSET ${offset}`;
    const cnt = await sql`SELECT COUNT(*) as total FROM invoices WHERE status = ${status}`;
    return { invoices: rows, total: Number(cnt[0].total) };
  }
  const rows = await sql`SELECT i.*, cu.first_name || ' ' || cu.last_name as customer_name, cu.email as customer_email FROM invoices i LEFT JOIN customers cu ON i.customer_id = cu.id ORDER BY i.created_at DESC LIMIT ${limit} OFFSET ${offset}`;
  const cnt = await sql`SELECT COUNT(*) as total FROM invoices`;
  return { invoices: rows, total: Number(cnt[0].total) };
}

export async function getInvoicesByCustomer(customerId: number) {
  return sql`SELECT * FROM invoices WHERE customer_id = ${customerId} ORDER BY created_at DESC`;
}

export async function createInvoice(data: Record<string, unknown>) {
  const year = new Date().getFullYear();
  const countRes = await sql`SELECT COUNT(*) as cnt FROM invoices WHERE invoice_number LIKE ${'FAC-' + year + '%'}`;
  const seq = Number(countRes[0].cnt) + 1;
  const num = 'FAC-' + year + '-' + String(seq).padStart(4, '0');
  const res = await sql`INSERT INTO invoices (invoice_number, customer_id, contract_id, description, subtotal, tax_rate, tax_amount, total, status, due_date, notes) VALUES (${num}, ${data.customer_id as number}, ${data.contract_id as number || null}, ${data.description as string || null}, ${data.subtotal as number}, ${data.tax_rate as number || 21}, ${data.tax_amount as number}, ${data.total as number}, ${data.status as string || 'open'}, ${data.due_date as string}, ${data.notes as string || null}) RETURNING *`;
  return res[0];
}

export async function updateInvoiceStatus(id: number, status: string, paymentMethod?: string) {
  if (status === 'betaald') {
    await sql`UPDATE invoices SET status = ${status}, paid_date = NOW(), payment_method = ${paymentMethod || null}, updated_at = NOW() WHERE id = ${id}`;
  } else {
    await sql`UPDATE invoices SET status = ${status}, updated_at = NOW() WHERE id = ${id}`;
  }
}

// Inspections
export async function getInspections(locationId?: number) {
  if (locationId) {
    return sql`SELECT i.*, ca.brand || ' ' || COALESCE(ca.model,'') as caravan_name, ca.license_plate, s.first_name || ' ' || s.last_name as staff_name FROM inspections i LEFT JOIN caravans ca ON i.caravan_id = ca.id LEFT JOIN staff s ON i.inspected_by = s.id WHERE ca.location_id = ${locationId} ORDER BY i.created_at DESC`;
  }
  return sql`SELECT i.*, ca.brand || ' ' || COALESCE(ca.model,'') as caravan_name, ca.license_plate, s.first_name || ' ' || s.last_name as staff_name FROM inspections i LEFT JOIN caravans ca ON i.caravan_id = ca.id LEFT JOIN staff s ON i.inspected_by = s.id ORDER BY i.created_at DESC`;
}

export async function createInspection(data: Record<string, unknown>) {
  const res = await sql`INSERT INTO inspections (caravan_id, inspected_by, inspection_type, status, checklist, notes, inspected_at) VALUES (${data.caravan_id as number}, ${data.inspected_by as number || null}, ${data.inspection_type as string || 'tweewekelijks'}, ${data.status as string || 'afgerond'}, ${JSON.stringify(data.checklist || {})}, ${data.notes as string || null}, NOW()) RETURNING *`;
  return res[0];
}

// Tasks
export async function getTasks(assignedTo?: number, status?: string) {
  if (assignedTo && status) {
    return sql`SELECT t.*, s.first_name || ' ' || s.last_name as staff_name, l.name as location_name FROM tasks t LEFT JOIN staff s ON t.assigned_to = s.id LEFT JOIN locations l ON t.location_id = l.id WHERE t.assigned_to = ${assignedTo} AND t.status = ${status} ORDER BY CASE t.priority WHEN 'urgent' THEN 0 WHEN 'hoog' THEN 1 WHEN 'normaal' THEN 2 ELSE 3 END, t.due_date ASC NULLS LAST`;
  }
  if (assignedTo) {
    return sql`SELECT t.*, s.first_name || ' ' || s.last_name as staff_name, l.name as location_name FROM tasks t LEFT JOIN staff s ON t.assigned_to = s.id LEFT JOIN locations l ON t.location_id = l.id WHERE t.assigned_to = ${assignedTo} OR t.assigned_to IS NULL ORDER BY CASE t.priority WHEN 'urgent' THEN 0 WHEN 'hoog' THEN 1 WHEN 'normaal' THEN 2 ELSE 3 END, t.due_date ASC NULLS LAST`;
  }
  if (status) {
    return sql`SELECT t.*, s.first_name || ' ' || s.last_name as staff_name, l.name as location_name FROM tasks t LEFT JOIN staff s ON t.assigned_to = s.id LEFT JOIN locations l ON t.location_id = l.id WHERE t.status = ${status} ORDER BY CASE t.priority WHEN 'urgent' THEN 0 WHEN 'hoog' THEN 1 WHEN 'normaal' THEN 2 ELSE 3 END, t.due_date ASC NULLS LAST`;
  }
  return sql`SELECT t.*, s.first_name || ' ' || s.last_name as staff_name, l.name as location_name FROM tasks t LEFT JOIN staff s ON t.assigned_to = s.id LEFT JOIN locations l ON t.location_id = l.id ORDER BY CASE t.priority WHEN 'urgent' THEN 0 WHEN 'hoog' THEN 1 WHEN 'normaal' THEN 2 ELSE 3 END, t.due_date ASC NULLS LAST`;
}

export async function createTask(data: Record<string, unknown>) {
  await sql`INSERT INTO tasks (title, description, priority, status, assigned_to, location_id, due_date) VALUES (${data.title as string}, ${data.description as string || null}, ${data.priority as string || 'normaal'}, 'open', ${data.assigned_to as number || null}, ${data.location_id as number || null}, ${data.due_date as string || null})`;
}

export async function updateTaskStatus(id: number, status: string) {
  if (status === 'afgerond') {
    await sql`UPDATE tasks SET status = ${status}, completed_at = NOW(), updated_at = NOW() WHERE id = ${id}`;
  } else {
    await sql`UPDATE tasks SET status = ${status}, updated_at = NOW() WHERE id = ${id}`;
  }
}

// Transport Orders
export async function getTransportOrders(status?: string) {
  if (status) {
    return sql`SELECT t.*, ca.brand || ' ' || COALESCE(ca.model,'') as caravan_name, ca.license_plate, cu.first_name || ' ' || cu.last_name as customer_name, s.first_name || ' ' || s.last_name as staff_name FROM transport_orders t LEFT JOIN caravans ca ON t.caravan_id = ca.id LEFT JOIN customers cu ON ca.customer_id = cu.id LEFT JOIN staff s ON t.assigned_staff = s.id WHERE t.status = ${status} ORDER BY t.scheduled_date ASC`;
  }
  return sql`SELECT t.*, ca.brand || ' ' || COALESCE(ca.model,'') as caravan_name, ca.license_plate, cu.first_name || ' ' || cu.last_name as customer_name, s.first_name || ' ' || s.last_name as staff_name FROM transport_orders t LEFT JOIN caravans ca ON t.caravan_id = ca.id LEFT JOIN customers cu ON ca.customer_id = cu.id LEFT JOIN staff s ON t.assigned_staff = s.id ORDER BY t.scheduled_date ASC`;
}

export async function createTransportOrder(data: Record<string, unknown>) {
  await sql`INSERT INTO transport_orders (caravan_id, pickup_address, delivery_address, scheduled_date, assigned_staff, notes) VALUES (${data.caravan_id as number}, ${data.pickup_address as string || null}, ${data.delivery_address as string || null}, ${data.scheduled_date as string}, ${data.assigned_staff as number || null}, ${data.notes as string || null})`;
}

export async function updateTransportStatus(id: number, status: string) {
  if (status === 'afgerond') {
    await sql`UPDATE transport_orders SET status = ${status}, completed_date = NOW(), updated_at = NOW() WHERE id = ${id}`;
  } else {
    await sql`UPDATE transport_orders SET status = ${status}, updated_at = NOW() WHERE id = ${id}`;
  }
}

// Service Requests
export async function getServiceRequests(status?: string) {
  if (status) {
    return sql`SELECT sr.*, cu.first_name || ' ' || cu.last_name as customer_name, ca.brand || ' ' || COALESCE(ca.model,'') as caravan_name FROM service_requests sr LEFT JOIN customers cu ON sr.customer_id = cu.id LEFT JOIN caravans ca ON sr.caravan_id = ca.id WHERE sr.status = ${status} ORDER BY sr.created_at DESC`;
  }
  return sql`SELECT sr.*, cu.first_name || ' ' || cu.last_name as customer_name, ca.brand || ' ' || COALESCE(ca.model,'') as caravan_name FROM service_requests sr LEFT JOIN customers cu ON sr.customer_id = cu.id LEFT JOIN caravans ca ON sr.caravan_id = ca.id ORDER BY sr.created_at DESC`;
}

export async function createServiceRequest(data: Record<string, unknown>) {
  await sql`INSERT INTO service_requests (customer_id, caravan_id, service_type, description) VALUES (${data.customer_id as number}, ${data.caravan_id as number || null}, ${data.service_type as string}, ${data.description as string || null})`;
}

// Dashboard Stats
export async function getDashboardStats() {
  const [customers, caravans, activeContracts, locations, openInvoices, overdueInvoices, openTasks, pendingTransports, revenue, monthlyRevenue, onSiteCaravans] = await Promise.all([
    sql`SELECT COUNT(*) as total FROM customers`,
    sql`SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status = 'gestald') as stored FROM caravans`,
    sql`SELECT COUNT(*) as total FROM contracts WHERE status = 'actief'`,
    sql`SELECT COUNT(*) as total FROM locations WHERE is_active = true`,
    sql`SELECT COUNT(*) as total, COALESCE(SUM(total),0) as amount FROM invoices WHERE status = 'open' OR status = 'verzonden'`,
    sql`SELECT COUNT(*) as total, COALESCE(SUM(total),0) as amount FROM invoices WHERE status != 'betaald' AND status != 'geannuleerd' AND due_date < CURRENT_DATE`,
    sql`SELECT COUNT(*) as total FROM tasks WHERE status IN ('open','in_uitvoering')`,
    sql`SELECT COUNT(*) as total FROM transport_orders WHERE status IN ('aangevraagd','gepland')`,
    sql`SELECT COALESCE(SUM(total),0) as year_total FROM invoices WHERE status = 'betaald' AND EXTRACT(YEAR FROM paid_date) = EXTRACT(YEAR FROM CURRENT_DATE)`,
    sql`SELECT TO_CHAR(paid_date, 'YYYY-MM') as month, COALESCE(SUM(total),0) as revenue, COUNT(*) as count
        FROM invoices WHERE status = 'betaald' AND paid_date >= CURRENT_DATE - INTERVAL '12 months'
        GROUP BY TO_CHAR(paid_date, 'YYYY-MM') ORDER BY month`,
    sql`SELECT COUNT(*) as total FROM caravans WHERE status = 'op_camping'`,
  ]);
  return {
    totalCustomers: Number(customers[0].total),
    totalCaravans: Number(caravans[0].total),
    storedCaravans: Number(caravans[0].stored),
    onSiteCaravans: Number(onSiteCaravans[0].total),
    activeContracts: Number(activeContracts[0].total),
    totalLocations: Number(locations[0].total),
    openInvoices: Number(openInvoices[0].total),
    openInvoiceAmount: Number(openInvoices[0].amount),
    overdueInvoices: Number(overdueInvoices[0].total),
    overdueAmount: Number(overdueInvoices[0].amount),
    openTasks: Number(openTasks[0].total),
    pendingTransports: Number(pendingTransports[0].total),
    yearRevenue: Number(revenue[0].year_total),
    monthlyRevenue: monthlyRevenue.map(r => ({ month: r.month, revenue: Number(r.revenue), count: Number(r.count) })),
  };
}

// Contact Messages
export async function createContactMessage(data: { name: string; email: string; phone?: string; subject?: string; message: string }) {
  await sql`INSERT INTO contact_messages (name, email, phone, subject, message) VALUES (${data.name}, ${data.email}, ${data.phone || null}, ${data.subject || null}, ${data.message})`;
}

export async function getContactMessages() {
  return sql`SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 200`;
}

// Activity Log
export function getAdminInfo(req: { headers: { get(name: string): string | null } }) {
  return {
    id: Number(req.headers.get('x-admin-id')) || 0,
    name: req.headers.get('x-admin-name') || 'Onbekend',
    role: req.headers.get('x-admin-role') || 'admin',
  };
}

export async function logActivity(data: { actor?: string; role?: string; action: string; entityType?: string; entityId?: string; entityLabel?: string; details?: string }) {
  await sql`INSERT INTO activity_log (actor, role, action, entity_type, entity_id, entity_label, details) VALUES (${data.actor || null}, ${data.role || null}, ${data.action}, ${data.entityType || null}, ${data.entityId || null}, ${data.entityLabel || null}, ${data.details || null})`.catch(() => {});
}

export async function getRecentActivity(limit = 30) {
  return sql`SELECT * FROM activity_log ORDER BY created_at DESC LIMIT ${limit}`;
}

export async function getEntityActivity(entityType: string, entityId: string, limit = 50) {
  return sql`SELECT * FROM activity_log WHERE entity_type = ${entityType} AND entity_id = ${entityId} ORDER BY created_at DESC LIMIT ${limit}`;
}

// ─── Guide Hub: Campings ───
export async function getGuideCampings(page = 1, limit = 20, search = '', region = '', stars?: number) {
  const offset = (page - 1) * limit;
  const q = search ? '%' + search + '%' : null;
  const rows = await sql`SELECT c.*, (SELECT url FROM guide_images WHERE entity_type = 'camping' AND entity_id = c.id AND is_cover = true LIMIT 1) as cover_image FROM guide_campings c WHERE c.is_active = true AND (${q}::text IS NULL OR c.name ILIKE ${q || ''} OR c.town ILIKE ${q || ''}) AND (${region || null}::text IS NULL OR c.region = ${region || ''}) AND (${stars ?? null}::int IS NULL OR c.stars = ${stars ?? 0}) ORDER BY c.is_featured DESC, c.stars DESC, c.name LIMIT ${limit} OFFSET ${offset}`;
  const cnt = await sql`SELECT COUNT(*) as total FROM guide_campings c WHERE c.is_active = true AND (${q}::text IS NULL OR c.name ILIKE ${q || ''} OR c.town ILIKE ${q || ''}) AND (${region || null}::text IS NULL OR c.region = ${region || ''}) AND (${stars ?? null}::int IS NULL OR c.stars = ${stars ?? 0})`;
  return { items: rows, total: Number(cnt[0].total) };
}
export async function getGuideCampingBySlug(slug: string) {
  const rows = await sql`SELECT * FROM guide_campings WHERE slug = ${slug} AND is_active = true LIMIT 1`;
  return rows[0] || null;
}
export async function createGuideCamping(data: Record<string, unknown>) {
  const res = await sql`INSERT INTO guide_campings (name, slug, description, region, town, address, lat, lng, stars, website, phone, price_range, amenities, highlights, is_featured) VALUES (${data.name as string}, ${data.slug as string}, ${data.description as string || null}, ${data.region as string || 'Costa Brava'}, ${data.town as string || null}, ${data.address as string || null}, ${data.lat as number || null}, ${data.lng as number || null}, ${data.stars as number || 3}, ${data.website as string || null}, ${data.phone as string || null}, ${data.price_range as string || '€€'}, ${JSON.stringify(data.amenities || [])}, ${JSON.stringify(data.highlights || [])}, ${data.is_featured === true}) RETURNING *`;
  return res[0];
}
export async function updateGuideCamping(id: number, data: Record<string, unknown>) {
  const res = await sql`UPDATE guide_campings SET name=${data.name as string}, slug=${data.slug as string}, description=${data.description as string||null}, region=${data.region as string||'Costa Brava'}, town=${data.town as string||null}, address=${data.address as string||null}, lat=${data.lat as number||null}, lng=${data.lng as number||null}, stars=${data.stars as number||3}, website=${data.website as string||null}, phone=${data.phone as string||null}, price_range=${data.price_range as string||'€€'}, amenities=${JSON.stringify(data.amenities||[])}, highlights=${JSON.stringify(data.highlights||[])}, is_featured=${data.is_featured===true}, is_active=${data.is_active!==false}, updated_at=NOW() WHERE id=${id} RETURNING *`;
  return res[0];
}
export async function deleteGuideCamping(id: number) {
  await sql`UPDATE guide_campings SET is_active = false, updated_at = NOW() WHERE id = ${id}`;
}

// ─── Guide Hub: Places ───
export async function getGuidePlaces(page = 1, limit = 20, search = '', region = '') {
  const offset = (page - 1) * limit;
  const q = search ? '%' + search + '%' : null;
  const rows = await sql`SELECT p.*, (SELECT url FROM guide_images WHERE entity_type = 'place' AND entity_id = p.id AND is_cover = true LIMIT 1) as cover_image FROM guide_places p WHERE p.is_active = true AND (${q}::text IS NULL OR p.name ILIKE ${q || ''}) AND (${region || null}::text IS NULL OR p.region = ${region || ''}) ORDER BY p.is_featured DESC, p.name LIMIT ${limit} OFFSET ${offset}`;
  const cnt = await sql`SELECT COUNT(*) as total FROM guide_places p WHERE p.is_active = true AND (${q}::text IS NULL OR p.name ILIKE ${q || ''}) AND (${region || null}::text IS NULL OR p.region = ${region || ''})`;
  return { items: rows, total: Number(cnt[0].total) };
}
export async function getGuidePlaceBySlug(slug: string) {
  const rows = await sql`SELECT * FROM guide_places WHERE slug = ${slug} AND is_active = true LIMIT 1`;
  return rows[0] || null;
}
export async function createGuidePlace(data: Record<string, unknown>) {
  const res = await sql`INSERT INTO guide_places (name, slug, description, region, town, lat, lng, highlights, best_season, population, is_featured) VALUES (${data.name as string}, ${data.slug as string}, ${data.description as string || null}, ${data.region as string || 'Costa Brava'}, ${data.town as string || null}, ${data.lat as number || null}, ${data.lng as number || null}, ${JSON.stringify(data.highlights || [])}, ${data.best_season as string || null}, ${data.population as string || null}, ${data.is_featured === true}) RETURNING *`;
  return res[0];
}
export async function updateGuidePlace(id: number, data: Record<string, unknown>) {
  const res = await sql`UPDATE guide_places SET name=${data.name as string}, slug=${data.slug as string}, description=${data.description as string||null}, region=${data.region as string||'Costa Brava'}, town=${data.town as string||null}, lat=${data.lat as number||null}, lng=${data.lng as number||null}, highlights=${JSON.stringify(data.highlights||[])}, best_season=${data.best_season as string||null}, population=${data.population as string||null}, is_featured=${data.is_featured===true}, is_active=${data.is_active!==false}, updated_at=NOW() WHERE id=${id} RETURNING *`;
  return res[0];
}
export async function deleteGuidePlace(id: number) {
  await sql`UPDATE guide_places SET is_active = false, updated_at = NOW() WHERE id = ${id}`;
}

// ─── Guide Hub: Beaches ───
export async function getGuideBeaches(page = 1, limit = 20, search = '', region = '', beachType = '') {
  const offset = (page - 1) * limit;
  const q = search ? '%' + search + '%' : null;
  const rows = await sql`SELECT b.*, p.name as place_name, (SELECT url FROM guide_images WHERE entity_type = 'beach' AND entity_id = b.id AND is_cover = true LIMIT 1) as cover_image FROM guide_beaches b LEFT JOIN guide_places p ON b.place_id = p.id WHERE b.is_active = true AND (${q}::text IS NULL OR b.name ILIKE ${q || ''}) AND (${region || null}::text IS NULL OR b.region = ${region || ''}) AND (${beachType || null}::text IS NULL OR b.beach_type = ${beachType || ''}) ORDER BY b.is_featured DESC, b.name LIMIT ${limit} OFFSET ${offset}`;
  const cnt = await sql`SELECT COUNT(*) as total FROM guide_beaches b WHERE b.is_active = true AND (${q}::text IS NULL OR b.name ILIKE ${q || ''}) AND (${region || null}::text IS NULL OR b.region = ${region || ''}) AND (${beachType || null}::text IS NULL OR b.beach_type = ${beachType || ''})`;
  return { items: rows, total: Number(cnt[0].total) };
}
export async function getGuideBeachBySlug(slug: string) {
  const rows = await sql`SELECT b.*, p.name as place_name FROM guide_beaches b LEFT JOIN guide_places p ON b.place_id = p.id WHERE b.slug = ${slug} AND b.is_active = true LIMIT 1`;
  return rows[0] || null;
}
export async function createGuideBeach(data: Record<string, unknown>) {
  const res = await sql`INSERT INTO guide_beaches (name, slug, description, place_id, region, town, beach_type, length_meters, blue_flag, lat, lng, facilities, is_featured) VALUES (${data.name as string}, ${data.slug as string}, ${data.description as string || null}, ${data.place_id as number || null}, ${data.region as string || 'Costa Brava'}, ${data.town as string || null}, ${data.beach_type as string || 'zand'}, ${data.length_meters as number || null}, ${data.blue_flag === true}, ${data.lat as number || null}, ${data.lng as number || null}, ${JSON.stringify(data.facilities || [])}, ${data.is_featured === true}) RETURNING *`;
  return res[0];
}
export async function updateGuideBeach(id: number, data: Record<string, unknown>) {
  const res = await sql`UPDATE guide_beaches SET name=${data.name as string}, slug=${data.slug as string}, description=${data.description as string||null}, place_id=${data.place_id as number||null}, region=${data.region as string||'Costa Brava'}, town=${data.town as string||null}, beach_type=${data.beach_type as string||'zand'}, length_meters=${data.length_meters as number||null}, blue_flag=${data.blue_flag===true}, lat=${data.lat as number||null}, lng=${data.lng as number||null}, facilities=${JSON.stringify(data.facilities||[])}, is_featured=${data.is_featured===true}, is_active=${data.is_active!==false}, updated_at=NOW() WHERE id=${id} RETURNING *`;
  return res[0];
}
export async function deleteGuideBeach(id: number) {
  await sql`UPDATE guide_beaches SET is_active = false, updated_at = NOW() WHERE id = ${id}`;
}

// ─── Guide Hub: Attractions ───
export async function getGuideAttractions(page = 1, limit = 20, search = '', region = '', category = '') {
  const offset = (page - 1) * limit;
  const q = search ? '%' + search + '%' : null;
  const rows = await sql`SELECT a.*, p.name as place_name, (SELECT url FROM guide_images WHERE entity_type = 'attraction' AND entity_id = a.id AND is_cover = true LIMIT 1) as cover_image FROM guide_attractions a LEFT JOIN guide_places p ON a.place_id = p.id WHERE a.is_active = true AND (${q}::text IS NULL OR a.name ILIKE ${q || ''}) AND (${region || null}::text IS NULL OR a.region = ${region || ''}) AND (${category || null}::text IS NULL OR a.category = ${category || ''}) ORDER BY a.is_featured DESC, a.name LIMIT ${limit} OFFSET ${offset}`;
  const cnt = await sql`SELECT COUNT(*) as total FROM guide_attractions a WHERE a.is_active = true AND (${q}::text IS NULL OR a.name ILIKE ${q || ''}) AND (${region || null}::text IS NULL OR a.region = ${region || ''}) AND (${category || null}::text IS NULL OR a.category = ${category || ''})`;
  return { items: rows, total: Number(cnt[0].total) };
}
export async function getGuideAttractionBySlug(slug: string) {
  const rows = await sql`SELECT a.*, p.name as place_name FROM guide_attractions a LEFT JOIN guide_places p ON a.place_id = p.id WHERE a.slug = ${slug} AND a.is_active = true LIMIT 1`;
  return rows[0] || null;
}
export async function createGuideAttraction(data: Record<string, unknown>) {
  const res = await sql`INSERT INTO guide_attractions (name, slug, description, place_id, region, town, category, address, lat, lng, website, price_info, opening_hours, price_range, highlights, is_featured) VALUES (${data.name as string}, ${data.slug as string}, ${data.description as string || null}, ${data.place_id as number || null}, ${data.region as string || 'Costa Brava'}, ${data.town as string || null}, ${data.category as string || 'bezienswaardigheid'}, ${data.address as string || null}, ${data.lat as number || null}, ${data.lng as number || null}, ${data.website as string || null}, ${data.price_info as string || null}, ${data.opening_hours as string || null}, ${data.price_range as string || null}, ${JSON.stringify(data.highlights || [])}, ${data.is_featured === true}) RETURNING *`;
  return res[0];
}
export async function updateGuideAttraction(id: number, data: Record<string, unknown>) {
  const res = await sql`UPDATE guide_attractions SET name=${data.name as string}, slug=${data.slug as string}, description=${data.description as string||null}, place_id=${data.place_id as number||null}, region=${data.region as string||'Costa Brava'}, town=${data.town as string||null}, category=${data.category as string||'bezienswaardigheid'}, address=${data.address as string||null}, lat=${data.lat as number||null}, lng=${data.lng as number||null}, website=${data.website as string||null}, price_info=${data.price_info as string||null}, opening_hours=${data.opening_hours as string||null}, price_range=${data.price_range as string||null}, highlights=${JSON.stringify(data.highlights||[])}, is_featured=${data.is_featured===true}, is_active=${data.is_active!==false}, updated_at=NOW() WHERE id=${id} RETURNING *`;
  return res[0];
}
export async function deleteGuideAttraction(id: number) {
  await sql`UPDATE guide_attractions SET is_active = false, updated_at = NOW() WHERE id = ${id}`;
}

// ─── Guide Hub: Restaurants ───
export async function getGuideRestaurants(page = 1, limit = 20, search = '', region = '', cuisineType = '') {
  const offset = (page - 1) * limit;
  const q = search ? '%' + search + '%' : null;
  const rows = await sql`SELECT r.*, p.name as place_name, (SELECT url FROM guide_images WHERE entity_type = 'restaurant' AND entity_id = r.id AND is_cover = true LIMIT 1) as cover_image FROM guide_restaurants r LEFT JOIN guide_places p ON r.place_id = p.id WHERE r.is_active = true AND (${q}::text IS NULL OR r.name ILIKE ${q || ''}) AND (${region || null}::text IS NULL OR r.region = ${region || ''}) AND (${cuisineType || null}::text IS NULL OR r.cuisine_type = ${cuisineType || ''}) ORDER BY r.is_featured DESC, r.name LIMIT ${limit} OFFSET ${offset}`;
  const cnt = await sql`SELECT COUNT(*) as total FROM guide_restaurants r WHERE r.is_active = true AND (${q}::text IS NULL OR r.name ILIKE ${q || ''}) AND (${region || null}::text IS NULL OR r.region = ${region || ''}) AND (${cuisineType || null}::text IS NULL OR r.cuisine_type = ${cuisineType || ''})`;
  return { items: rows, total: Number(cnt[0].total) };
}
export async function getGuideRestaurantBySlug(slug: string) {
  const rows = await sql`SELECT r.*, p.name as place_name FROM guide_restaurants r LEFT JOIN guide_places p ON r.place_id = p.id WHERE r.slug = ${slug} AND r.is_active = true LIMIT 1`;
  return rows[0] || null;
}
export async function createGuideRestaurant(data: Record<string, unknown>) {
  const res = await sql`INSERT INTO guide_restaurants (name, slug, description, place_id, region, town, cuisine_type, price_range, address, lat, lng, website, phone, michelin_stars, specialties, is_featured) VALUES (${data.name as string}, ${data.slug as string}, ${data.description as string || null}, ${data.place_id as number || null}, ${data.region as string || 'Costa Brava'}, ${data.town as string || null}, ${data.cuisine_type as string || null}, ${data.price_range as string || '€€'}, ${data.address as string || null}, ${data.lat as number || null}, ${data.lng as number || null}, ${data.website as string || null}, ${data.phone as string || null}, ${data.michelin_stars as number || 0}, ${JSON.stringify(data.specialties || [])}, ${data.is_featured === true}) RETURNING *`;
  return res[0];
}
export async function updateGuideRestaurant(id: number, data: Record<string, unknown>) {
  const res = await sql`UPDATE guide_restaurants SET name=${data.name as string}, slug=${data.slug as string}, description=${data.description as string||null}, place_id=${data.place_id as number||null}, region=${data.region as string||'Costa Brava'}, town=${data.town as string||null}, cuisine_type=${data.cuisine_type as string||null}, price_range=${data.price_range as string||'€€'}, address=${data.address as string||null}, lat=${data.lat as number||null}, lng=${data.lng as number||null}, website=${data.website as string||null}, phone=${data.phone as string||null}, michelin_stars=${data.michelin_stars as number||0}, specialties=${JSON.stringify(data.specialties||[])}, is_featured=${data.is_featured===true}, is_active=${data.is_active!==false}, updated_at=NOW() WHERE id=${id} RETURNING *`;
  return res[0];
}
export async function deleteGuideRestaurant(id: number) {
  await sql`UPDATE guide_restaurants SET is_active = false, updated_at = NOW() WHERE id = ${id}`;
}

// ─── Guide Hub: Blog Posts ───
export async function getGuideBlogPosts(page = 1, limit = 20, search = '', category = '', publishedOnly = true) {
  const offset = (page - 1) * limit;
  const q = search ? '%' + search + '%' : null;
  const rows = await sql`SELECT bp.*, (SELECT url FROM guide_images WHERE entity_type = 'blog' AND entity_id = bp.id AND is_cover = true LIMIT 1) as cover_image FROM guide_blog_posts bp WHERE (${publishedOnly} = false OR bp.is_published = true) AND (${q}::text IS NULL OR bp.title ILIKE ${q || ''} OR bp.excerpt ILIKE ${q || ''}) AND (${category || null}::text IS NULL OR bp.category = ${category || ''}) ORDER BY bp.is_featured DESC, bp.published_at DESC NULLS LAST, bp.created_at DESC LIMIT ${limit} OFFSET ${offset}`;
  const cnt = await sql`SELECT COUNT(*) as total FROM guide_blog_posts bp WHERE (${publishedOnly} = false OR bp.is_published = true) AND (${q}::text IS NULL OR bp.title ILIKE ${q || ''} OR bp.excerpt ILIKE ${q || ''}) AND (${category || null}::text IS NULL OR bp.category = ${category || ''})`;
  return { items: rows, total: Number(cnt[0].total) };
}
export async function getGuideBlogPostBySlug(slug: string) {
  const rows = await sql`SELECT * FROM guide_blog_posts WHERE slug = ${slug} LIMIT 1`;
  return rows[0] || null;
}
export async function createGuideBlogPost(data: Record<string, unknown>) {
  const res = await sql`INSERT INTO guide_blog_posts (title, slug, excerpt, content, category, read_time, author, tags, is_featured, is_published, published_at) VALUES (${data.title as string}, ${data.slug as string}, ${data.excerpt as string || null}, ${data.content as string || null}, ${data.category as string || 'Algemeen'}, ${data.read_time as string || '5 min'}, ${data.author as string || 'Caravanstalling Spanje'}, ${JSON.stringify(data.tags || [])}, ${data.is_featured === true}, ${data.is_published === true}, ${data.is_published === true ? new Date().toISOString() : null}) RETURNING *`;
  return res[0];
}
export async function updateGuideBlogPost(id: number, data: Record<string, unknown>) {
  const wasPublished = data._was_published === true;
  const isNowPublished = data.is_published === true;
  const publishedAt = (!wasPublished && isNowPublished) ? new Date().toISOString() : (data.published_at as string || null);
  const res = await sql`UPDATE guide_blog_posts SET title=${data.title as string}, slug=${data.slug as string}, excerpt=${data.excerpt as string||null}, content=${data.content as string||null}, category=${data.category as string||'Algemeen'}, read_time=${data.read_time as string||'5 min'}, author=${data.author as string||'Caravanstalling Spanje'}, tags=${JSON.stringify(data.tags||[])}, is_featured=${data.is_featured===true}, is_published=${data.is_published===true}, published_at=${publishedAt}, updated_at=NOW() WHERE id=${id} RETURNING *`;
  return res[0];
}
export async function deleteGuideBlogPost(id: number) {
  await sql`DELETE FROM guide_blog_posts WHERE id = ${id}`;
}

// ─── Guide Hub: Images ───
export async function getGuideImages(entityType: string, entityId: number) {
  return sql`SELECT * FROM guide_images WHERE entity_type = ${entityType} AND entity_id = ${entityId} ORDER BY is_cover DESC, sort_order ASC`;
}
export async function createGuideImage(data: { entity_type: string; entity_id: number; url: string; alt_text?: string; is_cover?: boolean; sort_order?: number }) {
  if (data.is_cover) {
    await sql`UPDATE guide_images SET is_cover = false WHERE entity_type = ${data.entity_type} AND entity_id = ${data.entity_id}`;
  }
  const res = await sql`INSERT INTO guide_images (entity_type, entity_id, url, alt_text, is_cover, sort_order) VALUES (${data.entity_type}, ${data.entity_id}, ${data.url}, ${data.alt_text || null}, ${data.is_cover || false}, ${data.sort_order || 0}) RETURNING *`;
  return res[0];
}
export async function deleteGuideImage(id: number) {
  const rows = await sql`DELETE FROM guide_images WHERE id = ${id} RETURNING url`;
  return rows[0]?.url || null;
}
export async function setGuideCoverImage(id: number, entityType: string, entityId: number) {
  await sql`UPDATE guide_images SET is_cover = false WHERE entity_type = ${entityType} AND entity_id = ${entityId}`;
  await sql`UPDATE guide_images SET is_cover = true WHERE id = ${id}`;
}

// ─── Guide Hub: Featured & Cross-search ───
export async function getGuideFeatured() {
  const [campings, places, beaches, attractions, restaurants, posts] = await Promise.all([
    sql`SELECT c.*, 'camping' as type, (SELECT url FROM guide_images WHERE entity_type = 'camping' AND entity_id = c.id AND is_cover = true LIMIT 1) as cover_image FROM guide_campings c WHERE c.is_featured = true AND c.is_active = true ORDER BY c.stars DESC LIMIT 6`,
    sql`SELECT p.*, 'place' as type, (SELECT url FROM guide_images WHERE entity_type = 'place' AND entity_id = p.id AND is_cover = true LIMIT 1) as cover_image FROM guide_places p WHERE p.is_featured = true AND p.is_active = true LIMIT 6`,
    sql`SELECT b.*, 'beach' as type, (SELECT url FROM guide_images WHERE entity_type = 'beach' AND entity_id = b.id AND is_cover = true LIMIT 1) as cover_image FROM guide_beaches b WHERE b.is_featured = true AND b.is_active = true LIMIT 6`,
    sql`SELECT a.*, 'attraction' as type, (SELECT url FROM guide_images WHERE entity_type = 'attraction' AND entity_id = a.id AND is_cover = true LIMIT 1) as cover_image FROM guide_attractions a WHERE a.is_featured = true AND a.is_active = true LIMIT 6`,
    sql`SELECT r.*, 'restaurant' as type, (SELECT url FROM guide_images WHERE entity_type = 'restaurant' AND entity_id = r.id AND is_cover = true LIMIT 1) as cover_image FROM guide_restaurants r WHERE r.is_featured = true AND r.is_active = true LIMIT 6`,
    sql`SELECT bp.*, 'blog' as type, (SELECT url FROM guide_images WHERE entity_type = 'blog' AND entity_id = bp.id AND is_cover = true LIMIT 1) as cover_image FROM guide_blog_posts bp WHERE bp.is_featured = true AND bp.is_published = true ORDER BY bp.published_at DESC LIMIT 6`,
  ]);
  return { campings, places, beaches, attractions, restaurants, posts };
}

export async function getGuideStats() {
  const [c, p, b, a, r, bp] = await Promise.all([
    sql`SELECT COUNT(*) as total FROM guide_campings WHERE is_active = true`,
    sql`SELECT COUNT(*) as total FROM guide_places WHERE is_active = true`,
    sql`SELECT COUNT(*) as total FROM guide_beaches WHERE is_active = true`,
    sql`SELECT COUNT(*) as total FROM guide_attractions WHERE is_active = true`,
    sql`SELECT COUNT(*) as total FROM guide_restaurants WHERE is_active = true`,
    sql`SELECT COUNT(*) as total FROM guide_blog_posts WHERE is_published = true`,
  ]);
  return { campings: Number(c[0].total), places: Number(p[0].total), beaches: Number(b[0].total), attractions: Number(a[0].total), restaurants: Number(r[0].total), blogPosts: Number(bp[0].total) };
}

// ─── Reviews ───
export async function getAllReviews(page = 1, limit = 50, published?: boolean) {
  const offset = (page - 1) * limit;
  if (published !== undefined) {
    const rows = await sql`SELECT r.*, cu.first_name || ' ' || cu.last_name as customer_name, cu.email as customer_email
      FROM reviews r LEFT JOIN customers cu ON r.customer_id = cu.id
      WHERE r.is_published = ${published} ORDER BY r.created_at DESC LIMIT ${limit} OFFSET ${offset}`;
    const cnt = await sql`SELECT COUNT(*) as total FROM reviews WHERE is_published = ${published}`;
    return { reviews: rows, total: Number(cnt[0].total) };
  }
  const rows = await sql`SELECT r.*, cu.first_name || ' ' || cu.last_name as customer_name, cu.email as customer_email
    FROM reviews r LEFT JOIN customers cu ON r.customer_id = cu.id
    ORDER BY r.created_at DESC LIMIT ${limit} OFFSET ${offset}`;
  const cnt = await sql`SELECT COUNT(*) as total FROM reviews`;
  return { reviews: rows, total: Number(cnt[0].total) };
}

export async function getPublishedReviews(limit = 20) {
  return sql`SELECT r.rating, r.title, r.comment, r.admin_reply, r.created_at, cu.first_name
    FROM reviews r LEFT JOIN customers cu ON r.customer_id = cu.id
    WHERE r.is_published = true ORDER BY r.created_at DESC LIMIT ${limit}`;
}

export async function createReview(data: { customer_id: number; service_request_id?: number; rating: number; title?: string; comment?: string }) {
  const res = await sql`INSERT INTO reviews (customer_id, service_request_id, rating, title, comment)
    VALUES (${data.customer_id}, ${data.service_request_id || null}, ${data.rating}, ${data.title || null}, ${data.comment || null}) RETURNING *`;
  return res[0];
}

export async function updateReviewStatus(id: number, is_published: boolean, admin_reply?: string) {
  await sql`UPDATE reviews SET is_published = ${is_published}, admin_reply = ${admin_reply || null} WHERE id = ${id}`;
}

// ─── Discount Codes ───
export async function getAllDiscountCodes(page = 1, limit = 50) {
  const offset = (page - 1) * limit;
  const rows = await sql`SELECT * FROM discount_codes ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
  const cnt = await sql`SELECT COUNT(*) as total FROM discount_codes`;
  return { codes: rows, total: Number(cnt[0].total) };
}

export async function getDiscountCodeByCode(code: string) {
  const rows = await sql`SELECT * FROM discount_codes WHERE code = ${code} AND is_active = true AND (valid_from IS NULL OR valid_from <= CURRENT_DATE) AND (valid_until IS NULL OR valid_until >= CURRENT_DATE) AND (max_uses IS NULL OR used_count < max_uses) LIMIT 1`;
  return rows[0] || null;
}

export async function createDiscountCode(data: { code: string; description?: string; type: string; value: number; min_months?: number; max_uses?: number; valid_from?: string; valid_until?: string }) {
  const res = await sql`INSERT INTO discount_codes (code, description, type, value, min_months, max_uses, valid_from, valid_until)
    VALUES (${data.code}, ${data.description || null}, ${data.type}, ${data.value}, ${data.min_months || 1}, ${data.max_uses || null}, ${data.valid_from || null}, ${data.valid_until || null}) RETURNING *`;
  return res[0];
}

export async function updateDiscountCode(id: number, data: { is_active?: boolean; description?: string; max_uses?: number; valid_until?: string }) {
  await sql`UPDATE discount_codes SET
    is_active = COALESCE(${data.is_active ?? null}, is_active),
    description = COALESCE(${data.description ?? null}, description),
    max_uses = COALESCE(${data.max_uses ?? null}, max_uses),
    valid_until = COALESCE(${data.valid_until ?? null}::date, valid_until)
    WHERE id = ${id}`;
}

export async function incrementDiscountCodeUsage(code: string) {
  await sql`UPDATE discount_codes SET used_count = used_count + 1 WHERE code = ${code}`;
}

export { sql };
