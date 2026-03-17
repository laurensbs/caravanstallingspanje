'use client';

import { useState, useEffect, useCallback, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, Caravan, MapPin, FileText, Receipt, UserCog,
  ClipboardList, Truck, Settings, LogOut, Menu, X, Bell, Search, ChevronDown,
  Wrench, MessageSquare, Shield, Eye, EyeOff,
} from 'lucide-react';

const NAV = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard', section: '' },
  { href: '/admin/klanten', icon: Users, label: 'Klanten', section: 'Beheer' },
  { href: '/admin/caravans', icon: Caravan, label: 'Caravans', section: '' },
  { href: '/admin/locaties', icon: MapPin, label: 'Locaties & Plekken', section: '' },
  { href: '/admin/contracten', icon: FileText, label: 'Contracten', section: 'Financieel' },
  { href: '/admin/facturen', icon: Receipt, label: 'Facturen', section: '' },
  { href: '/admin/transport', icon: Truck, label: 'Transport', section: 'Operationeel' },
  { href: '/admin/taken', icon: ClipboardList, label: 'Taken', section: '' },
  { href: '/admin/diensten', icon: Wrench, label: 'Service aanvragen', section: '' },
  { href: '/admin/berichten', icon: MessageSquare, label: 'Berichten', section: 'Overig' },
  { href: '/admin/medewerkers', icon: UserCog, label: 'Medewerkers', section: '' },
  { href: '/admin/instellingen', icon: Settings, label: 'Instellingen', section: '' },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [showPw, setShowPw] = useState(false);

  const checkAuth = useCallback(() => {
    fetch('/api/admin/auth/me', { credentials: 'include' })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => { setUser(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => { checkAuth(); }, [checkAuth]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm), credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) { setLoginError(data.error || 'Inloggen mislukt'); return; }
      setUser(data.user);
    } catch { setLoginError('Er is een fout opgetreden'); }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/auth/logout', { method: 'POST', credentials: 'include' });
    setUser(null);
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#0a0e1a]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-white/30 text-sm">Laden...</p>
      </div>
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center px-6 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-amber-900/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-sky-900/10 rounded-full blur-[120px]" />
        </div>
        <div className="w-full max-w-md relative">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl mb-6 shadow-lg shadow-amber-500/20">
              <Shield className="text-white" size={28} />
            </div>
            <h1 className="text-white font-black text-3xl tracking-tight">Admin Panel</h1>
            <p className="text-white/30 text-sm mt-3">Caravanstalling Spanje</p>
          </div>
          <form onSubmit={handleLogin} className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-3xl p-8 space-y-5 shadow-2xl">
            {loginError && <div className="bg-red-500/10 border border-red-500/10 text-red-400 text-sm p-3 rounded-xl">{loginError}</div>}
            <div>
              <label className="text-white/40 text-xs font-semibold block mb-2">E-mailadres</label>
              <input type="email" required value={loginForm.email} onChange={e => setLoginForm({ ...loginForm, email: e.target.value })} className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400/30 placeholder:text-white/20 transition-all" placeholder="admin@example.com" />
            </div>
            <div>
              <label className="text-white/40 text-xs font-semibold block mb-2">Wachtwoord</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} required value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3.5 text-white text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400/30 placeholder:text-white/20 transition-all" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/40">{showPw ? <EyeOff size={16} /> : <Eye size={16} />}</button>
              </div>
            </div>
            <button type="submit" className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20">Inloggen</button>
          </form>
        </div>
      </div>
    );
  }

  let lastSection = '';

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-[270px] bg-[#0a0e1a] transform transition-transform md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-16 px-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center text-white text-[10px] font-black">CS</div>
            <div>
              <span className="text-white font-bold text-sm block leading-tight">Caravanstalling</span>
              <span className="text-white/30 text-[10px]">Admin Panel</span>
            </div>
          </div>
          <button className="md:hidden text-white/50" onClick={() => setSidebarOpen(false)}><X size={20} /></button>
        </div>
        <nav className="p-3 space-y-0.5 overflow-y-auto h-[calc(100vh-8rem)] custom-scrollbar">
          {NAV.map(n => {
            const active = pathname === n.href || (n.href !== '/admin' && pathname.startsWith(n.href));
            let sectionHeader = null;
            if (n.section && n.section !== lastSection) {
              lastSection = n.section;
              sectionHeader = <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest px-3 pt-5 pb-1.5">{n.section}</p>;
            }
            return (
              <div key={n.href}>
                {sectionHeader}
                <Link href={n.href} onClick={() => setSidebarOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all ${active ? 'bg-white/[0.08] text-white shadow-sm' : 'text-white/40 hover:text-white/80 hover:bg-white/[0.03]'}`}>
                  <n.icon size={17} className={active ? 'text-amber-400' : ''} /> {n.label}
                  {active && <div className="w-1.5 h-1.5 rounded-full bg-amber-400 ml-auto" />}
                </Link>
              </div>
            );
          })}
        </nav>
        <div className="absolute bottom-0 w-full p-3 border-t border-white/[0.06]">
          <div className="flex items-center gap-3 px-3 mb-3">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">{user.name.charAt(0)}</div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">{user.name}</p>
              <p className="text-white/30 text-[10px]">{user.role}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-white/30 hover:text-red-400 hover:bg-red-400/5 w-full transition-all">
            <LogOut size={17} /> Uitloggen
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-slate-200/80 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button className="md:hidden text-slate-400 hover:text-slate-600" onClick={() => setSidebarOpen(true)}><Menu size={20} /></button>
            <div className="hidden md:flex items-center gap-2 bg-slate-50 rounded-xl px-3.5 py-2.5 w-80 border border-slate-100">
              <Search size={15} className="text-slate-300" />
              <input placeholder="Zoeken..." className="bg-transparent text-sm outline-none flex-1 text-slate-600 placeholder:text-slate-300" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative text-slate-300 hover:text-slate-500 transition-colors">
              <Bell size={19} />
            </button>
            <div className="h-6 w-px bg-slate-100" />
            <div className="flex items-center gap-2.5 text-sm">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm shadow-amber-500/20">{user.name.charAt(0)}</div>
              <div className="hidden md:block">
                <p className="font-semibold text-sm text-slate-800">{user.name}</p>
                <p className="text-[11px] text-slate-400">{user.role}</p>
              </div>
              <ChevronDown size={14} className="text-slate-300" />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50">
          {children}
        </main>
      </div>

      {/* Overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden" onClick={() => setSidebarOpen(false)} />}
    </div>
  );
}
