'use client';

import { useState, useEffect, ReactNode } from 'react';
import { LayoutDashboard, ClipboardList, Search as SearchIcon, MapPin, LogOut, Menu, X, Eye, EyeOff, Wrench } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/staff', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/staff/taken', label: 'Mijn taken', icon: ClipboardList },
  { href: '/staff/inspecties', label: 'Inspecties', icon: SearchIcon },
  { href: '/staff/terrein', label: 'Terreinoverzicht', icon: MapPin },
];

export default function StaffLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [authenticated, setAuthenticated] = useState(false);
  const [staffName, setStaffName] = useState('');
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    fetch('/api/staff/auth/me', { credentials: 'include' })
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(d => { setAuthenticated(true); setStaffName(d.name || ''); })
      .catch(() => setAuthenticated(false))
      .finally(() => setLoading(false));
  }, []);

  const login = async (e: React.FormEvent) => {
    e.preventDefault(); setLoginError('');
    const res = await fetch('/api/staff/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(loginForm), credentials: 'include' });
    if (res.ok) { const d = await res.json(); setAuthenticated(true); setStaffName(d.name || ''); }
    else { const d = await res.json(); setLoginError(d.error || 'Inloggen mislukt'); }
  };

  const logout = async () => {
    await fetch('/api/staff/auth/logout', { method: 'POST', credentials: 'include' });
    setAuthenticated(false); setStaffName('');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin w-10 h-10 border-2 border-emerald-400 border-t-transparent rounded-full" />
        <p className="text-white/40 text-sm">Laden...</p>
      </div>
    </div>
  );

  if (!authenticated) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-emerald-900/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-sky-900/10 rounded-full blur-3xl" />
      </div>
      <div className="w-full max-w-md relative">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl mb-6 shadow-lg shadow-emerald-900/30">
            <Wrench className="text-white" size={28}/>
          </div>
          <h1 className="text-white font-black text-3xl tracking-tight">Staff Portal</h1>
          <p className="text-white/30 text-sm mt-3">Caravanstalling Spanje</p>
        </div>
        <form onSubmit={login} className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-3xl p-8 space-y-5 shadow-2xl">
          {loginError && <div className="bg-red-500/10 text-red-400 text-sm p-3 rounded-xl border border-red-500/10">{loginError}</div>}
          <div>
            <label className="text-white/40 text-xs font-semibold block mb-2">E-mail</label>
            <input type="email" required value={loginForm.email} onChange={e=>setLoginForm({...loginForm,email:e.target.value})} className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400/30 placeholder:text-white/20 transition-all" />
          </div>
          <div>
            <label className="text-white/40 text-xs font-semibold block mb-2">Wachtwoord</label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} required value={loginForm.password} onChange={e=>setLoginForm({...loginForm,password:e.target.value})} className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3.5 text-white text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400/30 placeholder:text-white/20 transition-all" />
              <button type="button" onClick={()=>setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/40">{showPw ? <EyeOff size={16}/> : <Eye size={16}/>}</button>
            </div>
          </div>
          <button type="submit" className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-emerald-600/20">Inloggen</button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 bg-slate-950 flex-col fixed h-full">
        <div className="p-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-lg flex items-center justify-center">
              <Wrench className="text-white" size={14}/>
            </div>
            <div>
              <h2 className="text-white font-bold text-sm">Staff Portal</h2>
              <p className="text-white/30 text-[10px]">Caravanstalling Spanje</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {NAV_ITEMS.map(item => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all ${active ? 'bg-white/[0.08] text-white shadow-sm' : 'text-white/40 hover:text-white/80 hover:bg-white/[0.03]'}`}>
                <item.icon size={17} className={active ? 'text-emerald-400' : ''}/>{item.label}
                {active && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-auto" />}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-3 mb-3 px-3">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-lg flex items-center justify-center text-white text-xs font-bold">{staffName.charAt(0)}</div>
            <p className="text-white text-xs font-semibold truncate flex-1">{staffName}</p>
          </div>
          <button onClick={logout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-white/30 hover:text-red-400 hover:bg-red-400/5 w-full transition-all">
            <LogOut size={17}/> Uitloggen
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-slate-950 z-40 px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-lg flex items-center justify-center">
            <Wrench className="text-white" size={12}/>
          </div>
          <span className="text-white font-bold text-sm">Staff Portal</span>
        </div>
        <button onClick={()=>setMobileMenuOpen(!mobileMenuOpen)} className="text-white/60 hover:text-white"><Menu size={20}/></button>
      </div>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={()=>setMobileMenuOpen(false)}>
          <div className="bg-slate-950 w-64 h-full p-5" onClick={e=>e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <span className="text-white font-bold text-sm">Menu</span>
              <button onClick={()=>setMobileMenuOpen(false)} className="text-white/40 hover:text-white"><X size={20}/></button>
            </div>
            <nav className="space-y-1">
              {NAV_ITEMS.map(item=>(
                <Link key={item.href} href={item.href} onClick={()=>setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-white/40 hover:text-white hover:bg-white/[0.05] font-medium">
                  <item.icon size={17}/>{item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      <main className="flex-1 md:ml-64 p-6 pt-16 md:pt-6">{children}</main>
    </div>
  );
}
