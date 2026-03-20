'use client';
import { useState } from 'react';
import { User, KeyRound, CheckCircle2, AlertCircle, Mail, Phone, MapPin, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import type { CustomerData } from './types';

interface Props { customer: CustomerData; }

export default function ProfielTab({ customer }: Props) {
  const [profileForm, setProfileForm] = useState({ phone: '', address: '', city: '', postal_code: '', country: '' });
  const [profileMsg, setProfileMsg] = useState('');
  const [pwChangeForm, setPwChangeForm] = useState({ current: '', newPw: '', confirm: '' });
  const [pwChangeMsg, setPwChangeMsg] = useState('');

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault(); setProfileMsg('');
    try {
      const res = await fetch('/api/customer/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(profileForm), credentials: 'include' });
      if (res.ok) setProfileMsg('Profiel bijgewerkt!');
      else { const d = await res.json(); setProfileMsg(d.error || 'Bijwerken mislukt'); }
    } catch { setProfileMsg('Er ging iets mis'); }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault(); setPwChangeMsg('');
    if (pwChangeForm.newPw !== pwChangeForm.confirm) { setPwChangeMsg('Wachtwoorden komen niet overeen'); return; }
    try {
      const res = await fetch('/api/customer/profile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currentPassword: pwChangeForm.current, newPassword: pwChangeForm.newPw }), credentials: 'include' });
      if (res.ok) { setPwChangeMsg('Wachtwoord gewijzigd!'); setPwChangeForm({ current: '', newPw: '', confirm: '' }); }
      else { const d = await res.json(); setPwChangeMsg(d.error || 'Wijzigen mislukt'); }
    } catch { setPwChangeMsg('Er ging iets mis'); }
  };

  const inputClass = 'w-full border border-sand-dark/30 rounded-xl px-4 py-3 text-sm bg-sand/20 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all placeholder:text-warm-gray/40';

  return (
    <div className="space-y-6">
      {/* Account Info Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-primary/[0.07] via-accent/[0.04] to-ocean/[0.06] rounded-2xl border border-primary/15 p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-white text-xl font-black">{customer?.name?.charAt(0) || 'U'}</span>
          </div>
          <div>
            <h2 className="text-xl font-black text-surface-dark">{customer?.name}</h2>
            <div className="flex items-center gap-4 mt-1">
              <span className="text-sm text-warm-gray/70 flex items-center gap-1.5"><Mail size={13} /> {customer?.email}</span>
              {customer?.phone && <span className="text-sm text-warm-gray/70 flex items-center gap-1.5"><Phone size={13} /> {customer.phone}</span>}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          className="card-premium p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="icon-premium w-10 h-10"><User size={18} className="text-primary" /></div>
            <div><h2 className="font-bold text-surface-dark text-lg">Profiel bewerken</h2><p className="text-xs text-warm-gray/60">Werk uw contactgegevens bij</p></div>
          </div>
          {profileMsg && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className={`text-sm p-3.5 rounded-xl mb-5 flex items-center gap-2.5 ${profileMsg.includes('bijgewerkt') ? 'bg-accent/10 text-accent-dark border border-accent/30' : 'bg-danger/10 text-danger border border-danger/30'}`}>
              {profileMsg.includes('bijgewerkt') ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}{profileMsg}
            </motion.div>
          )}
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-warm-gray/60 uppercase tracking-wider block mb-2">Telefoon</label>
              <div className="relative">
                <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-warm-gray/30" />
                <input value={profileForm.phone} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} placeholder={customer?.phone || '+31 6 12345678'} className={`${inputClass} pl-10`} />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-warm-gray/60 uppercase tracking-wider block mb-2">Adres</label>
              <div className="relative">
                <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-warm-gray/30" />
                <input value={profileForm.address} onChange={e => setProfileForm({ ...profileForm, address: e.target.value })} placeholder="Straat en huisnummer" className={`${inputClass} pl-10`} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs font-bold text-warm-gray/60 uppercase tracking-wider block mb-2">Postcode</label><input value={profileForm.postal_code} onChange={e => setProfileForm({ ...profileForm, postal_code: e.target.value })} placeholder="1234 AB" className={inputClass} /></div>
              <div><label className="text-xs font-bold text-warm-gray/60 uppercase tracking-wider block mb-2">Plaats</label><input value={profileForm.city} onChange={e => setProfileForm({ ...profileForm, city: e.target.value })} placeholder="Amsterdam" className={inputClass} /></div>
            </div>
            <div>
              <label className="text-xs font-bold text-warm-gray/60 uppercase tracking-wider block mb-2">Land</label>
              <div className="relative">
                <Globe size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-warm-gray/30" />
                <input value={profileForm.country} onChange={e => setProfileForm({ ...profileForm, country: e.target.value })} placeholder="Nederland" className={`${inputClass} pl-10`} />
              </div>
            </div>
            <button type="submit" className="bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary text-white font-bold px-7 py-3 rounded-xl text-sm transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5">Opslaan</button>
          </form>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
          className="card-premium p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="icon-premium w-10 h-10"><KeyRound size={18} className="text-primary" /></div>
            <div><h2 className="font-bold text-surface-dark text-lg">Wachtwoord wijzigen</h2><p className="text-xs text-warm-gray/60">Beveilig uw account</p></div>
          </div>
          {pwChangeMsg && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className={`text-sm p-3.5 rounded-xl mb-5 flex items-center gap-2.5 ${pwChangeMsg.includes('gewijzigd') ? 'bg-accent/10 text-accent-dark border border-accent/30' : 'bg-danger/10 text-danger border border-danger/30'}`}>
              {pwChangeMsg.includes('gewijzigd') ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}{pwChangeMsg}
            </motion.div>
          )}
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div><label className="text-xs font-bold text-warm-gray/60 uppercase tracking-wider block mb-2">Huidig wachtwoord</label><input type="password" required value={pwChangeForm.current} onChange={e => setPwChangeForm({ ...pwChangeForm, current: e.target.value })} className={inputClass} placeholder="••••••••" /></div>
            <div><label className="text-xs font-bold text-warm-gray/60 uppercase tracking-wider block mb-2">Nieuw wachtwoord</label><input type="password" required minLength={8} value={pwChangeForm.newPw} onChange={e => setPwChangeForm({ ...pwChangeForm, newPw: e.target.value })} className={inputClass} placeholder="Min. 8 tekens" /></div>
            <div><label className="text-xs font-bold text-warm-gray/60 uppercase tracking-wider block mb-2">Herhaal nieuw wachtwoord</label><input type="password" required minLength={8} value={pwChangeForm.confirm} onChange={e => setPwChangeForm({ ...pwChangeForm, confirm: e.target.value })} className={inputClass} placeholder="Bevestig wachtwoord" /></div>
            <button type="submit" className="bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary text-white font-bold px-7 py-3 rounded-xl text-sm transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5">Wachtwoord wijzigen</button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
