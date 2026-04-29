const BASE = 'https://api.holded.com/api';

function apiKey(): string {
  const key = process.env.HOLDED_API_KEY;
  if (!key) throw new Error('HOLDED_API_KEY ontbreekt');
  return key;
}

async function holdedFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'key': apiKey(),
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  let body: unknown;
  try { body = text ? JSON.parse(text) : {}; } catch { body = { raw: text }; }
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      throw new Error('Holded weigert de API-key (401/403). Vernieuw de key in Vercel env vars.');
    }
    if (res.status === 429) {
      throw new Error('Holded rate limit bereikt. Probeer het over een minuut opnieuw.');
    }
    const msg = (body && typeof body === 'object' && 'info' in body && typeof (body as { info: unknown }).info === 'string')
      ? (body as { info: string }).info
      : `Holded ${res.status}`;
    throw new Error(msg);
  }
  return body as T;
}

export type HoldedContact = {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  vatnumber?: string;
  address?: { address?: string; city?: string; postalCode?: string; country?: string };
};

// Holded paginatie. Default page-size is 50; we vragen max op om import-tempo
// te verhogen. Stoppen zodra een page minder dan {limit} entries teruggeeft.
export async function listContactsPaginated(page = 1, limit = 500): Promise<HoldedContact[]> {
  return holdedFetch<HoldedContact[]>(`/invoicing/v1/contacts?page=${page}&limit=${limit}`);
}

export async function listAllContacts(): Promise<HoldedContact[]> {
  const all: HoldedContact[] = [];
  for (let page = 1; page < 200; page++) {
    const batch = await listContactsPaginated(page, 500);
    if (!Array.isArray(batch) || batch.length === 0) break;
    all.push(...batch);
    if (batch.length < 500) break;
  }
  return all;
}

// Verlengde create voor het admin-paneel: meer velden dan ensureContact
// gebruikt. Returnt het nieuwe Holded-id.
export async function pushContactToHolded(input: {
  name: string;
  email?: string | null;
  phone?: string | null;
  mobile?: string | null;
  address?: string | null;
  city?: string | null;
  postal_code?: string | null;
  country?: string | null;
  vat_number?: string | null;
}): Promise<string> {
  const body: Record<string, unknown> = {
    name: input.name,
    email: input.email || undefined,
    phone: input.phone || undefined,
    mobile: input.mobile || input.phone || undefined,
    type: 'client',
    isperson: 1,
  };
  if (input.address || input.city || input.postal_code || input.country) {
    body.address = {
      address: input.address || undefined,
      city: input.city || undefined,
      postalCode: input.postal_code || undefined,
      country: input.country || 'ES',
    };
  }
  if (input.vat_number) body.vatnumber = input.vat_number;
  const data = await holdedFetch<{ status: number; id: string }>(
    '/invoicing/v1/contacts',
    { method: 'POST', body: JSON.stringify(body) }
  );
  return data.id;
}

export async function findContactByEmail(email: string): Promise<HoldedContact | null> {
  if (!email) return null;
  const data = await holdedFetch<HoldedContact[]>(`/invoicing/v1/contacts?email=${encodeURIComponent(email)}`);
  return Array.isArray(data) && data.length > 0 ? data[0] : null;
}

// Holded has no ?phone= query, so we scan the first page of contacts and
// match locally. Good enough for our scale (<100 contacts); we'd swap to
// pagination if we ever cross a few thousand.
function normalizePhone(s: string): string {
  return s.replace(/[^\d]/g, '').replace(/^00/, ''); // strip + space - and leading 00
}

export async function findContactByPhone(phone: string): Promise<HoldedContact | null> {
  const target = normalizePhone(phone);
  if (target.length < 5) return null;
  // First page (Holded default ~50 per page). For larger lists we'd loop
  // ?page=2 etc., but our schaal verandert dit nog niet.
  const data = await holdedFetch<HoldedContact[]>(`/invoicing/v1/contacts`);
  if (!Array.isArray(data)) return null;
  for (const c of data) {
    const candidates = [c.phone, c.mobile].filter(Boolean) as string[];
    if (candidates.some((p) => normalizePhone(p) === target)) {
      return c;
    }
  }
  return null;
}

export async function createContact(input: { name: string; email?: string | null; phone?: string | null }): Promise<HoldedContact> {
  const body = {
    name: input.name,
    email: input.email || undefined,
    phone: input.phone || undefined,
    mobile: input.phone || undefined,
    type: 'client',
    isperson: 1,
  };
  const data = await holdedFetch<{ status: number; id: string }>(
    '/invoicing/v1/contacts',
    { method: 'POST', body: JSON.stringify(body) }
  );
  return {
    id: data.id,
    name: input.name,
    email: input.email || undefined,
    phone: input.phone || undefined,
  };
}

export async function ensureContact(input: { name: string; email?: string | null; phone?: string | null }): Promise<HoldedContact> {
  // 1. Try exact email match first (fast — Holded supports ?email=).
  if (input.email) {
    try {
      const byEmail = await findContactByEmail(input.email);
      if (byEmail) return byEmail;
    } catch { /* ignore + fall through to phone */ }
  }
  // 2. Fall back to phone match (scans first page, normalises +/space/dashes).
  if (input.phone) {
    try {
      const byPhone = await findContactByPhone(input.phone);
      if (byPhone) return byPhone;
    } catch { /* ignore + fall through to create */ }
  }
  // 3. No match — create a fresh contact.
  return createContact(input);
}

export type HoldedInvoiceItem = {
  name: string;
  units: number;
  subtotal: number;
  tax?: number;
};

export type CreateInvoiceInput = {
  contactId: string;
  desc?: string;
  date?: number; // unix seconds
  notes?: string;
  items: HoldedInvoiceItem[];
};

export type HoldedInvoiceStatus = 'paid' | 'partial' | 'unpaid' | 'unknown';

export type HoldedInvoiceSummary = {
  id: string;
  docNumber?: string;
  status: HoldedInvoiceStatus;
  total?: number;
  pending?: number;
  publicUrl?: string;
};

export async function getInvoice(id: string): Promise<HoldedInvoiceSummary | null> {
  if (!id) return null;
  try {
    const data = await holdedFetch<{
      id: string;
      docNumber?: string;
      status?: number | string;
      total?: number;
      pending?: number;
      publicUrl?: string;
    }>(`/invoicing/v1/documents/invoice/${id}`);
    // Holded uses status: 0 = draft, 1 = unpaid, 2 = partial, 3 = paid (codes vary;
    // also a paid invoice has pending = 0). We treat both signals.
    let status: HoldedInvoiceStatus = 'unknown';
    if (data.pending === 0 && data.total && data.total > 0) status = 'paid';
    else if (data.pending != null && data.total != null && data.pending < data.total) status = 'partial';
    else if (data.pending != null) status = 'unpaid';
    return {
      id: data.id,
      docNumber: data.docNumber,
      status,
      total: data.total,
      pending: data.pending,
      publicUrl: data.publicUrl,
    };
  } catch {
    return null;
  }
}

// One-shot: find-or-create a contact by email, then create an invoice.
// Used by the Stripe webhook after a successful payment.
export async function invoiceForCustomer(input: {
  customer: { name: string; email: string; phone?: string | null };
  description: string;
  amountEur: number;
  taxPercent?: number;
}): Promise<{ id: string; invoiceNum: string; contactId: string }> {
  const contact = await ensureContact(input.customer);
  const invoice = await createInvoice({
    contactId: contact.id,
    desc: input.description,
    items: [{
      name: input.description,
      units: 1,
      subtotal: input.amountEur,
      tax: input.taxPercent ?? 21,
    }],
  });
  return { id: invoice.id, invoiceNum: invoice.invoiceNum, contactId: contact.id };
}

export async function createInvoice(input: CreateInvoiceInput): Promise<{ id: string; invoiceNum: string }> {
  const body = {
    contactId: input.contactId,
    desc: input.desc || '',
    date: input.date || Math.floor(Date.now() / 1000),
    notes: input.notes || '',
    items: input.items,
  };
  const data = await holdedFetch<{ status: number; id: string; invoiceNum?: string }>(
    '/invoicing/v1/documents/invoice',
    { method: 'POST', body: JSON.stringify(body) }
  );
  return { id: data.id, invoiceNum: data.invoiceNum || '' };
}
