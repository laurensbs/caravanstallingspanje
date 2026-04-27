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
