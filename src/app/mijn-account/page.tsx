'use client';

import { useState, useEffect } from 'react';
import { User, FileText, Receipt, Wrench, Truck, LogOut, Eye, EyeOff, ChevronRight } from 'lucide-react';

interface CustomerData { name: string; email: string; phone: string; customer_number: string; }
interface Caravan { id: number; brand: string; model: string; license_plate: string; status: string; location_name: string; spot_label: string; insurance_expiry: string; apk_expiry: string; }
interface Invoice { id: number; invoice_number: string; description: string; total: number; status: string; due_date: string; }
interface Contract { id: number; contract_number: string; start_date: string; end_date: string; monthly_rate: number; status: string; auto_renew: boolean; }

export default function MijnAccountPage() {
  const [auth, setAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overzicht');
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [caravans, setCaravans] = useState<Caravan[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ first_name: '', last_name: '', email: '', phone: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [serviceForm, setServiceForm] = useState({ caravan_id: '', service_type: 'reparatie', description: '' });
  const [showServiceForm, setShowServiceForm] = useState(false);

  useEffect(() => {
    fetch('/api/customer/auth/me', { credentials: 'include' })
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(d => { setAuth(true); setCustomer(d); })
      .catch(() => setAuth(false))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!auth) return;
    Promise.all([
      fetch('/api/customer/caravans', { credentials: 'include' }).then(r => r.json()),
      fetch('/api/customer/invoices', { credentials: 'include' }).then(r => r.json()),
      fetch('/api/customer/contracts', { credentials: 'include' }).then(r => r.json()),
    ]).then(([c, i, co]) => {
      setCaravans(c.caravans || []); setInvoices(i.invoices || []); setContracts(co.contracts || []);
    }).catch(() => {});
  }, [auth]);

  const login = async (e: React.FormEvent) => {
    e.preventDefault(); setLoginError('');
    const res = await fetch('/api/customer/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(loginForm), credentials: 'include' });
    if (res.ok) { const d = await res.json(); setAuth(true); setCustomer(d); }
    else { const d = await res.json(); setLoginError(d.error || 'Inloggen mislukt'); }
  };

  const register = async (e: React.FormEvent) => {
    e.preventDefault(); setLoginError('');
    const res = await fetch('/api/customer/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(registerForm), credentials: 'include' });
    if (res.ok) { const d = await res.json(); setAuth(true); setCustomer(d); }
    else { const d = await res.json(); setLoginError(d.error || 'Registratie mislukt'); }
  };

  const logout = async () => { await fetch('/api/customer/auth/logout', { method: 'POST', credentials: 'include' }); setAuth(false); setCustomer(null); };

  const submitService = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/customer/services', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(serviceForm), credentials: 'include' });
    setShowServiceForm(false); alert('Serviceverzoek ingediend!');
  };

  const fmt = (n: number) => new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(n);
  const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('nl-NL') : '-';
  const STATUS_COLORS: Record<string,string> = { betaald: 'bg-green-100 text-green-700', open: 'bg-blue-100 text-blue-700', verzonden: 'bg-amber-100 text-amber-700', actief: 'bg-green-100 text-green-700', verlopen: 'bg-red-100 text-red-700' };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-[#1e3a5f] border-t-transparent rounded-full" /></div>;

  if (!auth) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8"><div className="w-12 h-12 bg-[#1e3a5f]/10 rounded-xl flex items-center justify-center mx-auto mb-3"><User className="text-[#1e3a5f]" size={24}/></div><h1 className="text-xl font-bold">{isRegister ? 'Account aanmaken' : 'Mijn Account'}</h1><p className="text-sm text-gray-500">Caravan Storage Spain</p></div>
        {loginError && <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-xl mb-4">{loginError}</div>}
        {isRegister ? (
          <form onSubmit={register} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs font-medium text-gray-500 block mb-1">Voornaam *</label><input required value={registerForm.first_name} onChange={e=>setRegisterForm({...registerForm,first_name:e.target.value})} className="w-full border rounded-xl px-3 py-2.5 text-sm"/></div>
              <div><label className="text-xs font-medium text-gray-500 block mb-1">Achternaam *</label><input required value={registerForm.last_name} onChange={e=>setRegisterForm({...registerForm,last_name:e.target.value})} className="w-full border rounded-xl px-3 py-2.5 text-sm"/></div>
            </div>
            <div><label className="text-xs font-medium text-gray-500 block mb-1">E-mail *</label><input type="email" required value={registerForm.email} onChange={e=>setRegisterForm({...registerForm,email:e.target.value})} className="w-full border rounded-xl px-3 py-2.5 text-sm"/></div>
            <div><label className="text-xs font-medium text-gray-500 block mb-1">Telefoon</label><input value={registerForm.phone} onChange={e=>setRegisterForm({...registerForm,phone:e.target.value})} className="w-full border rounded-xl px-3 py-2.5 text-sm"/></div>
            <div><label className="text-xs font-medium text-gray-500 block mb-1">Wachtwoord *</label><div className="relative"><input type={showPw?'text':'password'} required minLength={8} value={registerForm.password} onChange={e=>setRegisterForm({...registerForm,password:e.target.value})} className="w-full border rounded-xl px-3 py-2.5 text-sm pr-10"/><button type="button" onClick={()=>setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{showPw?<EyeOff size={16}/>:<Eye size={16}/>}</button></div></div>
            <button type="submit" className="w-full bg-[#1e3a5f] hover:bg-[#2a4a6f] text-white font-semibold py-2.5 rounded-xl text-sm">Registreren</button>
            <p className="text-center text-sm text-gray-500">Al een account? <button type="button" onClick={()=>setIsRegister(false)} className="text-[#1e3a5f] font-medium">Inloggen</button></p>
          </form>
        ) : (
          <form onSubmit={login} className="space-y-4">
            <div><label className="text-xs font-medium text-gray-500 block mb-1">E-mail</label><input type="email" required value={loginForm.email} onChange={e=>setLoginForm({...loginForm,email:e.target.value})} className="w-full border rounded-xl px-3 py-2.5 text-sm"/></div>
            <div><label className="text-xs font-medium text-gray-500 block mb-1">Wachtwoord</label><div className="relative"><input type={showPw?'text':'password'} required value={loginForm.password} onChange={e=>setLoginForm({...loginForm,password:e.target.value})} className="w-full border rounded-xl px-3 py-2.5 text-sm pr-10"/><button type="button" onClick={()=>setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{showPw?<EyeOff size={16}/>:<Eye size={16}/>}</button></div></div>
            <button type="submit" className="w-full bg-[#1e3a5f] hover:bg-[#2a4a6f] text-white font-semibold py-2.5 rounded-xl text-sm">Inloggen</button>
            <p className="text-center text-sm text-gray-500">Nog geen account? <button type="button" onClick={()=>setIsRegister(true)} className="text-[#1e3a5f] font-medium">Registreren</button></p>
          </form>
        )}
      </div>
    </div>
  );

  const TABS = [
    { id: 'overzicht', label: 'Overzicht', icon: User },
    { id: 'caravans', label: 'Mijn caravans', icon: Truck },
    { id: 'contracten', label: 'Contracten', icon: FileText },
    { id: 'facturen', label: 'Facturen', icon: Receipt },
    { id: 'diensten', label: 'Diensten aanvragen', icon: Wrench },
  ];

  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-2xl font-bold">Welkom, {customer?.name}</h1><p className="text-sm text-gray-500">Klantnummer: {customer?.customer_number}</p></div>
        <button onClick={logout} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"><LogOut size={16}/> Uitloggen</button>
      </div>

      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {TABS.map(t => (
          <button key={t.id} onClick={()=>setTab(t.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap ${tab === t.id ? 'bg-[#1e3a5f] text-white' : 'bg-white border hover:bg-gray-50'}`}><t.icon size={16}/>{t.label}</button>
        ))}
      </div>

      {tab === 'overzicht' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl shadow-sm border p-6"><div className="text-3xl font-bold text-[#1e3a5f]">{caravans.length}</div><div className="text-sm text-gray-500">Gestalde caravans</div></div>
          <div className="bg-white rounded-2xl shadow-sm border p-6"><div className="text-3xl font-bold text-[#1e3a5f]">{contracts.filter(c=>c.status==='actief').length}</div><div className="text-sm text-gray-500">Actieve contracten</div></div>
          <div className="bg-white rounded-2xl shadow-sm border p-6"><div className="text-3xl font-bold text-[#e8a838]">{invoices.filter(i=>i.status!=='betaald').length}</div><div className="text-sm text-gray-500">Openstaande facturen</div></div>
        </div>
      )}

      {tab === 'caravans' && (
        <div className="space-y-4">
          {caravans.length === 0 ? <div className="bg-white rounded-2xl shadow-sm border p-8 text-center text-gray-500">Geen caravans gevonden</div> :
          caravans.map(c => (
            <div key={c.id} className="bg-white rounded-2xl shadow-sm border p-5">
              <div className="flex items-center justify-between">
                <div><h3 className="font-semibold">{c.brand} {c.model}</h3><p className="text-sm text-gray-500">{c.license_plate}</p></div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${c.status === 'gestald' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{c.status}</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                <div><span className="text-gray-500 text-xs block">Locatie</span>{c.location_name || '-'}</div>
                <div><span className="text-gray-500 text-xs block">Plek</span>{c.spot_label || '-'}</div>
                <div><span className="text-gray-500 text-xs block">Verzekering verloopt</span><span className={c.insurance_expiry && new Date(c.insurance_expiry) < new Date() ? 'text-red-500 font-medium' : ''}>{fmtDate(c.insurance_expiry)}</span></div>
                <div><span className="text-gray-500 text-xs block">APK verloopt</span><span className={c.apk_expiry && new Date(c.apk_expiry) < new Date() ? 'text-red-500 font-medium' : ''}>{fmtDate(c.apk_expiry)}</span></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'contracten' && (
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b"><tr><th className="text-left px-4 py-3">Contract</th><th className="text-left px-4 py-3">Periode</th><th className="text-right px-4 py-3">Maandbedrag</th><th className="text-center px-4 py-3">Auto-verlenging</th><th className="text-center px-4 py-3">Status</th></tr></thead>
            <tbody className="divide-y">{contracts.map(c=><tr key={c.id} className="hover:bg-gray-50"><td className="px-4 py-3 font-mono text-xs">{c.contract_number}</td><td className="px-4 py-3 text-xs">{fmtDate(c.start_date)} - {fmtDate(c.end_date)}</td><td className="px-4 py-3 text-right font-medium">{fmt(c.monthly_rate)}</td><td className="px-4 py-3 text-center">{c.auto_renew ? '✅' : '❌'}</td><td className="px-4 py-3 text-center"><span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLORS[c.status] || 'bg-gray-100'}`}>{c.status}</span></td></tr>)}</tbody>
          </table>
        </div>
      )}

      {tab === 'facturen' && (
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b"><tr><th className="text-left px-4 py-3">Factuur</th><th className="text-left px-4 py-3">Omschrijving</th><th className="text-right px-4 py-3">Bedrag</th><th className="text-left px-4 py-3">Vervaldatum</th><th className="text-center px-4 py-3">Status</th></tr></thead>
            <tbody className="divide-y">{invoices.map(i=><tr key={i.id} className="hover:bg-gray-50"><td className="px-4 py-3 font-mono text-xs">{i.invoice_number}</td><td className="px-4 py-3 text-xs">{i.description || '-'}</td><td className="px-4 py-3 text-right font-medium">{fmt(i.total)}</td><td className="px-4 py-3 text-xs">{fmtDate(i.due_date)}</td><td className="px-4 py-3 text-center"><span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLORS[i.status] || 'bg-gray-100'}`}>{i.status}</span></td></tr>)}</tbody>
          </table>
        </div>
      )}

      {tab === 'diensten' && (
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h2 className="font-bold mb-4">Dienst aanvragen</h2>
          <p className="text-sm text-gray-500 mb-6">Vraag een reparatie, onderhoud, keuring, schoonmaak of transport aan voor uw caravan.</p>
          {!showServiceForm ? (
            <button onClick={()=>setShowServiceForm(true)} className="bg-[#1e3a5f] text-white font-semibold px-6 py-2.5 rounded-xl text-sm">Nieuw verzoek indienen</button>
          ) : (
            <form onSubmit={submitService} className="space-y-4 max-w-md">
              <div><label className="text-xs font-medium text-gray-500 block mb-1">Caravan *</label><select required value={serviceForm.caravan_id} onChange={e=>setServiceForm({...serviceForm,caravan_id:e.target.value})} className="w-full border rounded-xl px-3 py-2.5 text-sm"><option value="">Selecteer caravan</option>{caravans.map(c=><option key={c.id} value={c.id}>{c.brand} {c.model} - {c.license_plate}</option>)}</select></div>
              <div><label className="text-xs font-medium text-gray-500 block mb-1">Type dienst *</label><select required value={serviceForm.service_type} onChange={e=>setServiceForm({...serviceForm,service_type:e.target.value})} className="w-full border rounded-xl px-3 py-2.5 text-sm"><option value="reparatie">Reparatie</option><option value="onderhoud">Onderhoud</option><option value="keuring">Technische keuring</option><option value="schoonmaak">Schoonmaak</option><option value="transport">Transport</option></select></div>
              <div><label className="text-xs font-medium text-gray-500 block mb-1">Omschrijving *</label><textarea required value={serviceForm.description} onChange={e=>setServiceForm({...serviceForm,description:e.target.value})} className="w-full border rounded-xl px-3 py-2.5 text-sm" rows={4} placeholder="Beschrijf uw verzoek..."/></div>
              <div className="flex gap-3">
                <button type="button" onClick={()=>setShowServiceForm(false)} className="px-4 py-2.5 text-sm text-gray-500">Annuleren</button>
                <button type="submit" className="bg-[#1e3a5f] text-white font-semibold px-6 py-2.5 rounded-xl text-sm">Indienen</button>
              </div>
            </form>
          )}
        </div>
      )}
    </section>
  );
}
