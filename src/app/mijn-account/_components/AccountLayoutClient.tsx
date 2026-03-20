'use client';
import { useState, Suspense } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { User, LogOut, Eye, EyeOff, Shield, Caravan, AlertCircle, CheckCircle2, MessageSquare, KeyRound, Wrench, Settings } from 'lucide-react';
import { AccountProvider, useAccount } from './AccountContext';
import NotificationCenter from '@/components/NotificationCenter';

const NAV = [
  { href: '/mijn-account', label: 'Overzicht', icon: User },
  { href: '/mijn-account/caravans', label: 'Mijn Caravans', icon: Caravan },
  { href: '/mijn-account/berichten', label: 'Berichten', icon: MessageSquare },
  { href: '/mijn-account/aanvragen', label: 'Aanvragen', icon: Wrench },
  { href: '/mijn-account/profiel', label: 'Profiel', icon: Settings },
];

function AuthGate({ children }: { children: React.ReactNode }) {
  const { auth, loading, customer, logout, setAuth, setCustomer } = useAccount();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const resetToken = searchParams.get('reset');

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ first_name: '', last_name: '', email: '', phone: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [resetForm, setResetForm] = useState({ password: '', confirm: '' });
  const [resetMsg, setResetMsg] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault(); setForgotLoading(true); setForgotMsg('');
    try {
      await fetch('/api/customer/auth/forgot-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: forgotEmail }) });
      setForgotMsg('Als dit e-mailadres bij ons bekend is, ontvangt u een resetlink.');
    } catch { setForgotMsg('Er ging iets mis. Probeer het opnieuw.'); }
    setForgotLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resetForm.password !== resetForm.confirm) { setResetMsg('Wachtwoorden komen niet overeen'); return; }
    if (resetForm.password.length < 8) { setResetMsg('Wachtwoord moet minimaal 8 tekens zijn'); return; }
    setResetLoading(true); setResetMsg('');
    try {
      const res = await fetch('/api/customer/auth/reset-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: resetToken, password: resetForm.password }), credentials: 'include' });
      if (res.ok) {
        setResetSuccess(true); setResetMsg('Wachtwoord succesvol ingesteld! U wordt doorgestuurd...');
        setTimeout(() => { window.location.href = '/mijn-account'; }, 2000);
      } else { const d = await res.json(); setResetMsg(d.error || 'Ongeldige of verlopen link'); }
    } catch { setResetMsg('Er ging iets mis'); }
    setResetLoading(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;

  // Not authenticated — show login/register/forgot/reset
  if (!auth) {
    if (resetToken && !resetSuccess) return (
      <>
        <Header />
        <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-gray-100 via-surface to-gray-100 p-4">
          <div className="bg-surface rounded-3xl shadow-xl shadow-gray-200/30 border border-gray-200 p-8 sm:p-10 w-full max-w-md">
            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-light rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20"><KeyRound className="text-white" size={24}/></div>
              <h1 className="text-2xl font-bold text-gray-900">Wachtwoord instellen</h1>
              <p className="text-sm text-gray-500/70 mt-1">Stel uw nieuwe wachtwoord in</p>
            </div>
            {resetMsg && <div className={`text-sm p-3 rounded-xl mb-5 flex items-center gap-2 ${resetSuccess ? 'bg-accent/10 border border-accent/30 text-primary-dark' : 'bg-danger/10 border border-danger/30 text-danger'}`}>{resetSuccess ? <CheckCircle2 size={14}/> : <AlertCircle size={14}/>}{resetMsg}</div>}
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div><label className="text-sm font-semibold text-gray-500/70 block mb-2">Nieuw wachtwoord</label><input type="password" required minLength={8} value={resetForm.password} onChange={e=>setResetForm({...resetForm,password:e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"/></div>
              <div><label className="text-sm font-semibold text-gray-500/70 block mb-2">Herhaal wachtwoord</label><input type="password" required minLength={8} value={resetForm.confirm} onChange={e=>setResetForm({...resetForm,confirm:e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"/></div>
              <button type="submit" disabled={resetLoading} className="w-full bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-primary/20 disabled:opacity-50">{resetLoading ? 'Bezig...' : 'Wachtwoord instellen'}</button>
            </form>
          </div>
        </div>
        <Footer />
      </>
    );

    return (
      <>
        <Header />
        <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-gray-100 via-surface to-gray-100 p-4 relative overflow-hidden">
          <div className="absolute top-20 right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
          <div className="bg-surface rounded-3xl shadow-xl shadow-gray-200/30 border border-gray-200 p-6 sm:p-10 w-full max-w-md relative">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-light rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20"><Shield className="text-white" size={24}/></div>
              {showForgot ? (
                <><h1 className="text-2xl font-bold text-gray-900">Wachtwoord vergeten</h1><p className="text-sm text-gray-500/70 mt-1">Vul uw e-mailadres in voor een resetlink</p></>
              ) : (
                <><h1 className="text-2xl font-bold text-gray-900">Mijn Account</h1><p className="text-sm text-gray-500/70 mt-1">Caravanstalling Spanje</p></>
              )}
            </div>

            {!showForgot && (
              <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
                <button type="button" onClick={() => { setIsRegister(false); setLoginError(''); }} className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${!isRegister ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500/60 hover:text-gray-500'}`}>Inloggen</button>
                <button type="button" onClick={() => { setIsRegister(true); setLoginError(''); }} className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${isRegister ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500/60 hover:text-gray-500'}`}>Registreren</button>
              </div>
            )}

            {loginError && <div className="bg-danger/10 border border-danger/30 text-danger text-sm p-3 rounded-xl mb-5 flex items-center gap-2"><AlertCircle size={14}/>{loginError}</div>}
            {showForgot ? (
              <div className="space-y-4">
                {forgotMsg && <div className="bg-accent/10 border border-accent/30 text-primary-dark text-sm p-3 rounded-xl flex items-center gap-2"><CheckCircle2 size={14}/>{forgotMsg}</div>}
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div><label className="text-sm font-semibold text-gray-500/70 block mb-2">E-mailadres</label><input type="email" required value={forgotEmail} onChange={e=>setForgotEmail(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="uw@email.nl"/></div>
                  <button type="submit" disabled={forgotLoading} className="w-full bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-primary/20 disabled:opacity-50">{forgotLoading ? 'Verzenden...' : 'Resetlink versturen'}</button>
                </form>
                <p className="text-center text-sm text-gray-500/70">Weet u uw wachtwoord? <button type="button" onClick={()=>{setShowForgot(false);setForgotMsg('');}} className="text-primary font-semibold hover:underline">Terug naar inloggen</button></p>
              </div>
            ) : isRegister ? (
              <form onSubmit={register} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-sm font-semibold text-gray-500/70 block mb-2">Voornaam *</label><input required value={registerForm.first_name} onChange={e=>setRegisterForm({...registerForm,first_name:e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="Jan"/></div>
                  <div><label className="text-sm font-semibold text-gray-500/70 block mb-2">Achternaam *</label><input required value={registerForm.last_name} onChange={e=>setRegisterForm({...registerForm,last_name:e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="Janssen"/></div>
                </div>
                <div><label className="text-sm font-semibold text-gray-500/70 block mb-2">E-mail *</label><input type="email" required value={registerForm.email} onChange={e=>setRegisterForm({...registerForm,email:e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="uw@email.nl"/></div>
                <div><label className="text-sm font-semibold text-gray-500/70 block mb-2">Telefoon</label><input value={registerForm.phone} onChange={e=>setRegisterForm({...registerForm,phone:e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="+31 6 12345678"/></div>
                <div><label className="text-sm font-semibold text-gray-500/70 block mb-2">Wachtwoord *</label><div className="relative"><input type={showPw?'text':'password'} required minLength={8} value={registerForm.password} onChange={e=>setRegisterForm({...registerForm,password:e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm pr-12 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="Min. 8 tekens"/><button type="button" onClick={()=>setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500/50 hover:text-gray-500 p-1" aria-label={showPw?"Wachtwoord verbergen":"Wachtwoord tonen"}>{showPw?<EyeOff size={18}/>:<Eye size={18}/>}</button></div></div>
                <button type="submit" className="w-full bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-primary/20">Registreren</button>
              </form>
            ) : (
              <form onSubmit={login} className="space-y-4">
                <div><label className="text-sm font-semibold text-gray-500/70 block mb-2">E-mail</label><input type="email" required value={loginForm.email} onChange={e=>setLoginForm({...loginForm,email:e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="uw@email.nl"/></div>
                <div><label className="text-sm font-semibold text-gray-500/70 block mb-2">Wachtwoord</label><div className="relative"><input type={showPw?'text':'password'} required value={loginForm.password} onChange={e=>setLoginForm({...loginForm,password:e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm pr-12 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="Uw wachtwoord"/><button type="button" onClick={()=>setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500/50 hover:text-gray-500 p-1" aria-label={showPw?"Wachtwoord verbergen":"Wachtwoord tonen"}>{showPw?<EyeOff size={18}/>:<Eye size={18}/>}</button></div></div>
                <button type="submit" className="w-full bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-primary/20">Inloggen</button>
                <button type="button" onClick={()=>setShowForgot(true)} className="w-full text-center text-sm text-gray-500/60 hover:text-primary transition-colors py-1">Wachtwoord vergeten?</button>
              </form>
            )}
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Authenticated view
  return (
    <>
      <Header />
      <section className="bg-primary-dark text-white py-10 sm:py-14 relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-20" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-2 text-primary text-sm font-semibold mb-3">
                <div className="w-8 h-px bg-primary" /> MIJN ACCOUNT
              </div>
              <h1 className="text-3xl md:text-4xl font-bold">Welkom, {customer?.name}</h1>
              <p className="text-white/70 text-sm mt-2">Klantnummer: {customer?.customer_number}</p>
            </div>
            <button onClick={logout} className="hidden sm:flex items-center gap-2 text-sm text-white/60 hover:text-white bg-surface/5 border border-white/10 px-4 py-2.5 rounded-xl transition-all hover:bg-surface/10">
              <LogOut size={16}/> Uitloggen
            </button>
            <div className="hidden sm:block"><NotificationCenter userType="customer" /></div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 -mt-6 relative z-10 pb-24 lg:pb-16">
        <div className="flex gap-6">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-56 shrink-0">
            <nav className="bg-surface rounded-2xl shadow-lg shadow-gray-200/30 border border-gray-200 p-2 sticky top-24">
              {NAV.map(item => {
                const active = item.href === '/mijn-account' ? pathname === '/mijn-account' : pathname.startsWith(item.href);
                return (
                  <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all mb-1 ${active ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-gray-500/70 hover:text-gray-500 hover:bg-gray-50'}`}>
                    <item.icon size={18} />{item.label}
                  </Link>
                );
              })}
              <hr className="my-2 border-gray-200" />
              <button onClick={logout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-500/50 hover:text-danger hover:bg-danger/5 transition-all w-full">
                <LogOut size={18} /> Uitloggen
              </button>
            </nav>
          </aside>

          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </section>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-surface border-t border-gray-200 z-50">
        <div className="flex justify-around py-1 pb-[env(safe-area-inset-bottom)]">
          {NAV.map(item => {
            const active = item.href === '/mijn-account' ? pathname === '/mijn-account' : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} className={`flex flex-col items-center gap-0.5 py-2 px-3 min-w-[60px] min-h-[48px] justify-center rounded-xl transition-all ${active ? 'text-primary' : 'text-gray-500/50'}`}>
                <item.icon size={20} />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <Footer />
    </>
  );
}

function LayoutInner({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>}>
      <AuthGate>{children}</AuthGate>
    </Suspense>
  );
}

export default function AccountLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <AccountProvider>
      <LayoutInner>{children}</LayoutInner>
    </AccountProvider>
  );
}
