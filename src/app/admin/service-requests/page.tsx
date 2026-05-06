'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Wrench, Truck, Sparkles, ClipboardCheck, MessageSquare, MoreHorizontal,
  Clock, AlertCircle, CheckCircle2, XCircle, Calendar, User,
  Search, Save, Loader2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button, Skeleton, Select } from '@/components/ui';
import PageHeader from '@/components/admin/PageHeader';
import EmptyState from '@/components/admin/EmptyState';

type Status = 'new' | 'in_progress' | 'done' | 'cancelled';

type ServiceRequest = {
  id: number;
  customer_id: number;
  caravan_id: number | null;
  kind: string;
  title: string;
  description: string | null;
  preferred_date: string | null;
  status: Status;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
};

const STATUS_OPTIONS: Array<{ value: Status | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'done', label: 'Done' },
  { value: 'cancelled', label: 'Cancelled' },
];

const KIND_META: Record<string, { label: string; Icon: LucideIcon }> = {
  cleaning: { label: 'Schoonmaak', Icon: Sparkles },
  service: { label: 'Onderhoud', Icon: Wrench },
  inspection: { label: 'Inspectie', Icon: ClipboardCheck },
  repair: { label: 'Reparatie', Icon: Wrench },
  transport: { label: 'Transport', Icon: Truck },
  other: { label: 'Overig', Icon: MoreHorizontal },
};

function statusMeta(s: Status): { label: string; tone: 'warning' | 'accent' | 'success' | 'neutral'; Icon: LucideIcon } {
  switch (s) {
    case 'new': return { label: 'Nieuw', tone: 'warning', Icon: Clock };
    case 'in_progress': return { label: 'In behandeling', tone: 'accent', Icon: AlertCircle };
    case 'done': return { label: 'Afgerond', tone: 'success', Icon: CheckCircle2 };
    case 'cancelled': return { label: 'Geannuleerd', tone: 'neutral', Icon: XCircle };
  }
}

function fmtDate(s: string | null): string {
  if (!s) return '—';
  return new Date(s).toLocaleString('nl-NL', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function fmtDateOnly(s: string | null): string {
  if (!s) return '—';
  return new Date(s).toLocaleDateString('nl-NL', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function ServiceRequestsPage() {
  const [items, setItems] = useState<ServiceRequest[] | null>(null);
  const [filter, setFilter] = useState<Status | 'all'>('new');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await fetch(`/api/admin/service-requests?status=${filter}`, { credentials: 'include' });
      const d = await r.json();
      setItems(d.items || []);
    } catch {
      setItems([]);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const visible = (() => {
    if (!items) return null;
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((m) =>
      [m.title, m.description, m.customer_name, m.customer_email, m.customer_phone, m.kind]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q))
    );
  })();

  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="Service-aanvragen"
        description="Klanten kunnen vanuit hun portaal een aanvraag indienen — schoonmaak, onderhoud, inspectie, reparatie, transport. Hier handel je ze af."
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Zoek op klant, titel, omschrijving…"
            className="w-full pl-9 pr-3 py-2 border border-border rounded-md bg-surface text-text text-[14px]"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUS_OPTIONS.map((opt) => {
            const active = filter === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setFilter(opt.value)}
                className={`px-3 py-1.5 text-[13px] rounded-md border transition-colors ${
                  active
                    ? 'bg-text text-bg border-text font-semibold'
                    : 'bg-surface border-border hover:border-border-strong'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {visible === null ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-20" />)}
        </div>
      ) : visible.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title={search ? 'Geen resultaten' : 'Geen aanvragen'}
          description={search
            ? 'Probeer een andere zoekterm of wijzig de status-filter.'
            : 'Klanten dienen aanvragen in vanuit /account/caravan tab "Aanvragen".'}
        />
      ) : (
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {visible.map((r) => (
              <RequestCard
                key={r.id}
                req={r}
                expanded={expandedId === r.id}
                onToggle={() => setExpandedId(expandedId === r.id ? null : r.id)}
                onUpdated={(next) => {
                  setItems((prev) => prev ? prev.map((x) => x.id === next.id ? { ...x, ...next } : x) : prev);
                }}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </>
  );
}

function RequestCard({
  req, expanded, onToggle, onUpdated,
}: {
  req: ServiceRequest;
  expanded: boolean;
  onToggle: () => void;
  onUpdated: (next: Partial<ServiceRequest> & { id: number }) => void;
}) {
  const meta = statusMeta(req.status);
  const kindMeta = KIND_META[req.kind] || KIND_META.other;
  const KindIcon = kindMeta.Icon;
  const StatusIcon = meta.Icon;

  const [draftStatus, setDraftStatus] = useState<Status>(req.status);
  const [draftNote, setDraftNote] = useState(req.admin_note || '');
  const [saving, setSaving] = useState(false);

  const dirty = draftStatus !== req.status || (draftNote || '') !== (req.admin_note || '');

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/service-requests/${req.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: draftStatus, adminNote: draftNote || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error || 'Opslaan mislukt');
        return;
      }
      onUpdated({ id: req.id, status: draftStatus, admin_note: draftNote, updated_at: new Date().toISOString() });
      toast.success('Bijgewerkt — klant ziet de update direct in zijn portaal');
    } finally {
      setSaving(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="card-surface"
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left p-4 flex items-start gap-3 hover:bg-surface-2 transition-colors"
      >
        <span
          aria-hidden
          className="w-9 h-9 rounded-md grid place-items-center flex-shrink-0"
          style={{ background: 'var(--color-surface-2)', color: 'var(--text)' }}
        >
          <KindIcon size={16} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <strong className="text-[14px]">{req.title}</strong>
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium"
              style={{
                background: meta.tone === 'warning' ? 'var(--color-warning-soft)'
                  : meta.tone === 'accent' ? 'var(--color-accent-soft)'
                  : meta.tone === 'success' ? 'var(--color-success-soft)'
                  : 'var(--color-surface-2)',
                color: meta.tone === 'warning' ? 'var(--color-warning)'
                  : meta.tone === 'accent' ? 'var(--color-accent)'
                  : meta.tone === 'success' ? 'var(--color-success)'
                  : 'var(--text-muted)',
              }}
            >
              <StatusIcon size={11} /> {meta.label}
            </span>
          </div>
          <div className="text-[12px] text-text-muted mt-1 flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1"><User size={11} /> {req.customer_name || `klant #${req.customer_id}`}</span>
            <span>·</span>
            <span>{kindMeta.label}</span>
            {req.preferred_date && (
              <>
                <span>·</span>
                <span className="inline-flex items-center gap-1"><Calendar size={11} /> gewenst {fmtDateOnly(req.preferred_date)}</span>
              </>
            )}
            <span>·</span>
            <span>{fmtDate(req.created_at)}</span>
          </div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 border-t border-border space-y-4">
              {/* klant-contact */}
              <div className="text-[12px] text-text-muted">
                {req.customer_email && (
                  <a href={`mailto:${req.customer_email}`} className="hover:text-text">{req.customer_email}</a>
                )}
                {req.customer_phone && (
                  <>{req.customer_email ? ' · ' : ''}<a href={`tel:${req.customer_phone}`} className="hover:text-text">{req.customer_phone}</a></>
                )}
              </div>

              {req.description && (
                <div>
                  <div className="text-[11px] uppercase tracking-[0.14em] text-text-muted mb-1">Klant-omschrijving</div>
                  <p className="text-[13px] text-text whitespace-pre-wrap">{req.description}</p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-3">
                <Select
                  label="Status"
                  value={draftStatus}
                  onChange={(e) => setDraftStatus(e.target.value as Status)}
                >
                  <option value="new">Nieuw</option>
                  <option value="in_progress">In behandeling</option>
                  <option value="done">Afgerond</option>
                  <option value="cancelled">Geannuleerd</option>
                </Select>
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.14em] text-text-muted mb-1">
                    Reactie naar klant
                  </label>
                  <textarea
                    rows={3}
                    value={draftNote}
                    onChange={(e) => setDraftNote(e.target.value)}
                    placeholder="Bijv. ingepland op vrijdag 14u, of: te druk deze week, kan niet eerder dan…"
                    className="w-full px-3 py-2 border border-border rounded-md bg-surface text-text text-[13px]"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={save} disabled={!dirty || saving} loading={saving}>
                  <Save size={12} /> Opslaan
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
