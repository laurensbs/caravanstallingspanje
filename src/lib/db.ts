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

  await sql`ALTER TABLE stalling_requests ADD COLUMN IF NOT EXISTS holded_invoice_id TEXT`;
  await sql`ALTER TABLE stalling_requests ADD COLUMN IF NOT EXISTS holded_invoice_number TEXT`;
  await sql`ALTER TABLE transport_requests ADD COLUMN IF NOT EXISTS holded_invoice_id TEXT`;
  await sql`ALTER TABLE transport_requests ADD COLUMN IF NOT EXISTS holded_invoice_number TEXT`;

  await sql`CREATE TABLE IF NOT EXISTS pending_intakes (
    id SERIAL PRIMARY KEY,
    stripe_session_id TEXT UNIQUE NOT NULL,
    payload JSONB NOT NULL,
    forwarded_at TIMESTAMP,
    forward_repair_job_id TEXT,
    abandoned_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
  )`;
  await sql`ALTER TABLE pending_intakes ADD COLUMN IF NOT EXISTS abandoned_at TIMESTAMP`;
  // Allow rows to exist before we have a Stripe session id (we insert first,
  // then create the Stripe session, then attach the id). Drop the NOT NULL.
  await sql`ALTER TABLE pending_intakes ALTER COLUMN stripe_session_id DROP NOT NULL`.catch(() => {});
  await sql`CREATE INDEX IF NOT EXISTS idx_pending_intakes_session ON pending_intakes(stripe_session_id)`;

  // services_catalog tabel is verwijderd — services worden nu beheerd in
  // het reparatiepaneel en via /api/services-public publiek opgehaald.
  // De oude tabel laten we in productie staan (geen DROP) maar wordt niet
  // meer gelezen of geschreven.

  await sql`CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW()
  )`;
  // Seed default prices once (no-op if already present)
  await sql`INSERT INTO app_settings (key, value) VALUES
    ('stalling_price_binnen', '950'::jsonb),
    ('stalling_price_buiten', '650'::jsonb)
    ON CONFLICT (key) DO NOTHING`;
  // transport_price is dood — transport is geen betaalde dienst meer.
  await sql`DELETE FROM app_settings WHERE key = 'transport_price'`;

  await sql`CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    stripe_session_id TEXT UNIQUE,
    stripe_payment_intent_id TEXT,
    stripe_event_id TEXT,
    kind TEXT NOT NULL,
    ref_id TEXT,
    amount_cents INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'eur',
    customer_email TEXT,
    description TEXT,
    status TEXT NOT NULL,
    raw JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`;
  await sql`CREATE INDEX IF NOT EXISTS idx_payments_kind_ref ON payments(kind, ref_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_payments_created ON payments(created_at DESC)`;
  await sql`CREATE TABLE IF NOT EXISTS stripe_events (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    received_at TIMESTAMP DEFAULT NOW()
  )`;

  await sql`CREATE TABLE IF NOT EXISTS transport_requests (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    from_location TEXT NOT NULL,
    to_location TEXT NOT NULL,
    preferred_date DATE,
    return_date DATE,
    camping TEXT,
    registration TEXT,
    brand TEXT,
    model TEXT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'controleren',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`;
  await sql`ALTER TABLE transport_requests ADD COLUMN IF NOT EXISTS return_date DATE`;
  await sql`ALTER TABLE transport_requests ADD COLUMN IF NOT EXISTS camping TEXT`;
  await sql`ALTER TABLE transport_requests ADD COLUMN IF NOT EXISTS created_via TEXT NOT NULL DEFAULT 'public'`;
  await sql`ALTER TABLE transport_requests ADD COLUMN IF NOT EXISTS outbound_time TEXT`;
  await sql`ALTER TABLE transport_requests ADD COLUMN IF NOT EXISTS return_time TEXT`;
  await sql`CREATE INDEX IF NOT EXISTS idx_transport_requests_status ON transport_requests(status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_transport_requests_created ON transport_requests(created_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_transport_requests_date ON transport_requests(preferred_date)`;

  await sql`CREATE TABLE IF NOT EXISTS stalling_requests (
    id SERIAL PRIMARY KEY,
    type TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    registration TEXT,
    brand TEXT,
    model TEXT,
    length TEXT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'controleren',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`;
  await sql`CREATE INDEX IF NOT EXISTS idx_stalling_requests_status ON stalling_requests(status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_stalling_requests_created ON stalling_requests(created_at DESC)`;

  await sql`CREATE TABLE IF NOT EXISTS fridge_waitlist (
    id SERIAL PRIMARY KEY,
    device_type TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    camping TEXT,
    spot_number TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'wachtend',
    created_at TIMESTAMP DEFAULT NOW(),
    notified_at TIMESTAMP
  )`;
  await sql`CREATE INDEX IF NOT EXISTS idx_fridge_waitlist_status ON fridge_waitlist(status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_fridge_waitlist_dates ON fridge_waitlist(start_date, end_date)`;

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

// Number of bookings that are currently "out" (today between start and end),
// grouped by device_type. start_date inclusive, end_date inclusive.
export async function getActiveBookingsByType(): Promise<{ device_type: string; count: number }[]> {
  const rows = await sql`
    SELECT f.device_type, COUNT(b.id) AS count
    FROM fridge_bookings b
    JOIN fridges f ON f.id = b.fridge_id
    WHERE b.start_date IS NOT NULL
      AND b.end_date IS NOT NULL
      AND CURRENT_DATE BETWEEN b.start_date AND b.end_date
      AND b.status <> 'controleren'
    GROUP BY f.device_type`;
  return (rows as { device_type: string; count: string | number }[])
    .map(r => ({ device_type: r.device_type, count: Number(r.count) }));
}

// Currently active bookings (today within start..end). Joins fridge data so
// the admin can see who has what out, sorted by end_date so soonest-returns
// come first.
export async function getActiveBookings(): Promise<Array<{
  id: number;
  fridge_id: number;
  customer_name: string;
  email: string | null;
  device_type: string;
  camping: string | null;
  spot_number: string | null;
  start_date: string;
  end_date: string;
  status: string;
}>> {
  const rows = await sql`
    SELECT b.id, b.fridge_id, f.name AS customer_name, f.email,
      f.device_type, b.camping, b.spot_number,
      b.start_date, b.end_date, b.status
    FROM fridge_bookings b
    JOIN fridges f ON f.id = b.fridge_id
    WHERE b.start_date IS NOT NULL
      AND b.end_date IS NOT NULL
      AND CURRENT_DATE BETWEEN b.start_date AND b.end_date
      AND b.status <> 'controleren'
    ORDER BY b.end_date ASC`;
  return rows as never;
}

// Klant 360°: zoek alle diensten op basis van email (case-insensitive).
// Gebruikt door /admin/transport om te zien of een klant ook een koelkast
// of stalling heeft lopen.
export async function getCustomerOverview(email: string) {
  if (!email) return { fridges: [], stalling: [], otherTransports: [] };
  const fridges = await sql`
    SELECT f.id, f.name, f.device_type,
      COALESCE(json_agg(json_build_object(
        'id', b.id, 'camping', b.camping, 'spot_number', b.spot_number,
        'start_date', b.start_date, 'end_date', b.end_date, 'status', b.status,
        'holded_invoice_number', b.holded_invoice_number
      ) ORDER BY b.start_date DESC NULLS LAST) FILTER (WHERE b.id IS NOT NULL), '[]') AS bookings
    FROM fridges f
    LEFT JOIN fridge_bookings b ON b.fridge_id = f.id
    WHERE LOWER(f.email) = LOWER(${email})
    GROUP BY f.id`;
  const stalling = await sql`
    SELECT id, type, start_date, end_date, status, registration
    FROM stalling_requests
    WHERE LOWER(email) = LOWER(${email})
    ORDER BY created_at DESC`;
  const otherTransports = await sql`
    SELECT id, camping, preferred_date, return_date, status, created_via
    FROM transport_requests
    WHERE LOWER(email) = LOWER(${email})
    ORDER BY preferred_date DESC NULLS LAST`;
  return {
    fridges: fridges as never,
    stalling: stalling as never,
    otherTransports: otherTransports as never,
  };
}

// How many fridges of a given type have at least one day overlap with the
// requested period. Two periods overlap when start <= other_end AND end >= other_start.
export async function countOverlappingBookings(
  deviceType: string,
  startDate: string,
  endDate: string,
): Promise<number> {
  const rows = await sql`
    SELECT COUNT(b.id) AS count
    FROM fridge_bookings b
    JOIN fridges f ON f.id = b.fridge_id
    WHERE f.device_type = ${deviceType}
      AND b.start_date IS NOT NULL
      AND b.end_date IS NOT NULL
      AND b.start_date <= ${endDate}::date
      AND b.end_date >= ${startDate}::date`;
  return Number((rows as { count: string | number }[])[0]?.count || 0);
}

// ─── Pending intakes (service-aanvragen wachtend op betaling) ───
export async function createPendingIntake(stripe_session_id: string, payload: unknown) {
  const json = JSON.stringify(payload);
  await sql`INSERT INTO pending_intakes (stripe_session_id, payload)
    VALUES (${stripe_session_id}, ${json}::jsonb)`;
}

// Insert eerst zonder session-id zodat we het ID terug krijgen voor de
// klant-zichtbare ref. Daarna attachen we de Stripe-session.
export async function createPendingIntakeReturningId(payload: unknown): Promise<number> {
  const json = JSON.stringify(payload);
  const rows = await sql`INSERT INTO pending_intakes (payload, stripe_session_id)
    VALUES (${json}::jsonb, NULL)
    RETURNING id`;
  return Number((rows as { id: number }[])[0].id);
}

export async function attachStripeSessionToPendingIntake(id: number, stripe_session_id: string) {
  await sql`UPDATE pending_intakes SET stripe_session_id = ${stripe_session_id} WHERE id = ${id}`;
}

export async function abandonPendingIntake(id: number, reason?: string) {
  await sql`UPDATE pending_intakes
    SET abandoned_at = NOW(),
      payload = jsonb_set(payload, '{_abandonReason}', to_jsonb(${reason || 'unknown'}::text))
    WHERE id = ${id}`;
}

export async function getPendingIntakeById(id: number) {
  const rows = await sql`SELECT * FROM pending_intakes WHERE id = ${id} LIMIT 1`;
  return (rows[0] as unknown as {
    id: number;
    stripe_session_id: string | null;
    payload: unknown;
    forwarded_at: string | null;
    forward_repair_job_id: string | null;
    abandoned_at: string | null;
    created_at: string;
  }) || null;
}

// Markeer intakes ouder dan {hours} en zonder forward of abandon als verlaten.
// Lazy cleanup — aangeroepen vanuit de webhook handler zodat we geen cron
// nodig hebben.
export async function cleanupOldPendingIntakes(hours = 24) {
  await sql`UPDATE pending_intakes
    SET abandoned_at = NOW()
    WHERE forwarded_at IS NULL
      AND abandoned_at IS NULL
      AND created_at < NOW() - (${hours}::int * INTERVAL '1 hour')`;
}

export async function getPendingIntakeBySession(stripe_session_id: string) {
  const rows = await sql`SELECT * FROM pending_intakes WHERE stripe_session_id = ${stripe_session_id} LIMIT 1`;
  return (rows[0] as unknown as { id: number; stripe_session_id: string; payload: unknown; forwarded_at: string | null; forward_repair_job_id: string | null }) || null;
}

export async function markPendingIntakeForwarded(id: number, repairJobId: string) {
  await sql`UPDATE pending_intakes SET forwarded_at = NOW(), forward_repair_job_id = ${repairJobId} WHERE id = ${id}`;
}

// ─── App settings (key/value JSON) ───
export async function getSettings(keys: string[]): Promise<Record<string, unknown>> {
  if (keys.length === 0) return {};
  const rows = await sql`SELECT key, value FROM app_settings WHERE key = ANY(${keys}::text[])`;
  const map: Record<string, unknown> = {};
  for (const r of rows as unknown as { key: string; value: unknown }[]) map[r.key] = r.value;
  return map;
}

export async function setSetting(key: string, value: unknown) {
  const json = JSON.stringify(value);
  await sql`INSERT INTO app_settings (key, value, updated_at)
    VALUES (${key}, ${json}::jsonb, NOW())
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`;
}

// ─── Payments / Stripe ───
export async function recordStripeEventOnce(eventId: string, type: string): Promise<boolean> {
  // Returns true if this is the first time we see this event id (so caller
  // should process), false if we've already handled it (idempotency guard).
  const res = await sql`
    INSERT INTO stripe_events (id, type) VALUES (${eventId}, ${type})
    ON CONFLICT (id) DO NOTHING
    RETURNING id`;
  return res.length > 0;
}

export async function unrecordStripeEvent(eventId: string) {
  // Used when a handler fails — we delete the event marker so Stripe's
  // retry will be processed instead of skipped as a duplicate.
  await sql`DELETE FROM stripe_events WHERE id = ${eventId}`;
}

export async function upsertPayment(data: {
  stripe_session_id?: string | null;
  stripe_payment_intent_id?: string | null;
  stripe_event_id?: string | null;
  kind: string;
  ref_id?: string | null;
  amount_cents: number;
  currency?: string;
  customer_email?: string | null;
  description?: string | null;
  status: string;
  raw?: unknown;
}) {
  const rawJson = data.raw ? JSON.stringify(data.raw) : null;
  await sql`INSERT INTO payments
    (stripe_session_id, stripe_payment_intent_id, stripe_event_id, kind, ref_id,
     amount_cents, currency, customer_email, description, status, raw)
    VALUES (${data.stripe_session_id || null}, ${data.stripe_payment_intent_id || null},
      ${data.stripe_event_id || null}, ${data.kind}, ${data.ref_id || null},
      ${data.amount_cents}, ${data.currency || 'eur'}, ${data.customer_email || null},
      ${data.description || null}, ${data.status}, ${rawJson}::jsonb)
    ON CONFLICT (stripe_session_id) DO UPDATE SET
      status = EXCLUDED.status,
      stripe_payment_intent_id = COALESCE(EXCLUDED.stripe_payment_intent_id, payments.stripe_payment_intent_id),
      stripe_event_id = EXCLUDED.stripe_event_id,
      raw = EXCLUDED.raw,
      updated_at = NOW()`;
}

export async function markBookingPaid(bookingId: number, sessionId: string) {
  await sql`UPDATE fridge_bookings
    SET status = 'compleet', updated_at = NOW()
    WHERE id = ${bookingId}`;
  void sessionId;
}

export async function markStallingRequestPaid(id: number) {
  await sql`UPDATE stalling_requests SET status = 'betaald', updated_at = NOW() WHERE id = ${id}`;
}

// Kept for admin manual mark-as-paid in /admin/transport even though
// transport no longer goes through Stripe.
export async function markTransportRequestPaid(id: number) {
  await sql`UPDATE transport_requests SET status = 'betaald', updated_at = NOW() WHERE id = ${id}`;
}

export async function getStallingRequestById(id: number) {
  const rows = await sql`SELECT * FROM stalling_requests WHERE id = ${id} LIMIT 1`;
  return rows[0] || null;
}

export async function getTransportRequestById(id: number) {
  const rows = await sql`SELECT * FROM transport_requests WHERE id = ${id} LIMIT 1`;
  return rows[0] || null;
}

export async function setStallingHoldedInvoice(id: number, invoiceId: string, invoiceNum: string) {
  await sql`UPDATE stalling_requests SET holded_invoice_id = ${invoiceId}, holded_invoice_number = ${invoiceNum}, updated_at = NOW() WHERE id = ${id}`;
}

export async function setTransportHoldedInvoice(id: number, invoiceId: string, invoiceNum: string) {
  await sql`UPDATE transport_requests SET holded_invoice_id = ${invoiceId}, holded_invoice_number = ${invoiceNum}, updated_at = NOW() WHERE id = ${id}`;
}

// ─── Transport requests (lokaal — eigen operatie, niet reparatie) ───
export async function createTransportRequest(data: {
  name: string;
  email: string;
  phone?: string | null;
  /** Camping waar de caravan staat. Heen-rit gaat van stalling → camping,
   *  terug-rit van camping → stalling. */
  camping: string;
  outbound_date: string;
  outbound_time?: string | null;
  return_date: string;
  return_time?: string | null;
  registration?: string | null;
  brand?: string | null;
  model?: string | null;
  notes?: string | null;
  created_via?: 'public' | 'admin';
  status?: string;
}) {
  const res = await sql`INSERT INTO transport_requests
    (name, email, phone, from_location, to_location,
     camping, preferred_date, return_date, outbound_time, return_time,
     registration, brand, model, notes, created_via, status)
    VALUES (${data.name}, ${data.email}, ${data.phone || null},
      'Stalling Cruïlles', ${data.camping},
      ${data.camping}, ${data.outbound_date}::date, ${data.return_date}::date,
      ${data.outbound_time || null}, ${data.return_time || null},
      ${data.registration || null}, ${data.brand || null}, ${data.model || null},
      ${data.notes || null}, ${data.created_via || 'public'}, ${data.status || 'controleren'})
    RETURNING *`;
  return res[0];
}

export async function getAllTransportRequests(status?: string) {
  if (status) {
    return sql`SELECT * FROM transport_requests WHERE status = ${status} ORDER BY
      preferred_date NULLS LAST, created_at DESC`;
  }
  return sql`SELECT * FROM transport_requests ORDER BY
    preferred_date NULLS LAST, created_at DESC`;
}

export async function updateTransportRequestStatus(id: number, status: string) {
  await sql`UPDATE transport_requests SET status = ${status}, updated_at = NOW() WHERE id = ${id}`;
}

export async function deleteTransportRequest(id: number) {
  await sql`DELETE FROM transport_requests WHERE id = ${id}`;
}

// ─── Stalling requests (lokaal, niet doorgestuurd) ───
export async function createStallingRequest(data: {
  type: 'binnen' | 'buiten';
  name: string;
  email: string;
  phone?: string | null;
  start_date: string;
  end_date?: string | null;
  registration?: string | null;
  brand?: string | null;
  model?: string | null;
  length?: string | null;
  notes?: string | null;
}) {
  const res = await sql`INSERT INTO stalling_requests
    (type, name, email, phone, start_date, end_date, registration, brand, model, length, notes)
    VALUES (${data.type}, ${data.name}, ${data.email}, ${data.phone || null},
      ${data.start_date}::date, ${data.end_date || null}::date,
      ${data.registration || null}, ${data.brand || null}, ${data.model || null},
      ${data.length || null}, ${data.notes || null})
    RETURNING *`;
  return res[0];
}

// ─── Waitlist ───
export async function createWaitlistEntry(data: {
  device_type: string;
  name: string;
  email: string;
  phone?: string | null;
  camping?: string | null;
  spot_number?: string | null;
  start_date: string;
  end_date: string;
  notes?: string | null;
}) {
  const res = await sql`INSERT INTO fridge_waitlist
    (device_type, name, email, phone, camping, spot_number, start_date, end_date, notes)
    VALUES (${data.device_type}, ${data.name}, ${data.email}, ${data.phone || null},
      ${data.camping || null}, ${data.spot_number || null},
      ${data.start_date}::date, ${data.end_date}::date, ${data.notes || null})
    RETURNING *`;
  return res[0];
}

export async function getWaitlist() {
  return sql`SELECT * FROM fridge_waitlist ORDER BY created_at DESC`;
}

export async function deleteWaitlistEntry(id: number) {
  await sql`DELETE FROM fridge_waitlist WHERE id = ${id}`;
}

export async function markWaitlistNotified(id: number) {
  await sql`UPDATE fridge_waitlist SET status = 'genotificeerd', notified_at = NOW() WHERE id = ${id}`;
}

export { sql };
