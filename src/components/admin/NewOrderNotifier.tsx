'use client';

import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

// Listent op /api/admin/badge-counts polls (al door AppShell geactiveerd)
// en signaleert nieuwe items via een browser-notificatie + toast.
//
// Werking:
//   - Eerste poll bij mount: leg baseline vast, géén notificatie (anders
//     'pop' voor elke open admin-tab elke 30s na herstart).
//   - Volgende polls: vergelijk per category. Bij toename → notify.
//   - Browser-permission: vragen we 1x op /admin/dashboard via de wrapper-
//     hook hieronder. Geen modale prompt; klant kan 'm zelf openen via
//     instellingen.
//
// Storage:
//   - localStorage 'cs-admin-notify' = 'on' | 'off' (default 'on' zodra
//     permission granted)
//   - localStorage 'cs-admin-notify-baseline' bewaart laatste counts om
//     bij tab-wissel niet alle items 'opnieuw' nieuw te lijken.

const BASELINE_KEY = 'cs-admin-notify-baseline';
const PREF_KEY = 'cs-admin-notify';
const POLL_MS = 30_000;

type Counts = {
  stalling?: number;
  transport?: number;
  fridge?: number;
  contact?: number;
  ideas?: number;
  waitlist?: number;
};

type Category = keyof Counts;

const LABELS: Record<Category, { nl: string; href: string }> = {
  fridge:    { nl: 'Nieuwe koelkast/airco-boeking', href: '/admin/koelkasten' },
  stalling:  { nl: 'Nieuwe stalling-aanvraag',      href: '/admin/stalling' },
  transport: { nl: 'Nieuwe transport-aanvraag',     href: '/admin/transport' },
  contact:   { nl: 'Nieuw contactbericht',          href: '/admin/contact' },
  ideas:     { nl: 'Nieuw idee',                    href: '/admin/ideeen' },
  waitlist:  { nl: 'Nieuwe wachtlijst-aanmelding',  href: '/admin/wachtlijst' },
};

export function notificationsEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  if (!('Notification' in window)) return false;
  const pref = window.localStorage.getItem(PREF_KEY);
  if (pref === 'off') return false;
  return Notification.permission === 'granted';
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'denied';
  if (Notification.permission !== 'default') return Notification.permission;
  const result = await Notification.requestPermission();
  if (result === 'granted') {
    try { window.localStorage.setItem(PREF_KEY, 'on'); } catch { /* noop */ }
  }
  return result;
}

function readBaseline(): Counts | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(BASELINE_KEY);
    return raw ? (JSON.parse(raw) as Counts) : null;
  } catch {
    return null;
  }
}

function writeBaseline(counts: Counts) {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(BASELINE_KEY, JSON.stringify(counts)); } catch { /* noop */ }
}

function detectIncreases(prev: Counts | null, next: Counts): Array<{ key: Category; delta: number }> {
  if (!prev) return [];
  const out: Array<{ key: Category; delta: number }> = [];
  for (const k of Object.keys(LABELS) as Category[]) {
    const a = prev[k] ?? 0;
    const b = next[k] ?? 0;
    if (b > a) out.push({ key: k, delta: b - a });
  }
  return out;
}

function fireNotification(key: Category, delta: number) {
  const label = LABELS[key];
  const title = `${label.nl}${delta > 1 ? ` (${delta})` : ''}`;
  if (notificationsEnabled()) {
    try {
      const n = new Notification(title, {
        body: 'Klik om te openen.',
        icon: '/favicon.ico',
        tag: `cs-admin-${key}`, // overrides bestaande zelfde tag
      });
      n.onclick = () => {
        window.focus();
        window.location.href = label.href;
      };
    } catch {
      /* sommige browsers throwen op secondary windows */
    }
  }
  toast(title, {
    action: { label: 'Open', onClick: () => { window.location.href = label.href; } },
  });
}

/**
 * Mount in AppShell. Geen UI — alleen side-effect: poll + diff + notify.
 * Aparte poller dan de sidebar-badges (die in AppShell zit) zodat we niet
 * koppelen op intern state. 30s tick is goed genoeg voor admin.
 */
export default function NewOrderNotifier() {
  const baselineRef = useRef<Counts | null>(null);

  useEffect(() => {
    let mounted = true;
    let timer: ReturnType<typeof setTimeout> | null = null;

    // Init baseline van localStorage zodat refresh geen 'nieuwe' items oppopt.
    baselineRef.current = readBaseline();

    async function tick() {
      try {
        const r = await fetch('/api/admin/badge-counts', { credentials: 'include' });
        if (!r.ok) return;
        const next = (await r.json()) as Counts;

        const increases = detectIncreases(baselineRef.current, next);
        if (increases.length > 0) {
          for (const inc of increases) fireNotification(inc.key, inc.delta);
        }

        baselineRef.current = next;
        writeBaseline(next);
      } catch {
        /* offline of API down — geen ramp, volgende tick probeert opnieuw */
      } finally {
        if (mounted) timer = setTimeout(tick, POLL_MS);
      }
    }

    tick();
    return () => {
      mounted = false;
      if (timer) clearTimeout(timer);
    };
  }, []);

  return null;
}
