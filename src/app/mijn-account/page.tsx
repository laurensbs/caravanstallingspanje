'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { User, FileText, Receipt, Wrench, Truck, LogOut, Eye, EyeOff, Shield, Caravan, MapPin, Calendar, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

interface CustomerData { name: string; email: string; phone: string; customer_number: string; }
interface CaravanItem { id: number; brand: string; model: string; license_plate: string; status: string; location_name: string; spot_label: string; insurance_expiry: string; apk_expiry: string; }
interface Invoice { id: number; invoice_number: string; description: string; total: number; status: string; due_date: string; }
interface Contract { id: number; contract_number: string; start_date: string; end_date: string; monthly_rate: number; status: string; auto_renew: boolean; }

export default function MijnAccountPage() {
  const [auth, setAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overzicht');
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [caravans, setCaravans] = useState<CaravanItem[]>([]);
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
  const STATUS_COLORS: Record<string,string> = { betaald: 'bg-emerald-50 text-emerald-700 border-emerald-200', open: 'bg-blue-50 text-blue-700 border-blue-200', verzonden: 'bg-amber-50 text-amber-700 border-amber-200', actief: 'bg-emerald-50 text-emerald-700 border-emerald-200', verlopen: 'bg-red-50 text-red-700 border-red-200' };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin w-8 h-8 border-2 border-sky-800 border-t-transparent rounded-full" /></div>;

  if (!auth) return (
    <>
      <Header />
      <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-sky-50 p-4 relative overflow-hidden">
        <div className="absolute top-20 right-20 w-72 h-72 bg-sky-100/40 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-amber-100/30 rounded-full blur-3xl" />
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-10 w-full max-w-md relative">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-sky-700 to-sky-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-sky-800/20">
              <Shield className="text-white" size={24}/>
            </div>
            <h1 className="text-2xl font-black text-slate-900">{isRegister ? 'Account aanmaken' : 'Mijn Account'}</h1>
            <p className="text-sm text-slate-400 mt-1">Caravanstalling Spanje</p>
          </div>
          {loginError && <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-xl mb-5 flex items-center gap-2"><AlertCircle size={14}/>{loginError}</div>}
          {isRegister ? (
            <form onSubmit={register} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-semibold text-slate-400 block mb-2">Voornaam *</label><input required value={registerForm.first_name} onChange={e=>setRegisterForm({...registerForm,first_name:e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-sky-800/20 focus:border-sky-800 transition-all"/></div>
                <div><label className="text-xs font-semibold text-slate-400 block mb-2">Achternaam *</label><input required value={registerForm.last_name} onChange={e=>setRegisterForm({...registerForm,last_name:e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-sky-800/20 focus:border-sky-800 transition-all"/></div>
              </div>
              <div><label className="text-xs font-semibold text-slate-400 block mb-2">E-mail *</label><input type="email" required value={registerForm.email} onChange={e=>setRegisterForm({...registerForm,email:e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-sky-800/20 focus:border-sky-800 transition-all"/></div>
              <div><label className="text-xs font-semibold text-slate-400 block mb-2">Telefoon</label><input value={registerForm.phone} onChange={e=>setRegisterForm({...registerForm,phone:e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-sky-800/20 focus:border-sky-800 transition-all"/></div>
              <div><label className="text-xs font-semibold text-slate-400 block mb-2">Wachtwoord *</label><div className="relative"><input type={showPw?'text':'password'} required minLength={8} value={registerForm.password} onChange={e=>setRegisterForm({...registerForm,password:e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm pr-10 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-sky-800/20 focus:border-sky-800 transition-all"/><button type="button" onClick={()=>setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">{showPw?<EyeOff size={16}/>:<Eye size={16}/>}</button></div></div>
              <button type="submit" className="w-full bg-gradient-to-r from-sky-700 to-sky-800 hover:from-sky-800 hover:to-sky-900 text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-sky-800/20">Registreren</button>
              <p className="text-center text-sm text-slate-400">Al een account? <button type="button" onClick={()=>setIsRegister(false)} className="text-sky-700 font-semibold hover:underline">Inloggen</button></p>
            </form>
          ) : (
            <form onSubmit={login} className="space-y-4">
              <div><label className="text-xs font-semibold text-slate-400 block mb-2">E-mail</label><input type="email" required value={loginForm.email} onChange={e=>setLoginForm({...loginForm,email:e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-sky-800/20 focus:border-sky-800 transition-all"/></div>
              <div><label className="text-xs font-semibold text-slate-400 block mb-2">Wachtwoord</label><div className="relative"><input type={showPw?'text':'password'} required value={loginForm.password} onChange={e=>setLoginForm({...loginForm,password:e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm pr-10 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-sky-800/20 focus:border-sky-800 transition-all"/><button type="button" onClick={()=>setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">{showPw?<EyeOff size={16}/>:<Eye size={16}/>}</button></div></div>
              <button type="submit" className="w-full bg-gradient-to-r from-sky-700 to-sky-800 hover:from-sky-800 hover:to-sky-900 text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-sky-800/20">Inloggen</button>
              <p className="text-center text-sm text-slate-400">Nog geen account? <button type="button" onClick={()=>setIsRegister(true)} className="text-sky-700 font-semibold hover:underline">Registreren</button></p>
            </form>
          )}
        </div>
      </div>
      <Footer />
    </>
  );

  const TABS = [
    { id: 'overzicht', label: 'Overzicht', icon: User },
    { id: 'caravans', label: 'Mijn caravans', icon: Caravan },
    { id: 'contracten', label: 'Contracten', icon: FileText },
    { id: 'facturen', label: 'Facturen', icon: Receipt },
    { id: 'diensten', label: 'Diensten aanvragen', icon: Wrench },
  ];

  return (
    <>
      <Header />
      <section className="gradient-bg text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 pattern-overlay" />
        <div className="relative max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-2 text-amber-400 text-sm font-semibold mb-3">
                <div className="w-8 h-px bg-amber-400" /> MIJN ACCOUNT
              </div>
              <h1 className="text-3xl md:text-4xl font-black">Welkom, {customer?.name}</h1>
              <p className="text-white/50 text-sm mt-2">Klantnummer: {customer?.customer_number}</p>
            </div>
            <button onClick={logout} className="flex items-center gap-2 text-sm text-white/40 hover:text-white bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl transition-all hover:bg-white/10">
              <LogOut size={16}/> Uitloggen
            </button>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 -mt-6 relative z-10 pb-24">
        {/* Tabs */}
        <div className="flex gap-1.5 mb-8 overflow-x-auto pb-2 bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 p-1.5">
          {TABS.map(t => (
            <button key={t.id} onClick={()=>setTab(t.id)} className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${tab === t.id ? 'bg-sky-800 text-white shadow-md shadow-sky-800/20' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}>
              <t.icon size={16}/>{t.label}
            </button>
          ))}
        </div>

        {tab === 'overzicht' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon: Caravan, value: caravans.length, label: 'Gestalde caravans', color: 'from-sky-500 to-sky-600', bg: 'bg-sky-50', text: 'text-sky-600' },
              { icon: FileText, value: contracts.filter(c=>c.status==='actief').length, label: 'Actieve contracten', color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50', text: 'text-emerald-600' },
              { icon: Receipt, value: invoices.filter(i=>i.status!=='betaald').length, label: 'Openstaande facturen', color: 'from-amber-500 to-amber-600', bg: 'bg-amber-50', text: 'text-amber-600' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-lg hover:shadow-slate-200/50 transition-all">
                <div className={`w-11 h-11 ${s.bg} rounded-xl flex items-center justify-center mb-4`}><s.icon size={20} className={s.text} /></div>
                <p className="text-3xl font-black text-slate-900">{s.value}</p>
                <p className="text-sm text-slate-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {tab === 'caravans' && (
          <div className="space-y-4">
            {caravans.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4"><Caravan className="text-slate-300" size={24}/></div>
                <p className="text-slate-400 font-medium">Geen caravans gevonden</p>
              </div>
            ) : caravans.map(c => (
              <div key={c.id} className="bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-lg hover:shadow-slate-200/50 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-sky-50 rounded-xl flex items-center justify-center"><Caravan size={18} className="text-sky-600" /></div>
                    <div><h3 className="font-bold text-slate-900">{c.brand} {c.model}</h3><p className="text-sm text-slate-400">{c.license_plate}</p></div>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${c.status === 'gestald' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>{c.status}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {[
                    { icon: MapPin, label: 'Locatie', value: c.location_name || '-' },
                    { icon: MapPin, label: 'Plek', value: c.spot_label || '-' },
                    { icon: Calendar, label: 'Verzekering verloopt', value: fmtDate(c.insurance_expiry), warn: c.insurance_expiry && new Date(c.insurance_expiry) < new Date() },
                    { icon: Calendar, label: 'APK verloopt', value: fmtDate(c.apk_expiry), warn: c.apk_expiry && new Date(c.apk_expiry) < new Date() },
                  ].map(f => (
                    <div key={f.label} className="bg-slate-50/80 rounded-xl p-3">
                      <span className="text-slate-400 text-[11px] font-medium block mb-0.5">{f.label}</span>
                      <span className={`font-medium ${f.warn ? 'text-red-500' : 'text-slate-700'}`}>{f.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'contracten' && (
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Contract</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Periode</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Maandbedrag</th>
                  <th className="text-center px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Auto-verlenging</th>
                  <th className="text-center px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">{contracts.map(c=>(
                <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4 font-mono text-xs text-slate-500">{c.contract_number}</td>
                  <td className="px-5 py-4 text-xs text-slate-600">{fmtDate(c.start_date)} — {fmtDate(c.end_date)}</td>
                  <td className="px-5 py-4 text-right font-bold text-slate-800">{fmt(c.monthly_rate)}</td>
                  <td className="px-5 py-4 text-center">{c.auto_renew ? <CheckCircle2 size={16} className="text-emerald-500 mx-auto"/> : <Clock size={16} className="text-slate-300 mx-auto"/>}</td>
                  <td className="px-5 py-4 text-center"><span className={`text-xs font-semibold px-3 py-1 rounded-full border ${STATUS_COLORS[c.status] || 'bg-slate-50 text-slate-500 border-slate-200'}`}>{c.status}</span></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}

        {tab === 'facturen' && (
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Factuur</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Omschrijving</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Bedrag</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Vervaldatum</th>
                  <th className="text-center px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">{invoices.map(i=>(
                <tr key={i.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4 font-mono text-xs text-slate-500">{i.invoice_number}</td>
                  <td className="px-5 py-4 text-xs text-slate-600">{i.description || '-'}</td>
                  <td className="px-5 py-4 text-right font-bold text-slate-800">{fmt(i.total)}</td>
                  <td className="px-5 py-4 text-xs text-slate-600">{fmtDate(i.due_date)}</td>
                  <td className="px-5 py-4 text-center"><span className={`text-xs font-semibold px-3 py-1 rounded-full border ${STATUS_COLORS[i.status] || 'bg-slate-50 text-slate-500 border-slate-200'}`}>{i.status}</span></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}

        {tab === 'diensten' && (
          <div className="bg-white rounded-2xl border border-slate-100 p-8">
            <h2 className="font-bold text-slate-900 text-lg mb-2">Dienst aanvragen</h2>
            <p className="text-sm text-slate-400 mb-8">Vraag een reparatie, onderhoud, keuring, schoonmaak of transport aan voor uw caravan.</p>
            {!showServiceForm ? (
              <button onClick={()=>setShowServiceForm(true)} className="bg-sky-800 hover:bg-sky-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-lg shadow-sky-800/10 inline-flex items-center gap-2">
                <Wrench size={16}/> Nieuw verzoek indienen
              </button>
            ) : (
              <form onSubmit={submitService} className="space-y-5 max-w-lg">
                <div><label className="text-xs font-semibold text-slate-400 block mb-2">Caravan *</label><select required value={serviceForm.caravan_id} onChange={e=>setServiceForm({...serviceForm,caravan_id:e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-sky-800/20 focus:border-sky-800 transition-all"><option value="">Selecteer caravan</option>{caravans.map(c=><option key={c.id} value={c.id}>{c.brand} {c.model} - {c.license_plate}</option>)}</select></div>
                <div><label className="text-xs font-semibold text-slate-400 block mb-2">Type dienst *</label><select required value={serviceForm.service_type} onChange={e=>setServiceForm({...serviceForm,service_type:e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-sky-800/20 focus:border-sky-800 transition-all"><option value="reparatie">Reparatie</option><option value="onderhoud">Onderhoud</option><option value="keuring">Technische keuring</option><option value="schoonmaak">Schoonmaak</option><option value="transport">Transport</option></select></div>
                <div><label className="text-xs font-semibold text-slate-400 block mb-2">Omschrijving *</label><textarea required value={serviceForm.description} onChange={e=>setServiceForm({...serviceForm,description:e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-sky-800/20 focus:border-sky-800 resize-none transition-all" rows={4} placeholder="Beschrijf uw verzoek..."/></div>
                <div className="flex gap-3">
                  <button type="button" onClick={()=>setShowServiceForm(false)} className="px-5 py-3 text-sm text-slate-400 hover:text-slate-600 font-medium transition-colors">Annuleren</button>
                  <button type="submit" className="bg-sky-800 hover:bg-sky-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-lg shadow-sky-800/10">Indienen</button>
                </div>
              </form>
            )}
          </div>
        )}
      </section>
      <Footer />
    </>
  );
}
