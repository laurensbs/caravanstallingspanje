'use client';

import { useState } from 'react';
import { Search, X, ChevronLeft, ChevronRight, Mail, Phone, MessageCircle, Trash2, Clock, Target } from 'lucide-react';
import { useAdminData } from '@/hooks/useAdminData';

interface Lead {
  id: number;
  email: string;
  name: string | null;
  phone: string | null;
  interest: string | null;
  storage_type: string | null;
  caravan_brand: string | null;
  caravan_length: string | null;
  services: string | null;
  timeframe: string | null;
  source: string | null;
  status: string;
  notes: string | null;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  nieuw: 'bg-blue-100 text-blue-700',
  gecontacteerd: 'bg-yellow-100 text-yellow-700',
  offerte: 'bg-purple-100 text-purple-700',
  klant: 'bg-green-100 text-green-700',
  verloren: 'bg-red-100 text-red-700',
};

const STATUSES = ['nieuw', 'gecontacteerd', 'offerte', 'klant', 'verloren'];

const INTEREST_LABELS: Record<string, string> = {
  stalling: 'Stalling',
  reparatie: 'Reparatie & onderhoud',
  schadeherstel: 'CaravanRepair® schade',
  transport: 'Transport',
  verkoop: 'Verkoop / bemiddeling',
  verhuur: 'Verhuur',
  schoonmaak: 'Schoonmaak',
  anders: 'Anders',
};

const SOURCE_LABELS: Record<string, string> = {
  quiz: 'Quiz modal',
  'contact-page': 'Contactpagina',
  'exit-intent': 'Exit-intent popup',
  homepage: 'Homepage',
  diensten: 'Dienstenpagina',
  stalling: 'Stallingpagina',
  tarieven: 'Tarievenpagina',
};

const SERVICE_DETAIL_LABELS: Record<string, string> = {
  repair_types: 'Reparatietypen',
  urgency: 'Urgentie',
  description: 'Toelichting',
  damage_types: 'Schadetypen',
  insurance: 'Verzekering',
  route: 'Route',
  sale_type: 'Koop/Verkoop',
  budget: 'Budget',
  rental_items: 'Huuritems',
  rental_period: 'Huurperiode',
  cleaning_package: 'Schoonmaakpakket',
};

const parseServices = (services: string | null): Record<string, unknown> | null => {
  if (!services) return null;
  try {
    const parsed = JSON.parse(services);
    return typeof parsed === 'object' && parsed !== null ? parsed : null;
  } catch {
    return null;
  }
};

export default function LeadsPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const { items: leads, total, page, setPage, loading, refetch } = useAdminData<Lead>({
    endpoint: '/api/admin/leads',
    dataKey: 'leads',
    limit: 25,
    params: { status: statusFilter },
  });
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editingNotes, setEditingNotes] = useState<Record<number, string>>({});
  const limit = 25;
  const totalPages = Math.ceil(total / limit);

  const updateStatus = async (id: number, status: string) => {
    await fetch(`/api/admin/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
      credentials: 'include',
    });
    refetch();
  };

  const saveNotes = async (id: number) => {
    await fetch(`/api/admin/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes: editingNotes[id] || '' }),
      credentials: 'include',
    });
    refetch();
  };

  const deleteLead = async (id: number) => {
    if (!confirm('Weet u zeker dat u deze lead wilt verwijderen?')) return;
    await fetch(`/api/admin/leads/${id}`, { method: 'DELETE', credentials: 'include' });
    refetch();
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m geleden`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}u geleden`;
    const days = Math.floor(hrs / 24);
    return `${days}d geleden`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-surface-dark">Leads</h1>
          <p className="text-sm text-warm-gray/70 mt-1">{total} leads totaal</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-surface rounded-2xl border border-sand-dark/20 mb-6 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => { setStatusFilter(''); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${!statusFilter ? 'bg-hero text-white' : 'bg-sand/60 text-warm-gray hover:bg-sand'}`}
          >
            Alle
          </button>
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all capitalize ${statusFilter === s ? 'bg-hero text-white' : 'bg-sand/60 text-warm-gray hover:bg-sand'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Leads Grid */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-surface rounded-2xl border border-sand-dark/20 p-8 text-center text-warm-gray/70">Laden...</div>
        ) : leads.length === 0 ? (
          <div className="bg-surface rounded-2xl border border-sand-dark/20 p-12 text-center">
            <Target size={32} className="text-warm-gray/30 mx-auto mb-3" />
            <p className="text-warm-gray/70">Nog geen leads{statusFilter ? ` met status "${statusFilter}"` : ''}</p>
          </div>
        ) : leads.map(lead => (
          <div key={lead.id} className="bg-surface rounded-2xl border border-sand-dark/20 overflow-hidden">
            {/* Lead Header Row */}
            <div
              className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-sand/20 transition-colors"
              onClick={() => setExpandedId(expandedId === lead.id ? null : lead.id)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-bold text-sm truncate">{lead.name || lead.email}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${STATUS_COLORS[lead.status] || 'bg-gray-100 text-gray-600'}`}>
                    {lead.status}
                  </span>
                  {lead.source && (
                    <span className="text-[10px] text-warm-gray/60 bg-sand/50 px-2 py-0.5 rounded-full">
                      {SOURCE_LABELS[lead.source] || lead.source}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs text-warm-gray/70">
                  <span className="flex items-center gap-1"><Mail size={11} /> {lead.email}</span>
                  {lead.phone && <span className="flex items-center gap-1"><Phone size={11} /> {lead.phone}</span>}
                  {lead.interest && <span>{INTEREST_LABELS[lead.interest] || lead.interest}</span>}
                </div>
              </div>
              <div className="text-xs text-warm-gray/50 flex items-center gap-1 shrink-0">
                <Clock size={11} /> {timeAgo(lead.created_at)}
              </div>
            </div>

            {/* Expanded Detail */}
            {expandedId === lead.id && (
              <div className="border-t border-sand-dark/10 px-5 py-4 bg-sand/10">
                <div className="grid sm:grid-cols-3 gap-4 mb-4">
                  {lead.storage_type && (
                    <div>
                      <p className="text-[10px] font-bold text-warm-gray/60 uppercase tracking-wider mb-0.5">Type stalling</p>
                      <p className="text-sm font-medium capitalize">{lead.storage_type}</p>
                    </div>
                  )}
                  {lead.caravan_brand && (
                    <div>
                      <p className="text-[10px] font-bold text-warm-gray/60 uppercase tracking-wider mb-0.5">Merk</p>
                      <p className="text-sm font-medium">{lead.caravan_brand}</p>
                    </div>
                  )}
                  {lead.caravan_length && (
                    <div>
                      <p className="text-[10px] font-bold text-warm-gray/60 uppercase tracking-wider mb-0.5">Lengte</p>
                      <p className="text-sm font-medium">{lead.caravan_length}</p>
                    </div>
                  )}
                  {lead.timeframe && (
                    <div>
                      <p className="text-[10px] font-bold text-warm-gray/60 uppercase tracking-wider mb-0.5">Tijdlijn</p>
                      <p className="text-sm font-medium">{lead.timeframe}</p>
                    </div>
                  )}
                  {lead.services && (() => {
                    const parsed = parseServices(lead.services);
                    if (parsed) {
                      return Object.entries(parsed).map(([key, value]) => (
                        <div key={key}>
                          <p className="text-[10px] font-bold text-warm-gray/60 uppercase tracking-wider mb-0.5">{SERVICE_DETAIL_LABELS[key] || key}</p>
                          <p className="text-sm font-medium">{Array.isArray(value) ? value.join(', ') : String(value)}</p>
                        </div>
                      ));
                    }
                    return (
                      <div>
                        <p className="text-[10px] font-bold text-warm-gray/60 uppercase tracking-wider mb-0.5">Diensten</p>
                        <p className="text-sm font-medium">{lead.services}</p>
                      </div>
                    );
                  })()}
                  <div>
                    <p className="text-[10px] font-bold text-warm-gray/60 uppercase tracking-wider mb-0.5">Aangemaakt</p>
                    <p className="text-sm font-medium">{new Date(lead.created_at).toLocaleString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>

                {/* Status update */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="text-xs font-bold text-warm-gray/60 mr-1">Status:</span>
                  {STATUSES.map(s => (
                    <button
                      key={s}
                      onClick={() => updateStatus(lead.id, s)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all capitalize ${lead.status === s ? STATUS_COLORS[s] : 'bg-sand/60 text-warm-gray/60 hover:bg-sand'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                {/* Notes */}
                <div className="mb-4">
                  <p className="text-xs font-bold text-warm-gray/60 mb-1.5">Notities</p>
                  <div className="flex gap-2">
                    <textarea
                      value={editingNotes[lead.id] ?? lead.notes ?? ''}
                      onChange={e => setEditingNotes(prev => ({ ...prev, [lead.id]: e.target.value }))}
                      rows={2}
                      className="flex-1 border border-sand-dark/20 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 resize-none bg-surface"
                      placeholder="Voeg notities toe..."
                    />
                    <button
                      onClick={() => saveNotes(lead.id)}
                      className="bg-primary hover:bg-primary-dark text-white font-bold px-4 py-2 rounded-xl text-xs transition-all self-end"
                    >
                      Opslaan
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {lead.phone && (
                    <a href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 font-bold px-3 py-1.5 rounded-lg text-xs transition-all">
                      <MessageCircle size={12} /> WhatsApp
                    </a>
                  )}
                  <a href={`mailto:${lead.email}`} className="inline-flex items-center gap-1.5 bg-primary/10 text-primary hover:bg-primary/20 font-bold px-3 py-1.5 rounded-lg text-xs transition-all">
                    <Mail size={12} /> E-mail
                  </a>
                  {lead.phone && (
                    <a href={`tel:${lead.phone}`} className="inline-flex items-center gap-1.5 bg-hero/10 text-hero hover:bg-hero/20 font-bold px-3 py-1.5 rounded-lg text-xs transition-all">
                      <Phone size={12} /> Bellen
                    </a>
                  )}
                  <button onClick={() => deleteLead(lead.id)} className="inline-flex items-center gap-1.5 bg-red-50 text-red-600 hover:bg-red-100 font-bold px-3 py-1.5 rounded-lg text-xs transition-all ml-auto">
                    <Trash2 size={12} /> Verwijderen
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-sand-dark/10">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="flex items-center gap-1 text-xs text-warm-gray hover:text-warm-gray/80 disabled:opacity-40">
            <ChevronLeft size={14} /> Vorige
          </button>
          <span className="text-xs text-warm-gray/60">Pagina {page} van {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="flex items-center gap-1 text-xs text-warm-gray hover:text-warm-gray/80 disabled:opacity-40">
            Volgende <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
