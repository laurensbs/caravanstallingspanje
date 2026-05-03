import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { log } from '@/lib/log';

// Readiness probe — checkt of de externe afhankelijkheden bereikbaar zijn.
// DB ping is verplicht; Stripe/Holded zijn soft-checks (mogen falen zonder
// de hele site neer te halen).
//
// Auth: vereist `READY_TOKEN` header om scraping van interne timing-data te
// voorkomen. Wanneer niet gezet: endpoint blijft 200 voor zelf-controle in dev.

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Check = { name: string; ok: boolean; ms: number; detail?: string };

async function timeIt<T>(name: string, fn: () => Promise<T>): Promise<Check> {
  const start = Date.now();
  try {
    await fn();
    return { name, ok: true, ms: Date.now() - start };
  } catch (err) {
    const detail = err instanceof Error ? err.message.slice(0, 200) : String(err);
    return { name, ok: false, ms: Date.now() - start, detail };
  }
}

export async function GET(req: Request) {
  // Optionele bescherming. Zonder READY_TOKEN-env staat de endpoint open.
  const expected = process.env.READY_TOKEN;
  if (expected) {
    const got = req.headers.get('x-ready-token');
    if (got !== expected) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }
  }

  const checks: Check[] = [];

  // DB ping — verplicht. Gebruikt eigen connection zodat we geen draft-import
  // van de hele db.ts laden (init-bijwerking blijft uit deze hot-path).
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    checks.push({ name: 'db', ok: false, ms: 0, detail: 'DATABASE_URL ontbreekt' });
  } else {
    const sql = neon(dbUrl);
    checks.push(await timeIt('db', async () => {
      await sql`SELECT 1`;
    }));
  }

  // Env presence — soft check, alleen aanwezigheid (geen calls).
  checks.push({
    name: 'stripe_env',
    ok: !!process.env.STRIPE_SECRET_KEY && !!process.env.STRIPE_WEBHOOK_SECRET,
    ms: 0,
  });
  checks.push({
    name: 'mail_env',
    ok: !!process.env.SMTP_HOST && !!process.env.SMTP_USER,
    ms: 0,
  });
  checks.push({
    name: 'jwt_env',
    ok: !!process.env.ADMIN_JWT_SECRET,
    ms: 0,
  });

  const ok = checks.every((c) => c.ok);

  if (!ok) {
    log.warn('ready_failed', { checks: checks.filter((c) => !c.ok) });
  }

  return NextResponse.json(
    {
      status: ok ? 'ready' : 'not_ready',
      ts: new Date().toISOString(),
      checks,
    },
    {
      status: ok ? 200 : 503,
      headers: { 'Cache-Control': 'no-store' },
    },
  );
}
