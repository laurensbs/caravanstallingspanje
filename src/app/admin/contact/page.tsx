'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Mail, Phone, MessageSquare, Trash2, Check, RotateCcw, Reply, Search, X,
} from 'lucide-react';
import { Button, Badge, Skeleton, Select } from '@/components/ui';
import PageHeader from '@/components/admin/PageHeader';
import EmptyState from '@/components/admin/EmptyState';

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
  { value: 'handled', label: 'Handled',       tone: 'success' as const },
];

function fmtDate(s: string): string {
  return new Date(s).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function ContactInboxPage() {
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [filter, setFilter] = useState('open');
  const [search, setSearch] = useState('');

  const visible = (() => {
    if (!messages) return null;
    const q = search.trim().toLowerCase();
    if (!q) return messages;
    return messages.filter((m) =>
      [m.name, m.email, m.phone, m.subject, m.message].filter(Boolean).some((v) => v!.toLowerCase().includes(q))
    );
  })();

  useEffect(() => {
    function onKey(ev: KeyboardEvent) {
      const t = ev.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      if (ev.key === '/') {
        ev.preventDefault();
        document.getElementById('contact-search')?.focus();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

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
    if (!res.ok) { toast.error('Action failed'); return; }
    toast.success(msg);
    load();
  };

  const remove = async (id: number) => {
    if (!confirm('Delete message?')) return;
    const res = await fetch(`/api/admin/contact/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!res.ok) { toast.error('Delete failed'); return; }
    toast.success('Deleted');
    load();
  };

  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="Messages"
        description="Incoming contact form messages."
        actions={
          <Select value={filter} onChange={(e) => setFilter(e.target.value)} className="min-w-[160px]">
            <option value="">All</option>
            {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </Select>
        }
      />

      <div className="relative max-w-md mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle pointer-events-none" />
        <input
          id="contact-search"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Escape') setSearch(''); }}
          placeholder="Search by name, email, subject, body…"
          aria-label="Search messages"
          className="w-full h-9 pl-9 pr-9 text-sm bg-surface border border-border rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent transition-colors placeholder:text-text-subtle"
        />
        {search && (
          <button type="button" onClick={() => setSearch('')} aria-label="Clear" className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-text-subtle hover:text-text">
            <X size={12} />
          </button>
        )}
        <kbd className="hidden md:inline-block absolute right-9 top-1/2 -translate-y-1/2 text-[10px] text-text-subtle border border-border rounded px-1.5 py-0.5 pointer-events-none">/</kbd>
      </div>

      {messages === null ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-24" delayMs={i * 40} />)}
        </div>
      ) : messages.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title={filter ? `No messages with status "${filter}"` : 'No messages'}
          description={filter ? 'Try clearing the filter.' : 'Public contact form submissions will appear here.'}
        />
      ) : visible && visible.length === 0 ? (
        <EmptyState
          icon={Search}
          title={`No matches for "${search}"`}
          description="Try a different search term, or press Esc to clear."
        />
      ) : (
        <ul className="space-y-3">
          <AnimatePresence initial={false}>
            {visible!.map((m) => {
              const tone = STATUS_OPTIONS.find((s) => s.value === m.status)?.tone || 'neutral';
              const label = STATUS_OPTIONS.find((s) => s.value === m.status)?.label || m.status;
              const replyHref = `mailto:${encodeURIComponent(m.email)}?subject=${encodeURIComponent('Re: ' + (m.subject || 'Your message'))}&body=${encodeURIComponent('Hi ' + m.name + ',\n\n')}`;
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
                        <Button size="sm" variant="secondary"><Reply size={12} /> Reply</Button>
                      </a>
                      {m.status === 'open' ? (
                        <Button size="sm" variant="ghost"
                          onClick={() => action(m.id, { action: 'handle' }, 'Handled')}>
                          <Check size={12} /> Mark as handled
                        </Button>
                      ) : (
                        <Button size="sm" variant="ghost"
                          onClick={() => action(m.id, { action: 'reopen' }, 'Reopened')}>
                          <RotateCcw size={12} /> Reopen
                        </Button>
                      )}
                      <button
                        onClick={() => remove(m.id)}
                        className="w-8 h-8 inline-flex items-center justify-center rounded-[var(--radius-md)] text-text-muted hover:text-danger hover:bg-danger-soft transition-colors"
                        aria-label="Delete"
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
