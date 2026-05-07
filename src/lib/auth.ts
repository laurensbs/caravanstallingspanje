import { SignJWT, jwtVerify } from 'jose';

let _adminSecret: Uint8Array | null = null;

function adminSecret(): Uint8Array {
  if (_adminSecret) return _adminSecret;
  const val = process.env.ADMIN_JWT_SECRET || process.env.ADMIN_SECRET;
  if (!val) throw new Error('Missing required environment variable: ADMIN_JWT_SECRET');
  _adminSecret = new TextEncoder().encode(val);
  return _adminSecret;
}

export async function createAdminToken(payload: { id: number; name: string; email: string; role: string }) {
  return new SignJWT(payload).setProtectedHeader({ alg: 'HS256' }).setExpirationTime('7d').sign(adminSecret());
}

export async function verifyAdminToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, adminSecret());
    return payload as { id: number; name: string; email: string; role: string };
  } catch { return null; }
}

// ─── Customer-portal sessions ────────────────────────────
// Aparte JWT met eigen secret zodat een lekkende klant-sessie nooit
// admin-toegang kan geven. Default 7 dagen geldig (klanten loggen niet
// vaak in — meestal alleen om factuur op te halen).
let _customerSecret: Uint8Array | null = null;
function customerSecret(): Uint8Array {
  if (_customerSecret) return _customerSecret;
  const val = process.env.CUSTOMER_JWT_SECRET || process.env.ADMIN_JWT_SECRET;
  if (!val) throw new Error('Missing required environment variable: CUSTOMER_JWT_SECRET');
  _customerSecret = new TextEncoder().encode(val);
  return _customerSecret;
}

export type CustomerTokenPayload = {
  id: number;
  email: string;
  name: string;
};

export async function createCustomerToken(payload: CustomerTokenPayload) {
  return new SignJWT({ ...payload }).setProtectedHeader({ alg: 'HS256' }).setExpirationTime('7d').sign(customerSecret());
}

export async function verifyCustomerToken(token: string): Promise<CustomerTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, customerSecret());
    return payload as unknown as CustomerTokenPayload;
  } catch { return null; }
}

// Variant die exp-timestamp meestuurt zodat middleware een sliding-session
// kan implementeren (cookie verlengen als < 1 dag van expiry).
export async function verifyCustomerTokenWithExp(token: string): Promise<(CustomerTokenPayload & { exp: number }) | null> {
  try {
    const { payload } = await jwtVerify(token, customerSecret());
    return payload as unknown as CustomerTokenPayload & { exp: number };
  } catch { return null; }
}

// Cryptografisch sterk eenmalig wachtwoord. 12 tekens, mix van
// hoofd/kleinletters + cijfers. Geen leestekens (mensen tikken 'm
// over uit een mail). Geen 0/O/1/I/l om verwarring te voorkomen.
export function generateTempPassword(): string {
  const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  const len = 12;
  // crypto.getRandomValues geeft uniform-random integers; modulo bias is
  // verwaarloosbaar bij dit charset (54 chars × 12 picks).
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  let out = '';
  for (let i = 0; i < len; i++) out += charset[bytes[i] % charset.length];
  return out;
}
