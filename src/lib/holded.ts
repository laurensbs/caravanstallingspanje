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
};

export async function findContactByEmail(email: string): Promise<HoldedContact | null> {
  if (!email) return null;
  const data = await holdedFetch<HoldedContact[]>(`/invoicing/v1/contacts?email=${encodeURIComponent(email)}`);
  return Array.isArray(data) && data.length > 0 ? data[0] : null;
}

export async function createContact(input: { name: string; email?: string | null }): Promise<HoldedContact> {
  const body = {
    name: input.name,
    email: input.email || undefined,
    type: 'client',
    isperson: 1,
  };
  const data = await holdedFetch<{ status: number; id: string }>(
    '/invoicing/v1/contacts',
    { method: 'POST', body: JSON.stringify(body) }
  );
  return { id: data.id, name: input.name, email: input.email || undefined };
}

export async function ensureContact(input: { name: string; email?: string | null }): Promise<HoldedContact> {
  if (input.email) {
    const existing = await findContactByEmail(input.email);
    if (existing) return existing;
  }
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
