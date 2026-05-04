'use client';

import { useEffect, useState } from 'react';
import { Bell, BellOff, BellRing } from 'lucide-react';
import { Button } from '@/components/ui';
import { notificationsEnabled, requestNotificationPermission } from './NewOrderNotifier';

// Toggle voor browser-notificaties bij nieuwe orders. Drie states:
//   - permission='default'  → "Inschakelen"-knop, vraagt browser-permission
//   - permission='granted'  → toggle on/off via localStorage 'cs-admin-notify'
//   - permission='denied'   → toelichting hoe te re-enable in browser-settings

const PREF_KEY = 'cs-admin-notify';

export default function NotificationToggle() {
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('unsupported');
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('Notification' in window)) {
      setPermission('unsupported');
      return;
    }
    setPermission(Notification.permission);
    setEnabled(notificationsEnabled());
  }, []);

  async function ask() {
    const result = await requestNotificationPermission();
    setPermission(result);
    setEnabled(result === 'granted');
    if (result === 'granted') {
      try { new Notification('Notificaties aan', { body: 'Je krijgt vanaf nu meldingen bij nieuwe orders.' }); } catch { /* noop */ }
    }
  }

  function toggle(next: boolean) {
    setEnabled(next);
    try {
      window.localStorage.setItem(PREF_KEY, next ? 'on' : 'off');
    } catch { /* noop */ }
  }

  return (
    <section className="space-y-3">
      <header>
        <h2 className="text-sm font-semibold inline-flex items-center gap-2">
          <Bell size={14} aria-hidden /> Browser-notificaties
        </h2>
        <p className="text-[12px] text-text-muted mt-0.5">
          Geluidloze melding rechtsboven in je browser zodra een nieuwe bestelling, aanvraag of bericht binnenkomt.
        </p>
      </header>

      <div className="card-surface p-4 flex items-start gap-4">
        {permission === 'unsupported' && (
          <p className="text-[13px] text-text-muted">
            Deze browser ondersteunt geen notificaties.
          </p>
        )}

        {permission === 'default' && (
          <>
            <BellRing size={20} className="text-text-muted shrink-0 mt-0.5" aria-hidden />
            <div className="flex-1">
              <p className="text-[13px] text-text">
                Notificaties staan nog niet aan.
              </p>
              <p className="text-[12px] text-text-muted mt-0.5">
                Klik om toestemming te geven; je kunt 'm later ook weer uitzetten.
              </p>
            </div>
            <Button onClick={ask}>Inschakelen</Button>
          </>
        )}

        {permission === 'granted' && (
          <>
            <Bell size={20} className={enabled ? 'text-success shrink-0 mt-0.5' : 'text-text-muted shrink-0 mt-0.5'} aria-hidden />
            <div className="flex-1">
              <p className="text-[13px] text-text">
                {enabled ? 'Notificaties staan aan.' : 'Notificaties zijn handmatig uitgezet.'}
              </p>
              <p className="text-[12px] text-text-muted mt-0.5">
                Geldt voor deze browser op dit apparaat.
              </p>
            </div>
            <button
              type="button"
              onClick={() => toggle(!enabled)}
              role="switch"
              aria-checked={enabled}
              aria-label="Notificaties aan/uit"
              className="relative w-10 h-6 rounded-full transition-colors shrink-0"
              style={{
                background: enabled ? 'var(--color-success)' : 'var(--color-border-strong)',
              }}
            >
              <span
                aria-hidden
                className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform"
                style={{ transform: enabled ? 'translateX(16px)' : 'translateX(0)' }}
              />
            </button>
          </>
        )}

        {permission === 'denied' && (
          <>
            <BellOff size={20} className="text-text-muted shrink-0 mt-0.5" aria-hidden />
            <div className="flex-1">
              <p className="text-[13px] text-text">
                Je hebt notificaties geweigerd.
              </p>
              <p className="text-[12px] text-text-muted mt-0.5">
                Aanzetten kan via de browser-instellingen (slot-icoon links naast het adres). Daarna deze pagina herladen.
              </p>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
