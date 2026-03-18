'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { User, FileText, Receipt, Wrench, Truck, LogOut, Eye, EyeOff, Shield, Caravan, MapPin, Calendar, AlertCircle, CheckCircle2, Clock, Upload, CreditCard, Download, Bell, MessageSquare, Send, Activity } from 'lucide-react';

interface CustomerData { name: string; email: string; phone: string; customer_number: string; }
interface CaravanItem { id: number; brand: string; model: string; license_plate: string; status: string; location_name: string; spot_label: string; insurance_expiry: string; apk_expiry: string; }
interface Invoice { id: number; invoice_number: string; description: string; total: number; status: string; due_date: string; }
interface Contract { id: number; contract_number: string; start_date: string; end_date: string; monthly_rate: number; status: string; auto_renew: boolean; }

interface ConvItem { id: number; subject: string; status: string; unread_count: number; last_message: string; last_sender: string; last_message_at: string; }
interface ConvMsg { id: number; sender_type: string; sender_name: string; message: string; created_at: string; }

function CustomerMessagesTab() {
  const [convs, setConvs] = useState<ConvItem[]>([]);
  const [selected, setSelected] = useState<ConvItem | null>(null);
  const [msgs, setMsgs] = useState<ConvMsg[]>([]);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    fetch('/api/customer/conversations', { credentials: 'include' }).then(r => r.json()).then(d => setConvs(d.conversations || [])).catch(() => {});
  }, []);

  const openConv = async (c: ConvItem) => {
    setSelected(c);
    const res = await fetch(`/api/customer/conversations/${c.id}`, { credentials: 'include' });
    const data = await res.json();
    setMsgs(data.messages || []);
    setConvs(prev => prev.map(x => x.id === c.id ? { ...x, unread_count: 0 } : x));
  };

  const sendReply = async () => {
    if (!reply.trim() || !selected) return;
    setSending(true);
    await fetch(`/api/customer/conversations/${selected.id}`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: reply }) });
    setReply('');
    setSending(false);
    openConv(selected);
  };

  const createConv = async () => {
    if (!newSubject.trim() || !newMessage.trim()) return;
    setSending(true);
    await fetch('/api/customer/conversations', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subject: newSubject, message: newMessage }) });
    setSending(false);
    setShowNew(false);
    setNewSubject('');
    setNewMessage('');
    const res = await fetch('/api/customer/conversations', { credentials: 'include' });
    const data = await res.json();
    setConvs(data.conversations || []);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-surface-dark text-lg">Berichten</h2>
        <button onClick={() => setShowNew(true)} className="bg-primary hover:bg-primary-light text-white font-semibold px-4 py-2 rounded-xl text-sm flex items-center gap-2 transition-all"><Send size={14} /> Nieuw bericht</button>
      </div>

      {showNew && (
        <div className="bg-surface rounded-2xl border border-sand-dark/20 p-6 space-y-4">
          <input value={newSubject} onChange={e => setNewSubject(e.target.value)} placeholder="Onderwerp" className="w-full px-4 py-3 border border-sand-dark/30 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
          <textarea value={newMessage} onChange={e => setNewMessage(e.target.value)} rows={4} placeholder="Typ uw bericht..." className="w-full px-4 py-3 border border-sand-dark/30 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none" />
          <div className="flex gap-3">
            <button onClick={() => setShowNew(false)} className="text-sm text-warm-gray/70 px-4 py-2">Annuleren</button>
            <button onClick={createConv} disabled={sending} className="bg-primary text-white font-semibold px-5 py-2 rounded-xl text-sm disabled:opacity-50">Versturen</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="space-y-2">
          {convs.length === 0 ? (
            <div className="bg-surface rounded-2xl border border-sand-dark/20 p-8 text-center">
              <MessageSquare size={32} className="text-warm-gray/40 mx-auto mb-3" />
              <p className="text-sm text-warm-gray/70">Nog geen gesprekken</p>
            </div>
          ) : convs.map(c => (
            <button key={c.id} onClick={() => openConv(c)} className={`w-full text-left bg-surface rounded-xl border p-4 transition-all hover:shadow-md ${selected?.id === c.id ? 'border-primary shadow-md' : 'border-sand-dark/20'}`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-surface-dark truncate">{c.subject}</span>
                {Number(c.unread_count) > 0 && <span className="w-5 h-5 bg-primary text-white rounded-full text-[10px] font-bold flex items-center justify-center">{c.unread_count}</span>}
              </div>
              <p className="text-xs text-warm-gray/70 mt-1 truncate">{c.last_message?.substring(0, 60)}</p>
            </button>
          ))}
        </div>

        <div className="lg:col-span-2">
          {selected ? (
            <div className="bg-surface rounded-2xl border border-sand-dark/20 flex flex-col h-[500px]">
              <div className="p-4 border-b border-sand-dark/20">
                <h3 className="font-bold text-surface-dark text-sm">{selected.subject}</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {msgs.map(m => (
                  <div key={m.id} className={`flex ${m.sender_type === 'customer' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${m.sender_type === 'customer' ? 'bg-primary text-white' : 'bg-sand text-surface-dark'}`}>
                      <p className={`text-xs font-semibold mb-1 ${m.sender_type === 'customer' ? 'text-white/70' : 'text-warm-gray'}`}>{m.sender_name}</p>
                      <p className="text-sm whitespace-pre-wrap">{m.message}</p>
                      <p className={`text-[10px] mt-1 ${m.sender_type === 'customer' ? 'text-white/50' : 'text-warm-gray/70'}`}>
                        {new Date(m.created_at).toLocaleString('nl-NL', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-sand-dark/20 flex gap-2">
                <input value={reply} onChange={e => setReply(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') sendReply(); }} placeholder="Typ een reactie..." className="flex-1 px-4 py-2.5 border border-sand-dark/30 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                <button onClick={sendReply} disabled={sending || !reply.trim()} className="bg-primary text-white p-2.5 rounded-xl disabled:opacity-50"><Send size={16} /></button>
              </div>
            </div>
          ) : (
            <div className="bg-surface rounded-2xl border border-sand-dark/20 p-12 text-center h-[500px] flex flex-col items-center justify-center">
              <MessageSquare size={40} className="text-warm-gray/40 mb-3" />
              <p className="text-sm text-warm-gray/70">Selecteer een gesprek</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

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
  const STATUS_COLORS: Record<string,string> = { betaald: 'bg-accent/10 text-primary-dark border-accent/30', open: 'bg-ocean/10 text-ocean-dark border-ocean/30', verzonden: 'bg-warning/10 text-warning border-warning/30', actief: 'bg-accent/10 text-primary-dark border-accent/30', verlopen: 'bg-danger/10 text-danger border-danger/30' };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-sand/40"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;

  if (!auth) return (
    <>
      <Header />
      <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-sand/40 via-surface to-sand/60 p-4 relative overflow-hidden">
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="bg-surface rounded-3xl shadow-xl shadow-sand-dark/20 border border-sand-dark/20 p-8 sm:p-10 w-full max-w-md relative">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-light rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
              <Shield className="text-white" size={24}/>
            </div>
            <h1 className="text-2xl font-black text-surface-dark">{isRegister ? 'Account aanmaken' : 'Mijn Account'}</h1>
            <p className="text-sm text-warm-gray/70 mt-1">Caravanstalling Spanje</p>
          </div>
          {loginError && <div className="bg-danger/10 border border-danger/30 text-danger text-sm p-3 rounded-xl mb-5 flex items-center gap-2"><AlertCircle size={14}/>{loginError}</div>}
          {isRegister ? (
            <form onSubmit={register} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-semibold text-warm-gray/70 block mb-2">Voornaam *</label><input required value={registerForm.first_name} onChange={e=>setRegisterForm({...registerForm,first_name:e.target.value})} className="w-full border border-sand-dark/30 rounded-xl px-4 py-3 text-sm bg-sand/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"/></div>
                <div><label className="text-xs font-semibold text-warm-gray/70 block mb-2">Achternaam *</label><input required value={registerForm.last_name} onChange={e=>setRegisterForm({...registerForm,last_name:e.target.value})} className="w-full border border-sand-dark/30 rounded-xl px-4 py-3 text-sm bg-sand/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"/></div>
              </div>
              <div><label className="text-xs font-semibold text-warm-gray/70 block mb-2">E-mail *</label><input type="email" required value={registerForm.email} onChange={e=>setRegisterForm({...registerForm,email:e.target.value})} className="w-full border border-sand-dark/30 rounded-xl px-4 py-3 text-sm bg-sand/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"/></div>
              <div><label className="text-xs font-semibold text-warm-gray/70 block mb-2">Telefoon</label><input value={registerForm.phone} onChange={e=>setRegisterForm({...registerForm,phone:e.target.value})} className="w-full border border-sand-dark/30 rounded-xl px-4 py-3 text-sm bg-sand/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"/></div>
              <div><label className="text-xs font-semibold text-warm-gray/70 block mb-2">Wachtwoord *</label><div className="relative"><input type={showPw?'text':'password'} required minLength={8} value={registerForm.password} onChange={e=>setRegisterForm({...registerForm,password:e.target.value})} className="w-full border border-sand-dark/30 rounded-xl px-4 py-3 text-sm pr-10 bg-sand/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"/><button type="button" onClick={()=>setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-gray/50 hover:text-warm-gray">{showPw?<EyeOff size={16}/>:<Eye size={16}/>}</button></div></div>
              <button type="submit" className="w-full bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-primary/20">Registreren</button>
              <p className="text-center text-sm text-warm-gray/70">Al een account? <button type="button" onClick={()=>setIsRegister(false)} className="text-primary font-semibold hover:underline">Inloggen</button></p>
            </form>
          ) : (
            <form onSubmit={login} className="space-y-4">
              <div><label className="text-xs font-semibold text-warm-gray/70 block mb-2">E-mail</label><input type="email" required value={loginForm.email} onChange={e=>setLoginForm({...loginForm,email:e.target.value})} className="w-full border border-sand-dark/30 rounded-xl px-4 py-3 text-sm bg-sand/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"/></div>
              <div><label className="text-xs font-semibold text-warm-gray/70 block mb-2">Wachtwoord</label><div className="relative"><input type={showPw?'text':'password'} required value={loginForm.password} onChange={e=>setLoginForm({...loginForm,password:e.target.value})} className="w-full border border-sand-dark/30 rounded-xl px-4 py-3 text-sm pr-10 bg-sand/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"/><button type="button" onClick={()=>setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-gray/50 hover:text-warm-gray">{showPw?<EyeOff size={16}/>:<Eye size={16}/>}</button></div></div>
              <button type="submit" className="w-full bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-primary/20">Inloggen</button>
              <p className="text-center text-sm text-warm-gray/70">Nog geen account? <button type="button" onClick={()=>setIsRegister(true)} className="text-primary font-semibold hover:underline">Registreren</button></p>
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
    { id: 'berichten', label: 'Berichten', icon: MessageSquare },
    { id: 'documenten', label: 'Documenten', icon: Upload },
    { id: 'diensten', label: 'Diensten aanvragen', icon: Wrench },
  ];

  return (
    <>
      <Header />
      <section className="bg-primary-dark text-white py-12 sm:py-16 relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-20" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-2 text-primary text-sm font-semibold mb-3">
                <div className="w-8 h-px bg-primary" /> MIJN ACCOUNT
              </div>
              <h1 className="text-3xl md:text-4xl font-black">Welkom, {customer?.name}</h1>
              <p className="text-white/50 text-sm mt-2">Klantnummer: {customer?.customer_number}</p>
            </div>
            <button onClick={logout} className="flex items-center gap-2 text-sm text-white/40 hover:text-white bg-surface/5 border border-white/10 px-4 py-2.5 rounded-xl transition-all hover:bg-surface/10">
              <LogOut size={16}/> Uitloggen
            </button>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 -mt-6 relative z-10 pb-16 sm:pb-24">
        {/* Tabs */}
        <div className="flex gap-1.5 mb-8 overflow-x-auto pb-2 bg-surface rounded-2xl shadow-lg shadow-sand-dark/20 border border-sand-dark/20 p-1.5">
          {TABS.map(t => (
            <button key={t.id} onClick={()=>setTab(t.id)} className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${tab === t.id ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-warm-gray/70 hover:text-warm-gray hover:bg-sand/40'}`}>
              <t.icon size={16}/>{t.label}
            </button>
          ))}
        </div>

        {tab === 'overzicht' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { icon: Caravan, value: caravans.length, label: 'Gestalde caravans', color: 'from-ocean to-ocean-dark', bg: 'bg-ocean/10', text: 'text-ocean' },
                { icon: FileText, value: contracts.filter(c=>c.status==='actief').length, label: 'Actieve contracten', color: 'from-primary to-primary-dark', bg: 'bg-accent/10', text: 'text-accent' },
                { icon: Receipt, value: invoices.filter(i=>i.status!=='betaald').length, label: 'Openstaande facturen', color: 'from-warning to-warning', bg: 'bg-warning/10', text: 'text-warning' },
              ].map(s => (
                <div key={s.label} className="bg-surface rounded-2xl border border-sand-dark/20 p-6 hover:shadow-lg hover:shadow-sand-dark/20 transition-all">
                  <div className={`w-11 h-11 ${s.bg} rounded-xl flex items-center justify-center mb-4`}><s.icon size={20} className={s.text} /></div>
                  <p className="text-3xl font-black text-surface-dark">{s.value}</p>
                  <p className="text-sm text-warm-gray/70 mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Status Timeline */}
            <div className="bg-surface rounded-2xl border border-sand-dark/20 p-6">
              <h3 className="font-bold text-surface-dark flex items-center gap-2 mb-6"><Activity size={18} className="text-primary" /> Status tijdlijn</h3>
              <div className="space-y-0">
                {(() => {
                  const timeline: { icon: React.ElementType; label: string; date: string; status: 'done' | 'active' | 'upcoming'; color: string }[] = [];
                  
                  // Contract events
                  contracts.filter(c => c.status === 'actief').forEach(c => {
                    timeline.push({ icon: FileText, label: `Contract ${c.contract_number} gestart`, date: c.start_date, status: 'done', color: 'bg-accent/100' });
                    timeline.push({ icon: Calendar, label: `Contract ${c.contract_number} eindigt`, date: c.end_date, status: new Date(c.end_date) > new Date() ? 'upcoming' : 'done', color: 'bg-warning/100' });
                  });
                  
                  // Invoice events
                  invoices.slice(0, 5).forEach(inv => {
                    if (inv.status === 'betaald') {
                      timeline.push({ icon: CheckCircle2, label: `Factuur ${inv.invoice_number} betaald`, date: inv.due_date, status: 'done', color: 'bg-accent/100' });
                    } else {
                      timeline.push({ icon: Receipt, label: `Factuur ${inv.invoice_number} open (${fmt(inv.total)})`, date: inv.due_date, status: 'active', color: 'bg-ocean/100' });
                    }
                  });

                  // Caravan warnings
                  caravans.forEach(c => {
                    if (c.insurance_expiry && new Date(c.insurance_expiry) < new Date(Date.now() + 30 * 86400000)) {
                      timeline.push({ icon: AlertCircle, label: `Verzekering ${c.brand} ${c.model} verloopt`, date: c.insurance_expiry, status: 'active', color: 'bg-danger/100' });
                    }
                    if (c.apk_expiry && new Date(c.apk_expiry) < new Date(Date.now() + 30 * 86400000)) {
                      timeline.push({ icon: AlertCircle, label: `APK ${c.brand} ${c.model} verloopt`, date: c.apk_expiry, status: 'active', color: 'bg-danger/100' });
                    }
                  });

                  timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                  if (timeline.length === 0) return <p className="text-sm text-warm-gray/70">Geen recente activiteit</p>;

                  return timeline.slice(0, 8).map((item, i) => (
                    <div key={i} className="flex gap-4 relative">
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full ${item.color} flex items-center justify-center flex-shrink-0 ${item.status === 'upcoming' ? 'opacity-40' : ''}`}>
                          <item.icon size={14} className="text-white" />
                        </div>
                        {i < Math.min(timeline.length, 8) - 1 && <div className="w-px h-8 bg-sand-dark/30" />}
                      </div>
                      <div className={`pb-6 ${item.status === 'upcoming' ? 'opacity-50' : ''}`}>
                        <p className="text-sm font-medium text-surface-dark">{item.label}</p>
                        <p className="text-xs text-warm-gray/70">{fmtDate(item.date)}</p>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        )}

        {tab === 'caravans' && (
          <div className="space-y-4">
            {caravans.length === 0 ? (
              <div className="bg-surface rounded-2xl border border-sand-dark/20 p-12 text-center">
                <div className="w-14 h-14 bg-sand/40 rounded-2xl flex items-center justify-center mx-auto mb-4"><Caravan className="text-warm-gray/50" size={24}/></div>
                <p className="text-warm-gray/70 font-medium">Geen caravans gevonden</p>
              </div>
            ) : caravans.map(c => (
              <div key={c.id} className="bg-surface rounded-2xl border border-sand-dark/20 p-6 hover:shadow-lg hover:shadow-sand-dark/20 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-ocean/10 rounded-xl flex items-center justify-center"><Caravan size={18} className="text-ocean" /></div>
                    <div><h3 className="font-bold text-surface-dark">{c.brand} {c.model}</h3><p className="text-sm text-warm-gray/70">{c.license_plate}</p></div>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${c.status === 'gestald' ? 'bg-accent/10 text-primary-dark border-accent/30' : 'bg-ocean/10 text-ocean-dark border-ocean/30'}`}>{c.status}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {[
                    { icon: MapPin, label: 'Locatie', value: c.location_name || '-' },
                    { icon: MapPin, label: 'Plek', value: c.spot_label || '-' },
                    { icon: Calendar, label: 'Verzekering verloopt', value: fmtDate(c.insurance_expiry), warn: c.insurance_expiry && new Date(c.insurance_expiry) < new Date() },
                    { icon: Calendar, label: 'APK verloopt', value: fmtDate(c.apk_expiry), warn: c.apk_expiry && new Date(c.apk_expiry) < new Date() },
                  ].map(f => (
                    <div key={f.label} className="bg-sand/60 rounded-xl p-3">
                      <span className="text-warm-gray/70 text-[11px] font-medium block mb-0.5">{f.label}</span>
                      <span className={`font-medium ${f.warn ? 'text-danger' : 'text-surface-dark'}`}>{f.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'contracten' && (
          <div className="bg-surface rounded-2xl border border-sand-dark/20 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-sand/40 border-b border-sand-dark/20">
                <tr>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-warm-gray/70 uppercase tracking-wider">Contract</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-warm-gray/70 uppercase tracking-wider">Periode</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-warm-gray/70 uppercase tracking-wider">Maandbedrag</th>
                  <th className="text-center px-5 py-3.5 text-xs font-semibold text-warm-gray/70 uppercase tracking-wider">Auto-verlenging</th>
                  <th className="text-center px-5 py-3.5 text-xs font-semibold text-warm-gray/70 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-dark/10">{contracts.map(c=>(
                <tr key={c.id} className="hover:bg-sand/30 transition-colors">
                  <td className="px-5 py-4 font-mono text-xs text-warm-gray">{c.contract_number}</td>
                  <td className="px-5 py-4 text-xs text-warm-gray">{fmtDate(c.start_date)} — {fmtDate(c.end_date)}</td>
                  <td className="px-5 py-4 text-right font-bold text-surface-dark">{fmt(c.monthly_rate)}</td>
                  <td className="px-5 py-4 text-center">{c.auto_renew ? <CheckCircle2 size={16} className="text-accent mx-auto"/> : <Clock size={16} className="text-warm-gray/50 mx-auto"/>}</td>
                  <td className="px-5 py-4 text-center"><span className={`text-xs font-semibold px-3 py-1 rounded-full border ${STATUS_COLORS[c.status] || 'bg-sand/40 text-warm-gray border-sand-dark/30'}`}>{c.status}</span></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}

        {tab === 'facturen' && (
          <div className="bg-surface rounded-2xl border border-sand-dark/20 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-sand/40 border-b border-sand-dark/20">
                <tr>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-warm-gray/70 uppercase tracking-wider">Factuur</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-warm-gray/70 uppercase tracking-wider">Omschrijving</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-warm-gray/70 uppercase tracking-wider">Bedrag</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-warm-gray/70 uppercase tracking-wider">Vervaldatum</th>
                  <th className="text-center px-5 py-3.5 text-xs font-semibold text-warm-gray/70 uppercase tracking-wider">Status</th>
                  <th className="text-center px-5 py-3.5 text-xs font-semibold text-warm-gray/70 uppercase tracking-wider">Actie</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-dark/10">{invoices.map(i=>(
                <tr key={i.id} className="hover:bg-sand/30 transition-colors">
                  <td className="px-5 py-4 font-mono text-xs text-warm-gray">{i.invoice_number}</td>
                  <td className="px-5 py-4 text-xs text-warm-gray">{i.description || '-'}</td>
                  <td className="px-5 py-4 text-right font-bold text-surface-dark">{fmt(i.total)}</td>
                  <td className="px-5 py-4 text-xs text-warm-gray">{fmtDate(i.due_date)}</td>
                  <td className="px-5 py-4 text-center"><span className={`text-xs font-semibold px-3 py-1 rounded-full border ${STATUS_COLORS[i.status] || 'bg-sand/40 text-warm-gray border-sand-dark/30'}`}>{i.status}</span></td>
                  <td className="px-5 py-4 text-center">
                    {i.status !== 'betaald' && (
                      <button onClick={() => window.open(`/api/customer/invoices?pay=${i.id}`, '_blank')} className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-dark transition-colors">
                        <CreditCard size={12} /> Betalen
                      </button>
                    )}
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}

        {tab === 'documenten' && (
          <div className="bg-surface rounded-2xl border border-sand-dark/20 p-8">
            <h2 className="font-bold text-surface-dark text-lg mb-2">Documenten</h2>
            <p className="text-sm text-warm-gray/70 mb-8">Upload verzekeringspapieren, APK-rapporten en andere documenten voor uw caravan(s).</p>

            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {['Verzekeringsbewijs', 'APK-keuring', 'Kentekenbewijs', 'Anders'].map(docType => (
                <label key={docType} className="flex items-center gap-4 p-5 border-2 border-dashed border-sand-dark/30 rounded-2xl hover:border-primary/30 hover:bg-primary/[0.02] transition-all cursor-pointer group">
                  <div className="w-11 h-11 bg-sand/40 rounded-xl flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <Upload size={18} className="text-warm-gray/70 group-hover:text-primary transition-colors" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-surface-dark">{docType}</p>
                    <p className="text-[11px] text-warm-gray/70">PDF, JPG of PNG (max 10MB)</p>
                  </div>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const formData = new FormData();
                    formData.append('file', file);
                    formData.append('type', docType);
                    try {
                      const res = await fetch('/api/customer/documents', { method: 'POST', body: formData, credentials: 'include' });
                      if (res.ok) { alert('Document geüpload!'); } else { alert('Upload mislukt'); }
                    } catch { alert('Er ging iets mis'); }
                  }} />
                </label>
              ))}
            </div>

            <div className="border-t border-sand-dark/20 pt-6">
              <h3 className="text-sm font-semibold text-warm-gray mb-4">Geüploade documenten</h3>
              <div className="text-center py-8">
                <FileText size={32} className="text-warm-gray/40 mx-auto mb-3" />
                <p className="text-sm text-warm-gray/70">Nog geen documenten geüpload</p>
              </div>
            </div>
          </div>
        )}

        {tab === 'berichten' && <CustomerMessagesTab />}

        {tab === 'diensten' && (
          <div className="bg-surface rounded-2xl border border-sand-dark/20 p-8">
            <h2 className="font-bold text-surface-dark text-lg mb-2">Dienst aanvragen</h2>
            <p className="text-sm text-warm-gray/70 mb-8">Vraag een reparatie, onderhoud, keuring, schoonmaak of transport aan voor uw caravan.</p>
            {!showServiceForm ? (
              <button onClick={()=>setShowServiceForm(true)} className="bg-primary hover:bg-primary-light text-white font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-lg shadow-primary/10 inline-flex items-center gap-2">
                <Wrench size={16}/> Nieuw verzoek indienen
              </button>
            ) : (
              <form onSubmit={submitService} className="space-y-5 max-w-lg">
                <div><label className="text-xs font-semibold text-warm-gray/70 block mb-2">Caravan *</label><select required value={serviceForm.caravan_id} onChange={e=>setServiceForm({...serviceForm,caravan_id:e.target.value})} className="w-full border border-sand-dark/30 rounded-xl px-4 py-3 text-sm bg-sand/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"><option value="">Selecteer caravan</option>{caravans.map(c=><option key={c.id} value={c.id}>{c.brand} {c.model} - {c.license_plate}</option>)}</select></div>
                <div><label className="text-xs font-semibold text-warm-gray/70 block mb-2">Type dienst *</label><select required value={serviceForm.service_type} onChange={e=>setServiceForm({...serviceForm,service_type:e.target.value})} className="w-full border border-sand-dark/30 rounded-xl px-4 py-3 text-sm bg-sand/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"><option value="reparatie">Reparatie</option><option value="onderhoud">Onderhoud</option><option value="keuring">Technische keuring</option><option value="schoonmaak">Schoonmaak</option><option value="transport">Transport</option></select></div>
                <div><label className="text-xs font-semibold text-warm-gray/70 block mb-2">Omschrijving *</label><textarea required value={serviceForm.description} onChange={e=>setServiceForm({...serviceForm,description:e.target.value})} className="w-full border border-sand-dark/30 rounded-xl px-4 py-3 text-sm bg-sand/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none transition-all" rows={4} placeholder="Beschrijf uw verzoek..."/></div>
                <div className="flex gap-3">
                  <button type="button" onClick={()=>setShowServiceForm(false)} className="px-5 py-3 text-sm text-warm-gray/70 hover:text-warm-gray font-medium transition-colors">Annuleren</button>
                  <button type="submit" className="bg-primary hover:bg-primary-light text-white font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-lg shadow-primary/10">Indienen</button>
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
