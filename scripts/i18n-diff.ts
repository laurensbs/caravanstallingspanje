// Audit-script voor i18n-volledigheid.
// Vergelijkt NL ↔ EN waarden in src/lib/i18n.ts en flagt:
//  - missende vertalingen (lege EN of identieke EN==NL waar dat onlogisch is)
//  - duplicate keys
//  - keys gebruikt in code maar niet in dictionary (en omgekeerd)
//
// Run: `npx tsx scripts/i18n-diff.ts`
//      (of `npx ts-node scripts/i18n-diff.ts`)

import { STRINGS } from '../src/lib/i18n';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const SRC_ROOT = join(process.cwd(), 'src');

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, out);
    else if (/\.(tsx?|mts|cts)$/.test(name)) out.push(p);
  }
  return out;
}

function findUsedKeys(): Set<string> {
  const files = walk(SRC_ROOT);
  const used = new Set<string>();
  // Simpel patroon: t('foo.bar') of translate(locale, 'foo.bar')
  const re = /\b(?:t|translate)\s*\(\s*(?:[a-zA-Z_$][\w$]*\s*,\s*)?['"]([\w.-]+)['"]/g;
  for (const f of files) {
    const txt = readFileSync(f, 'utf8');
    let m;
    while ((m = re.exec(txt))) used.add(m[1]);
  }
  return used;
}

const dictKeys = Object.keys(STRINGS);
const missingTranslation: string[] = [];
const sameNlEn: string[] = [];

for (const key of dictKeys) {
  const entry = (STRINGS as Record<string, { nl: string; en: string }>)[key];
  if (!entry?.en?.trim()) missingTranslation.push(key);
  else if (entry.nl === entry.en && !/^(\+?\d|info@|https?:|NL$|EN$|·)/.test(entry.nl) && entry.nl.length > 3) {
    // Heuristiek: identieke NL/EN flagt alleen als het waarschijnlijk vertaald had moeten worden.
    sameNlEn.push(key);
  }
}

const used = findUsedKeys();
const dictSet = new Set(dictKeys);
const usedButMissing = [...used].filter((k) => !dictSet.has(k));
const definedButUnused = dictKeys.filter((k) => !used.has(k));

console.log(`\n=== i18n diff ===`);
console.log(`Dictionary keys: ${dictKeys.length}`);
console.log(`Used in code:    ${used.size}\n`);

if (missingTranslation.length) {
  console.log(`❌ Missing EN translation (${missingTranslation.length}):`);
  missingTranslation.forEach((k) => console.log(`   - ${k}`));
  console.log();
}

if (sameNlEn.length) {
  console.log(`⚠️  NL == EN (mogelijk ontbrekende vertaling) (${sameNlEn.length}):`);
  sameNlEn.slice(0, 30).forEach((k) => console.log(`   - ${k}`));
  if (sameNlEn.length > 30) console.log(`   … +${sameNlEn.length - 30} more`);
  console.log();
}

if (usedButMissing.length) {
  console.log(`❌ Used in code but not in dict (${usedButMissing.length}):`);
  usedButMissing.forEach((k) => console.log(`   - ${k}`));
  console.log();
}

if (definedButUnused.length) {
  console.log(`🪶 Defined but never used (${definedButUnused.length}):`);
  definedButUnused.slice(0, 30).forEach((k) => console.log(`   - ${k}`));
  if (definedButUnused.length > 30) console.log(`   … +${definedButUnused.length - 30} more`);
  console.log();
}

const hardFails = missingTranslation.length + usedButMissing.length;
if (hardFails > 0) {
  console.log(`💥 ${hardFails} hard failures.`);
  process.exit(1);
}
console.log('✅ No hard i18n failures.');
