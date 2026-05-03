// Structured logger met PII-scrub. Schrijft JSON-lines naar stdout zodat
// Vercel/CloudWatch/Datadog ze ongewijzigd indexeert. Géén externe dep —
// `console.log(JSON.stringify(…))` is simpel, snel, en context-rijk.
//
// Gebruik:
//   import { log } from '@/lib/log';
//   log.info('order_received', { kind: 'fridge', refId: 42 });
//   log.error('holded_failed', err, { refId: 42 });
//
// PII (e-mail, telefoon, IBAN, kaartnummers) wordt automatisch gemaskeerd.
// Niet je enige verdediging, maar voorkomt 90% van per-ongeluk-leaks.

type Level = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_RANK: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };

function envLevel(): Level {
  const raw = (process.env.LOG_LEVEL || '').toLowerCase();
  if (raw === 'debug' || raw === 'info' || raw === 'warn' || raw === 'error') return raw;
  return process.env.NODE_ENV === 'production' ? 'info' : 'debug';
}

const MIN_LEVEL = envLevel();

// Velden waarvan we de inhoud altijd maskeren — case-insensitive match op key.
// Aparte set i.p.v. één regex zodat 't ook werkt bij geneste objecten.
const PII_KEYS = new Set([
  'email', 'phone', 'telefoon', 'tel',
  'address', 'street', 'streetaddress', 'postal_code', 'postalcode',
  'iban', 'bic', 'swift',
  'card', 'cardnumber', 'card_number', 'cvc', 'cvv',
  'password', 'token', 'secret', 'apikey', 'api_key', 'authorization',
]);

function maskValue(v: unknown): unknown {
  if (typeof v !== 'string') return '[redacted]';
  if (v.length <= 4) return '***';
  return `${v.slice(0, 2)}***${v.slice(-2)}`;
}

function scrub(value: unknown, depth = 0): unknown {
  if (value == null || depth > 6) return value;
  if (Array.isArray(value)) return value.map((v) => scrub(v, depth + 1));
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (PII_KEYS.has(k.toLowerCase())) {
        out[k] = maskValue(v);
      } else {
        out[k] = scrub(v, depth + 1);
      }
    }
    return out;
  }
  return value;
}

function emit(level: Level, event: string, context?: Record<string, unknown>) {
  if (LEVEL_RANK[level] < LEVEL_RANK[MIN_LEVEL]) return;
  const line = {
    ts: new Date().toISOString(),
    level,
    event,
    env: process.env.VERCEL_ENV || process.env.NODE_ENV,
    region: process.env.VERCEL_REGION,
    ...(context ? (scrub(context) as Record<string, unknown>) : {}),
  };
  // stdout voor info/debug, stderr voor warn/error — laat Vercel het splitsen.
  const out = level === 'error' || level === 'warn' ? console.error : console.log;
  out(JSON.stringify(line));
}

function errToJson(err: unknown): Record<string, unknown> {
  if (err instanceof Error) {
    return {
      err_name: err.name,
      err_message: err.message,
      err_stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
    };
  }
  return { err: String(err) };
}

export const log = {
  debug(event: string, context?: Record<string, unknown>) {
    emit('debug', event, context);
  },
  info(event: string, context?: Record<string, unknown>) {
    emit('info', event, context);
  },
  warn(event: string, context?: Record<string, unknown>) {
    emit('warn', event, context);
  },
  error(event: string, err: unknown, context?: Record<string, unknown>) {
    emit('error', event, { ...errToJson(err), ...(context ?? {}) });
  },
};

/** Schaalt down logs in tests om de test-output schoon te houden.
 *  Gebruik in vitest setup: `silenceLogs()`. */
export function silenceLogs() {
  for (const k of ['debug', 'info', 'warn', 'error'] as const) {
    log[k] = () => { /* noop */ };
  }
}
