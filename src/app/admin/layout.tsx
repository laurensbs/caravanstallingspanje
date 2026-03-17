'use client';

import { useState, useEffect, useCallback, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, Caravan, MapPin, FileText, Receipt, UserCog,
  ClipboardList, Truck, Settings, LogOut, Menu, X, Bell, Search, ChevronDown,
  Wrench, MessageSquare, Shield, Eye, EyeOff, Lock, User, ArrowRight, AlertCircle,
} from 'lucide-react';

type NavItem = { href: string; icon: typeof LayoutDashboard; label: string; section: string; roles: string[] };

const NAV: NavItem[] = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard', section: '', roles: ['admin', 'staff'] },
  { href: '/admin/klanten', icon: Users, label: 'Klanten', section: 'Beheer', roles: ['admin'] },
  { href: '/admin/caravans', icon: Caravan, label: 'Caravans', section: '', roles: ['admin'] },
  { href: '/admin/locaties', icon: MapPin, label: 'Locaties & Plekken', section: '', roles: ['admin'] },
  { href: '/admin/contracten', icon: FileText, label: 'Contracten', section: 'Financieel', roles: ['admin'] },
  { href: '/admin/facturen', icon: Receipt, label: 'Facturen', section: '', roles: ['admin'] },
  { href: '/admin/transport', icon: Truck, label: 'Transport', section: 'Operationeel', roles: ['admin', 'staff'] },
  { href: '/admin/taken', icon: ClipboardList, label: 'Taken', section: '', roles: ['admin', 'staff'] },
  { href: '/admin/diensten', icon: Wrench, label: 'Service aanvragen', section: '', roles: ['admin', 'staff'] },
  { href: '/admin/berichten', icon: MessageSquare, label: 'Berichten', section: 'Overig', roles: ['admin', 'staff'] },
  { href: '/admin/medewerkers', icon: UserCog, label: 'Medewerkers', section: '', roles: ['admin'] },
  { href: '/admin/instellingen', icon: Settings, label: 'Instellingen', section: '', roles: ['admin'] },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [role, setRole] = useState<'admin' | 'staff'>('admin');
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<'admin' | 'staff'>('admin');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const checkAuth = useCallback(() => {
    fetch('/api/admin/auth/me', { credentials: 'include' })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => { setAuthenticated(true); setUserName(d.name || 'Admin'); setRole(d.role === 'staff' ? 'staff' : 'admin'); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const savedRole = localStorage.getItem('admin_panel_role') as 'admin' | 'staff' | null;
    if (savedRole === 'admin' || savedRole === 'staff') setSelectedRole(savedRole);
    checkAuth();
  }, [checkAuth]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: selectedRole, password }),
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAuthenticated(true);
        setRole(data.role === 'staff' ? 'staff' : 'admin');
        setUserName(data.name);
        localStorage.setItem('admin_panel_role', selectedRole);
      } else {
        setLoginError(data.error || 'Inloggen mislukt');
      }
    } catch {
      setLoginError('Er is een fout opgetreden');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/auth/logout', { method: 'POST', credentials: 'include' });
    setAuthenticated(false);
    setPassword('');
    setUserName('');
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#0a0e1a]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-white/30 text-sm">Laden...</p>
      </div>
    </div>
  );

  if (!authenticated) {
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
            <h1 className="text-white font-black text-3xl tracking-tight">Beheerportaal</h1>
            <p className="text-white/30 text-sm mt-3">Caravanstalling Spanje</p>
          </div>

          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-3xl p-8 space-y-5 shadow-2xl">
            {/* Role selector tabs */}
            <div>
              <label className="text-white/30 text-[10px] font-bold uppercase tracking-widest block mb-2.5">Inloggen als</label>
              <div className="flex bg-white/[0.04] rounded-xl p-1 border border-white/[0.06]">
                {(['admin', 'staff'] as const).map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => { setSelectedRole(r); setLoginError(''); }}
                    className={`flex-1 py-3 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                      selectedRole === r
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/20'
                        : 'text-white/30 hover:text-white/50'
                    }`}
                  >
                    {r === 'admin' ? <Shield size={15} /> : <User size={15} />}
                    {r === 'admin' ? 'Admin' : 'Staff'}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Password field */}
              <div>
                <label className="text-white/30 text-[10px] font-bold uppercase tracking-widest block mb-2.5">Wachtwoord</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => { setPassword(e.target.value); setLoginError(''); }}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-10 pr-12 py-3.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400/30 placeholder:text-white/15 transition-all"
                    placeholder="••••••••"
                    autoFocus
                    autoComplete="current-password"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/40 transition-colors">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {loginError && (
                <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/10 text-red-400 text-sm p-3.5 rounded-xl">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loginLoading}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loginLoading ? 'Bezig...' : 'Inloggen'}
                {!loginLoading && <ArrowRight size={16} />}
              </button>
            </form>
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-5 mt-6">
            <span className="flex items-center gap-1.5 text-[11px] text-white/20 font-medium">
              <Shield size={12} /> Beveiligde verbinding
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-white/20 font-medium">
              <Lock size={12} /> Versleuteld
            </span>
          </div>
        </div>
      </div>
    );
  }

  const filteredNav = NAV.filter(n => n.roles.includes(role));
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
              <span className="text-white/30 text-[10px]">{role === 'admin' ? 'Admin Panel' : 'Staff Portal'}</span>
            </div>
          </div>
          <button className="md:hidden text-white/50" onClick={() => setSidebarOpen(false)}><X size={20} /></button>
        </div>
        <nav className="p-3 space-y-0.5 overflow-y-auto h-[calc(100vh-8rem)] custom-scrollbar">
          {filteredNav.map(n => {
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
            <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">{userName.charAt(0)}</div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">{userName}</p>
              <p className="text-white/30 text-[10px]">{role}</p>
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
              <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm shadow-amber-500/20">{userName.charAt(0)}</div>
              <div className="hidden md:block">
                <p className="font-semibold text-sm text-slate-800">{userName}</p>
                <p className="text-[11px] text-slate-400">{role}</p>
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
