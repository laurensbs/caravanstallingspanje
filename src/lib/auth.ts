import { SignJWT, jwtVerify } from 'jose';

function getSecret(name: string, ...fallbacks: string[]): Uint8Array {
  const val = process.env[name] || fallbacks.map(f => process.env[f]).find(Boolean);
  if (!val) throw new Error(`Missing required environment variable: ${name}`);
  return new TextEncoder().encode(val);
}

// Lazy initialization — avoids crashing the middleware module at import time
// when env vars aren't available yet (e.g. during build or edge cold start).
let _adminSecret: Uint8Array | null = null;
let _staffSecret: Uint8Array | null = null;
let _customerSecret: Uint8Array | null = null;

function adminSecret(): Uint8Array {
  if (!_adminSecret) _adminSecret = getSecret('ADMIN_JWT_SECRET', 'ADMIN_SECRET');
  return _adminSecret;
}
function staffSecret(): Uint8Array {
  if (!_staffSecret) _staffSecret = getSecret('STAFF_JWT_SECRET', 'ADMIN_SECRET');
  return _staffSecret;
}
function customerSecret(): Uint8Array {
  if (!_customerSecret) _customerSecret = getSecret('CUSTOMER_JWT_SECRET', 'ADMIN_SECRET');
  return _customerSecret;
}

// ── Admin auth ──

export async function createAdminToken(payload: { id: number; name: string; email: string; role: string }) {
  return new SignJWT(payload).setProtectedHeader({ alg: 'HS256' }).setExpirationTime('7d').sign(adminSecret());
}

export async function verifyAdminToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, adminSecret());
    return payload as { id: number; name: string; email: string; role: string };
  } catch { return null; }
}

// ── Staff auth ──

export async function createStaffToken(payload: { id: number; name: string; email: string; role: string; locationId?: number }) {
  return new SignJWT(payload).setProtectedHeader({ alg: 'HS256' }).setExpirationTime('12h').sign(staffSecret());
}

export async function verifyStaffToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, staffSecret());
    return payload as { id: number; name: string; email: string; role: string; locationId?: number };
  } catch { return null; }
}

// ── Customer auth ──

export async function createCustomerToken(payload: { id: number; email: string; name: string }) {
  return new SignJWT(payload).setProtectedHeader({ alg: 'HS256' }).setExpirationTime('30d').sign(customerSecret());
}

export async function verifyCustomerToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, customerSecret());
    return payload as { id: number; email: string; name: string };
  } catch { return null; }
}

export async function getCustomerSession(token: string) {
  return verifyCustomerToken(token);
}
