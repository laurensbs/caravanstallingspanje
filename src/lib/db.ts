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
  // Pickup-locatie: voor 'zelf'-mode is dit "Stalling" (klant komt naar ons),
  // voor 'wij_rijden'-mode is dit de camping waar wij hem ophalen.
  await sql`ALTER TABLE transport_requests ADD COLUMN IF NOT EXISTS pickup_location TEXT`;
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
  await sql`ALTER TABLE stalling_requests ADD COLUMN IF NOT EXISTS customer_notified_at TIMESTAMP`;
  await sql`ALTER TABLE stalling_requests ADD COLUMN IF NOT EXISTS notified_status TEXT`;
  await sql`ALTER TABLE transport_requests ADD COLUMN IF NOT EXISTS transport_mode TEXT`;

  await sql`CREATE TABLE IF NOT EXISTS contact_messages (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open',
    handled_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`;
  await sql`CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_contact_messages_created ON contact_messages(created_at DESC)`;

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

  // ─── Centraal klantenregister ──────────────────────────────
  await sql`CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    mobile TEXT,
    address TEXT,
    city TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'ES',
    vat_number TEXT,
    notes TEXT,
    holded_contact_id TEXT,
    holded_sync_failed BOOLEAN DEFAULT false,
    source TEXT DEFAULT 'manual',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`;
  await sql`ALTER TABLE customers ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP`;
  await sql`ALTER TABLE customers ADD COLUMN IF NOT EXISTS holded_synced_at TIMESTAMP`;
  // Email-uniqueness alleen voor levende klanten — soft-deleted rows mogen
  // hun email vrij geven aan een nieuwe klant.
  await sql`DROP INDEX IF EXISTS idx_customers_email_lower`;
  // Legacy UNIQUE-constraint van een eerder DB-schema. Botst met onze
  // case-insensitive + soft-delete matching, dus weghalen.
  await sql`ALTER TABLE customers DROP CONSTRAINT IF EXISTS customers_email_key`;
  await sql`ALTER TABLE customers DROP CONSTRAINT IF EXISTS customers_email_unique`;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_email_lower_alive ON customers (LOWER(email)) WHERE email IS NOT NULL AND deleted_at IS NULL`;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_holded_id ON customers (holded_contact_id) WHERE holded_contact_id IS NOT NULL`;
  await sql`CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers (phone)`;

  // FK kolommen voor migratie naar customer-centrisch model.
  await sql`ALTER TABLE fridges ADD COLUMN IF NOT EXISTS customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL`;
  await sql`CREATE INDEX IF NOT EXISTS idx_fridges_customer ON fridges(customer_id)`;
  await sql`ALTER TABLE stalling_requests ADD COLUMN IF NOT EXISTS customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL`;
  await sql`CREATE INDEX IF NOT EXISTS idx_stalling_requests_customer ON stalling_requests(customer_id)`;
  await sql`ALTER TABLE transport_requests ADD COLUMN IF NOT EXISTS customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL`;
  await sql`CREATE INDEX IF NOT EXISTS idx_transport_requests_customer ON transport_requests(customer_id)`;

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

// Self-healing seed voor Helen — voorkomt dat we /api/admin/seed-helen
// handmatig moeten triggeren op productie. Idempotent: doet alleen wat als
// het account er nog niet is. Mislukt-mag-stilletjes: eerstvolgende call
// probeert opnieuw, en de login-lijst werkt sowieso voor de andere admins.
let _helenSeedAttempted = false;
async function ensureHelenSeed(): Promise<void> {
  if (_helenSeedAttempted) return;
  _helenSeedAttempted = true;
  try {
    const email = 'helen@caravanstalling-spanje.com';
    const existing = await sql`SELECT id FROM admin_users WHERE email = ${email} LIMIT 1`;
    if ((existing as { id: number }[]).length > 0) return;
    // Bcrypt-hash van 'admin1234' (vaste waarde, kost één seed; bij eerste
    // login wordt 'm vervangen door must_change_password=true).
    const { hashPassword } = await import('./passwords');
    const hash = await hashPassword('admin1234');
    await sql`INSERT INTO admin_users (name, email, password_hash, role, must_change_password)
      VALUES ('Helen', ${email}, ${hash}, 'admin', true)`;
  } catch {
    // Volgende request mag opnieuw proberen.
    _helenSeedAttempted = false;
  }
}

export async function getActiveAdmins() {
  await ensureHelenSeed();
  return sql`SELECT id, name, role FROM admin_users WHERE is_active = true ORDER BY name`;
}

export async function createAdmin(name: string, email: string, hash: string, role = 'admin', mustChangePassword = false) {
  await sql`INSERT INTO admin_users (name, email, password_hash, role, must_change_password)
    VALUES (${name}, ${email}, ${hash}, ${role}, ${mustChangePassword})`;
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
  await ensureCustomerSchema();
  const y = year ?? 0;
  const s = search ? `%${search}%` : null;

  const rows = status
    ? await sql`
        SELECT f.*,
          COALESCE(json_agg(json_build_object(
            'id', b.id, 'camping', b.camping, 'start_date', b.start_date, 'end_date', b.end_date,
            'spot_number', b.spot_number, 'status', b.status, 'notes', b.notes,
            'device_type', b.device_type,
            'holded_invoice_id', b.holded_invoice_id, 'holded_invoice_number', b.holded_invoice_number,
            'holded_invoice_url', b.holded_invoice_url, 'holded_invoice_status', b.holded_invoice_status,
            'payment_link_url', b.payment_link_url, 'payment_link_sent_at', b.payment_link_sent_at,
            'payment_link_email', b.payment_link_email, 'payment_link_amount_cents', b.payment_link_amount_cents,
            'paid_at', b.paid_at, 'stripe_payment_intent_id', b.stripe_payment_intent_id,
            'sales_invoice_converted_at', b.sales_invoice_converted_at,
            'sales_invoice_converted_by', b.sales_invoice_converted_by
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
            'device_type', b.device_type,
            'holded_invoice_id', b.holded_invoice_id, 'holded_invoice_number', b.holded_invoice_number,
            'holded_invoice_url', b.holded_invoice_url, 'holded_invoice_status', b.holded_invoice_status,
            'payment_link_url', b.payment_link_url, 'payment_link_sent_at', b.payment_link_sent_at,
            'payment_link_email', b.payment_link_email, 'payment_link_amount_cents', b.payment_link_amount_cents,
            'paid_at', b.paid_at, 'stripe_payment_intent_id', b.stripe_payment_intent_id,
            'sales_invoice_converted_at', b.sales_invoice_converted_at,
            'sales_invoice_converted_by', b.sales_invoice_converted_by
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
  await ensureCustomerSchema();
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

export async function createFridge(data: {
  name: string;
  email?: string | null;
  extra_email?: string | null;
  device_type?: string;
  notes?: string | null;
  customer_id?: number | null;
}) {
  await ensureCustomerSchema();
  const res = await sql`INSERT INTO fridges
    (name, email, extra_email, device_type, notes, customer_id)
    VALUES (${data.name}, ${data.email || null}, ${data.extra_email || null},
      ${data.device_type || 'Grote koelkast'}, ${data.notes || null}, ${data.customer_id || null})
    RETURNING *`;
  return res[0];
}

export async function findFridgeByEmail(email: string) {
  if (!email) return null;
  await ensureCustomerSchema();
  const rows = await sql`SELECT * FROM fridges WHERE LOWER(email) = LOWER(${email}) LIMIT 1`;
  return rows[0] || null;
}


export async function updateFridge(id: number, data: { name?: string; email?: string | null; extra_email?: string | null; device_type?: string; notes?: string | null; customer_id?: number | null }) {
  await ensureCustomerSchema();
  await sql`UPDATE fridges SET
    name = COALESCE(${data.name ?? null}, name),
    email = COALESCE(${data.email ?? null}, email),
    extra_email = COALESCE(${data.extra_email ?? null}, extra_email),
    device_type = COALESCE(${data.device_type ?? null}, device_type),
    notes = COALESCE(${data.notes ?? null}, notes),
    customer_id = COALESCE(${data.customer_id ?? null}, customer_id),
    updated_at = NOW()
    WHERE id = ${id}`;
}

export async function setFridgeHoldedContact(id: number, holdedContactId: string) {
  await sql`UPDATE fridges SET holded_contact_id = ${holdedContactId}, updated_at = NOW() WHERE id = ${id}`;
}

export async function deleteFridge(id: number) {
  await sql`DELETE FROM fridges WHERE id = ${id}`;
}

export async function createFridgeBooking(fridgeId: number, data: { camping?: string | null; start_date?: string | null; end_date?: string | null; spot_number?: string | null; status?: string; notes?: string | null; device_type?: string | null; already_paid?: boolean }) {
  // Probeer ensureMiscSchema (voegt device_type kolom toe als 'm mist) maar
  // laat een eventuele migratie-fout de booking-create niet blokkeren.
  await ensureMiscSchema().catch(() => {});
  // Als admin "already paid" aanvinkt: zet paid_at = NOW(). Dit signaleert
  // overal in de UI dat er geen betaal-link of pro-forma meer hoeft.
  const paidAt = data.already_paid ? new Date().toISOString() : null;
  try {
    const res = await sql`INSERT INTO fridge_bookings (fridge_id, camping, start_date, end_date, spot_number, status, notes, device_type, paid_at)
      VALUES (${fridgeId}, ${data.camping || null}, ${data.start_date || null}::date, ${data.end_date || null}::date, ${data.spot_number || null}, ${data.status || 'compleet'}, ${data.notes || null}, ${data.device_type || null}, ${paidAt}::timestamp) RETURNING *`;
    return res[0];
  } catch (err) {
    // Fallback: oude DB zonder device_type kolom. Insert zonder dat veld.
    const msg = err instanceof Error ? err.message : '';
    if (/column.*device_type.*does not exist/i.test(msg)) {
      const res = await sql`INSERT INTO fridge_bookings (fridge_id, camping, start_date, end_date, spot_number, status, notes, paid_at)
        VALUES (${fridgeId}, ${data.camping || null}, ${data.start_date || null}::date, ${data.end_date || null}::date, ${data.spot_number || null}, ${data.status || 'compleet'}, ${data.notes || null}, ${paidAt}::timestamp) RETURNING *`;
      return res[0];
    }
    throw err;
  }
}

export async function updateFridgeBooking(id: number, data: { camping?: string | null; start_date?: string | null; end_date?: string | null; spot_number?: string | null; status?: string; notes?: string | null; already_paid?: boolean }) {
  await sql`UPDATE fridge_bookings SET
    camping = COALESCE(${data.camping ?? null}, camping),
    start_date = COALESCE(${data.start_date ?? null}::date, start_date),
    end_date = COALESCE(${data.end_date ?? null}::date, end_date),
    spot_number = COALESCE(${data.spot_number ?? null}, spot_number),
    status = COALESCE(${data.status ?? null}, status),
    notes = COALESCE(${data.notes ?? null}, notes),
    updated_at = NOW()
    WHERE id = ${id}`;

  // Offline-paid toggle bij edit. Alleen aanpassen als er GEEN Stripe-
  // payment-intent en GEEN Holded pro-forma is — anders zou je een online-
  // paid timestamp kunnen overschrijven of een actieve betaal-flow ondermijnen.
  if (typeof data.already_paid === 'boolean') {
    if (data.already_paid) {
      await sql`UPDATE fridge_bookings
        SET paid_at = COALESCE(paid_at, NOW()), updated_at = NOW()
        WHERE id = ${id}
          AND stripe_payment_intent_id IS NULL
          AND (holded_invoice_number IS NULL OR holded_invoice_number = '')`;
    } else {
      await sql`UPDATE fridge_bookings
        SET paid_at = NULL, updated_at = NOW()
        WHERE id = ${id}
          AND stripe_payment_intent_id IS NULL
          AND (holded_invoice_number IS NULL OR holded_invoice_number = '')`;
    }
  }
}

export async function setBookingHoldedInvoice(id: number, holdedInvoiceId: string, holdedInvoiceNumber: string) {
  await sql`UPDATE fridge_bookings SET holded_invoice_id = ${holdedInvoiceId}, holded_invoice_number = ${holdedInvoiceNumber}, updated_at = NOW() WHERE id = ${id}`;
}

export async function setBookingPaymentLink(
  id: number,
  url: string,
  email: string,
  amountCents: number,
) {
  await ensureMiscSchema();
  await sql`UPDATE fridge_bookings
    SET payment_link_url = ${url},
        payment_link_email = ${email},
        payment_link_amount_cents = ${amountCents},
        payment_link_sent_at = NOW(),
        updated_at = NOW()
    WHERE id = ${id}`;
}

// Bij Stripe-webhook na betaling: vul paid_at + payment_intent_id zodat we
// de exacte betaaldatum kunnen tonen in de admin-UI. Idempotent: COALESCE
// laat een eerder gezet paid_at staan (bv. bij dubbele webhook events).
export async function setBookingPaidAt(id: number, paidAt: Date, paymentIntentId: string | null) {
  await ensureMiscSchema();
  await sql`UPDATE fridge_bookings
    SET paid_at = COALESCE(paid_at, ${paidAt.toISOString()}::timestamp),
        stripe_payment_intent_id = COALESCE(stripe_payment_intent_id, ${paymentIntentId}),
        updated_at = NOW()
    WHERE id = ${id}`;
}

export async function setStallingPaidAt(id: number, paidAt: Date, paymentIntentId: string | null) {
  await ensureMiscSchema();
  await sql`UPDATE stalling_requests
    SET paid_at = COALESCE(paid_at, ${paidAt.toISOString()}::timestamp),
        stripe_payment_intent_id = COALESCE(stripe_payment_intent_id, ${paymentIntentId}),
        updated_at = NOW()
    WHERE id = ${id}`;
}

export async function setTransportPaidAt(id: number, paidAt: Date, paymentIntentId: string | null) {
  await ensureMiscSchema();
  await sql`UPDATE transport_requests
    SET paid_at = COALESCE(paid_at, ${paidAt.toISOString()}::timestamp),
        stripe_payment_intent_id = COALESCE(stripe_payment_intent_id, ${paymentIntentId}),
        updated_at = NOW()
    WHERE id = ${id}`;
}

// Toggle pro-forma → sales-invoice flag. converted=true zet timestamp+admin;
// converted=false maakt 'm leeg (Undo).
export async function setBookingSalesInvoice(id: number, converted: boolean, adminName: string | null) {
  await ensureMiscSchema();
  if (converted) {
    await sql`UPDATE fridge_bookings
      SET sales_invoice_converted_at = NOW(),
          sales_invoice_converted_by = ${adminName || 'admin'},
          updated_at = NOW()
      WHERE id = ${id}`;
  } else {
    await sql`UPDATE fridge_bookings
      SET sales_invoice_converted_at = NULL,
          sales_invoice_converted_by = NULL,
          updated_at = NOW()
      WHERE id = ${id}`;
  }
}

export async function setStallingSalesInvoice(id: number, converted: boolean, adminName: string | null) {
  await ensureMiscSchema();
  if (converted) {
    await sql`UPDATE stalling_requests
      SET sales_invoice_converted_at = NOW(),
          sales_invoice_converted_by = ${adminName || 'admin'},
          updated_at = NOW()
      WHERE id = ${id}`;
  } else {
    await sql`UPDATE stalling_requests
      SET sales_invoice_converted_at = NULL,
          sales_invoice_converted_by = NULL,
          updated_at = NOW()
      WHERE id = ${id}`;
  }
}

export async function setTransportSalesInvoice(id: number, converted: boolean, adminName: string | null) {
  await ensureMiscSchema();
  if (converted) {
    await sql`UPDATE transport_requests
      SET sales_invoice_converted_at = NOW(),
          sales_invoice_converted_by = ${adminName || 'admin'},
          updated_at = NOW()
      WHERE id = ${id}`;
  } else {
    await sql`UPDATE transport_requests
      SET sales_invoice_converted_at = NULL,
          sales_invoice_converted_by = NULL,
          updated_at = NOW()
      WHERE id = ${id}`;
  }
}

// Bulk-snapshot in 1 multi-value UPDATE via VALUES-tabel — veel sneller
// dan 1 query per klant.
export async function bulkUpdateCustomerHoldedSnapshots(
  rows: Array<{ id: number; raw: Record<string, unknown> }>,
): Promise<void> {
  if (rows.length === 0) return;
  await ensureMiscSchema();
  // Per rij parallel uitvoeren — Neon kan parallelle queries aan en het
  // is veel sneller dan sequentieel awaiten.
  await Promise.all(rows.map(({ id, raw }) => setCustomerHoldedSnapshot(id, raw).catch(() => {})));
}

// Bulk upsert voor de Holded-import — 1 round-trip ipv 3-4 per klant.
// Match op holded_contact_id (uniek), anders email; UPDATE bestaat al,
// INSERT als nieuw. Returnt de id zodat we daarna in 1 batch de snapshot
// kunnen schrijven.
export async function bulkUpsertCustomersFromHolded(
  rows: Array<{
    holded_id: string;
    name: string;
    email: string | null;
    phone: string | null;
    mobile: string | null;
    address: string | null;
    city: string | null;
    postal_code: string | null;
    country: string | null;
    vat_number: string | null;
  }>,
): Promise<Array<{ id: number; holded_id: string; was_new: boolean }>> {
  if (rows.length === 0) return [];
  await ensureCustomerSchema();
  const out: Array<{ id: number; holded_id: string; was_new: boolean }> = [];
  // Postgres ON CONFLICT vereist een unique-constraint. We hebben:
  //  - idx_customers_holded_id (unique partial)
  //  - idx_customers_email_lower_alive (unique partial)
  // De partial indices breken ON CONFLICT inferentie, dus we doen 't per
  // rij in 1 enkele Query (CTE). Nog steeds veel sneller dan 4 round-trips.
  for (const r of rows) {
    const result = await sql`
      WITH existing AS (
        SELECT id FROM customers
        WHERE deleted_at IS NULL
          AND (holded_contact_id = ${r.holded_id}
               OR (${r.email}::text IS NOT NULL AND LOWER(email) = LOWER(${r.email})))
        LIMIT 1
      ),
      upserted AS (
        UPDATE customers SET
          name = ${r.name},
          email = COALESCE(${r.email}, email),
          phone = COALESCE(${r.phone}, phone),
          mobile = COALESCE(${r.mobile}, mobile),
          address = COALESCE(${r.address}, address),
          city = COALESCE(${r.city}, city),
          postal_code = COALESCE(${r.postal_code}, postal_code),
          country = COALESCE(${r.country}, country),
          vat_number = COALESCE(${r.vat_number}, vat_number),
          holded_contact_id = ${r.holded_id},
          updated_at = NOW()
        WHERE id = (SELECT id FROM existing)
        RETURNING id, false AS was_new
      ),
      inserted AS (
        INSERT INTO customers (name, email, phone, mobile, address, city, postal_code, country, vat_number, holded_contact_id, source)
        SELECT ${r.name}, ${r.email}, ${r.phone}, ${r.mobile}, ${r.address}, ${r.city}, ${r.postal_code}, COALESCE(${r.country}, 'ES'), ${r.vat_number}, ${r.holded_id}, 'holded_import'
        WHERE NOT EXISTS (SELECT 1 FROM existing)
        RETURNING id, true AS was_new
      )
      SELECT id, was_new FROM upserted
      UNION ALL
      SELECT id, was_new FROM inserted
      LIMIT 1`;
    const row = (result as Array<{ id: number; was_new: boolean }>)[0];
    if (row) out.push({ id: row.id, holded_id: r.holded_id, was_new: row.was_new });
  }
  return out;
}

// Voor het dashboard: hoeveel betaalde pro-forma's wachten nog op handmatige
// sales-invoice-conversie? Telt alle drie de bronnen.
export async function getNeedsSalesInvoiceCount() {
  await ensureMiscSchema();
  const fridges = await sql`SELECT COUNT(*) AS c FROM fridge_bookings
    WHERE holded_invoice_status = 'paid' AND sales_invoice_converted_at IS NULL`;
  const stallings = await sql`SELECT COUNT(*) AS c FROM stalling_requests
    WHERE holded_invoice_status = 'paid' AND sales_invoice_converted_at IS NULL`;
  const transports = await sql`SELECT COUNT(*) AS c FROM transport_requests
    WHERE holded_invoice_status = 'paid' AND sales_invoice_converted_at IS NULL`;
  return Number((fridges[0] as { c: string | number }).c)
    + Number((stallings[0] as { c: string | number }).c)
    + Number((transports[0] as { c: string | number }).c);
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

// Bookings die overlappen met de gegeven datum-range, voor de planning-view.
// Een booking telt als 'overlap' als z'n periode (start..end) snijdt met de
// range (from..to). LEFT JOIN customers voor telefoon — fridge.email blijft
// canonical voor de mail. Booking.device_type heeft voorrang op fridge.device_type.
export async function getBookingsInRange(from: string, to: string): Promise<Array<{
  id: number;
  fridge_id: number;
  customer_name: string;
  email: string | null;
  phone: string | null;
  device_type: string;
  camping: string | null;
  spot_number: string | null;
  start_date: string;
  end_date: string;
  status: string;
  holded_invoice_status: string | null;
  paid_at: string | null;
}>> {
  const rows = await sql`
    SELECT b.id, b.fridge_id, f.name AS customer_name, f.email,
      COALESCE(c.phone, c.mobile) AS phone,
      COALESCE(b.device_type, f.device_type) AS device_type,
      b.camping, b.spot_number, b.start_date, b.end_date, b.status,
      b.holded_invoice_status, b.paid_at
    FROM fridge_bookings b
    JOIN fridges f ON f.id = b.fridge_id
    LEFT JOIN customers c ON c.id = f.customer_id
    WHERE b.start_date IS NOT NULL
      AND b.end_date IS NOT NULL
      AND b.start_date <= ${to}::date
      AND b.end_date >= ${from}::date
    ORDER BY b.start_date ASC, f.name ASC`;
  return rows as never;
}

// Schuift een booking naar een nieuwe start_date. Behoudt periode-duur door
// end_date evenredig mee te schuiven. Gebruikt door drag-to-replan op de
// planning-view. Returnt de nieuwe rij voor optimistische UI-rollback.
export async function shiftBookingDates(id: number, newStartDate: string, newEndDate: string) {
  const res = await sql`UPDATE fridge_bookings
    SET start_date = ${newStartDate}::date,
        end_date = ${newEndDate}::date,
        updated_at = NOW()
    WHERE id = ${id}
    RETURNING *`;
  return res[0] || null;
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
  /** 'wij_rijden' (€100) of 'zelf' (€50). NULL voor oude rijen vóór de
   *  betaalde-flow live ging. */
  mode?: 'wij_rijden' | 'zelf' | null;
  /** Bij 'wij_rijden': adres of camping waar wij de caravan komen halen.
   *  Bij 'zelf': altijd 'Stalling' (klant komt zelf langs). */
  pickup_location?: string | null;
}) {
  await ensureMiscSchema();
  const res = await sql`INSERT INTO transport_requests
    (name, email, phone, from_location, to_location,
     camping, preferred_date, return_date, outbound_time, return_time,
     registration, brand, model, notes, created_via, status, transport_mode, pickup_location)
    VALUES (${data.name}, ${data.email}, ${data.phone || null},
      'Stalling Cruïlles', ${data.camping},
      ${data.camping}, ${data.outbound_date}::date, ${data.return_date}::date,
      ${data.outbound_time || null}, ${data.return_time || null},
      ${data.registration || null}, ${data.brand || null}, ${data.model || null},
      ${data.notes || null}, ${data.created_via || 'public'}, ${data.status || 'controleren'},
      ${data.mode || null}, ${data.pickup_location || null})
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

// Cache-reset zodat /api/admin/run-migrations alle ALTER's opnieuw kan
// runnen — handig na deploys waar nieuwe kolommen zijn toegevoegd.
export function resetSchemaCache(): void {
  _migrationsApplied = null;
  _miscMigrationsApplied = null;
}

// ─── Lazy migratie voor contact_messages en uitbreidingen op transport/stalling.
let _miscMigrationsApplied: Promise<void> | null = null;

// Helper: voer één migratie-statement uit en log per-statement falen
// zonder de hele chain te blokkeren. Postgres kan partial-indexes faliekant
// laten falen ("column does not exist") als een eerdere ADD COLUMN niet
// liep — door per stap te catchen kunnen latere stappen alsnog draaien.
async function tryMigrate(label: string, fn: () => Promise<unknown>): Promise<void> {
  try {
    await fn();
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    console.error(`[misc migration] ${label} failed: ${msg}`);
  }
}

export async function ensureMiscSchema(): Promise<void> {
  if (_miscMigrationsApplied) return _miscMigrationsApplied;
  _miscMigrationsApplied = (async () => {
    // ─── Defensieve status-kolom recovery ──
    // Op productie-DBs die ooit een oudere schema-staat hebben gehad kan
    // de `status` kolom op fridge_bookings (en zustertabellen) ontbreken.
    // Dat doet o.a. de partial index hieronder falen ("column status does
    // not exist"). We voegen 'm idempotent toe vóór alles wat 'm gebruikt.
    await tryMigrate('fridge_bookings.status', () =>
      sql`ALTER TABLE fridge_bookings ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'compleet'`);
    await tryMigrate('stalling_requests.status', () =>
      sql`ALTER TABLE stalling_requests ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'controleren'`);
    await tryMigrate('transport_requests.status', () =>
      sql`ALTER TABLE transport_requests ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'controleren'`);
    await tryMigrate('contact_messages.status', () =>
      sql`ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'open'`);
    await tryMigrate('ideas.status', () =>
      sql`ALTER TABLE ideas ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'new'`);
    await tryMigrate('fridge_waitlist.status', () =>
      sql`ALTER TABLE fridge_waitlist ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'wachtend'`);

    // ─── Bestaande migraties — nu allemaal resilient zodat één faalkolom
    // niet het hele admin-portaal stuk kan zetten.
    await tryMigrate('transport.transport_mode', () =>
      sql`ALTER TABLE transport_requests ADD COLUMN IF NOT EXISTS transport_mode TEXT`);
    await tryMigrate('transport.pickup_location', () =>
      sql`ALTER TABLE transport_requests ADD COLUMN IF NOT EXISTS pickup_location TEXT`);
    await tryMigrate('stalling.customer_notified_at', () =>
      sql`ALTER TABLE stalling_requests ADD COLUMN IF NOT EXISTS customer_notified_at TIMESTAMP`);
    await tryMigrate('stalling.notified_status', () =>
      sql`ALTER TABLE stalling_requests ADD COLUMN IF NOT EXISTS notified_status TEXT`);
    // Holded-factuurstatus cache: paid / partial / unpaid / unknown.
    await tryMigrate('fridge_bookings.holded_invoice_status', () =>
      sql`ALTER TABLE fridge_bookings ADD COLUMN IF NOT EXISTS holded_invoice_status TEXT`);
    await tryMigrate('fridge_bookings.holded_invoice_synced_at', () =>
      sql`ALTER TABLE fridge_bookings ADD COLUMN IF NOT EXISTS holded_invoice_synced_at TIMESTAMP`);
    await tryMigrate('fridge_bookings.holded_invoice_url', () =>
      sql`ALTER TABLE fridge_bookings ADD COLUMN IF NOT EXISTS holded_invoice_url TEXT`);
    await tryMigrate('fridge_bookings.device_type', () =>
      sql`ALTER TABLE fridge_bookings ADD COLUMN IF NOT EXISTS device_type TEXT`);
    // Holded-snapshot — bewaart de complete contact-payload.
    await tryMigrate('customers.is_company', () =>
      sql`ALTER TABLE customers ADD COLUMN IF NOT EXISTS is_company BOOLEAN DEFAULT false`);
    await tryMigrate('customers.holded_raw', () =>
      sql`ALTER TABLE customers ADD COLUMN IF NOT EXISTS holded_raw JSONB`);
    await tryMigrate('customers.holded_custom_fields', () =>
      sql`ALTER TABLE customers ADD COLUMN IF NOT EXISTS holded_custom_fields JSONB`);
    await tryMigrate('customers.holded_tags', () =>
      sql`ALTER TABLE customers ADD COLUMN IF NOT EXISTS holded_tags JSONB`);
    await tryMigrate('customers.holded_code', () =>
      sql`ALTER TABLE customers ADD COLUMN IF NOT EXISTS holded_code TEXT`);
    await tryMigrate('customers.holded_type', () =>
      sql`ALTER TABLE customers ADD COLUMN IF NOT EXISTS holded_type TEXT`);
    await tryMigrate('customers.holded_iban', () =>
      sql`ALTER TABLE customers ADD COLUMN IF NOT EXISTS holded_iban TEXT`);
    await tryMigrate('customers.holded_web', () =>
      sql`ALTER TABLE customers ADD COLUMN IF NOT EXISTS holded_web TEXT`);
    await tryMigrate('customers.holded_secondary_email', () =>
      sql`ALTER TABLE customers ADD COLUMN IF NOT EXISTS holded_secondary_email TEXT`);
    await tryMigrate('customers.holded_default_currency', () =>
      sql`ALTER TABLE customers ADD COLUMN IF NOT EXISTS holded_default_currency TEXT`);
    await tryMigrate('customers.holded_billing_address', () =>
      sql`ALTER TABLE customers ADD COLUMN IF NOT EXISTS holded_billing_address JSONB`);
    await tryMigrate('customers.holded_shipping_address', () =>
      sql`ALTER TABLE customers ADD COLUMN IF NOT EXISTS holded_shipping_address JSONB`);
    // Customer-portal auth — bcrypt password-hash + flag dat klant 'm na
    // eerste login verplicht moet wijzigen + Stripe customer-id voor de
    // facturen-lookup. password_set_at = wanneer een echt zelf-gekozen
    // wachtwoord is gezet (NULL = nog op temp uit welkomst-mail).
    await tryMigrate('customers.password_hash', () =>
      sql`ALTER TABLE customers ADD COLUMN IF NOT EXISTS password_hash TEXT`);
    await tryMigrate('customers.must_change_password', () =>
      sql`ALTER TABLE customers ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT false`);
    await tryMigrate('customers.password_set_at', () =>
      sql`ALTER TABLE customers ADD COLUMN IF NOT EXISTS password_set_at TIMESTAMP`);
    await tryMigrate('customers.last_login_at', () =>
      sql`ALTER TABLE customers ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP`);
    await tryMigrate('customers.stripe_customer_id', () =>
      sql`ALTER TABLE customers ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT`);
    // Handmatige betaallink-flow.
    await tryMigrate('fridge_bookings.payment_link_url', () =>
      sql`ALTER TABLE fridge_bookings ADD COLUMN IF NOT EXISTS payment_link_url TEXT`);
    await tryMigrate('fridge_bookings.payment_link_sent_at', () =>
      sql`ALTER TABLE fridge_bookings ADD COLUMN IF NOT EXISTS payment_link_sent_at TIMESTAMP`);
    await tryMigrate('fridge_bookings.payment_link_email', () =>
      sql`ALTER TABLE fridge_bookings ADD COLUMN IF NOT EXISTS payment_link_email TEXT`);
    await tryMigrate('fridge_bookings.payment_link_amount_cents', () =>
      sql`ALTER TABLE fridge_bookings ADD COLUMN IF NOT EXISTS payment_link_amount_cents INTEGER`);
    await tryMigrate('stalling.holded_invoice_status', () =>
      sql`ALTER TABLE stalling_requests ADD COLUMN IF NOT EXISTS holded_invoice_status TEXT`);
    await tryMigrate('stalling.holded_invoice_synced_at', () =>
      sql`ALTER TABLE stalling_requests ADD COLUMN IF NOT EXISTS holded_invoice_synced_at TIMESTAMP`);
    await tryMigrate('stalling.holded_invoice_url', () =>
      sql`ALTER TABLE stalling_requests ADD COLUMN IF NOT EXISTS holded_invoice_url TEXT`);
    await tryMigrate('transport.holded_invoice_status', () =>
      sql`ALTER TABLE transport_requests ADD COLUMN IF NOT EXISTS holded_invoice_status TEXT`);
    await tryMigrate('transport.holded_invoice_synced_at', () =>
      sql`ALTER TABLE transport_requests ADD COLUMN IF NOT EXISTS holded_invoice_synced_at TIMESTAMP`);
    await tryMigrate('transport.holded_invoice_url', () =>
      sql`ALTER TABLE transport_requests ADD COLUMN IF NOT EXISTS holded_invoice_url TEXT`);
    // Composite index voor planning-view.
    await tryMigrate('idx_fridge_bookings_fridge_start', () =>
      sql`CREATE INDEX IF NOT EXISTS idx_fridge_bookings_fridge_start
        ON fridge_bookings(fridge_id, start_date)`);
    // Partial index voor admin "review"-filter — komt NA de status-kolom
    // recovery zodat 'ie nooit faalt op een DB die status kwijt was.
    await tryMigrate('idx_fridge_bookings_review', () =>
      sql`CREATE INDEX IF NOT EXISTS idx_fridge_bookings_review
        ON fridge_bookings(start_date) WHERE status = 'controleren'`);
    // Stripe paid_at + payment_intent_id én sales-invoice-conversion flag.
    await tryMigrate('fridge_bookings.paid_at', () =>
      sql`ALTER TABLE fridge_bookings ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP`);
    await tryMigrate('fridge_bookings.stripe_payment_intent_id', () =>
      sql`ALTER TABLE fridge_bookings ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT`);
    await tryMigrate('fridge_bookings.sales_invoice_converted_at', () =>
      sql`ALTER TABLE fridge_bookings ADD COLUMN IF NOT EXISTS sales_invoice_converted_at TIMESTAMP`);
    await tryMigrate('fridge_bookings.sales_invoice_converted_by', () =>
      sql`ALTER TABLE fridge_bookings ADD COLUMN IF NOT EXISTS sales_invoice_converted_by TEXT`);
    await tryMigrate('stalling.paid_at', () =>
      sql`ALTER TABLE stalling_requests ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP`);
    await tryMigrate('stalling.stripe_payment_intent_id', () =>
      sql`ALTER TABLE stalling_requests ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT`);
    await tryMigrate('stalling.sales_invoice_converted_at', () =>
      sql`ALTER TABLE stalling_requests ADD COLUMN IF NOT EXISTS sales_invoice_converted_at TIMESTAMP`);
    await tryMigrate('stalling.sales_invoice_converted_by', () =>
      sql`ALTER TABLE stalling_requests ADD COLUMN IF NOT EXISTS sales_invoice_converted_by TEXT`);
    await tryMigrate('transport.paid_at', () =>
      sql`ALTER TABLE transport_requests ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP`);
    await tryMigrate('transport.stripe_payment_intent_id', () =>
      sql`ALTER TABLE transport_requests ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT`);
    await tryMigrate('transport.sales_invoice_converted_at', () =>
      sql`ALTER TABLE transport_requests ADD COLUMN IF NOT EXISTS sales_invoice_converted_at TIMESTAMP`);
    await tryMigrate('transport.sales_invoice_converted_by', () =>
      sql`ALTER TABLE transport_requests ADD COLUMN IF NOT EXISTS sales_invoice_converted_by TEXT`);
    await tryMigrate('contact_messages table', () =>
      sql`CREATE TABLE IF NOT EXISTS contact_messages (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        subject TEXT,
        message TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'open',
        handled_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )`);
    await tryMigrate('idx_contact_messages_status', () =>
      sql`CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status)`);
    await tryMigrate('idx_contact_messages_created', () =>
      sql`CREATE INDEX IF NOT EXISTS idx_contact_messages_created ON contact_messages(created_at DESC)`);
    await tryMigrate('ideas table', () =>
      sql`CREATE TABLE IF NOT EXISTS ideas (
        id SERIAL PRIMARY KEY,
        name TEXT,
        email TEXT,
        category TEXT,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'new',
        votes_up INTEGER DEFAULT 0,
        votes_down INTEGER DEFAULT 0,
        featured BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )`);
    await tryMigrate('ideas.votes_up', () =>
      sql`ALTER TABLE ideas ADD COLUMN IF NOT EXISTS votes_up INTEGER DEFAULT 0`);
    await tryMigrate('ideas.votes_down', () =>
      sql`ALTER TABLE ideas ADD COLUMN IF NOT EXISTS votes_down INTEGER DEFAULT 0`);
    await tryMigrate('ideas.featured', () =>
      sql`ALTER TABLE ideas ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false`);
    await tryMigrate('idx_ideas_status', () =>
      sql`CREATE INDEX IF NOT EXISTS idx_ideas_status ON ideas(status)`);
    await tryMigrate('idx_ideas_created', () =>
      sql`CREATE INDEX IF NOT EXISTS idx_ideas_created ON ideas(created_at DESC)`);
    // Seed featured "watermachine" idee — pilot waar we feedback op willen.
    await tryMigrate('seed watermachine idea', () =>
      sql`INSERT INTO ideas (category, title, message, status, featured)
        SELECT 'verhuur',
          'Interesse in een watermachine?',
          'We onderzoeken of er interesse is in het huren van een watermachine voor op de camping. Met een watermachine heb je altijd koud drinkwater bij de hand, zonder steeds te hoeven sjouwen met zware flessen.

De verhuur zou bestaan uit:
• Een watermachine
• Een hervulbare fles
• Schoonmaaktabletten voor goed onderhoud

Altijd koud en schoon drinkwater — makkelijk en praktisch tijdens de vakantie.',
          'shortlist', true
        WHERE NOT EXISTS (SELECT 1 FROM ideas WHERE featured = true AND title ILIKE '%watermachine%')`);
  })().catch((err) => {
    console.error('[misc migrations] outer wrapper failed:', err);
    _miscMigrationsApplied = null;
    throw err;
  });
  return _miscMigrationsApplied;
}

// ─── Lazy migratie: zorgt dat customer-gerelateerde kolommen bestaan
// voordat de eerste query crasht. Wordt één keer per process gedaan en
// daarna gecached. Komt voor de helpers zodat deze nooit crashen op een
// koude DB die niet via /api/setup is geïnitialiseerd.
let _migrationsApplied: Promise<void> | null = null;
export async function ensureCustomerSchema(): Promise<void> {
  if (_migrationsApplied) return _migrationsApplied;
  _migrationsApplied = (async () => {
    await sql`CREATE TABLE IF NOT EXISTS customers (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      mobile TEXT,
      address TEXT,
      city TEXT,
      postal_code TEXT,
      country TEXT DEFAULT 'ES',
      vat_number TEXT,
      notes TEXT,
      holded_contact_id TEXT,
      holded_sync_failed BOOLEAN DEFAULT false,
      source TEXT DEFAULT 'manual',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )`;
    await sql`ALTER TABLE customers ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP`;
    await sql`ALTER TABLE customers ADD COLUMN IF NOT EXISTS holded_synced_at TIMESTAMP`;
    await sql`ALTER TABLE customers ADD COLUMN IF NOT EXISTS holded_sync_failed BOOLEAN DEFAULT false`;
    await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_email_lower_alive ON customers (LOWER(email)) WHERE email IS NOT NULL AND deleted_at IS NULL`;
    await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_holded_id ON customers (holded_contact_id) WHERE holded_contact_id IS NOT NULL`;
    await sql`CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers (phone)`;
    await sql`ALTER TABLE fridges ADD COLUMN IF NOT EXISTS customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL`;
    await sql`ALTER TABLE fridges ADD COLUMN IF NOT EXISTS holded_contact_id TEXT`;
    await sql`ALTER TABLE fridges ADD COLUMN IF NOT EXISTS extra_email TEXT`;
    await sql`ALTER TABLE fridge_bookings ADD COLUMN IF NOT EXISTS holded_invoice_id TEXT`;
    await sql`ALTER TABLE fridge_bookings ADD COLUMN IF NOT EXISTS holded_invoice_number TEXT`;
    await sql`ALTER TABLE stalling_requests ADD COLUMN IF NOT EXISTS customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL`;
    await sql`ALTER TABLE stalling_requests ADD COLUMN IF NOT EXISTS holded_invoice_id TEXT`;
    await sql`ALTER TABLE stalling_requests ADD COLUMN IF NOT EXISTS holded_invoice_number TEXT`;
    await sql`ALTER TABLE transport_requests ADD COLUMN IF NOT EXISTS customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL`;
    await sql`ALTER TABLE transport_requests ADD COLUMN IF NOT EXISTS holded_invoice_id TEXT`;
    await sql`ALTER TABLE transport_requests ADD COLUMN IF NOT EXISTS holded_invoice_number TEXT`;
  })().catch((err) => {
    console.error('[customer migrations] failed:', err);
    _migrationsApplied = null; // retry next call
    throw err;
  });
  return _migrationsApplied;
}

// ─── Customers ───────────────────────────────────────────
export type CustomerRow = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  mobile: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
  vat_number: string | null;
  notes: string | null;
  holded_contact_id: string | null;
  holded_sync_failed: boolean;
  source: string;
  created_at: string;
  updated_at: string;
  // Holded-snapshot velden (zie setCustomerHoldedSnapshot).
  is_company?: boolean;
  holded_raw?: Record<string, unknown> | null;
  holded_custom_fields?: Array<{ field?: string; value?: string; name?: string; id?: string }> | null;
  holded_tags?: string[] | null;
  holded_code?: string | null;
  holded_type?: string | null;
  holded_iban?: string | null;
  holded_web?: string | null;
  holded_secondary_email?: string | null;
  holded_default_currency?: string | null;
  holded_billing_address?: { address?: string; city?: string; postalCode?: string; country?: string } | null;
  holded_shipping_address?: { address?: string; city?: string; postalCode?: string; country?: string } | null;
  holded_synced_at?: string | null;
};

export async function searchCustomers(q: string, limit = 10): Promise<CustomerRow[]> {
  await ensureCustomerSchema();
  const term = `%${q.trim()}%`;
  if (!q.trim()) return [];
  const rows = await sql`
    SELECT * FROM customers
    WHERE deleted_at IS NULL
      AND (name ILIKE ${term} OR email ILIKE ${term} OR phone ILIKE ${term})
    ORDER BY
      CASE
        WHEN name ILIKE ${q + '%'} THEN 0
        WHEN email ILIKE ${q + '%'} THEN 1
        ELSE 2
      END,
      name ASC
    LIMIT ${limit}`;
  return rows as unknown as CustomerRow[];
}

export async function listCustomers(opts: { page?: number; pageSize?: number; search?: string } = {}) {
  await ensureCustomerSchema();
  const pageSize = opts.pageSize ?? 50;
  const page = Math.max(1, opts.page ?? 1);
  const offset = (page - 1) * pageSize;
  const term = opts.search ? `%${opts.search.trim()}%` : null;
  const rows = term
    ? await sql`SELECT * FROM customers
        WHERE deleted_at IS NULL
          AND (name ILIKE ${term} OR email ILIKE ${term} OR phone ILIKE ${term})
        ORDER BY name ASC LIMIT ${pageSize} OFFSET ${offset}`
    : await sql`SELECT * FROM customers WHERE deleted_at IS NULL
        ORDER BY name ASC LIMIT ${pageSize} OFFSET ${offset}`;
  const totalRows = term
    ? await sql`SELECT COUNT(*) AS c FROM customers
        WHERE deleted_at IS NULL
          AND (name ILIKE ${term} OR email ILIKE ${term} OR phone ILIKE ${term})`
    : await sql`SELECT COUNT(*) AS c FROM customers WHERE deleted_at IS NULL`;
  return {
    customers: rows as unknown as CustomerRow[],
    total: Number((totalRows[0] as { c: string | number }).c),
    page,
    pageSize,
  };
}

export async function getCustomerById(id: number): Promise<CustomerRow | null> {
  await ensureCustomerSchema();
  const rows = await sql`SELECT * FROM customers WHERE id = ${id} AND deleted_at IS NULL LIMIT 1`;
  return (rows[0] as CustomerRow) || null;
}

export async function getCustomerByEmail(email: string): Promise<CustomerRow | null> {
  if (!email) return null;
  await ensureCustomerSchema();
  const rows = await sql`SELECT * FROM customers WHERE LOWER(email) = LOWER(${email}) AND deleted_at IS NULL LIMIT 1`;
  return (rows[0] as CustomerRow) || null;
}

// ─── Customer-portal auth helpers ──
export async function setCustomerPassword(
  id: number,
  passwordHash: string,
  mustChange: boolean,
) {
  await ensureMiscSchema();
  await sql`UPDATE customers
    SET password_hash = ${passwordHash},
        must_change_password = ${mustChange},
        password_set_at = ${mustChange ? null : new Date().toISOString()}::timestamp,
        updated_at = NOW()
    WHERE id = ${id}`;
}

export async function recordCustomerLogin(id: number) {
  await sql`UPDATE customers SET last_login_at = NOW() WHERE id = ${id}`;
}

export async function setCustomerStripeId(id: number, stripeCustomerId: string) {
  await ensureMiscSchema();
  await sql`UPDATE customers SET stripe_customer_id = ${stripeCustomerId}, updated_at = NOW() WHERE id = ${id}`;
}

export async function getCustomerByHoldedId(holdedId: string): Promise<CustomerRow | null> {
  if (!holdedId) return null;
  await ensureCustomerSchema();
  const rows = await sql`SELECT * FROM customers WHERE holded_contact_id = ${holdedId} AND deleted_at IS NULL LIMIT 1`;
  return (rows[0] as CustomerRow) || null;
}

export async function createCustomer(data: {
  name: string;
  email?: string | null;
  phone?: string | null;
  mobile?: string | null;
  address?: string | null;
  city?: string | null;
  postal_code?: string | null;
  country?: string | null;
  vat_number?: string | null;
  notes?: string | null;
  holded_contact_id?: string | null;
  holded_sync_failed?: boolean;
  source?: string;
}): Promise<CustomerRow> {
  await ensureCustomerSchema();
  const rows = await sql`INSERT INTO customers
    (name, email, phone, mobile, address, city, postal_code, country, vat_number, notes,
     holded_contact_id, holded_sync_failed, source)
    VALUES (${data.name}, ${data.email || null}, ${data.phone || null}, ${data.mobile || null},
      ${data.address || null}, ${data.city || null}, ${data.postal_code || null},
      ${data.country || 'ES'}, ${data.vat_number || null}, ${data.notes || null},
      ${data.holded_contact_id || null}, ${data.holded_sync_failed ?? false}, ${data.source || 'manual'})
    RETURNING *`;
  return (rows[0] as CustomerRow);
}

export async function updateCustomer(id: number, data: Partial<{
  name: string; email: string | null; phone: string | null; mobile: string | null;
  address: string | null; city: string | null; postal_code: string | null;
  country: string | null; vat_number: string | null; notes: string | null;
  holded_contact_id: string | null;
}>) {
  await ensureCustomerSchema();
  await sql`UPDATE customers SET
    name = COALESCE(${data.name ?? null}, name),
    email = COALESCE(${data.email ?? null}, email),
    phone = COALESCE(${data.phone ?? null}, phone),
    mobile = COALESCE(${data.mobile ?? null}, mobile),
    address = COALESCE(${data.address ?? null}, address),
    city = COALESCE(${data.city ?? null}, city),
    postal_code = COALESCE(${data.postal_code ?? null}, postal_code),
    country = COALESCE(${data.country ?? null}, country),
    vat_number = COALESCE(${data.vat_number ?? null}, vat_number),
    notes = COALESCE(${data.notes ?? null}, notes),
    holded_contact_id = COALESCE(${data.holded_contact_id ?? null}, holded_contact_id),
    updated_at = NOW()
    WHERE id = ${id}`;
}

export async function setCustomerHoldedId(id: number, holdedId: string | null, failed = false) {
  await ensureCustomerSchema();
  await sql`UPDATE customers
    SET holded_contact_id = ${holdedId}, holded_sync_failed = ${failed}, updated_at = NOW()
    WHERE id = ${id}`;
}

// Bewaart de complete Holded-payload + losse handige kolommen voor snel
// filteren. Wordt aangeroepen tijdens import en bij elke handmatige sync.
// isperson: 0 = bedrijf, 1 = persoon. We slaan 'm omgekeerd op (is_company)
// zodat het default-gedrag (false) overeenkomt met "persoon" — meeste klanten.
export async function setCustomerHoldedSnapshot(
  id: number,
  raw: Record<string, unknown>,
) {
  await ensureMiscSchema();
  const customFields = raw.customFields ?? null;
  const tags = raw.tags ?? null;
  const billingRaw = raw.billAddress ?? null;
  const shippingRaw = raw.shippingAddress ?? null;
  const addressRaw = raw.address ?? null;
  const isperson = raw.isperson;
  // Holded geeft soms 0/1, soms true/false, soms '0'/'1'.
  const isCompany = isperson === 0 || isperson === false || isperson === '0';

  // Adres-mainline mapping. Holded levert het adres soms in `address`, soms
  // in `billAddress`. We picken in volgorde: billing → address → shipping.
  // Dat is hetzelfde adres dat de UI als "Billing address" laat zien — die
  // hoort ook in de hoofd customers.address/city/... kolommen te staan zodat
  // ie verschijnt waar admin het verwacht.
  type Addr = { address?: string; city?: string; postalCode?: string; country?: string; countryCode?: string };
  const pickAddr = (a: unknown): Addr | null => (a && typeof a === 'object' ? (a as Addr) : null);
  const primary = pickAddr(billingRaw) || pickAddr(addressRaw) || pickAddr(shippingRaw);
  const mainAddress = primary?.address ?? null;
  const mainCity = primary?.city ?? null;
  const mainPostal = primary?.postalCode ?? null;
  // Country: gebruik countryCode (ISO) als fallback voor lege country-string.
  const mainCountry = (primary?.country || primary?.countryCode) ?? null;

  // Phone/mobile uit Holded — alleen vullen als lokaal nog leeg, om
  // admin-edits niet te overschrijven. Daarom COALESCE op alle velden.
  const phone = (raw.phone as string) ?? null;
  const mobile = (raw.mobile as string) ?? null;

  await sql`UPDATE customers SET
    is_company = ${isCompany},
    holded_raw = ${JSON.stringify(raw)}::jsonb,
    holded_custom_fields = ${customFields ? JSON.stringify(customFields) : null}::jsonb,
    holded_tags = ${tags ? JSON.stringify(tags) : null}::jsonb,
    holded_code = ${(raw.code as string) ?? null},
    holded_type = ${(raw.type as string) ?? null},
    holded_iban = ${(raw.iban as string) ?? null},
    holded_web = ${(raw.web as string) ?? null},
    holded_secondary_email = ${(raw.secondaryEmail as string) ?? null},
    holded_default_currency = ${(raw.defaultCurrency as string) ?? null},
    holded_billing_address = ${billingRaw ? JSON.stringify(billingRaw) : null}::jsonb,
    holded_shipping_address = ${shippingRaw ? JSON.stringify(shippingRaw) : null}::jsonb,
    -- Hoofd-velden vullen vanuit Holded, maar alleen als lokaal leeg/NULL.
    -- NULLIF zorgt dat een lege Holded-string ('') als NULL telt zodat
    -- COALESCE doorvalt naar de bestaande lokale waarde.
    address = COALESCE(NULLIF(address, ''), NULLIF(${mainAddress}, '')),
    city = COALESCE(NULLIF(city, ''), NULLIF(${mainCity}, '')),
    postal_code = COALESCE(NULLIF(postal_code, ''), NULLIF(${mainPostal}, '')),
    country = COALESCE(NULLIF(country, ''), NULLIF(${mainCountry}, '')),
    phone = COALESCE(NULLIF(phone, ''), NULLIF(${phone}, '')),
    mobile = COALESCE(NULLIF(mobile, ''), NULLIF(${mobile}, '')),
    holded_synced_at = NOW(),
    updated_at = NOW()
    WHERE id = ${id}`;
}

export async function linkFridgeToCustomer(fridgeId: number, customerId: number) {
  await ensureCustomerSchema();
  await sql`UPDATE fridges SET customer_id = ${customerId}, updated_at = NOW() WHERE id = ${fridgeId}`;
}

export async function linkStallingToCustomer(stallingId: number, customerId: number) {
  await ensureCustomerSchema();
  await sql`UPDATE stalling_requests SET customer_id = ${customerId}, updated_at = NOW() WHERE id = ${stallingId}`;
}

export async function linkTransportToCustomer(transportId: number, customerId: number) {
  await ensureCustomerSchema();
  await sql`UPDATE transport_requests SET customer_id = ${customerId}, updated_at = NOW() WHERE id = ${transportId}`;
}

// Snel statistiekje voor de overzichtspagina: hoeveel koelkasten en
// stallingen per klant. Email-fallback voor backward-compat met bestaande
// rijen die nog geen customer_id hebben.
export async function getCustomerCounts(customerId: number, customerEmail: string | null) {
  await ensureCustomerSchema();
  const fridgeRows = await sql`
    SELECT COUNT(*) AS c FROM fridges
    WHERE customer_id = ${customerId}
       OR (customer_id IS NULL AND ${customerEmail}::text IS NOT NULL AND LOWER(email) = LOWER(${customerEmail}))`;
  const stallingRows = await sql`
    SELECT COUNT(*) AS c FROM stalling_requests
    WHERE customer_id = ${customerId}
       OR (customer_id IS NULL AND ${customerEmail}::text IS NOT NULL AND LOWER(email) = LOWER(${customerEmail}))`;
  const transportRows = await sql`
    SELECT COUNT(*) AS c FROM transport_requests
    WHERE customer_id = ${customerId}
       OR (customer_id IS NULL AND ${customerEmail}::text IS NOT NULL AND LOWER(email) = LOWER(${customerEmail}))`;
  return {
    fridges: Number((fridgeRows[0] as { c: string | number }).c),
    stalling: Number((stallingRows[0] as { c: string | number }).c),
    transport: Number((transportRows[0] as { c: string | number }).c),
  };
}

// Soft-delete: zet deleted_at; FK ON DELETE SET NULL ruimt de relaties op.
export async function softDeleteCustomer(id: number) {
  await ensureCustomerSchema();
  await sql`UPDATE customers SET deleted_at = NOW(), updated_at = NOW() WHERE id = ${id}`;
  // Cascade: gerelateerde rijen verliezen hun customer_id zodat ze
  // los blijven staan voor historisch bewaaren / re-link.
  await sql`UPDATE fridges SET customer_id = NULL, updated_at = NOW() WHERE customer_id = ${id}`;
  await sql`UPDATE stalling_requests SET customer_id = NULL, updated_at = NOW() WHERE customer_id = ${id}`;
  await sql`UPDATE transport_requests SET customer_id = NULL, updated_at = NOW() WHERE customer_id = ${id}`;
}

// Detail-pagina helper: customer + alle gerelateerde items (op customer_id
// of, voor backward-compat, op email-match).
export async function getCustomerWithRelated(id: number) {
  await ensureCustomerSchema();
  const customer = await getCustomerById(id);
  if (!customer) return null;
  const email = customer.email;
  const fridges = await sql`
    SELECT f.*, COALESCE(json_agg(
      json_build_object(
        'id', b.id, 'camping', b.camping, 'spot_number', b.spot_number,
        'start_date', b.start_date, 'end_date', b.end_date,
        'status', b.status, 'holded_invoice_id', b.holded_invoice_id,
        'holded_invoice_number', b.holded_invoice_number
      ) ORDER BY b.start_date DESC NULLS LAST) FILTER (WHERE b.id IS NOT NULL), '[]') AS bookings
    FROM fridges f
    LEFT JOIN fridge_bookings b ON b.fridge_id = f.id
    WHERE f.customer_id = ${id}
       OR (f.customer_id IS NULL AND ${email}::text IS NOT NULL AND LOWER(f.email) = LOWER(${email}))
    GROUP BY f.id
    ORDER BY f.created_at DESC`;
  const stalling = await sql`
    SELECT * FROM stalling_requests
    WHERE customer_id = ${id}
       OR (customer_id IS NULL AND ${email}::text IS NOT NULL AND LOWER(email) = LOWER(${email}))
    ORDER BY created_at DESC`;
  const transports = await sql`
    SELECT * FROM transport_requests
    WHERE customer_id = ${id}
       OR (customer_id IS NULL AND ${email}::text IS NOT NULL AND LOWER(email) = LOWER(${email}))
    ORDER BY preferred_date DESC NULLS LAST`;
  // Caravan-koppeling — leeft in een aparte tabel; pull lazy zodat oude
  // installaties zonder ensureCaravansSchema niet falen.
  let caravans: CustomerCaravanRow[] = [];
  try {
    caravans = await getCaravansByCustomer(id);
  } catch (err) {
    console.warn('[getCustomerWithRelated] caravans fetch failed:', err);
  }
  return {
    customer,
    fridges: fridges as never,
    stalling: stalling as never,
    transports: transports as never,
    caravans,
  };
}

// ─── Activity-log per entiteit ───────────────────────────
export async function getActivityForEntity(entityType: string, entityId: string, limit = 30) {
  return sql`SELECT * FROM activity_log
    WHERE entity_type = ${entityType} AND entity_id = ${entityId}
    ORDER BY created_at DESC LIMIT ${limit}`;
}

// Customer-activity = directe events + events van gerelateerde subentiteiten.
// Pragmatisch: we matchen op entity_label LIKE "%email%" voor backward-compat.
export async function getActivityForCustomer(customerId: number, customerEmail: string | null, limit = 30) {
  const idStr = String(customerId);
  const rows = await sql`SELECT * FROM activity_log
    WHERE (entity_type = 'customer' AND entity_id = ${idStr})
       OR entity_label ILIKE ${'%' + (customerEmail || '___no_match___') + '%'}
    ORDER BY created_at DESC LIMIT ${limit}`;
  return rows;
}

// ─── Stalling-admin CRUD ─────────────────────────────────
export async function getAllStallingRequests(status?: string) {
  if (status) {
    return sql`SELECT * FROM stalling_requests WHERE status = ${status} ORDER BY created_at DESC`;
  }
  return sql`SELECT * FROM stalling_requests ORDER BY created_at DESC`;
}

export async function updateStallingRequest(id: number, data: Partial<{
  type: 'binnen' | 'buiten';
  name: string;
  email: string;
  phone: string | null;
  start_date: string;
  end_date: string | null;
  registration: string | null;
  brand: string | null;
  model: string | null;
  length: string | null;
  notes: string | null;
  status: string;
  customer_id: number | null;
}>) {
  await sql`UPDATE stalling_requests SET
    type = COALESCE(${data.type ?? null}, type),
    name = COALESCE(${data.name ?? null}, name),
    email = COALESCE(${data.email ?? null}, email),
    phone = COALESCE(${data.phone ?? null}, phone),
    start_date = COALESCE(${data.start_date ?? null}::date, start_date),
    end_date = COALESCE(${data.end_date ?? null}::date, end_date),
    registration = COALESCE(${data.registration ?? null}, registration),
    brand = COALESCE(${data.brand ?? null}, brand),
    model = COALESCE(${data.model ?? null}, model),
    length = COALESCE(${data.length ?? null}, length),
    notes = COALESCE(${data.notes ?? null}, notes),
    status = COALESCE(${data.status ?? null}, status),
    customer_id = COALESCE(${data.customer_id ?? null}, customer_id),
    updated_at = NOW()
    WHERE id = ${id}`;
}

export async function deleteStallingRequest(id: number) {
  await sql`DELETE FROM stalling_requests WHERE id = ${id}`;
}

// ─── Transport-edit (was alleen status-PATCH) ────────────
export async function updateTransportRequest(id: number, data: Partial<{
  name: string;
  email: string;
  phone: string | null;
  camping: string;
  outbound_date: string;
  outbound_time: string | null;
  return_date: string;
  return_time: string | null;
  registration: string | null;
  brand: string | null;
  model: string | null;
  notes: string | null;
  status: string;
  customer_id: number | null;
  pickup_location: string | null;
  transport_mode: string | null;
}>) {
  await sql`UPDATE transport_requests SET
    name = COALESCE(${data.name ?? null}, name),
    email = COALESCE(${data.email ?? null}, email),
    phone = COALESCE(${data.phone ?? null}, phone),
    camping = COALESCE(${data.camping ?? null}, camping),
    to_location = COALESCE(${data.camping ?? null}, to_location),
    preferred_date = COALESCE(${data.outbound_date ?? null}::date, preferred_date),
    outbound_time = COALESCE(${data.outbound_time ?? null}, outbound_time),
    return_date = COALESCE(${data.return_date ?? null}::date, return_date),
    return_time = COALESCE(${data.return_time ?? null}, return_time),
    registration = COALESCE(${data.registration ?? null}, registration),
    brand = COALESCE(${data.brand ?? null}, brand),
    model = COALESCE(${data.model ?? null}, model),
    notes = COALESCE(${data.notes ?? null}, notes),
    status = COALESCE(${data.status ?? null}, status),
    customer_id = COALESCE(${data.customer_id ?? null}, customer_id),
    pickup_location = COALESCE(${data.pickup_location ?? null}, pickup_location),
    transport_mode = COALESCE(${data.transport_mode ?? null}, transport_mode),
    updated_at = NOW()
    WHERE id = ${id}`;
}

// ─── Contact messages ───────────────────────────────────
export type ContactMessageRow = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: string;
  handled_at: string | null;
  created_at: string;
  updated_at: string;
};

export async function createContactMessage(data: {
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
}): Promise<ContactMessageRow> {
  await ensureMiscSchema();
  const rows = await sql`INSERT INTO contact_messages
    (name, email, phone, subject, message)
    VALUES (${data.name}, ${data.email}, ${data.phone || null},
      ${data.subject || null}, ${data.message})
    RETURNING *`;
  return rows[0] as ContactMessageRow;
}

export async function listContactMessages(status?: string) {
  await ensureMiscSchema();
  if (status) {
    return sql`SELECT * FROM contact_messages WHERE status = ${status} ORDER BY created_at DESC`;
  }
  return sql`SELECT * FROM contact_messages ORDER BY created_at DESC`;
}

export async function getContactMessageById(id: number): Promise<ContactMessageRow | null> {
  await ensureMiscSchema();
  const rows = await sql`SELECT * FROM contact_messages WHERE id = ${id} LIMIT 1`;
  return (rows[0] as ContactMessageRow) || null;
}

export async function markContactMessageHandled(id: number) {
  await ensureMiscSchema();
  await sql`UPDATE contact_messages
    SET status = 'handled', handled_at = NOW(), updated_at = NOW()
    WHERE id = ${id}`;
}

export async function markContactMessageOpen(id: number) {
  await ensureMiscSchema();
  await sql`UPDATE contact_messages
    SET status = 'open', handled_at = NULL, updated_at = NOW()
    WHERE id = ${id}`;
}

export async function deleteContactMessage(id: number) {
  await ensureMiscSchema();
  await sql`DELETE FROM contact_messages WHERE id = ${id}`;
}

// ─── Ideas (publieke ideeënbus) ──────────────────────────
export type IdeaRow = {
  id: number;
  name: string | null;
  email: string | null;
  category: string | null;
  title: string;
  message: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export async function createIdea(data: {
  name?: string | null;
  email?: string | null;
  category?: string | null;
  title: string;
  message: string;
}): Promise<IdeaRow> {
  await ensureMiscSchema();
  const rows = await sql`INSERT INTO ideas
    (name, email, category, title, message)
    VALUES (${data.name || null}, ${data.email || null},
      ${data.category || null}, ${data.title}, ${data.message})
    RETURNING *`;
  return rows[0] as IdeaRow;
}

export async function listIdeas(status?: string) {
  await ensureMiscSchema();
  if (status) {
    return sql`SELECT * FROM ideas WHERE status = ${status} ORDER BY created_at DESC`;
  }
  return sql`SELECT * FROM ideas ORDER BY created_at DESC`;
}

export async function setIdeaStatus(id: number, status: string) {
  await ensureMiscSchema();
  await sql`UPDATE ideas SET status = ${status}, updated_at = NOW() WHERE id = ${id}`;
}

export async function deleteIdea(id: number) {
  await ensureMiscSchema();
  await sql`DELETE FROM ideas WHERE id = ${id}`;
}

// Voor de publieke ideeën-pagina: alleen featured + shortlist tonen,
// gesorteerd op enthousiasme. Niet alle inzendingen zijn publiek.
export async function listFeaturedIdeas() {
  await ensureMiscSchema();
  // Self-healing seed: als de pilot-watermachine nog niet in de DB staat
  // (bv. omdat ensureMiscSchema op deze instance al gedraaid had vóór de
  // seed-code werd toegevoegd), insert hem nu. Idempotent dankzij
  // WHERE NOT EXISTS — kost één lege round-trip als ie er al staat.
  await sql`INSERT INTO ideas (category, title, message, status, featured)
    SELECT 'verhuur',
      'Interesse in een watermachine?',
      'We onderzoeken of er interesse is in het huren van een watermachine voor op de camping. Met een watermachine heb je altijd koud drinkwater bij de hand, zonder steeds te hoeven sjouwen met zware flessen.

De verhuur zou bestaan uit:
• Een watermachine
• Een hervulbare fles
• Schoonmaaktabletten voor goed onderhoud

Altijd koud en schoon drinkwater — makkelijk en praktisch tijdens de vakantie.',
      'shortlist', true
    WHERE NOT EXISTS (SELECT 1 FROM ideas WHERE title ILIKE '%watermachine%')`.catch(() => null);
  // Bestaande, niet-featured watermachine-rij alsnog promoveren.
  await sql`UPDATE ideas SET featured = true, status = 'shortlist'
    WHERE title ILIKE '%watermachine%' AND featured IS NOT TRUE`.catch(() => null);
  const rows = await sql`SELECT id, category, title, message, votes_up, votes_down, featured
    FROM ideas
    WHERE featured = true
       OR status = 'shortlist'
       OR status = 'in_progress'
    ORDER BY featured DESC, votes_up DESC, created_at DESC`;
  return rows as unknown as Array<{
    id: number;
    category: string | null;
    title: string;
    message: string;
    votes_up: number;
    votes_down: number;
    featured: boolean;
  }>;
}

export async function voteOnIdea(id: number, direction: 'up' | 'down') {
  await ensureMiscSchema();
  if (direction === 'up') {
    await sql`UPDATE ideas SET votes_up = COALESCE(votes_up, 0) + 1, updated_at = NOW() WHERE id = ${id}`;
  } else {
    await sql`UPDATE ideas SET votes_down = COALESCE(votes_down, 0) + 1, updated_at = NOW() WHERE id = ${id}`;
  }
}

export async function setIdeaFeatured(id: number, featured: boolean) {
  await ensureMiscSchema();
  await sql`UPDATE ideas SET featured = ${featured}, updated_at = NOW() WHERE id = ${id}`;
}

// ─── Holded invoice-status sync ─────────────────────────
// Lijst alle bookings/requests met een Holded-factuur-id zodat de cron
// elke status kan ophalen en cachen.
export async function getInvoicedBookingsForSync() {
  await ensureMiscSchema();
  return sql`SELECT id, holded_invoice_id FROM fridge_bookings
    WHERE holded_invoice_id IS NOT NULL
      AND (holded_invoice_synced_at IS NULL
        OR holded_invoice_synced_at < NOW() - INTERVAL '50 minutes'
        OR holded_invoice_status IS NULL
        OR holded_invoice_status <> 'paid')
    ORDER BY holded_invoice_synced_at NULLS FIRST LIMIT 200`;
}

export async function getInvoicedStallingForSync() {
  await ensureMiscSchema();
  return sql`SELECT id, holded_invoice_id FROM stalling_requests
    WHERE holded_invoice_id IS NOT NULL
      AND (holded_invoice_synced_at IS NULL
        OR holded_invoice_synced_at < NOW() - INTERVAL '50 minutes'
        OR holded_invoice_status IS NULL
        OR holded_invoice_status <> 'paid')
    ORDER BY holded_invoice_synced_at NULLS FIRST LIMIT 200`;
}

export async function getInvoicedTransportForSync() {
  await ensureMiscSchema();
  return sql`SELECT id, holded_invoice_id FROM transport_requests
    WHERE holded_invoice_id IS NOT NULL
      AND (holded_invoice_synced_at IS NULL
        OR holded_invoice_synced_at < NOW() - INTERVAL '50 minutes'
        OR holded_invoice_status IS NULL
        OR holded_invoice_status <> 'paid')
    ORDER BY holded_invoice_synced_at NULLS FIRST LIMIT 200`;
}

export async function setBookingInvoiceStatus(id: number, status: string, url: string | null) {
  await ensureMiscSchema();
  await sql`UPDATE fridge_bookings
    SET holded_invoice_status = ${status},
      holded_invoice_url = ${url},
      holded_invoice_synced_at = NOW(),
      updated_at = NOW()
    WHERE id = ${id}`;
}

export async function setStallingInvoiceStatus(id: number, status: string, url: string | null) {
  await ensureMiscSchema();
  await sql`UPDATE stalling_requests
    SET holded_invoice_status = ${status},
      holded_invoice_url = ${url},
      holded_invoice_synced_at = NOW(),
      updated_at = NOW()
    WHERE id = ${id}`;
}

export async function setTransportInvoiceStatus(id: number, status: string, url: string | null) {
  await ensureMiscSchema();
  await sql`UPDATE transport_requests
    SET holded_invoice_status = ${status},
      holded_invoice_url = ${url},
      holded_invoice_synced_at = NOW(),
      updated_at = NOW()
    WHERE id = ${id}`;
}

// Voor het admin-dashboard: hoeveel bookings staan er nog open in Holded?
export async function getHoldedInvoiceSummary() {
  await ensureMiscSchema();
  // Drie losse queries i.p.v. UNION ALL omdat status-alias in GROUP BY
  // problematisch is binnen UNION's. Concat lokaal — kost geen perf op
  // de schaal van een paar honderd rijen.
  const [a, b, c] = await Promise.all([
    sql`SELECT 'koelkast' AS kind, holded_invoice_status AS status, COUNT(*)::text AS count
        FROM fridge_bookings WHERE holded_invoice_id IS NOT NULL
        GROUP BY holded_invoice_status`,
    sql`SELECT 'stalling' AS kind, holded_invoice_status AS status, COUNT(*)::text AS count
        FROM stalling_requests WHERE holded_invoice_id IS NOT NULL
        GROUP BY holded_invoice_status`,
    sql`SELECT 'transport' AS kind, holded_invoice_status AS status, COUNT(*)::text AS count
        FROM transport_requests WHERE holded_invoice_id IS NOT NULL
        GROUP BY holded_invoice_status`,
  ]);
  return [...a, ...b, ...c] as unknown as Array<{ kind: string; status: string | null; count: string | number }>;
}

// ─── Stalling notify-tracking ────────────────────────────
export async function markStallingCustomerNotified(id: number, statusNotified: string) {
  await ensureMiscSchema();
  await sql`UPDATE stalling_requests
    SET customer_notified_at = NOW(), notified_status = ${statusNotified}, updated_at = NOW()
    WHERE id = ${id}`;
}

// ─── Klant-caravans ──────────────────────────────────────
// customer_caravans: een klant heeft één (soms meerdere) caravan/camper
// die bij ons gestald staat. Wordt zichtbaar in /account/caravan en op
// het dashboard. service_history is een lichte log van wat we eraan
// gedaan hebben (schoonmaak/onderhoud/inspectie/reparatie).

let _caravansMigrationsApplied: Promise<void> | null = null;

export async function ensureCaravansSchema(): Promise<void> {
  if (_caravansMigrationsApplied) return _caravansMigrationsApplied;
  _caravansMigrationsApplied = (async () => {
    await tryMigrate('customer_caravans.create', () => sql`
      CREATE TABLE IF NOT EXISTS customer_caravans (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        kind TEXT NOT NULL DEFAULT 'caravan',
        brand TEXT,
        model TEXT,
        year INTEGER,
        registration TEXT,
        length_m NUMERIC(4,2),
        spot_code TEXT,
        storage_type TEXT,
        contract_start DATE,
        contract_renew DATE,
        insurance_provider TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await tryMigrate('customer_caravans.idx_customer', () =>
      sql`CREATE INDEX IF NOT EXISTS idx_customer_caravans_customer ON customer_caravans(customer_id)`);

    await tryMigrate('caravan_service_history.create', () => sql`
      CREATE TABLE IF NOT EXISTS caravan_service_history (
        id SERIAL PRIMARY KEY,
        caravan_id INTEGER NOT NULL REFERENCES customer_caravans(id) ON DELETE CASCADE,
        kind TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        happened_on DATE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await tryMigrate('caravan_service_history.idx_caravan', () =>
      sql`CREATE INDEX IF NOT EXISTS idx_caravan_service_history_caravan ON caravan_service_history(caravan_id)`);
    await tryMigrate('caravan_service_history.idx_happened', () =>
      sql`CREATE INDEX IF NOT EXISTS idx_caravan_service_history_happened ON caravan_service_history(happened_on DESC)`);
  })();
  return _caravansMigrationsApplied;
}

export type CustomerCaravanRow = {
  id: number;
  customer_id: number;
  kind: string;
  brand: string | null;
  model: string | null;
  year: number | null;
  registration: string | null;
  length_m: string | null;
  spot_code: string | null;
  storage_type: string | null;
  contract_start: string | null;
  contract_renew: string | null;
  insurance_provider: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export async function getCaravansByCustomer(customerId: number): Promise<CustomerCaravanRow[]> {
  await ensureCaravansSchema();
  return sql`SELECT * FROM customer_caravans WHERE customer_id = ${customerId} ORDER BY created_at DESC` as unknown as Promise<CustomerCaravanRow[]>;
}

export async function getCaravanById(id: number): Promise<CustomerCaravanRow | null> {
  await ensureCaravansSchema();
  const rows = await sql`SELECT * FROM customer_caravans WHERE id = ${id}` as unknown as CustomerCaravanRow[];
  return rows[0] || null;
}

export async function createCustomerCaravan(data: {
  customer_id: number;
  kind?: string;
  brand?: string | null;
  model?: string | null;
  year?: number | null;
  registration?: string | null;
  length_m?: number | null;
  spot_code?: string | null;
  storage_type?: string | null;
  contract_start?: string | null;
  contract_renew?: string | null;
  insurance_provider?: string | null;
  notes?: string | null;
}): Promise<CustomerCaravanRow> {
  await ensureCaravansSchema();
  const rows = await sql`
    INSERT INTO customer_caravans
      (customer_id, kind, brand, model, year, registration, length_m, spot_code,
       storage_type, contract_start, contract_renew, insurance_provider, notes)
    VALUES
      (${data.customer_id}, ${data.kind || 'caravan'},
       ${data.brand || null}, ${data.model || null}, ${data.year ?? null},
       ${data.registration || null}, ${data.length_m ?? null},
       ${data.spot_code || null}, ${data.storage_type || null},
       ${data.contract_start || null}::date, ${data.contract_renew || null}::date,
       ${data.insurance_provider || null}, ${data.notes || null})
    RETURNING *` as unknown as CustomerCaravanRow[];
  return rows[0];
}

export async function updateCustomerCaravan(id: number, data: Partial<{
  kind: string;
  brand: string | null;
  model: string | null;
  year: number | null;
  registration: string | null;
  length_m: number | null;
  spot_code: string | null;
  storage_type: string | null;
  contract_start: string | null;
  contract_renew: string | null;
  insurance_provider: string | null;
  notes: string | null;
}>): Promise<CustomerCaravanRow | null> {
  await ensureCaravansSchema();
  const cur = await getCaravanById(id);
  if (!cur) return null;
  const rows = await sql`
    UPDATE customer_caravans SET
      kind = ${data.kind ?? cur.kind},
      brand = ${data.brand !== undefined ? data.brand : cur.brand},
      model = ${data.model !== undefined ? data.model : cur.model},
      year = ${data.year !== undefined ? data.year : cur.year},
      registration = ${data.registration !== undefined ? data.registration : cur.registration},
      length_m = ${data.length_m !== undefined ? data.length_m : cur.length_m},
      spot_code = ${data.spot_code !== undefined ? data.spot_code : cur.spot_code},
      storage_type = ${data.storage_type !== undefined ? data.storage_type : cur.storage_type},
      contract_start = ${data.contract_start !== undefined ? data.contract_start : cur.contract_start}::date,
      contract_renew = ${data.contract_renew !== undefined ? data.contract_renew : cur.contract_renew}::date,
      insurance_provider = ${data.insurance_provider !== undefined ? data.insurance_provider : cur.insurance_provider},
      notes = ${data.notes !== undefined ? data.notes : cur.notes},
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *` as unknown as CustomerCaravanRow[];
  return rows[0] || null;
}

export async function deleteCustomerCaravan(id: number): Promise<boolean> {
  await ensureCaravansSchema();
  const rows = await sql`DELETE FROM customer_caravans WHERE id = ${id} RETURNING id` as unknown as { id: number }[];
  return rows.length > 0;
}

export type ServiceHistoryRow = {
  id: number;
  caravan_id: number;
  kind: string;
  title: string;
  description: string | null;
  happened_on: string | null;
  created_at: string;
};

export async function getServiceHistory(caravanId: number): Promise<ServiceHistoryRow[]> {
  await ensureCaravansSchema();
  return sql`
    SELECT * FROM caravan_service_history
    WHERE caravan_id = ${caravanId}
    ORDER BY COALESCE(happened_on, created_at::date) DESC, created_at DESC
  ` as unknown as Promise<ServiceHistoryRow[]>;
}

export async function createServiceHistoryEntry(data: {
  caravan_id: number;
  kind: string;
  title: string;
  description?: string | null;
  happened_on?: string | null;
}): Promise<ServiceHistoryRow> {
  await ensureCaravansSchema();
  const rows = await sql`
    INSERT INTO caravan_service_history (caravan_id, kind, title, description, happened_on)
    VALUES (${data.caravan_id}, ${data.kind}, ${data.title}, ${data.description || null}, ${data.happened_on || null}::date)
    RETURNING *` as unknown as ServiceHistoryRow[];
  return rows[0];
}

export async function deleteServiceHistoryEntry(id: number): Promise<boolean> {
  await ensureCaravansSchema();
  const rows = await sql`DELETE FROM caravan_service_history WHERE id = ${id} RETURNING id` as unknown as { id: number }[];
  return rows.length > 0;
}

// ─── Voorraad / verkoop ──────────────────────────────────
// stock_items: caravans/campers die wij verkopen.
// purchase_intakes: aanvragen van klanten die hun caravan aan ons willen
// verkopen (inkoop-flow met foto's).

let _salesMigrationsApplied: Promise<void> | null = null;

export async function ensureSalesSchema(): Promise<void> {
  if (_salesMigrationsApplied) return _salesMigrationsApplied;
  _salesMigrationsApplied = (async () => {
    await tryMigrate('stock_items.create', () => sql`
      CREATE TABLE IF NOT EXISTS stock_items (
        id SERIAL PRIMARY KEY,
        kind TEXT NOT NULL DEFAULT 'caravan',
        brand TEXT NOT NULL,
        model TEXT NOT NULL,
        year INTEGER,
        km INTEGER,
        length_m NUMERIC(4,2),
        price_eur NUMERIC(10,2),
        status TEXT NOT NULL DEFAULT 'available',
        slug TEXT UNIQUE,
        description TEXT,
        hero_photo_url TEXT,
        gallery_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await tryMigrate('stock_items.idx_status', () =>
      sql`CREATE INDEX IF NOT EXISTS idx_stock_items_status ON stock_items(status)`);
    await tryMigrate('stock_items.idx_kind', () =>
      sql`CREATE INDEX IF NOT EXISTS idx_stock_items_kind ON stock_items(kind)`);
    await tryMigrate('stock_items.idx_created', () =>
      sql`CREATE INDEX IF NOT EXISTS idx_stock_items_created ON stock_items(created_at DESC)`);

    await tryMigrate('purchase_intakes.create', () => sql`
      CREATE TABLE IF NOT EXISTS purchase_intakes (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        kind TEXT NOT NULL DEFAULT 'caravan',
        brand TEXT,
        model TEXT,
        year INTEGER,
        registration TEXT,
        km INTEGER,
        condition_note TEXT,
        asking_price_eur NUMERIC(10,2),
        photos JSONB NOT NULL DEFAULT '[]'::jsonb,
        status TEXT NOT NULL DEFAULT 'new',
        admin_note TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await tryMigrate('purchase_intakes.idx_status', () =>
      sql`CREATE INDEX IF NOT EXISTS idx_purchase_intakes_status ON purchase_intakes(status)`);
    await tryMigrate('purchase_intakes.idx_created', () =>
      sql`CREATE INDEX IF NOT EXISTS idx_purchase_intakes_created ON purchase_intakes(created_at DESC)`);
  })();
  return _salesMigrationsApplied;
}

export type StockItemRow = {
  id: number;
  kind: string;
  brand: string;
  model: string;
  year: number | null;
  km: number | null;
  length_m: string | null;
  price_eur: string | null;
  status: string;
  slug: string | null;
  description: string | null;
  hero_photo_url: string | null;
  gallery_urls: unknown;
  created_at: string;
  updated_at: string;
};

export async function listStockItems(opts?: { onlyVisible?: boolean }): Promise<StockItemRow[]> {
  await ensureSalesSchema();
  if (opts?.onlyVisible) {
    return sql`SELECT * FROM stock_items
      WHERE status IN ('available', 'reserved', 'new', 'sold')
      ORDER BY
        CASE status WHEN 'new' THEN 0 WHEN 'available' THEN 1 WHEN 'reserved' THEN 2 ELSE 3 END,
        created_at DESC` as unknown as Promise<StockItemRow[]>;
  }
  return sql`SELECT * FROM stock_items ORDER BY created_at DESC` as unknown as Promise<StockItemRow[]>;
}

export async function getStockItemById(id: number): Promise<StockItemRow | null> {
  await ensureSalesSchema();
  const rows = await sql`SELECT * FROM stock_items WHERE id = ${id}` as unknown as StockItemRow[];
  return rows[0] || null;
}

export async function getStockItemBySlug(slug: string): Promise<StockItemRow | null> {
  await ensureSalesSchema();
  const rows = await sql`SELECT * FROM stock_items WHERE slug = ${slug}` as unknown as StockItemRow[];
  return rows[0] || null;
}

export async function createStockItem(data: {
  kind: string;
  brand: string;
  model: string;
  year?: number | null;
  km?: number | null;
  length_m?: number | null;
  price_eur?: number | null;
  status?: string;
  slug?: string | null;
  description?: string | null;
  hero_photo_url?: string | null;
  gallery_urls?: string[];
}): Promise<StockItemRow> {
  await ensureSalesSchema();
  const status = data.status || 'available';
  const gallery = JSON.stringify(data.gallery_urls || []);
  const rows = await sql`
    INSERT INTO stock_items
      (kind, brand, model, year, km, length_m, price_eur, status, slug, description, hero_photo_url, gallery_urls)
    VALUES
      (${data.kind}, ${data.brand}, ${data.model},
       ${data.year ?? null}, ${data.km ?? null}, ${data.length_m ?? null},
       ${data.price_eur ?? null}, ${status},
       ${data.slug || null}, ${data.description || null},
       ${data.hero_photo_url || null}, ${gallery}::jsonb)
    RETURNING *` as unknown as StockItemRow[];
  return rows[0];
}

export async function updateStockItem(id: number, data: Partial<{
  kind: string;
  brand: string;
  model: string;
  year: number | null;
  km: number | null;
  length_m: number | null;
  price_eur: number | null;
  status: string;
  slug: string | null;
  description: string | null;
  hero_photo_url: string | null;
  gallery_urls: string[];
}>): Promise<StockItemRow | null> {
  await ensureSalesSchema();
  // Bouw expliciet — neon-tagged-template heeft geen dynamic SET-builder.
  const cur = await getStockItemById(id);
  if (!cur) return null;
  const galleryArr = data.gallery_urls ?? (Array.isArray(cur.gallery_urls) ? cur.gallery_urls as string[] : []);
  const rows = await sql`
    UPDATE stock_items SET
      kind = ${data.kind ?? cur.kind},
      brand = ${data.brand ?? cur.brand},
      model = ${data.model ?? cur.model},
      year = ${data.year !== undefined ? data.year : cur.year},
      km = ${data.km !== undefined ? data.km : cur.km},
      length_m = ${data.length_m !== undefined ? data.length_m : cur.length_m},
      price_eur = ${data.price_eur !== undefined ? data.price_eur : cur.price_eur},
      status = ${data.status ?? cur.status},
      slug = ${data.slug !== undefined ? data.slug : cur.slug},
      description = ${data.description !== undefined ? data.description : cur.description},
      hero_photo_url = ${data.hero_photo_url !== undefined ? data.hero_photo_url : cur.hero_photo_url},
      gallery_urls = ${JSON.stringify(galleryArr)}::jsonb,
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *` as unknown as StockItemRow[];
  return rows[0] || null;
}

export async function deleteStockItem(id: number): Promise<boolean> {
  await ensureSalesSchema();
  const rows = await sql`DELETE FROM stock_items WHERE id = ${id} RETURNING id` as unknown as { id: number }[];
  return rows.length > 0;
}

// ─── Purchase intakes (inkoop-aanvragen) ─────────────────
export type PurchaseIntakeRow = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  kind: string;
  brand: string | null;
  model: string | null;
  year: number | null;
  registration: string | null;
  km: number | null;
  condition_note: string | null;
  asking_price_eur: string | null;
  photos: unknown;
  status: string;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
};

export async function createPurchaseIntake(data: {
  name: string;
  email: string;
  phone?: string | null;
  kind: string;
  brand?: string | null;
  model?: string | null;
  year?: number | null;
  registration?: string | null;
  km?: number | null;
  condition_note?: string | null;
  asking_price_eur?: number | null;
  photos?: Array<{ url: string; webUrl?: string; fileName: string; sizeKb?: number }>;
}): Promise<PurchaseIntakeRow> {
  await ensureSalesSchema();
  const photos = JSON.stringify(data.photos || []);
  const rows = await sql`
    INSERT INTO purchase_intakes
      (name, email, phone, kind, brand, model, year, registration, km, condition_note, asking_price_eur, photos)
    VALUES
      (${data.name}, ${data.email}, ${data.phone || null}, ${data.kind},
       ${data.brand || null}, ${data.model || null}, ${data.year ?? null},
       ${data.registration || null}, ${data.km ?? null},
       ${data.condition_note || null}, ${data.asking_price_eur ?? null},
       ${photos}::jsonb)
    RETURNING *` as unknown as PurchaseIntakeRow[];
  return rows[0];
}

export async function listPurchaseIntakes(): Promise<PurchaseIntakeRow[]> {
  await ensureSalesSchema();
  return sql`SELECT * FROM purchase_intakes ORDER BY created_at DESC` as unknown as Promise<PurchaseIntakeRow[]>;
}

export async function updatePurchaseIntakeStatus(id: number, status: string, adminNote?: string | null): Promise<PurchaseIntakeRow | null> {
  await ensureSalesSchema();
  const rows = await sql`
    UPDATE purchase_intakes
    SET status = ${status},
        admin_note = COALESCE(${adminNote ?? null}, admin_note),
        updated_at = NOW()
    WHERE id = ${id}
    RETURNING *` as unknown as PurchaseIntakeRow[];
  return rows[0] || null;
}

export { sql };
