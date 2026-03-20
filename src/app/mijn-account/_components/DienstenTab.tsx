'use client';
import { useState, useEffect } from 'react';
import { Wrench, Clock, CheckCircle2, AlertCircle, Loader2, Plus, Calendar, Euro } from 'lucide-react';
import type { CaravanItem } from './types';

interface ServiceRequest {
  id: number;
  service_type: string;
  description: string;
  status: string;
  caravan_name: string;
  license_plate: string;
  estimated_cost: number | null;
  actual_cost: number | null;
  scheduled_date: string | null;
  completed_date: string | null;
  created_at: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  aangevraagd: { label: 'Aangevraagd', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
  in_behandeling: { label: 'In behandeling', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: Loader2 },
  gepland: { label: 'Gepland', color: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: Calendar },
  in_uitvoering: { label: 'In uitvoering', color: 'bg-purple-50 text-purple-700 border-purple-200', icon: Wrench },
  afgerond: { label: 'Afgerond', color: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle2 },
  geannuleerd: { label: 'Geannuleerd', color: 'bg-red-50 text-red-700 border-red-200', icon: AlertCircle },
};

const TYPE_LABELS: Record<string, string> = {
  reparatie: 'Reparatie',
  onderhoud: 'Onderhoud',
  keuring: 'Technische keuring',
  schoonmaak: 'Schoonmaak',
  transport: 'Transport',
};

interface Props { caravans: CaravanItem[]; }

export default function DienstenTab({ caravans }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [serviceForm, setServiceForm] = useState({ caravan_id: '', service_type: 'reparatie', description: '' });
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadRequests = () => {
    fetch('/api/customer/services', { credentials: 'include' })
      .then(r => r.json())
      .then(d => setRequests(d.requests || []))
      .catch(() => {})
      .finally(() => setLoadingRequests(false));
  };

  useEffect(() => { loadRequests(); }, []);

  const submitService = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/customer/services', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(serviceForm), credentials: 'include' });
      if (res.ok) {
        setShowForm(false);
        setServiceForm({ caravan_id: '', service_type: 'reparatie', description: '' });
        loadRequests();
      }
    } catch { /* handled by loadRequests */ }
    setSubmitting(false);
  };

  const activeRequests = requests.filter(r => !['afgerond', 'geannuleerd'].includes(r.status));
  const pastRequests = requests.filter(r => ['afgerond', 'geannuleerd'].includes(r.status));

  return (
    <div className="space-y-6">
      {/* New request card */}
      <div className="bg-surface rounded-2xl border border-sand-dark/20 p-6 sm:p-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-bold text-surface-dark text-lg">Dienst aanvragen</h2>
          {!showForm && (
            <button onClick={() => setShowForm(true)} className="bg-primary hover:bg-primary-light text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-primary/10 inline-flex items-center gap-2">
              <Plus size={16} /> Nieuw verzoek
            </button>
          )}
        </div>
        <p className="text-sm text-warm-gray/70 mb-6">Vraag een reparatie, onderhoud, keuring, schoonmaak of transport aan voor uw caravan.</p>

        {showForm && (
          <form onSubmit={submitService} className="space-y-5 max-w-lg">
            <div><label className="text-sm font-semibold text-warm-gray/70 block mb-2">Caravan *</label><select required value={serviceForm.caravan_id} onChange={e => setServiceForm({ ...serviceForm, caravan_id: e.target.value })} className="w-full border border-sand-dark/30 rounded-xl px-4 py-3 text-sm bg-sand/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"><option value="">Selecteer caravan</option>{caravans.map(c => <option key={c.id} value={c.id}>{c.brand} {c.model} - {c.license_plate}</option>)}</select></div>
            <div><label className="text-sm font-semibold text-warm-gray/70 block mb-2">Type dienst *</label><select required value={serviceForm.service_type} onChange={e => setServiceForm({ ...serviceForm, service_type: e.target.value })} className="w-full border border-sand-dark/30 rounded-xl px-4 py-3 text-sm bg-sand/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"><option value="reparatie">Reparatie</option><option value="onderhoud">Onderhoud</option><option value="keuring">Technische keuring</option><option value="schoonmaak">Schoonmaak</option><option value="transport">Transport</option></select></div>
            <div><label className="text-sm font-semibold text-warm-gray/70 block mb-2">Omschrijving *</label><textarea required value={serviceForm.description} onChange={e => setServiceForm({ ...serviceForm, description: e.target.value })} className="w-full border border-sand-dark/30 rounded-xl px-4 py-3 text-sm bg-sand/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none transition-all" rows={4} placeholder="Beschrijf uw verzoek..." /></div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-3 text-sm text-warm-gray/70 hover:text-warm-gray font-medium transition-colors">Annuleren</button>
              <button type="submit" disabled={submitting} className="bg-primary hover:bg-primary-light text-white font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-lg shadow-primary/10 disabled:opacity-50">{submitting ? 'Indienen...' : 'Indienen'}</button>
            </div>
          </form>
        )}
      </div>

      {/* Active requests */}
      {loadingRequests ? (
        <div className="flex items-center justify-center py-12"><div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" /></div>
      ) : activeRequests.length > 0 && (
        <div className="bg-surface rounded-2xl border border-sand-dark/20 p-6 sm:p-8">
          <h3 className="font-bold text-surface-dark text-lg mb-4">Lopende aanvragen ({activeRequests.length})</h3>
          <div className="space-y-3">
            {activeRequests.map(r => {
              const sc = STATUS_CONFIG[r.status] || STATUS_CONFIG.aangevraagd;
              const Icon = sc.icon;
              return (
                <div key={r.id} className="border border-sand-dark/20 rounded-xl p-4 hover:bg-sand/20 transition-all">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <span className="font-semibold text-surface-dark text-sm">{TYPE_LABELS[r.service_type] || r.service_type}</span>
                      <span className="text-warm-gray/50 text-sm ml-2">#{r.id}</span>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border ${sc.color}`}>
                      <Icon size={12} />{sc.label}
                    </span>
                  </div>
                  <p className="text-sm text-warm-gray/70 mb-2">{r.caravan_name} &middot; {r.license_plate}</p>
                  {r.description && <p className="text-sm text-warm-gray/60 line-clamp-2">{r.description}</p>}
                  <div className="flex flex-wrap gap-4 mt-3 text-xs text-warm-gray/50">
                    <span>Ingediend: {new Date(r.created_at).toLocaleDateString('nl-NL')}</span>
                    {r.scheduled_date && <span className="flex items-center gap-1"><Calendar size={12} />Gepland: {new Date(r.scheduled_date).toLocaleDateString('nl-NL')}</span>}
                    {r.estimated_cost && <span className="flex items-center gap-1"><Euro size={12} />Geschat: &euro;{Number(r.estimated_cost).toFixed(2)}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Past requests */}
      {!loadingRequests && pastRequests.length > 0 && (
        <div className="bg-surface rounded-2xl border border-sand-dark/20 p-6 sm:p-8">
          <h3 className="font-bold text-surface-dark text-lg mb-4">Afgeronde aanvragen ({pastRequests.length})</h3>
          <div className="space-y-3">
            {pastRequests.map(r => {
              const sc = STATUS_CONFIG[r.status] || STATUS_CONFIG.afgerond;
              const Icon = sc.icon;
              return (
                <div key={r.id} className="border border-sand-dark/15 rounded-xl p-4 opacity-75">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <span className="font-semibold text-surface-dark text-sm">{TYPE_LABELS[r.service_type] || r.service_type} <span className="text-warm-gray/50">#{r.id}</span></span>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border ${sc.color}`}><Icon size={12} />{sc.label}</span>
                  </div>
                  <p className="text-sm text-warm-gray/70">{r.caravan_name}</p>
                  <div className="flex flex-wrap gap-4 mt-2 text-xs text-warm-gray/50">
                    <span>Ingediend: {new Date(r.created_at).toLocaleDateString('nl-NL')}</span>
                    {r.completed_date && <span>Afgerond: {new Date(r.completed_date).toLocaleDateString('nl-NL')}</span>}
                    {r.actual_cost && <span>Kosten: &euro;{Number(r.actual_cost).toFixed(2)}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!loadingRequests && requests.length === 0 && (
        <div className="bg-surface rounded-2xl border border-sand-dark/20 p-8 text-center">
          <Wrench size={32} className="mx-auto text-warm-gray/30 mb-3" />
          <p className="text-warm-gray/60 text-sm">U heeft nog geen aanvragen ingediend.</p>
        </div>
      )}
    </div>
  );
}
