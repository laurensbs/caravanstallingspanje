'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Mail, Phone, MessageSquare, Trash2, Check, RotateCcw, Reply,
} from 'lucide-react';
import { Button, Badge, Skeleton, Select } from '@/components/ui';
import PageHeader from '@/components/admin/PageHeader';

type Message = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: string;
  handled_at: string | null;
  created_at: string;
};

const STATUS_OPTIONS = [
  { value: 'open',    label: 'Open',          tone: 'warning' as const },
  { value: 'handled', label: 'Afgehandeld',   tone: 'success' as const },
];

function fmtDate(s: string): string {
  return new Date(s).toLocaleString('nl-NL', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function ContactInboxPage() {
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [filter, setFilter] = useState('open');

  const load = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filter) params.set('status', filter);
      const r = await fetch(`/api/admin/contact?${params}`, { credentials: 'include' });
      const d = await r.json();
      setMessages(d.messages || []);
    } catch {
      setMessages([]);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const action = async (id: number, body: object, msg: string) => {
    const res = await fetch(`/api/admin/contact/${id}`, {
      method: body && (body as { action?: string }).action ? 'PUT' : 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      credentials: 'include',
    });
    if (!res.ok) { toast.error('Actie mislukt'); return; }
    toast.success(msg);
    load();
  };

  const remove = async (id: number) => {
    if (!confirm('Bericht verwijderen?')) return;
    const res = await fetch(`/api/admin/contact/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!res.ok) { toast.error('Verwijderen mislukt'); return; }
    toast.success('Verwijderd');
    load();
  };

  return (
    <>
      <PageHeader
        eyebrow="Operatie"
        title="Berichten"
        description="Inkomende contact-formulier-berichten."
        actions={
          <Select value={filter} onChange={(e) => setFilter(e.target.value)} className="min-w-[160px]">
            <option value="">Alles</option>
            {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </Select>
        }
      />

      {messages === null ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-24" delayMs={i * 40} />)}
        </div>
      ) : messages.length === 0 ? (
        <div className="card-surface p-12 text-center">
          <div className="w-12 h-12 rounded-[var(--radius-2xl)] bg-surface-2 border border-border flex items-center justify-center mx-auto mb-4">
            <MessageSquare size={18} className="text-text-subtle" />
          </div>
          <p className="text-sm text-text">
            {filter ? `Geen berichten met status "${filter}"` : 'Geen berichten'}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          <AnimatePresence initial={false}>
            {messages.map((m) => {
              const tone = STATUS_OPTIONS.find((s) => s.value === m.status)?.tone || 'neutral';
              const label = STATUS_OPTIONS.find((s) => s.value === m.status)?.label || m.status;
              const replyHref = `mailto:${encodeURIComponent(m.email)}?subject=${encodeURIComponent('Re: ' + (m.subject || 'Je bericht'))}&body=${encodeURIComponent('Hi ' + m.name + ',\n\n')}`;
              return (
                <motion.li
                  key={m.id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  className="card-surface p-5"
                >
                  <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-text">{m.name}</h3>
                        <Badge tone={tone}>{label}</Badge>
                      </div>
                      <p className="text-[11px] text-text-muted mt-1">{fmtDate(m.created_at)}</p>
                    </div>
                    <div className="flex gap-1 shrink-0 items-center">
                      <a href={replyHref}>
                        <Button size="sm" variant="secondary"><Reply size={12} /> Antwoord</Button>
                      </a>
                      {m.status === 'open' ? (
                        <Button size="sm" variant="ghost"
                          onClick={() => action(m.id, { action: 'handle' }, 'Afgehandeld')}>
                          <Check size={12} /> Markeer afgehandeld
                        </Button>
                      ) : (
                        <Button size="sm" variant="ghost"
                          onClick={() => action(m.id, { action: 'reopen' }, 'Heropend')}>
                          <RotateCcw size={12} /> Heropen
                        </Button>
                      )}
                      <button
                        onClick={() => remove(m.id)}
                        className="w-8 h-8 inline-flex items-center justify-center rounded-[var(--radius-md)] text-text-muted hover:text-danger hover:bg-danger-soft transition-colors"
                        aria-label="Verwijderen"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[13px] mb-3">
                    <a href={`mailto:${m.email}`} className="flex items-center gap-1.5 text-text">
                      <Mail size={12} className="text-text-subtle shrink-0" /> {m.email}
                    </a>
                    {m.phone && (
                      <a href={`tel:${m.phone}`} className="flex items-center gap-1.5 text-text">
                        <Phone size={12} className="text-text-subtle shrink-0" /> {m.phone}
                      </a>
                    )}
                  </div>
                  {m.subject && (
                    <p className="text-[13px] font-medium mb-1.5">{m.subject}</p>
                  )}
                  <p className="text-[13px] text-text-muted leading-relaxed whitespace-pre-wrap">
                    {m.message}
                  </p>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}
    </>
  );
}
