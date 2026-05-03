import { NextResponse } from 'next/server';

// Liveness probe — antwoordt zolang het proces leeft. Gebruik 'm voor Vercel
// status-monitoring of een externe uptime-checker (UptimeRobot, etc.).
// Géén DB- of externe-API-calls hier; dat hoort in /api/ready.

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      ts: new Date().toISOString(),
      env: process.env.VERCEL_ENV || process.env.NODE_ENV,
      region: process.env.VERCEL_REGION,
      commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7),
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
