'use client';

import { useState, useEffect, useCallback } from 'react';
import { MapPin, Plus, X, Grid3X3, ChevronDown, ChevronUp } from 'lucide-react';

interface Location { id: number; name: string; address: string; city: string; capacity_inside: number; capacity_outside: number; is_active: boolean; total_spots: number; occupied_spots: number; }
interface Spot { id: number; label: string; zone: string; spot_type: string; status: string; caravan_brand: string; caravan_model: string; caravan_license_plate: string; customer_name: string; }

const SPOT_COLORS: Record<string, string> = { vrij: 'bg-green-100 border-green-300 text-green-700', bezet: 'bg-blue-100 border-blue-300 text-blue-700', gereserveerd: 'bg-amber-100 border-amber-300 text-amber-700', onderhoud: 'bg-red-100 border-red-300 text-red-700' };

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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Locaties & Plekken</h1>
          <p className="text-sm text-muted">Beheer uw terreinen en stallingplekken</p>
        </div>
        <button onClick={() => setShowForm(true)} className="bg-primary hover:bg-primary-light text-white font-semibold px-5 py-2.5 rounded-xl text-sm flex items-center gap-2">
          <Plus size={16} /> Nieuwe locatie
        </button>
      </div>

      {/* Locations */}
      <div className="space-y-4">
        {locations.map(loc => {
          const occ = loc.total_spots > 0 ? Math.round((Number(loc.occupied_spots) / Number(loc.total_spots)) * 100) : 0;
          return (
            <div key={loc.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <button onClick={() => loadSpots(loc.id)} className="w-full flex items-center justify-between p-6 hover:bg-surface/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center"><MapPin className="text-primary" size={20} /></div>
                  <div className="text-left">
                    <h3 className="font-semibold">{loc.name}</h3>
                    <p className="text-xs text-muted">{loc.address}, {loc.city}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm font-medium">{loc.occupied_spots}/{loc.total_spots} plekken</p>
                    <div className="w-24 h-2 bg-gray-200 rounded-full mt-1">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${occ}%` }} />
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${occ > 90 ? 'bg-red-100 text-red-700' : occ > 70 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>{occ}%</span>
                  {expandedId === loc.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </button>

              {/* Spots grid */}
              {expandedId === loc.id && (
                <div className="border-t border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Grid3X3 size={16} className="text-muted" />
                      <span className="text-sm font-medium">Terreinkaart</span>
                      <div className="flex gap-2 ml-4">
                        {Object.entries(SPOT_COLORS).map(([k, v]) => (
                          <span key={k} className={`text-[10px] px-2 py-0.5 rounded-full border ${v}`}>{k}</span>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => setShowBulk(loc.id)} className="text-sm text-primary font-medium flex items-center gap-1"><Plus size={14} /> Plekken toevoegen</button>
                  </div>

                  {showBulk === loc.id && (
                    <div className="bg-surface rounded-xl p-4 mb-4 flex flex-wrap gap-3">
                      <input placeholder="Zone" value={bulkForm.zone} onChange={e => setBulkForm({ ...bulkForm, zone: e.target.value })} className="border rounded-lg px-3 py-2 text-sm w-20" />
                      <input placeholder="Prefix" value={bulkForm.prefix} onChange={e => setBulkForm({ ...bulkForm, prefix: e.target.value })} className="border rounded-lg px-3 py-2 text-sm w-20" />
                      <input type="number" placeholder="Aantal" value={bulkForm.count} onChange={e => setBulkForm({ ...bulkForm, count: e.target.value })} className="border rounded-lg px-3 py-2 text-sm w-24" />
                      <select value={bulkForm.spot_type} onChange={e => setBulkForm({ ...bulkForm, spot_type: e.target.value })} className="border rounded-lg px-3 py-2 text-sm w-28"><option value="buiten">Buiten</option><option value="binnen">Binnen</option></select>
                      <button onClick={() => handleBulkSpots(loc.id)} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium">Aanmaken</button>
                      <button onClick={() => setShowBulk(null)} className="text-muted text-sm">Annuleren</button>
                    </div>
                  )}

                  {spotsLoading ? (
                    <p className="text-muted text-sm">Laden...</p>
                  ) : spots.length === 0 ? (
                    <p className="text-muted text-sm">Nog geen plekken aangemaakt. Gebruik de knop hierboven om plekken toe te voegen.</p>
                  ) : (
                    zones.map(zone => (
                      <div key={zone} className="mb-6">
                        <h4 className="text-sm font-semibold text-muted mb-2">Zone {zone}</h4>
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b"><h2 className="text-lg font-bold">Nieuwe locatie</h2><button onClick={() => setShowForm(false)}><X size={20} /></button></div>
            <form onSubmit={handleAddLocation} className="p-6 space-y-4">
              <div><label className="text-xs font-medium text-muted block mb-1">Naam *</label><input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full border rounded-xl px-3 py-2.5 text-sm" /></div>
              <div><label className="text-xs font-medium text-muted block mb-1">Adres</label><input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="w-full border rounded-xl px-3 py-2.5 text-sm" /></div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="text-xs font-medium text-muted block mb-1">Stad</label><input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="w-full border rounded-xl px-3 py-2.5 text-sm" /></div>
                <div><label className="text-xs font-medium text-muted block mb-1">Binnen capaciteit</label><input type="number" value={form.capacity_inside} onChange={e => setForm({ ...form, capacity_inside: e.target.value })} className="w-full border rounded-xl px-3 py-2.5 text-sm" /></div>
                <div><label className="text-xs font-medium text-muted block mb-1">Buiten capaciteit</label><input type="number" value={form.capacity_outside} onChange={e => setForm({ ...form, capacity_outside: e.target.value })} className="w-full border rounded-xl px-3 py-2.5 text-sm" /></div>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2.5 text-sm text-muted">Annuleren</button>
                <button type="submit" className="bg-primary text-white font-semibold px-6 py-2.5 rounded-xl text-sm">Opslaan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
