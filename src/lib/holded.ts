const BASE = 'https://api.holded.com/api';

function apiKey(): string {
  const key = process.env.HOLDED_API_KEY;
  if (!key) throw new Error('HOLDED_API_KEY ontbreekt');
  return key;
}

async function holdedFetch<T>(path: string, init: RequestInit = {}, attempt = 0): Promise<T> {
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
      // Retry met respect voor Retry-After header. Max 3 attempts: 2s, 4s, 8s.
      if (attempt < 3) {
        const retryAfter = Number(res.headers.get('retry-after')) || (2 ** (attempt + 1));
        const waitMs = Math.min(8000, retryAfter * 1000);
        await new Promise((r) => setTimeout(r, waitMs));
        return holdedFetch<T>(path, init, attempt + 1);
      }
      throw new Error('Holded rate limit (3 retries opgebruikt). Probeer over een minuut opnieuw.');
    }
    const msg = (body && typeof body === 'object' && 'info' in body && typeof (body as { info: unknown }).info === 'string')
      ? (body as { info: string }).info
      : `Holded ${res.status}`;
    throw new Error(msg);
  }
  return body as T;
}

// Volledige Holded-contact-shape. Holded geeft veel meer terug dan we
// historisch gebruikt hebben — kenteken zit bv. in customFields. We halen
// nu alles en bewaren de raw payload voor admin-detail.
export type HoldedCustomField = {
  field?: string;
  value?: string;
  // Holded varieert hier in oudere/nieuwere accounts.
  name?: string;
  id?: string;
};

export type HoldedAddress = {
  address?: string;
  city?: string;
  postalCode?: string;
  province?: string;
  country?: string;
  countryCode?: string;
};

export type HoldedContact = {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  vatnumber?: string;
  // Identificatie / classificatie
  code?: string;          // intern code-veld in Holded
  type?: string;          // 'client' | 'supplier' | 'lead'
  isperson?: number | boolean;
  // Adressen
  address?: HoldedAddress;
  billAddress?: HoldedAddress;
  shippingAddress?: HoldedAddress;
  // Aanvullend
  web?: string;
  secondaryEmail?: string;
  iban?: string;
  swift?: string;
  defaultCurrency?: string;
  notes?: string;
  // Custom fields — kenteken, klantnummer, locatie, etc.
  customFields?: HoldedCustomField[];
  // Tags voor filtering in Holded
  tags?: string[];
  // Onbekende velden willen we niet kwijt zijn — de raw-snapshot bewaart 'm.
  [key: string]: unknown;
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

// Update een bestaand Holded-contact. Holded gebruikt PUT op het ID-pad.
export async function updateContactInHolded(holdedId: string, input: {
  name?: string;
  email?: string | null;
  phone?: string | null;
  mobile?: string | null;
  address?: string | null;
  city?: string | null;
  postal_code?: string | null;
  country?: string | null;
  vat_number?: string | null;
}): Promise<void> {
  const body: Record<string, unknown> = {};
  if (input.name !== undefined) body.name = input.name;
  if (input.email !== undefined) body.email = input.email || undefined;
  if (input.phone !== undefined) body.phone = input.phone || undefined;
  if (input.mobile !== undefined) body.mobile = input.mobile || undefined;
  if (input.vat_number !== undefined) body.vatnumber = input.vat_number || undefined;
  if (input.address !== undefined || input.city !== undefined || input.postal_code !== undefined || input.country !== undefined) {
    body.address = {
      address: input.address || undefined,
      city: input.city || undefined,
      postalCode: input.postal_code || undefined,
      country: input.country || 'ES',
    };
  }
  await holdedFetch<{ status: number; id: string }>(
    `/invoicing/v1/contacts/${holdedId}`,
    { method: 'PUT', body: JSON.stringify(body) }
  );
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
    // Onderdruk welkomstmail van Holded — wij doen onze eigen comms.
    notifyAtCreate: false,
    sendMail: false,
    sendByEmail: false,
    notify: false,
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

// Zoek Holded-contacten op vrij-formaat zoekterm (naam/email/telefoon).
// Holded ondersteunt geen ?q= param, dus we trekken de eerste paar pagina's
// op en filteren client-side. Voor admin-typeahead is dat ruim genoeg.
// Errors propagate naar de caller zodat de UI ze kan tonen — fail niet
// stilletjes weg, want dan denkt admin dat er gewoon geen match is.
export async function searchContactsInHolded(query: string, max = 10): Promise<HoldedContact[]> {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const normalize = (s: string | undefined) => (s || '').toLowerCase();
  const normalizePhoneStr = (s: string | undefined) => (s || '').replace(/[^\d]/g, '');
  const phoneQ = normalizePhoneStr(query);

  // Probeer eerst directe email-match (snelst).
  if (q.includes('@')) {
    const direct = await findContactByEmail(query);
    if (direct) return [direct];
  }

  const out: HoldedContact[] = [];
  // Stop zodra we genoeg matches hebben of een lege batch krijgen.
  for (let page = 1; page <= 5 && out.length < max; page++) {
    const batch = await listContactsPaginated(page, 100);
    if (!Array.isArray(batch) || batch.length === 0) break;
    for (const c of batch) {
      const name = normalize(c.name);
      const email = normalize(c.email);
      const phone = normalizePhoneStr(c.phone);
      const mobile = normalizePhoneStr(c.mobile);
      const hit =
        (name && name.includes(q)) ||
        (email && email.includes(q)) ||
        (phoneQ.length >= 5 && (phone.includes(phoneQ) || mobile.includes(phoneQ)));
      if (hit) out.push(c);
      if (out.length >= max) break;
    }
    if (batch.length < 100) break;
  }
  return out;
}

export async function findContactByEmail(email: string): Promise<HoldedContact | null> {
  if (!email) return null;
  const data = await holdedFetch<HoldedContact[]>(`/invoicing/v1/contacts?email=${encodeURIComponent(email)}`);
  return Array.isArray(data) && data.length > 0 ? data[0] : null;
}

// Direct ophalen via id — geeft de volledige contact-detail incl. custom
// fields. Niet alle Holded-tenants ondersteunen dit endpoint, dus we vangen
// 'm netjes af bij 404.
export async function getContactById(holdedId: string): Promise<HoldedContact | null> {
  if (!holdedId) return null;
  try {
    return await holdedFetch<HoldedContact>(`/invoicing/v1/contacts/${holdedId}`);
  } catch {
    return null;
  }
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

export type ContactInput = {
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  postal_code?: string | null;
  country?: string | null;
  vat_number?: string | null;
};

export async function createContact(input: ContactInput): Promise<HoldedContact> {
  const body: Record<string, unknown> = {
    name: input.name,
    email: input.email || undefined,
    phone: input.phone || undefined,
    mobile: input.phone || undefined,
    type: 'client',
    isperson: 1,
    // Onderdruk welkomstmail van Holded — klanten krijgen onze eigen comms.
    notifyAtCreate: false,
    sendMail: false,
    sendByEmail: false,
    notify: false,
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
  return {
    id: data.id,
    name: input.name,
    email: input.email || undefined,
    phone: input.phone || undefined,
  };
}

export async function ensureContact(input: ContactInput): Promise<HoldedContact> {
  // 1. Try exact email match first (fast — Holded supports ?email=).
  if (input.email) {
    try {
      const byEmail = await findContactByEmail(input.email);
      if (byEmail) {
        // Bestaande contact — vul ontbrekende adresvelden bij zodat de
        // pro forma volledig is voor de boekhouding. Best-effort, niet fataal.
        if (input.address && !byEmail.address?.address) {
          await updateContactInHolded(byEmail.id, {
            address: input.address,
            city: input.city || null,
            postal_code: input.postal_code || null,
            country: input.country || null,
            vat_number: input.vat_number || null,
          }).catch(() => {});
        }
        return byEmail;
      }
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
  // Proforma endpoint eerst (sinds we alleen pro forma's maken). Bij niet
  // gevonden valt 'unknown' status terug. Echte invoice-endpoint als fallback
  // voor historische records van vóór deze switch.
  const tryFetch = async (path: string) => {
    try {
      return await holdedFetch<{
        id: string;
        docNumber?: string;
        status?: number | string;
        total?: number;
        pending?: number;
        publicUrl?: string;
      }>(path);
    } catch {
      return null;
    }
  };
  const data = await tryFetch(`/invoicing/v1/documents/proform/${id}`)
    ?? await tryFetch(`/invoicing/v1/documents/invoice/${id}`);
  if (!data) return null;
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
}

// One-shot: find-or-create a contact by email, then create a PROFORMA.
// Holded ondersteunt zowel 'invoice' als 'proform' als document-type;
// wij willen ALTIJD een proforma — geen echte facturen — zodat het
// boekhoudteam handmatig kan controleren en pas dan de echte factuur
// uitschrijft. Klant ziet er niets van: betaling werkt gewoon, mail en
// admin tonen de pro-forma-koppeling als bewijsstuk.
export async function invoiceForCustomer(input: {
  customer: ContactInput & { email: string };
  description: string;
  amountEur: number;
  taxPercent?: number;
}): Promise<{ id: string; invoiceNum: string; contactId: string }> {
  const contact = await ensureContact(input.customer);
  const proforma = await createProforma({
    contactId: contact.id,
    desc: input.description,
    items: [{
      name: input.description,
      units: 1,
      subtotal: input.amountEur,
      tax: input.taxPercent ?? 21,
    }],
  });
  return { id: proforma.id, invoiceNum: proforma.invoiceNum, contactId: contact.id };
}

// Maakt een Holded pro forma. NIET een echte factuur.
// Endpoint: POST /invoicing/v1/documents/proform
//
// BELANGRIJK: pro forma's zijn puur voor onze interne boekhouding —
// klanten mogen 'r GEEN automatische mail van Holded over ontvangen.
// We zetten daarom expliciet alle Holded-notify-flags uit. Klanten
// krijgen alleen onze eigen Stripe-betaallink-mail (zie payment-link route).
export async function createProforma(input: CreateInvoiceInput): Promise<{ id: string; invoiceNum: string }> {
  const body = {
    contactId: input.contactId,
    desc: input.desc || '',
    date: input.date || Math.floor(Date.now() / 1000),
    notes: input.notes || '',
    items: input.items,
    // Holded-velden om automatische klant-mail te onderdrukken.
    // De API negeert onbekende keys, dus 't is veilig om alle bekende
    // varianten mee te sturen — afhankelijk van account-config wint er één.
    notifyAtCreate: false,
    sendMail: false,
    sendByEmail: false,
    notify: false,
  };
  const data = await holdedFetch<{ status: number; id: string; invoiceNum?: string; docNumber?: string }>(
    '/invoicing/v1/documents/proform',
    { method: 'POST', body: JSON.stringify(body) }
  );
  return { id: data.id, invoiceNum: data.invoiceNum || data.docNumber || '' };
}

// Behouden voor backwards-compat (bv. admin manual-invoice). Roept nu ook
// de proforma-endpoint aan — geen echte facturen meer in Holded.
export async function createInvoice(input: CreateInvoiceInput): Promise<{ id: string; invoiceNum: string }> {
  return createProforma(input);
}
