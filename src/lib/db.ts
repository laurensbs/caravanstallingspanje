import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// Schema Setup
export async function initDatabase() {
  await sql`CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
  )`;

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
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`;

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

  return { success: true };
}

// Admin Users
export async function getAdminByEmail(email: string) {
  const rows = await sql`SELECT * FROM admin_users WHERE email = ${email} LIMIT 1`;
  return rows[0] || null;
}

export async function createAdmin(name: string, email: string, hash: string) {
  await sql`INSERT INTO admin_users (name, email, password_hash) VALUES (${name}, ${email}, ${hash})`;
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
export async function getAllContracts(status?: string) {
  if (status) {
    return sql`SELECT co.*, cu.first_name || ' ' || cu.last_name as customer_name, ca.brand || ' ' || COALESCE(ca.model,'') as caravan_name, ca.license_plate, l.name as location_name FROM contracts co LEFT JOIN customers cu ON co.customer_id = cu.id LEFT JOIN caravans ca ON co.caravan_id = ca.id LEFT JOIN locations l ON co.location_id = l.id WHERE co.status = ${status} ORDER BY co.end_date DESC`;
  }
  return sql`SELECT co.*, cu.first_name || ' ' || cu.last_name as customer_name, ca.brand || ' ' || COALESCE(ca.model,'') as caravan_name, ca.license_plate, l.name as location_name FROM contracts co LEFT JOIN customers cu ON co.customer_id = cu.id LEFT JOIN caravans ca ON co.caravan_id = ca.id LEFT JOIN locations l ON co.location_id = l.id ORDER BY co.end_date DESC`;
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
  const [customers, caravans, activeContracts, locations, openInvoices, overdueInvoices, openTasks, pendingTransports, revenue] = await Promise.all([
    sql`SELECT COUNT(*) as total FROM customers`,
    sql`SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status = 'gestald') as stored FROM caravans`,
    sql`SELECT COUNT(*) as total FROM contracts WHERE status = 'actief'`,
    sql`SELECT COUNT(*) as total FROM locations WHERE is_active = true`,
    sql`SELECT COUNT(*) as total, COALESCE(SUM(total),0) as amount FROM invoices WHERE status = 'open' OR status = 'verzonden'`,
    sql`SELECT COUNT(*) as total, COALESCE(SUM(total),0) as amount FROM invoices WHERE status != 'betaald' AND status != 'geannuleerd' AND due_date < CURRENT_DATE`,
    sql`SELECT COUNT(*) as total FROM tasks WHERE status IN ('open','in_uitvoering')`,
    sql`SELECT COUNT(*) as total FROM transport_orders WHERE status IN ('aangevraagd','gepland')`,
    sql`SELECT COALESCE(SUM(total),0) as year_total FROM invoices WHERE status = 'betaald' AND EXTRACT(YEAR FROM paid_date) = EXTRACT(YEAR FROM CURRENT_DATE)`,
  ]);
  return {
    totalCustomers: Number(customers[0].total),
    totalCaravans: Number(caravans[0].total),
    storedCaravans: Number(caravans[0].stored),
    activeContracts: Number(activeContracts[0].total),
    totalLocations: Number(locations[0].total),
    openInvoices: Number(openInvoices[0].total),
    openInvoiceAmount: Number(openInvoices[0].amount),
    overdueInvoices: Number(overdueInvoices[0].total),
    overdueAmount: Number(overdueInvoices[0].amount),
    openTasks: Number(openTasks[0].total),
    pendingTransports: Number(pendingTransports[0].total),
    yearRevenue: Number(revenue[0].year_total),
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
export async function logActivity(data: { actor?: string; role?: string; action: string; entityType?: string; entityId?: string; entityLabel?: string; details?: string }) {
  await sql`INSERT INTO activity_log (actor, role, action, entity_type, entity_id, entity_label, details) VALUES (${data.actor || null}, ${data.role || null}, ${data.action}, ${data.entityType || null}, ${data.entityId || null}, ${data.entityLabel || null}, ${data.details || null})`.catch(() => {});
}

export async function getRecentActivity(limit = 30) {
  return sql`SELECT * FROM activity_log ORDER BY created_at DESC LIMIT ${limit}`;
}

export { sql };
