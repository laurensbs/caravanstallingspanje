import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

// GET /api/admin/seed-ideas — forceert dat het watermachine-pilot-idee in de
// publieke ideeën-lijst staat. Idempotent: als het er al staat doet ie niets.
// Bestaat los van /api/admin/run-migrations zodat we de seed kunnen herhalen
// zonder alle migraties opnieuw uit te voeren.
export async function GET() {
  const log: string[] = [];
  const ran = async (label: string, fn: () => Promise<unknown>) => {
    try {
      await fn();
      log.push(`✓ ${label}`);
    } catch (err) {
      log.push(`✗ ${label}: ${err instanceof Error ? err.message : 'unknown'}`);
    }
  };

  // Eerst zorgen dat de tabel + kolommen bestaan (idempotent).
  await ran('ideas table', () => sql`CREATE TABLE IF NOT EXISTS ideas (
    id SERIAL PRIMARY KEY,
    name TEXT,
    email TEXT,
    category TEXT,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new',
    votes_up INTEGER DEFAULT 0,
    votes_down INTEGER DEFAULT 0,
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`);
  await ran('ideas.featured', () => sql`ALTER TABLE ideas ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false`);
  await ran('ideas.votes_up', () => sql`ALTER TABLE ideas ADD COLUMN IF NOT EXISTS votes_up INTEGER DEFAULT 0`);
  await ran('ideas.votes_down', () => sql`ALTER TABLE ideas ADD COLUMN IF NOT EXISTS votes_down INTEGER DEFAULT 0`);

  // Bestaat 'm al? Dan alleen featured-flag aan zetten (voor het geval een
  // eerdere variant zonder featured was geseed).
  await ran('promote bestaande watermachine-rij naar featured', () => sql`
    UPDATE ideas
    SET featured = true, status = 'shortlist'
    WHERE title ILIKE '%watermachine%'
  `);

  // Als 'r geen watermachine-rij is, insert 'm.
  await ran('insert watermachine-pilot als ie ontbreekt', () => sql`
    INSERT INTO ideas (category, title, message, status, featured)
    SELECT 'verhuur',
      'Interesse in een watermachine?',
      'We onderzoeken of er interesse is in het huren van een watermachine voor op de camping. Met een watermachine heb je altijd koud drinkwater bij de hand, zonder steeds te hoeven sjouwen met zware flessen.

De verhuur zou bestaan uit:
• Een watermachine
• Een hervulbare fles
• Schoonmaaktabletten voor goed onderhoud

Altijd koud en schoon drinkwater — makkelijk en praktisch tijdens de vakantie.',
      'shortlist', true
    WHERE NOT EXISTS (SELECT 1 FROM ideas WHERE title ILIKE '%watermachine%')
  `);

  // Lees de huidige featured ideeën terug zodat je in de browser ziet of de
  // seed gelukt is.
  const featured = await sql`
    SELECT id, title, status, featured, votes_up, votes_down
    FROM ideas
    WHERE featured = true OR status IN ('shortlist', 'in_progress')
    ORDER BY featured DESC, created_at DESC
  ` as unknown as Array<{ id: number; title: string; status: string; featured: boolean }>;

  return NextResponse.json({ ok: true, log, featured });
}
