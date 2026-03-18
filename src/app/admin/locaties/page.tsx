'use client';

import { useState, useEffect, useCallback } from 'react';
import { MapPin, Plus, X, Grid3X3, ChevronDown, ChevronUp } from 'lucide-react';

interface Location { id: number; name: string; address: string; city: string; capacity_inside: number; capacity_outside: number; is_active: boolean; total_spots: number; occupied_spots: number; }
interface Spot { id: number; label: string; zone: string; spot_type: string; status: string; caravan_brand: string; caravan_model: string; caravan_license_plate: string; customer_name: string; }

const SPOT_COLORS: Record<string, string> = { vrij: 'bg-accent/15 border-accent/40 text-primary-dark', bezet: 'bg-ocean/15 border-ocean/40 text-ocean-dark', gereserveerd: 'bg-warning/15 border-warning/40 text-warning', onderhoud: 'bg-danger/15 border-danger/40 text-danger' };

export default function LocatiesPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [spots, setSpots] = useState<Spot[]>([]);
  const [spotsLoading, setSpotsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', address: '', city: '', capacity_inside: '', capacity_outside: '' });
  const [bulkForm, setBulkForm] = useState({ zone: 'A', count: '10', prefix: 'A', spot_type: 'buiten' });
  const [showBulk, setShowBulk] = useState<number | null>(null);

  const fetchLocations = useCallback(async () => {
    const res = await fetch('/api/admin/locations', { credentials: 'include' });
    const data = await res.json();
    setLocations(data.locations || []);
  }, []);

  useEffect(() => { fetchLocations(); }, [fetchLocations]);

  const loadSpots = async (locId: number) => {
    if (expandedId === locId) { setExpandedId(null); return; }
    setExpandedId(locId); setSpotsLoading(true);
    const res = await fetch(`/api/admin/locations/${locId}/spots`, { credentials: 'include' });
    const data = await res.json();
    setSpots(data.spots || []);
    setSpotsLoading(false);
  };

  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/admin/locations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form), credentials: 'include' });
    setShowForm(false); fetchLocations();
  };

  const handleBulkSpots = async (locId: number) => {
    await fetch(`/api/admin/locations/${locId}/spots/bulk`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(bulkForm), credentials: 'include' });
    setShowBulk(null); loadSpots(locId);
  };

  const zones = [...new Set(spots.map(s => s.zone))].sort();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-surface-dark">Locaties & Plekken</h1>
          <p className="text-sm text-warm-gray/70 mt-1">Beheer uw terreinen en stallingplekken</p>
        </div>
        <button onClick={() => setShowForm(true)} className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all">
          <Plus size={16} /> Nieuwe locatie
        </button>
      </div>

      {/* Locations */}
      <div className="space-y-4">
        {locations.map(loc => {
          const occ = loc.total_spots > 0 ? Math.round((Number(loc.occupied_spots) / Number(loc.total_spots)) * 100) : 0;
          return (
            <div key={loc.id} className="bg-surface rounded-2xl border border-sand-dark/20 overflow-hidden hover:shadow-lg hover:shadow-sand-dark/20 transition-all">
              <button onClick={() => loadSpots(loc.id)} className="w-full flex items-center justify-between p-6 hover:bg-sand/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-warning/15 rounded-xl flex items-center justify-center"><MapPin className="text-warning" size={20} /></div>
                  <div className="text-left">
                    <h3 className="font-semibold">{loc.name}</h3>
                    <p className="text-xs text-warm-gray/70">{loc.address}, {loc.city}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm font-medium">{loc.occupied_spots}/{loc.total_spots} plekken</p>
                    <div className="w-24 h-2 bg-sand-dark/30 rounded-full mt-1">
                      <div className="h-full bg-warning/100 rounded-full transition-all" style={{ width: `${occ}%` }} />
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${occ > 90 ? 'bg-danger/15 text-danger' : occ > 70 ? 'bg-warning/15 text-warning' : 'bg-accent/15 text-primary-dark'}`}>{occ}%</span>
                  {expandedId === loc.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </button>

              {/* Spots grid */}
              {expandedId === loc.id && (
                <div className="border-t border-sand-dark/20 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Grid3X3 size={16} className="text-warm-gray/70" />
                      <span className="text-sm font-medium text-surface-dark">Terreinkaart</span>
                      <div className="flex gap-2 ml-4">
                        {Object.entries(SPOT_COLORS).map(([k, v]) => (
                          <span key={k} className={`text-[10px] px-2 py-0.5 rounded-full border ${v}`}>{k}</span>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => setShowBulk(loc.id)} className="text-sm text-warning font-medium flex items-center gap-1"><Plus size={14} /> Plekken toevoegen</button>
                  </div>

                  {showBulk === loc.id && (
                    <div className="bg-sand/40 rounded-xl p-4 mb-4 flex flex-wrap gap-3">
                      <input placeholder="Zone" value={bulkForm.zone} onChange={e => setBulkForm({ ...bulkForm, zone: e.target.value })} className="border border-sand-dark/30 rounded-lg px-3 py-2 text-sm w-20 bg-surface" />
                      <input placeholder="Prefix" value={bulkForm.prefix} onChange={e => setBulkForm({ ...bulkForm, prefix: e.target.value })} className="border border-sand-dark/30 rounded-lg px-3 py-2 text-sm w-20 bg-surface" />
                      <input type="number" placeholder="Aantal" value={bulkForm.count} onChange={e => setBulkForm({ ...bulkForm, count: e.target.value })} className="border border-sand-dark/30 rounded-lg px-3 py-2 text-sm w-24 bg-surface" />
                      <select value={bulkForm.spot_type} onChange={e => setBulkForm({ ...bulkForm, spot_type: e.target.value })} className="border border-sand-dark/30 rounded-lg px-3 py-2 text-sm w-28 bg-surface"><option value="buiten">Buiten</option><option value="binnen">Binnen</option></select>
                      <button onClick={() => handleBulkSpots(loc.id)} className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md shadow-amber-500/20">Aanmaken</button>
                      <button onClick={() => setShowBulk(null)} className="text-warm-gray/70 text-sm">Annuleren</button>
                    </div>
                  )}

                  {spotsLoading ? (
                    <p className="text-warm-gray/70 text-sm">Laden...</p>
                  ) : spots.length === 0 ? (
                    <p className="text-warm-gray/70 text-sm">Nog geen plekken aangemaakt. Gebruik de knop hierboven om plekken toe te voegen.</p>
                  ) : (
                    zones.map(zone => (
                      <div key={zone} className="mb-6">
                        <h4 className="text-sm font-semibold text-warm-gray/70 mb-2">Zone {zone}</h4>
                        <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
                          {spots.filter(s => s.zone === zone).map(s => (
                            <div key={s.id} className={`border rounded-lg p-2 text-center cursor-pointer hover:shadow-md transition-shadow ${SPOT_COLORS[s.status] || SPOT_COLORS.vrij}`} title={s.status === 'bezet' ? `${s.caravan_brand} ${s.caravan_model}\n${s.customer_name}\n${s.caravan_license_plate}` : 'Vrij'}>
                              <p className="text-xs font-bold">{s.label}</p>
                              {s.status === 'bezet' && <p className="text-[9px] truncate">{s.caravan_license_plate || '—'}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add location modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-sand-dark/20"><h2 className="text-lg font-bold text-surface-dark">Nieuwe locatie</h2><button onClick={() => setShowForm(false)} className="text-warm-gray/70 hover:text-warm-gray"><X size={20} /></button></div>
            <form onSubmit={handleAddLocation} className="p-6 space-y-4">
              <div><label className="text-xs font-semibold text-warm-gray block mb-1">Naam *</label><input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full border border-sand-dark/30 rounded-xl px-3 py-2.5 text-sm bg-sand/40 focus:ring-2 focus:ring-amber-400/20 focus:border-warning outline-none transition-all" /></div>
              <div><label className="text-xs font-semibold text-warm-gray block mb-1">Adres</label><input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="w-full border border-sand-dark/30 rounded-xl px-3 py-2.5 text-sm bg-sand/40 focus:ring-2 focus:ring-amber-400/20 focus:border-warning outline-none transition-all" /></div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="text-xs font-semibold text-warm-gray block mb-1">Stad</label><input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="w-full border border-sand-dark/30 rounded-xl px-3 py-2.5 text-sm bg-sand/40 focus:ring-2 focus:ring-amber-400/20 outline-none" /></div>
                <div><label className="text-xs font-semibold text-warm-gray block mb-1">Binnen capaciteit</label><input type="number" value={form.capacity_inside} onChange={e => setForm({ ...form, capacity_inside: e.target.value })} className="w-full border border-sand-dark/30 rounded-xl px-3 py-2.5 text-sm bg-sand/40 focus:ring-2 focus:ring-amber-400/20 outline-none" /></div>
                <div><label className="text-xs font-semibold text-warm-gray block mb-1">Buiten capaciteit</label><input type="number" value={form.capacity_outside} onChange={e => setForm({ ...form, capacity_outside: e.target.value })} className="w-full border border-sand-dark/30 rounded-xl px-3 py-2.5 text-sm bg-sand/40 focus:ring-2 focus:ring-amber-400/20 outline-none" /></div>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2.5 text-sm text-warm-gray/70 hover:bg-sand-dark/20 rounded-xl transition-colors">Annuleren</button>
                <button type="submit" className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm shadow-lg shadow-amber-500/20 transition-all">Opslaan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
