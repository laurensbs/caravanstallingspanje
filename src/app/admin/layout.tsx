'use client';

import { useState, useEffect, useCallback, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, Caravan, MapPin, FileText, Receipt, UserCog,
  ClipboardList, Truck, Settings, LogOut, Menu, X, Bell, Search, ChevronDown,
  Wrench, MessageSquare,
} from 'lucide-react';

const NAV = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/klanten', icon: Users, label: 'Klanten' },
  { href: '/admin/caravans', icon: Caravan, label: 'Caravans' },
  { href: '/admin/locaties', icon: MapPin, label: 'Locaties & Plekken' },
  { href: '/admin/contracten', icon: FileText, label: 'Contracten' },
  { href: '/admin/facturen', icon: Receipt, label: 'Facturen' },
  { href: '/admin/transport', icon: Truck, label: 'Transport' },
  { href: '/admin/taken', icon: ClipboardList, label: 'Taken' },
  { href: '/admin/diensten', icon: Wrench, label: 'Service aanvragen' },
  { href: '/admin/berichten', icon: MessageSquare, label: 'Berichten' },
  { href: '/admin/medewerkers', icon: UserCog, label: 'Medewerkers' },
  { href: '/admin/instellingen', icon: Settings, label: 'Instellingen' },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');

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

  if (loading) return <div className="h-screen flex items-center justify-center bg-surface-dark"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-surface-dark flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-white font-bold text-2xl">CARAVANSTALLING<span className="text-accent"> SPANJE</span></h1>
            <p className="text-white/50 text-sm mt-2">Administratie</p>
          </div>
          <form onSubmit={handleLogin} className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-4">
            <input type="email" placeholder="E-mailadres" required value={loginForm.email} onChange={e => setLoginForm({ ...loginForm, email: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 placeholder:text-white/30" />
            <input type="password" placeholder="Wachtwoord" required value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 placeholder:text-white/30" />
            {loginError && <p className="text-red-400 text-sm">{loginError}</p>}
            <button type="submit" className="w-full bg-accent hover:bg-accent-light text-primary-dark font-semibold py-3 rounded-xl text-sm transition-colors">Inloggen</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-surface-dark transform transition-transform md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-16 px-5 border-b border-white/5">
          <span className="text-white font-bold text-sm">CARAVANSTALLING<span className="text-accent"> SPANJE</span></span>
          <button className="md:hidden text-white/50" onClick={() => setSidebarOpen(false)}><X size={20} /></button>
        </div>
        <nav className="p-3 space-y-0.5 overflow-y-auto h-[calc(100vh-8rem)]">
          {NAV.map(n => {
            const active = pathname === n.href || (n.href !== '/admin' && pathname.startsWith(n.href));
            return (
              <Link key={n.href} href={n.href} onClick={() => setSidebarOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${active ? 'bg-accent/10 text-accent' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
                <n.icon size={18} /> {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 w-full p-3 border-t border-white/5">
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/40 hover:text-red-400 hover:bg-red-400/5 w-full transition-colors">
            <LogOut size={18} /> Uitloggen
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button className="md:hidden text-gray-500" onClick={() => setSidebarOpen(true)}><Menu size={20} /></button>
            <div className="hidden md:flex items-center gap-2 bg-surface rounded-xl px-3 py-2 w-72">
              <Search size={16} className="text-muted" />
              <input placeholder="Zoeken..." className="bg-transparent text-sm outline-none flex-1" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative text-muted hover:text-gray-700"><Bell size={20} /></button>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">{user.name.charAt(0)}</div>
              <div className="hidden md:block">
                <p className="font-medium text-sm">{user.name}</p>
                <p className="text-xs text-muted">{user.role}</p>
              </div>
              <ChevronDown size={14} className="text-muted" />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>

      {/* Overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />}
    </div>
  );
}
