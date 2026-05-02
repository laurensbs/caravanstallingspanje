import { NextResponse } from 'next/server';
import { ensureCustomerSchema, ensureMiscSchema, resetSchemaCache, sql } from '@/lib/db';

// Forceert alle ALTER TABLE / CREATE TABLE / INDEX / SEED migrations zonder
// gebruik te maken van de in-memory module-cache. Bezoek na deploy via
// GET /api/admin/run-migrations om de productie-DB op één zet bij te werken.
//
// Single source of truth: ensureCustomerSchema() en ensureMiscSchema() uit
// lib/db.ts. Alle ALTER's, indexes, seeds zitten daar — deze route doet
// niet meer dan ze in de juiste volgorde aanroepen + cache resetten zodat
// 't ook werkt op een fresh-deploy waar de cache nog niet opnieuw is
// gezet sinds de schema-update.
export async function GET() {
  const log: string[] = [];
  resetSchemaCache();

  try {
    await ensureCustomerSchema();
    log.push('✓ ensureCustomerSchema() complete');
  } catch (err) {
    log.push(`✗ ensureCustomerSchema(): ${err instanceof Error ? err.message : 'unknown'}`);
  }

  try {
    await ensureMiscSchema();
    log.push('✓ ensureMiscSchema() complete');
  } catch (err) {
    log.push(`✗ ensureMiscSchema(): ${err instanceof Error ? err.message : 'unknown'}`);
  }

  // Sanity-check: bevestig dat de belangrijkste tabellen + indexes bestaan.
  // Returnt deze info zodat admin kan zien dat de DB klopt.
  let tables: Array<{ table_name: string }> = [];
  let indexes: Array<{ indexname: string; tablename: string }> = [];
  try {
    tables = await sql`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    ` as unknown as Array<{ table_name: string }>;
    indexes = await sql`
      SELECT indexname, tablename FROM pg_indexes
      WHERE schemaname = 'public'
        AND indexname LIKE 'idx_%'
      ORDER BY tablename, indexname
    ` as unknown as Array<{ indexname: string; tablename: string }>;
  } catch (err) {
    log.push(`✗ schema-introspectie: ${err instanceof Error ? err.message : 'unknown'}`);
  }

  return NextResponse.json({
    ok: true,
    log,
    tables: tables.map((t) => t.table_name),
    indexes: indexes.map((i) => `${i.tablename}.${i.indexname}`),
  });
}
