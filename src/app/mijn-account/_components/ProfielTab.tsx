'use client';
import { useState } from 'react';
import { User, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-surface rounded-2xl border border-sand-dark/20 p-8">
        <h2 className="font-bold text-surface-dark text-lg mb-6 flex items-center gap-2"><User size={18} className="text-primary" /> Profiel bewerken</h2>
        {profileMsg && <div className={`text-sm p-3 rounded-xl mb-4 ${profileMsg.includes('bijgewerkt') ? 'bg-accent/10 text-primary-dark border border-accent/30' : 'bg-danger/10 text-danger border border-danger/30'}`}>{profileMsg}</div>}
        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div><label className="text-xs font-semibold text-warm-gray/70 block mb-2">Telefoon</label><input value={profileForm.phone} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} placeholder={customer?.phone || 'Telefoonnummer'} className="w-full border border-sand-dark/30 rounded-xl px-4 py-3 text-sm bg-sand/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" /></div>
          <div><label className="text-xs font-semibold text-warm-gray/70 block mb-2">Adres</label><input value={profileForm.address} onChange={e => setProfileForm({ ...profileForm, address: e.target.value })} placeholder="Straat en huisnummer" className="w-full border border-sand-dark/30 rounded-xl px-4 py-3 text-sm bg-sand/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs font-semibold text-warm-gray/70 block mb-2">Postcode</label><input value={profileForm.postal_code} onChange={e => setProfileForm({ ...profileForm, postal_code: e.target.value })} className="w-full border border-sand-dark/30 rounded-xl px-4 py-3 text-sm bg-sand/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" /></div>
            <div><label className="text-xs font-semibold text-warm-gray/70 block mb-2">Plaats</label><input value={profileForm.city} onChange={e => setProfileForm({ ...profileForm, city: e.target.value })} className="w-full border border-sand-dark/30 rounded-xl px-4 py-3 text-sm bg-sand/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" /></div>
          </div>
          <div><label className="text-xs font-semibold text-warm-gray/70 block mb-2">Land</label><input value={profileForm.country} onChange={e => setProfileForm({ ...profileForm, country: e.target.value })} placeholder="NL" className="w-full border border-sand-dark/30 rounded-xl px-4 py-3 text-sm bg-sand/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" /></div>
          <button type="submit" className="bg-primary hover:bg-primary-light text-white font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-lg shadow-primary/10">Opslaan</button>
        </form>
      </div>

      <div className="bg-surface rounded-2xl border border-sand-dark/20 p-8">
        <h2 className="font-bold text-surface-dark text-lg mb-6 flex items-center gap-2"><KeyRound size={18} className="text-primary" /> Wachtwoord wijzigen</h2>
        {pwChangeMsg && <div className={`text-sm p-3 rounded-xl mb-4 ${pwChangeMsg.includes('gewijzigd') ? 'bg-accent/10 text-primary-dark border border-accent/30' : 'bg-danger/10 text-danger border border-danger/30'}`}>{pwChangeMsg}</div>}
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div><label className="text-xs font-semibold text-warm-gray/70 block mb-2">Huidig wachtwoord</label><input type="password" required value={pwChangeForm.current} onChange={e => setPwChangeForm({ ...pwChangeForm, current: e.target.value })} className="w-full border border-sand-dark/30 rounded-xl px-4 py-3 text-sm bg-sand/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" /></div>
          <div><label className="text-xs font-semibold text-warm-gray/70 block mb-2">Nieuw wachtwoord</label><input type="password" required minLength={8} value={pwChangeForm.newPw} onChange={e => setPwChangeForm({ ...pwChangeForm, newPw: e.target.value })} className="w-full border border-sand-dark/30 rounded-xl px-4 py-3 text-sm bg-sand/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" /></div>
          <div><label className="text-xs font-semibold text-warm-gray/70 block mb-2">Herhaal nieuw wachtwoord</label><input type="password" required minLength={8} value={pwChangeForm.confirm} onChange={e => setPwChangeForm({ ...pwChangeForm, confirm: e.target.value })} className="w-full border border-sand-dark/30 rounded-xl px-4 py-3 text-sm bg-sand/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" /></div>
          <button type="submit" className="bg-primary hover:bg-primary-light text-white font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-lg shadow-primary/10">Wachtwoord wijzigen</button>
        </form>
      </div>
    </div>
  );
}
