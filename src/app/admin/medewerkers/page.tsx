'use client';

import { useState, useEffect, useCallback } from 'react';
import { Users, Plus, X, Shield, MapPin, Eye, EyeOff } from 'lucide-react';

interface StaffMember { id: number; first_name: string; last_name: string; email: string; phone: string; role: string; location_id: number; location_name: string; is_active: boolean; created_at: string; }

const ROLE_LABELS: Record<string,string> = { beheerder: 'Beheerder', medewerker: 'Medewerker', chauffeur: 'Chauffeur', technicus: 'Technicus' };
const ROLE_COLORS: Record<string,string> = { beheerder: 'bg-primary/15 text-primary', medewerker: 'bg-ocean/15 text-ocean-dark', chauffeur: 'bg-warning/15 text-warning', technicus: 'bg-accent/15 text-primary-dark' };

export default function MedewerkersPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [locations, setLocations] = useState<{id:number;name:string}[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone: '', password: '', role: 'medewerker', location_id: '' });

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/staff', { credentials: 'include' });
    const data = await res.json();
    setStaff(data.staff || []); setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openForm = async () => {
    const res = await fetch('/api/admin/locations', { credentials: 'include' });
    const data = await res.json();
    setLocations(data.locations || []);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/admin/staff', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form), credentials: 'include' });
    setShowForm(false); setForm({ first_name: '', last_name: '', email: '', phone: '', password: '', role: 'medewerker', location_id: '' }); fetchData();
  };

  const toggleActive = async (id: number, is_active: boolean) => {
    await fetch(`/api/admin/staff/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_active: !is_active }), credentials: 'include' });
    fetchData();
  };

  const activeStaff = staff.filter(s => s.is_active);
  const inactiveStaff = staff.filter(s => !s.is_active);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-2xl font-black text-surface-dark">Medewerkers</h1><p className="text-sm text-warm-gray/70 mt-1">{activeStaff.length} actief · {inactiveStaff.length} inactief</p></div>
        <button onClick={openForm} className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all"><Plus size={16} /> Medewerker toevoegen</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading ? <div className="col-span-full bg-surface rounded-2xl border border-sand-dark/20 p-8 text-center text-warm-gray/70">Laden...</div> :
        staff.length === 0 ? <div className="col-span-full bg-surface rounded-2xl border border-sand-dark/20 p-8 text-center text-warm-gray/70">Geen medewerkers</div> :
        staff.map(s => (
          <div key={s.id} className={`bg-surface rounded-2xl border border-sand-dark/20 p-5 hover:shadow-lg hover:shadow-sand-dark/20 transition-all ${!s.is_active ? 'opacity-50' : ''}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-warning/15 rounded-xl flex items-center justify-center text-warning font-bold text-sm">{s.first_name[0]}{s.last_name[0]}</div>
                <div>
                  <h3 className="font-semibold">{s.first_name} {s.last_name}</h3>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ROLE_COLORS[s.role] || 'bg-sand'}`}>{ROLE_LABELS[s.role] || s.role}</span>
                </div>
              </div>
              <button onClick={() => toggleActive(s.id, s.is_active)} className={`text-xs px-2 py-1 rounded-lg ${s.is_active ? 'text-danger hover:bg-danger/10' : 'text-accent hover:bg-accent/10'}`}>{s.is_active ? 'Deactiveren' : 'Activeren'}</button>
            </div>
            <div className="mt-4 space-y-1.5 text-sm text-warm-gray/70">
              <div className="flex items-center gap-2"><Shield size={14}/> {s.email}</div>
              {s.phone && <div className="flex items-center gap-2"><Users size={14}/> {s.phone}</div>}
              {s.location_name && <div className="flex items-center gap-2"><MapPin size={14}/> {s.location_name}</div>}
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-sand-dark/20"><h2 className="text-lg font-bold text-surface-dark">Medewerker toevoegen</h2><button onClick={()=>setShowForm(false)} className="text-warm-gray/70 hover:text-warm-gray"><X size={20}/></button></div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-semibold text-warm-gray block mb-1">Voornaam *</label><input required value={form.first_name} onChange={e=>setForm({...form,first_name:e.target.value})} className="w-full border border-sand-dark/30 rounded-xl px-3 py-2.5 text-sm bg-sand/40 focus:ring-2 focus:ring-amber-400/20 focus:border-warning outline-none transition-all"/></div>
                <div><label className="text-xs font-semibold text-warm-gray block mb-1">Achternaam *</label><input required value={form.last_name} onChange={e=>setForm({...form,last_name:e.target.value})} className="w-full border border-sand-dark/30 rounded-xl px-3 py-2.5 text-sm bg-sand/40 focus:ring-2 focus:ring-amber-400/20 focus:border-warning outline-none transition-all"/></div>
              </div>
              <div><label className="text-xs font-semibold text-warm-gray block mb-1">E-mail *</label><input type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className="w-full border border-sand-dark/30 rounded-xl px-3 py-2.5 text-sm bg-sand/40 focus:ring-2 focus:ring-amber-400/20 focus:border-warning outline-none transition-all"/></div>
              <div><label className="text-xs font-semibold text-warm-gray block mb-1">Telefoon</label><input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} className="w-full border border-sand-dark/30 rounded-xl px-3 py-2.5 text-sm bg-sand/40 focus:ring-2 focus:ring-amber-400/20 focus:border-warning outline-none transition-all"/></div>
              <div>
                <label className="text-xs font-semibold text-warm-gray block mb-1">Wachtwoord *</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} required minLength={8} value={form.password} onChange={e=>setForm({...form,password:e.target.value})} className="w-full border border-sand-dark/30 rounded-xl px-3 py-2.5 text-sm bg-sand/40 focus:ring-2 focus:ring-amber-400/20 focus:border-warning outline-none transition-all pr-10"/>
                  <button type="button" onClick={()=>setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-gray/70">{showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}</button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-semibold text-warm-gray block mb-1">Rol *</label><select required value={form.role} onChange={e=>setForm({...form,role:e.target.value})} className="w-full border border-sand-dark/30 rounded-xl px-3 py-2.5 text-sm bg-sand/40 focus:ring-2 focus:ring-amber-400/20 outline-none"><option value="medewerker">Medewerker</option><option value="beheerder">Beheerder</option><option value="chauffeur">Chauffeur</option><option value="technicus">Technicus</option></select></div>
                <div><label className="text-xs font-semibold text-warm-gray block mb-1">Locatie</label><select value={form.location_id} onChange={e=>setForm({...form,location_id:e.target.value})} className="w-full border border-sand-dark/30 rounded-xl px-3 py-2.5 text-sm bg-sand/40 focus:ring-2 focus:ring-amber-400/20 outline-none"><option value="">Alle locaties</option>{locations.map(l=><option key={l.id} value={l.id}>{l.name}</option>)}</select></div>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={()=>setShowForm(false)} className="px-4 py-2.5 text-sm text-warm-gray/70 hover:bg-sand-dark/20 rounded-xl transition-colors">Annuleren</button>
                <button type="submit" className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm shadow-lg shadow-amber-500/20 transition-all">Toevoegen</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
