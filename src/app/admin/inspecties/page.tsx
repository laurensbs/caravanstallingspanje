'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Search, ClipboardCheck, FileText, CheckCircle2, XCircle, Loader2, ExternalLink,
} from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import EmptyState from '@/components/admin/EmptyState';

type AdminCert = {
  id: number;
  certificate_number: string;
  inspection_date: string;
  overall_result: string;
  technician_name: string;
  customer_id: number | null;
  customer_name_snapshot: string | null;
  customer_name: string | null;
  customer_email: string | null;
  caravan_brand_snapshot: string | null;
  caravan_model_snapshot: string | null;
  caravan_registration_snapshot: string | null;
  created_at: string;
};

function fmtDate(s: string): string {
  return new Date(s).toLocaleDateString('nl-NL', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function InspectionsAdminPage() {
  const [items, setItems] = useState<AdminCert[] | null>(null);
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 250);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (debounced) params.set('search', debounced);
    fetch(`/api/admin/inspection-certs?${params}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => setItems(d.items || []))
      .catch(() => setItems([]));
  }, [debounced]);

  const passedCount = items?.filter((c) => c.overall_result === 'goedgekeurd').length || 0;
  const failedCount = items?.filter((c) => c.overall_result === 'afgekeurd').length || 0;

  return (
    <>
      <PageHeader
        eyebrow="Werkplaats"
        title="Keuringscertificaten"
        description={
          items
            ? `${items.length} certificaten · ${passedCount} goedgekeurd · ${failedCount} afgekeurd`
            : 'Alle keuringen die de garage heeft afgegeven.'
        }
      />

      <div className="mb-6 max-w-md">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Zoek op certificaat-nr, kenteken, klant…"
            className="w-full pl-9 pr-3 py-2 border border-border rounded-md bg-surface text-text text-[14px]"
          />
        </div>
      </div>

      {items === null ? (
        <div className="card-surface p-8 text-center text-text-muted">
          <Loader2 className="animate-spin inline" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={ClipboardCheck}
          title={debounced ? 'Geen resultaten' : 'Nog geen certificaten'}
          description={debounced
            ? 'Probeer een andere zoekterm.'
            : 'Zodra de garage een keuring afsluit, verschijnt het certificaat hier.'}
        />
      ) : (
        <div className="card-surface divide-y divide-border">
          {items.map((c) => {
            const passed = c.overall_result === 'goedgekeurd';
            const customerName = c.customer_name || c.customer_name_snapshot || '—';
            const caravanLabel = [c.caravan_brand_snapshot, c.caravan_model_snapshot].filter(Boolean).join(' ');
            return (
              <div key={c.id} className="p-4 flex flex-wrap items-center gap-4">
                <span
                  className="w-9 h-9 rounded-full grid place-items-center flex-shrink-0"
                  style={{
                    background: passed ? 'var(--color-success-soft)' : 'rgba(239,68,68,0.10)',
                    color: passed ? 'var(--color-success)' : '#EF4444',
                  }}
                >
                  {passed ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <strong className="text-[14px]">{c.certificate_number}</strong>
                    <span className="text-[12px] text-text-muted">·</span>
                    <span className="text-[13px] text-text">{customerName}</span>
                  </div>
                  <div className="text-[12px] text-text-muted mt-1">
                    {caravanLabel || '—'}
                    {c.caravan_registration_snapshot ? ` · ${c.caravan_registration_snapshot}` : ''}
                    {' · '}{fmtDate(c.inspection_date)}
                    {c.technician_name ? ` · ${c.technician_name}` : ''}
                  </div>
                </div>
                <span
                  className="px-2.5 py-1 rounded-full text-[11px] font-semibold"
                  style={{
                    background: passed ? 'var(--color-success-soft)' : 'rgba(239,68,68,0.10)',
                    color: passed ? 'var(--color-success)' : '#EF4444',
                  }}
                >
                  {passed ? 'Goedgekeurd' : 'Afgekeurd'}
                </span>
                <a
                  href={`/api/admin/inspection-certs/${c.id}/pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium rounded-md border border-border bg-surface hover:border-border-strong transition-colors"
                >
                  <FileText size={13} /> PDF
                </a>
                {c.customer_id && (
                  <Link
                    href={`/admin/klanten/${c.customer_id}`}
                    className="text-[12px] text-text-muted hover:text-text inline-flex items-center gap-1"
                  >
                    klant <ExternalLink size={11} />
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
