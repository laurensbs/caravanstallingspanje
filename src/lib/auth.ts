import { SignJWT, jwtVerify } from 'jose';

function requireEnv(name: string): Uint8Array {
  const val = process.env[name];
  if (!val) throw new Error(`Missing required environment variable: ${name}`);
  return new TextEncoder().encode(val);
}

const ADMIN_SECRET = requireEnv('ADMIN_JWT_SECRET');
const STAFF_SECRET = requireEnv('STAFF_JWT_SECRET');
const CUSTOMER_SECRET = requireEnv('CUSTOMER_JWT_SECRET');

// ── Admin auth ──

export async function createAdminToken(payload: { id: number; name: string; email: string; role: string }) {
  return new SignJWT(payload).setProtectedHeader({ alg: 'HS256' }).setExpirationTime('7d').sign(ADMIN_SECRET);
}

export async function verifyAdminToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, ADMIN_SECRET);
    return payload as { id: number; name: string; email: string; role: string };
  } catch { return null; }
}

// ── Staff auth ──

export async function createStaffToken(payload: { id: number; name: string; email: string; role: string; locationId?: number }) {
  return new SignJWT(payload).setProtectedHeader({ alg: 'HS256' }).setExpirationTime('12h').sign(STAFF_SECRET);
}

export async function verifyStaffToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, STAFF_SECRET);
    return payload as { id: number; name: string; email: string; role: string; locationId?: number };
  } catch { return null; }
}

// ── Customer auth ──

export async function createCustomerToken(payload: { id: number; email: string; name: string }) {
  return new SignJWT(payload).setProtectedHeader({ alg: 'HS256' }).setExpirationTime('30d').sign(CUSTOMER_SECRET);
}

export async function verifyCustomerToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, CUSTOMER_SECRET);
    return payload as { id: number; email: string; name: string };
  } catch { return null; }
}

export async function getCustomerSession(token: string) {
  return verifyCustomerToken(token);
}
