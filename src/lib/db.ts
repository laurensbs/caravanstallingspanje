import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL || 'postgresql://placeholder:placeholder@localhost/placeholder');

// ─── Schema ───
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
  await sql`ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS failed_attempts INTEGER DEFAULT 0`;
  await sql`ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP`;
  await sql`ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT false`;

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
  await sql`CREATE INDEX IF NOT EXISTS idx_activity_log_created ON activity_log(created_at DESC)`;

  await sql`CREATE TABLE IF NOT EXISTS fridges (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    extra_email TEXT,
    device_type TEXT NOT NULL DEFAULT 'Grote koelkast',
    notes TEXT,
    holded_contact_id TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`;
  await sql`ALTER TABLE fridges ADD COLUMN IF NOT EXISTS holded_contact_id TEXT`;

  await sql`CREATE TABLE IF NOT EXISTS fridge_bookings (
    id SERIAL PRIMARY KEY,
    fridge_id INTEGER NOT NULL REFERENCES fridges(id) ON DELETE CASCADE,
    camping TEXT,
    start_date DATE,
    end_date DATE,
    spot_number TEXT,
    status TEXT NOT NULL DEFAULT 'compleet',
    notes TEXT,
    holded_invoice_id TEXT,
    holded_invoice_number TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`;
  await sql`ALTER TABLE fridge_bookings ADD COLUMN IF NOT EXISTS holded_invoice_id TEXT`;
  await sql`ALTER TABLE fridge_bookings ADD COLUMN IF NOT EXISTS holded_invoice_number TEXT`;

  await sql`CREATE INDEX IF NOT EXISTS idx_fridge_bookings_fridge ON fridge_bookings(fridge_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_fridge_bookings_start ON fridge_bookings(start_date)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_fridge_bookings_status ON fridge_bookings(status)`;
  // Prevents the same booking ever being invoiced twice; if a duplicate POST
  // sneaks through the application check below, the unique constraint catches it.
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_fridge_bookings_holded_invoice ON fridge_bookings(holded_invoice_id) WHERE holded_invoice_id IS NOT NULL`;

  return { success: true };
}

// ─── Admin users ───
export async function getAdminByEmail(email: string) {
  const rows = await sql`SELECT * FROM admin_users WHERE email = ${email} AND is_active = true LIMIT 1`;
  return rows[0] || null;
}

export async function getAdminById(id: number) {
  const rows = await sql`SELECT * FROM admin_users WHERE id = ${id} AND is_active = true LIMIT 1`;
  return rows[0] || null;
}

export async function getActiveAdmins() {
  return sql`SELECT id, name, role FROM admin_users WHERE is_active = true ORDER BY name`;
}

export async function createAdmin(name: string, email: string, hash: string, role = 'admin') {
  await sql`INSERT INTO admin_users (name, email, password_hash, role) VALUES (${name}, ${email}, ${hash}, ${role})`;
}

export async function recordLoginSuccess(id: number) {
  await sql`UPDATE admin_users SET failed_attempts = 0, locked_until = NULL, last_login = NOW() WHERE id = ${id}`;
}

export async function recordLoginFailure(id: number) {
  const MAX_ATTEMPTS = 5;
  await sql`UPDATE admin_users SET failed_attempts = failed_attempts + 1,
    locked_until = CASE WHEN failed_attempts + 1 >= ${MAX_ATTEMPTS} THEN NOW() + INTERVAL '15 minutes' ELSE locked_until END
    WHERE id = ${id}`;
}

export async function isAccountLocked(id: number): Promise<boolean> {
  const rows = await sql`SELECT locked_until FROM admin_users WHERE id = ${id} LIMIT 1`;
  if (!rows[0]?.locked_until) return false;
  return new Date(rows[0].locked_until) > new Date();
}

export async function setAdminPassword(id: number, hash: string) {
  await sql`UPDATE admin_users SET password_hash = ${hash}, must_change_password = false, failed_attempts = 0, locked_until = NULL WHERE id = ${id}`;
}

export async function markAllAdminsForPasswordChange() {
  await sql`UPDATE admin_users SET must_change_password = true`;
}

// ─── Activity log ───
export function getAdminInfo(req: { headers: { get(name: string): string | null } }) {
  return {
    id: Number(req.headers.get('x-admin-id')) || 0,
    name: req.headers.get('x-admin-name') || 'Onbekend',
    role: req.headers.get('x-admin-role') || 'admin',
  };
}

export async function logActivity(data: { actor?: string; role?: string; action: string; entityType?: string; entityId?: string; entityLabel?: string; details?: string }) {
  await sql`INSERT INTO activity_log (actor, role, action, entity_type, entity_id, entity_label, details)
    VALUES (${data.actor || null}, ${data.role || null}, ${data.action}, ${data.entityType || null}, ${data.entityId || null}, ${data.entityLabel || null}, ${data.details || null})`.catch(() => {});
}

export async function getRecentActivity(limit = 30) {
  return sql`SELECT * FROM activity_log ORDER BY created_at DESC LIMIT ${limit}`;
}

// ─── Fridges ───
// Status filter forces an INNER JOIN so the customer only appears when at least
// one of their periods matches; without a status we LEFT JOIN to keep customers
// without periods visible. Year and search use sentinel values so the WHERE
// clause stays the same shape across calls.
export async function getAllFridges(year?: number, status?: string, search?: string) {
  const y = year ?? 0;
  const s = search ? `%${search}%` : null;

  const rows = status
    ? await sql`
        SELECT f.*,
          COALESCE(json_agg(json_build_object(
            'id', b.id, 'camping', b.camping, 'start_date', b.start_date, 'end_date', b.end_date,
            'spot_number', b.spot_number, 'status', b.status, 'notes', b.notes,
            'holded_invoice_id', b.holded_invoice_id, 'holded_invoice_number', b.holded_invoice_number
          ) ORDER BY b.start_date NULLS LAST) FILTER (WHERE b.id IS NOT NULL), '[]') AS bookings
        FROM fridges f
        INNER JOIN fridge_bookings b ON b.fridge_id = f.id
          AND (${y} = 0 OR EXTRACT(YEAR FROM b.start_date) = ${y})
          AND b.status = ${status}
        WHERE (${s}::text IS NULL
          OR f.name ILIKE ${s}
          OR f.email ILIKE ${s}
          OR EXISTS (SELECT 1 FROM fridge_bookings bb WHERE bb.fridge_id = f.id AND bb.camping ILIKE ${s}))
        GROUP BY f.id
        ORDER BY f.name`
    : await sql`
        SELECT f.*,
          COALESCE(json_agg(json_build_object(
            'id', b.id, 'camping', b.camping, 'start_date', b.start_date, 'end_date', b.end_date,
            'spot_number', b.spot_number, 'status', b.status, 'notes', b.notes,
            'holded_invoice_id', b.holded_invoice_id, 'holded_invoice_number', b.holded_invoice_number
          ) ORDER BY b.start_date NULLS LAST) FILTER (WHERE b.id IS NOT NULL), '[]') AS bookings
        FROM fridges f
        LEFT JOIN fridge_bookings b ON b.fridge_id = f.id
          AND (${y} = 0 OR EXTRACT(YEAR FROM b.start_date) = ${y})
        WHERE (${s}::text IS NULL
          OR f.name ILIKE ${s}
          OR f.email ILIKE ${s}
          OR EXISTS (SELECT 1 FROM fridge_bookings bb WHERE bb.fridge_id = f.id AND bb.camping ILIKE ${s}))
        GROUP BY f.id
        ORDER BY f.name`;

  return { fridges: rows, total: rows.length };
}

export async function getFridgeById(id: number) {
  const rows = await sql`
    SELECT f.*,
      COALESCE(json_agg(json_build_object(
        'id', b.id, 'camping', b.camping, 'start_date', b.start_date, 'end_date', b.end_date,
        'spot_number', b.spot_number, 'status', b.status, 'notes', b.notes,
        'holded_invoice_id', b.holded_invoice_id, 'holded_invoice_number', b.holded_invoice_number
      ) ORDER BY b.start_date NULLS LAST) FILTER (WHERE b.id IS NOT NULL), '[]') AS bookings
    FROM fridges f
    LEFT JOIN fridge_bookings b ON b.fridge_id = f.id
    WHERE f.id = ${id}
    GROUP BY f.id`;
  return rows[0] || null;
}

export async function createFridge(data: { name: string; email?: string | null; extra_email?: string | null; device_type?: string; notes?: string | null }) {
  const res = await sql`INSERT INTO fridges (name, email, extra_email, device_type, notes)
    VALUES (${data.name}, ${data.email || null}, ${data.extra_email || null}, ${data.device_type || 'Grote koelkast'}, ${data.notes || null}) RETURNING *`;
  return res[0];
}

export async function findFridgeByEmail(email: string) {
  if (!email) return null;
  const rows = await sql`SELECT * FROM fridges WHERE LOWER(email) = LOWER(${email}) LIMIT 1`;
  return rows[0] || null;
}

export async function getCampingSuggestions(): Promise<string[]> {
  const rows = await sql`
    SELECT DISTINCT camping FROM fridge_bookings
    WHERE camping IS NOT NULL AND camping <> ''
    ORDER BY camping`;
  return (rows as { camping: string }[]).map(r => r.camping);
}

export async function updateFridge(id: number, data: { name?: string; email?: string | null; extra_email?: string | null; device_type?: string; notes?: string | null }) {
  await sql`UPDATE fridges SET
    name = COALESCE(${data.name ?? null}, name),
    email = COALESCE(${data.email ?? null}, email),
    extra_email = COALESCE(${data.extra_email ?? null}, extra_email),
    device_type = COALESCE(${data.device_type ?? null}, device_type),
    notes = COALESCE(${data.notes ?? null}, notes),
    updated_at = NOW()
    WHERE id = ${id}`;
}

export async function setFridgeHoldedContact(id: number, holdedContactId: string) {
  await sql`UPDATE fridges SET holded_contact_id = ${holdedContactId}, updated_at = NOW() WHERE id = ${id}`;
}

export async function deleteFridge(id: number) {
  await sql`DELETE FROM fridges WHERE id = ${id}`;
}

export async function createFridgeBooking(fridgeId: number, data: { camping?: string | null; start_date?: string | null; end_date?: string | null; spot_number?: string | null; status?: string; notes?: string | null }) {
  const res = await sql`INSERT INTO fridge_bookings (fridge_id, camping, start_date, end_date, spot_number, status, notes)
    VALUES (${fridgeId}, ${data.camping || null}, ${data.start_date || null}::date, ${data.end_date || null}::date, ${data.spot_number || null}, ${data.status || 'compleet'}, ${data.notes || null}) RETURNING *`;
  return res[0];
}

export async function updateFridgeBooking(id: number, data: { camping?: string | null; start_date?: string | null; end_date?: string | null; spot_number?: string | null; status?: string; notes?: string | null }) {
  await sql`UPDATE fridge_bookings SET
    camping = COALESCE(${data.camping ?? null}, camping),
    start_date = COALESCE(${data.start_date ?? null}::date, start_date),
    end_date = COALESCE(${data.end_date ?? null}::date, end_date),
    spot_number = COALESCE(${data.spot_number ?? null}, spot_number),
    status = COALESCE(${data.status ?? null}, status),
    notes = COALESCE(${data.notes ?? null}, notes),
    updated_at = NOW()
    WHERE id = ${id}`;
}

export async function setBookingHoldedInvoice(id: number, holdedInvoiceId: string, holdedInvoiceNumber: string) {
  await sql`UPDATE fridge_bookings SET holded_invoice_id = ${holdedInvoiceId}, holded_invoice_number = ${holdedInvoiceNumber}, updated_at = NOW() WHERE id = ${id}`;
}

export async function getBookingById(id: number) {
  const rows = await sql`SELECT * FROM fridge_bookings WHERE id = ${id} LIMIT 1`;
  return rows[0] || null;
}

export async function deleteFridgeBooking(id: number) {
  await sql`DELETE FROM fridge_bookings WHERE id = ${id}`;
}

export async function getFridgeStats(year?: number) {
  const y = year ?? 0;
  const totalFridges = await sql`SELECT COUNT(*) as c FROM fridges`;
  const byStatus = await sql`SELECT status, COUNT(*) as count FROM fridge_bookings WHERE (${y} = 0 OR EXTRACT(YEAR FROM start_date) = ${y}) GROUP BY status`;
  const totalBookings = await sql`SELECT COUNT(*) as c FROM fridge_bookings WHERE (${y} = 0 OR EXTRACT(YEAR FROM start_date) = ${y})`;
  return {
    totalFridges: Number(totalFridges[0].c),
    totalBookings: Number(totalBookings[0].c),
    byStatus,
  };
}

export { sql };
