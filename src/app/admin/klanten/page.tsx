'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Search, Plus, Download, Loader2, Mail, Phone, MapPin, ExternalLink, AlertTriangle,
} from 'lucide-react';
import { Button, Skeleton, Badge } from '@/components/ui';
import PageHeader from '@/components/admin/PageHeader';
import NewCustomerDialog from '@/components/NewCustomerDialog';
import type { CustomerLite } from '@/components/CustomerPicker';

type CustomerRow = CustomerLite & {
  mobile: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
  vat_number: string | null;
  notes: string | null;
  holded_sync_failed: boolean;
  source: string;
  counts: { fridges: number; stalling: number; transport: number };
};

export default function KlantenPage() {
  const [data, setData] = useState<{ customers: CustomerRow[]; total: number; page: number; pageSize: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 250);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      if (debounced) params.set('search', debounced);
      const res = await fetch(`/api/admin/customers?${params}`, { credentials: 'include' });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !Array.isArray(json?.customers)) {
        setData({ customers: [], total: 0, page: 1, pageSize: 50 });
        return;
      }
      setData(json);
    } catch {
      setData({ customers: [], total: 0, page: 1, pageSize: 50 });
    } finally {
      setLoading(false);
    }
  }, [page, debounced]);

  useEffect(() => { load(); }, [load]);

  const importHolded = async () => {
    if (!confirm('Import / sync all Holded contacts with the local customer table?')) return;
    setImporting(true);
    try {
      const res = await fetch('/api/admin/customers/import-from-holded', {
        method: 'POST', credentials: 'include',
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || 'import failed');
      toast.success(`${j.imported} new, ${j.updated} updated (${j.total} total)`);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Customers"
        description={data ? `${data.total} customers managed.` : 'Customer register — linked to Holded.'}
        actions={
          <div className="flex gap-2 items-center">
            <Button variant="secondary" onClick={importHolded} disabled={importing}>
              {importing ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              Import from Holded
            </Button>
            <Button onClick={() => setCreating(true)}>
              <Plus size={14} /> New customer
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap gap-2 mb-6">
        <div className="relative flex-1 min-w-[260px] max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name, email or phone…"
            className="w-full h-10 pl-9 pr-3 text-sm bg-surface border border-border rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent transition-colors placeholder:text-text-subtle"
          />
        </div>
      </div>

      <div className="card-surface overflow-hidden">
        {loading ? (
          <div className="divide-y divide-border">
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i} className="px-5 py-4 flex items-center gap-4">
                <Skeleton className="w-9 h-9 rounded-full" />
                <Skeleton className="h-4 flex-1 max-w-xs" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        ) : !data || data.customers.length === 0 ? (
          <div className="py-16 text-center text-sm text-text-muted">
            {debounced ? `No results for "${debounced}"` : 'No customers yet — import from Holded or create manually.'}
          </div>
        ) : (
          <ul className="divide-y divide-border">
            <AnimatePresence initial={false}>
              {data.customers.map((c) => (
                <motion.li
                  key={c.id}
                  layout
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                >
                  <Link
                    href={`/admin/klanten/${c.id}`}
                    className="px-5 py-3.5 flex items-start gap-4 hover:bg-surface-2 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-full bg-surface-2 text-text flex items-center justify-center text-xs font-medium shrink-0 border border-border">
                      {initials(c.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-text">{c.name}</span>
                        {c.holded_contact_id && <Badge tone="success">Holded</Badge>}
                        {c.holded_sync_failed && (
                          <Badge tone="warning">
                            <AlertTriangle size={10} /> Sync
                          </Badge>
                        )}
                        {c.source === 'holded_import' && <Badge tone="neutral">imported</Badge>}
                        {c.source === 'stripe' && <Badge tone="accent">via payment</Badge>}
                      </div>
                      <div className="text-[12px] text-text-muted mt-0.5 flex flex-wrap gap-x-3 gap-y-1">
                        {c.email && (
                          <span className="inline-flex items-center gap-1"><Mail size={10} />{c.email}</span>
                        )}
                        {c.phone && (
                          <span className="inline-flex items-center gap-1"><Phone size={10} />{c.phone}</span>
                        )}
                        {(c.city || c.country) && (
                          <span className="inline-flex items-center gap-1"><MapPin size={10} />{[c.city, c.country].filter(Boolean).join(', ')}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 text-[11px] text-text-muted tabular-nums">
                      {c.counts.fridges > 0 && (
                        <Badge tone="neutral">{c.counts.fridges}× fridge/AC</Badge>
                      )}
                      {c.counts.stalling > 0 && (
                        <Badge tone="neutral">{c.counts.stalling}× storage</Badge>
                      )}
                      {c.counts.transport > 0 && (
                        <Badge tone="neutral">{c.counts.transport}× transport</Badge>
                      )}
                    </div>
                  </Link>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3 text-[13px]">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3 py-1.5 rounded-[var(--radius-md)] border border-border bg-surface hover:border-border-strong disabled:opacity-50"
          >Previous</button>
          <span className="text-text-muted tabular-nums">{page} / {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-3 py-1.5 rounded-[var(--radius-md)] border border-border bg-surface hover:border-border-strong disabled:opacity-50"
          >Next</button>
        </div>
      )}

      <NewCustomerDialog
        open={creating}
        onClose={() => setCreating(false)}
        onCreated={() => { load(); }}
      />
    </>
  );
}

function initials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() || '').join('');
}

void ExternalLink;
