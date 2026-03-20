'use client';
import { useState, useEffect } from 'react';
import { Wrench, Clock, CheckCircle2, AlertCircle, Loader2, Plus, Calendar, Euro, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  aangevraagd: { label: 'Aangevraagd', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', icon: Clock },
  in_behandeling: { label: 'In behandeling', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', icon: Loader2 },
  gepland: { label: 'Gepland', color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200', icon: Calendar },
  in_uitvoering: { label: 'In uitvoering', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200', icon: Wrench },
  afgerond: { label: 'Afgerond', color: 'text-green-700', bg: 'bg-green-50 border-green-200', icon: CheckCircle2 },
  geannuleerd: { label: 'Geannuleerd', color: 'text-red-700', bg: 'bg-red-50 border-red-200', icon: AlertCircle },
};

const TYPE_LABELS: Record<string, string> = {
  reparatie: 'Reparatie',
  onderhoud: 'Onderhoud',
  keuring: 'Technische keuring',
  schoonmaak: 'Schoonmaak',
  transport: 'Transport',
};

const STEP_ORDER = ['aangevraagd', 'in_behandeling', 'gepland', 'in_uitvoering', 'afgerond'];

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
  const inputClass = 'w-full border border-sand-dark/30 rounded-xl px-4 py-3 text-sm bg-sand/20 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all';

  return (
    <div className="space-y-6">
      {/* Header + New Request */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-black text-surface-dark text-xl">Dienstaanvragen</h2>
          <p className="text-sm text-warm-gray/60 mt-0.5">Reparatie, onderhoud, keuring of transport</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-primary/20 inline-flex items-center gap-2 hover:-translate-y-0.5">
            <Plus size={16} /> Nieuw verzoek
          </button>
        )}
      </div>

      {/* New Request Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="card-premium p-6 sm:p-8">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-surface-dark text-lg">Nieuwe aanvraag</h3>
              <button onClick={() => setShowForm(false)} className="text-warm-gray/50 hover:text-warm-gray transition-colors"><X size={18} /></button>
            </div>
            <form onSubmit={submitService} className="space-y-5 max-w-lg">
              <div>
                <label className="text-xs font-bold text-warm-gray/60 uppercase tracking-wider block mb-2">Caravan *</label>
                <select required value={serviceForm.caravan_id} onChange={e => setServiceForm({ ...serviceForm, caravan_id: e.target.value })} className={`${inputClass} appearance-none`}>
                  <option value="">Selecteer caravan</option>
                  {caravans.map(c => <option key={c.id} value={c.id}>{c.brand} {c.model} - {c.license_plate}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-warm-gray/60 uppercase tracking-wider block mb-2">Type dienst *</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(TYPE_LABELS).map(([val, label]) => (
                    <button key={val} type="button" onClick={() => setServiceForm({ ...serviceForm, service_type: val })}
                      className={`px-3 py-2.5 rounded-xl text-sm font-semibold border transition-all ${serviceForm.service_type === val ? 'bg-primary/[0.08] border-primary/30 text-primary ring-1 ring-primary/20' : 'bg-sand/30 border-sand-dark/20 text-warm-gray/70 hover:border-primary/20'}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-warm-gray/60 uppercase tracking-wider block mb-2">Omschrijving *</label>
                <textarea required value={serviceForm.description} onChange={e => setServiceForm({ ...serviceForm, description: e.target.value })} className={`${inputClass} resize-none`} rows={4} placeholder="Beschrijf uw verzoek zo specifiek mogelijk..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-3 text-sm text-warm-gray/70 hover:text-warm-gray font-medium transition-colors">Annuleren</button>
                <button type="submit" disabled={submitting} className="bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary text-white font-bold px-7 py-3 rounded-xl text-sm transition-all shadow-lg shadow-primary/20 disabled:opacity-50">{submitting ? 'Indienen...' : 'Indienen'}</button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active requests */}
      {loadingRequests ? (
        <div className="flex items-center justify-center py-12"><div className="animate-spin w-7 h-7 border-2 border-primary border-t-transparent rounded-full" /></div>
      ) : activeRequests.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-warm-gray/60 uppercase tracking-wider">Lopende aanvragen ({activeRequests.length})</h3>
          {activeRequests.map((r, i) => {
            const sc = STATUS_CONFIG[r.status] || STATUS_CONFIG.aangevraagd;
            const Icon = sc.icon;
            const stepIdx = STEP_ORDER.indexOf(r.status);
            const progress = stepIdx >= 0 ? ((stepIdx + 1) / STEP_ORDER.length) * 100 : 20;

            return (
              <motion.div key={r.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                className="card-premium p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="icon-premium w-10 h-10"><Wrench size={16} className="text-primary" /></div>
                    <div>
                      <span className="font-bold text-surface-dark">{TYPE_LABELS[r.service_type] || r.service_type}</span>
                      <span className="text-warm-gray/40 ml-2">#{r.id}</span>
                      <p className="text-xs text-warm-gray/60 mt-0.5">{r.caravan_name} &middot; {r.license_plate}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${sc.bg} ${sc.color}`}>
                    <Icon size={12} />{sc.label}
                  </span>
                </div>
                {/* Progress bar */}
                <div className="mb-3">
                  <div className="w-full bg-sand/60 rounded-full h-1.5">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.8, delay: 0.2 }}
                      className="bg-gradient-to-r from-primary to-primary-light h-1.5 rounded-full" />
                  </div>
                  <div className="flex justify-between mt-1.5">
                    {STEP_ORDER.map((step, si) => (
                      <span key={step} className={`text-[10px] font-medium ${si <= stepIdx ? 'text-primary' : 'text-warm-gray/30'}`}>
                        {STATUS_CONFIG[step]?.label}
                      </span>
                    ))}
                  </div>
                </div>
                {r.description && <p className="text-sm text-warm-gray/60 line-clamp-2 mb-3">{r.description}</p>}
                <div className="flex flex-wrap gap-4 text-xs text-warm-gray/50">
                  <span>Ingediend: {new Date(r.created_at).toLocaleDateString('nl-NL')}</span>
                  {r.scheduled_date && <span className="flex items-center gap-1"><Calendar size={11} />Gepland: {new Date(r.scheduled_date).toLocaleDateString('nl-NL')}</span>}
                  {r.estimated_cost && <span className="flex items-center gap-1"><Euro size={11} />Geschat: &euro;{Number(r.estimated_cost).toFixed(2)}</span>}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Past requests */}
      {!loadingRequests && pastRequests.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-warm-gray/60 uppercase tracking-wider">Afgerond ({pastRequests.length})</h3>
          {pastRequests.map(r => {
            const sc = STATUS_CONFIG[r.status] || STATUS_CONFIG.afgerond;
            const Icon = sc.icon;
            return (
              <div key={r.id} className="bg-surface rounded-xl border border-sand-dark/15 p-4 opacity-70 hover:opacity-100 transition-opacity">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <span className="font-bold text-surface-dark text-sm">{TYPE_LABELS[r.service_type] || r.service_type} <span className="text-warm-gray/40 font-normal">#{r.id}</span></span>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${sc.bg} ${sc.color}`}><Icon size={12} />{sc.label}</span>
                </div>
                <p className="text-sm text-warm-gray/60">{r.caravan_name}</p>
                <div className="flex flex-wrap gap-4 mt-2 text-xs text-warm-gray/50">
                  <span>Ingediend: {new Date(r.created_at).toLocaleDateString('nl-NL')}</span>
                  {r.completed_date && <span>Afgerond: {new Date(r.completed_date).toLocaleDateString('nl-NL')}</span>}
                  {r.actual_cost && <span>Kosten: &euro;{Number(r.actual_cost).toFixed(2)}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loadingRequests && requests.length === 0 && (
        <div className="card-premium p-12 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Wrench size={28} className="text-warm-gray/30" />
          </div>
          <p className="text-warm-gray/60 font-bold text-lg mb-1">Geen aanvragen</p>
          <p className="text-warm-gray/40 text-sm">Dien uw eerste serviceverzoek in via de knop hierboven</p>
        </div>
      )}
    </div>
  );
}
