'use client';

import { useState, useEffect, ReactNode } from 'react';
import { LayoutDashboard, ClipboardList, Search as SearchIcon, MapPin, LogOut, Menu, X, Eye, EyeOff, Wrench, QrCode, Bell, Mail } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/staff', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/staff/taken', label: 'Taken', icon: ClipboardList },
  { href: '/staff/inspecties', label: 'Inspecties', icon: SearchIcon },
  { href: '/staff/terrein', label: 'Terrein', icon: MapPin },
  { href: '/staff/scan', label: 'QR Scan', icon: QrCode },
];

export default function StaffLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [authenticated, setAuthenticated] = useState(false);
  const [staffName, setStaffName] = useState('');
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<{type:string;text:string}[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetch('/api/staff/auth/me', { credentials: 'include' })
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(d => { setAuthenticated(true); setStaffName(d.name || ''); })
      .catch(() => setAuthenticated(false))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!authenticated) return;
    const loadNotifications = async () => {
      try {
        const res = await fetch('/api/staff/dashboard', { credentials: 'include' });
        if (!res.ok) return;
        const data = await res.json();
        const items: {type:string;text:string}[] = [];
        if (data.stats?.tasks_open > 0) items.push({ type: 'taak', text: `${data.stats.tasks_open} open taken` });
        if (data.stats?.tasks_today > 0) items.push({ type: 'urgent', text: `${data.stats.tasks_today} taken voor vandaag` });
        if (data.stats?.inspections_due > 0) items.push({ type: 'inspectie', text: `${data.stats.inspections_due} geplande inspecties` });
        if (data.stats?.transports_today > 0) items.push({ type: 'transport', text: `${data.stats.transports_today} transporten vandaag` });
        setNotifications(items);
        setUnreadCount(items.length);
      } catch {}
    };
    loadNotifications();
    const iv = setInterval(loadNotifications, 30000);
    return () => clearInterval(iv);
  }, [authenticated]);

  const login = async (e: React.FormEvent) => {
    e.preventDefault(); setLoginError(''); setLoginLoading(true);
    try {
      const res = await fetch('/api/staff/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: loginEmail, password }), credentials: 'include' });
      if (res.ok) { const d = await res.json(); setAuthenticated(true); setStaffName(d.name || ''); }
      else { const d = await res.json(); setLoginError(d.error || 'Inloggen mislukt'); }
    } catch { setLoginError('Er is een fout opgetreden'); }
    finally { setLoginLoading(false); }
  };

  const logout = async () => {
    await fetch('/api/staff/auth/logout', { method: 'POST', credentials: 'include' });
    setAuthenticated(false); setStaffName(''); setPassword(''); setLoginEmail('');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-surface-dark">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin w-10 h-10 border-2 border-accent-light border-t-transparent rounded-full" />
        <p className="text-white/60 text-sm">Laden...</p>
      </div>
    </div>
  );

  if (!authenticated) return (
    <div className="min-h-screen flex items-center justify-center bg-surface-dark p-4 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-sky-900/10 rounded-full blur-3xl" />
      </div>
      <div className="w-full max-w-md relative">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-primary-dark rounded-2xl mb-6 shadow-lg shadow-primary/30">
            <Wrench className="text-white" size={28}/>
          </div>
          <h1 className="text-white font-black text-3xl tracking-tight">Staff Portal</h1>
          <p className="text-white/70 text-sm mt-3">Caravanstalling Spanje</p>
        </div>
        <form onSubmit={login} className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-3xl p-8 space-y-5 shadow-2xl">
          {loginError && (
            <div className="flex items-start gap-2.5 bg-red-500/10 text-red-400 text-sm p-3.5 rounded-xl border border-red-500/10">
              <span>{loginError}</span>
            </div>
          )}
          <div>
            <label className="text-white/70 text-[10px] font-bold uppercase tracking-widest block mb-2.5">E-mailadres</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20" />
              <input type="email" required value={loginEmail} onChange={e=>{ setLoginEmail(e.target.value); setLoginError(''); }} className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-10 pr-4 py-3.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 placeholder:text-white/15 transition-all" placeholder="medewerker@voorbeeld.com" autoFocus autoComplete="email" />
            </div>
          </div>
          <div>
            <label className="text-white/70 text-[10px] font-bold uppercase tracking-widest block mb-2.5">Wachtwoord</label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} required value={password} onChange={e=>{ setPassword(e.target.value); setLoginError(''); }} className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3.5 text-white text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 placeholder:text-white/15 transition-all" placeholder="••••••••" autoFocus autoComplete="current-password" />
              <button type="button" onClick={()=>setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/60 transition-colors" aria-label={showPw ? "Wachtwoord verbergen" : "Wachtwoord tonen"}>{showPw ? <EyeOff size={16}/> : <Eye size={16}/>}</button>
            </div>
          </div>
          <button type="submit" disabled={loginLoading} className="w-full bg-gradient-to-r from-primary to-primary-dark hover:from-primary hover:to-primary-dark text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-primary/20 disabled:opacity-60">
            {loginLoading ? 'Bezig...' : 'Inloggen'}
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-sand/40 flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 bg-surface-dark flex-col fixed h-full">
        <div className="p-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center">
              <Wrench className="text-white" size={14}/>
            </div>
            <div>
              <h2 className="text-white font-bold text-sm">Staff Portal</h2>
              <p className="text-white/70 text-[10px]">Caravanstalling Spanje</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {NAV_ITEMS.map(item => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all ${active ? 'bg-white/[0.08] text-white shadow-sm' : 'text-white/60 hover:text-white/80 hover:bg-white/[0.03]'}`}>
                <item.icon size={17} className={active ? 'text-primary-light' : ''}/>{item.label}
                {active && <div className="w-1.5 h-1.5 rounded-full bg-primary-light ml-auto" />}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-3 mb-3 px-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center text-white text-xs font-bold">{staffName.charAt(0)}</div>
            <p className="text-white text-xs font-semibold truncate flex-1">{staffName}</p>
            <div className="relative">
              <button onClick={() => { setShowNotifications(!showNotifications); setUnreadCount(0); }} className="relative text-white/70 hover:text-white/60 transition-colors" aria-label="Meldingen">
                <Bell size={17} />
                {unreadCount > 0 && <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white font-bold flex items-center justify-center">{unreadCount}</span>}
              </button>
              {showNotifications && (
                <div className="absolute bottom-full right-0 mb-2 w-64 bg-surface-dark border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden z-50">
                  <div className="p-3 border-b border-white/[0.06]">
                    <p className="text-white text-xs font-bold">Meldingen</p>
                  </div>
                  {notifications.length === 0 ? (
                    <p className="text-white/70 text-xs p-3">Geen meldingen</p>
                  ) : (
                    <div className="max-h-48 overflow-y-auto">
                      {notifications.map((n, i) => (
                        <div key={i} className="px-3 py-2 border-b border-white/[0.04] last:border-0 flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${n.type === 'urgent' ? 'bg-red-400' : n.type === 'inspectie' ? 'bg-blue-400' : n.type === 'transport' ? 'bg-warning' : 'bg-primary-light'}`} />
                          <span className="text-white/60 text-xs">{n.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <button onClick={logout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-white/70 hover:text-red-400 hover:bg-red-400/5 w-full transition-all">
            <LogOut size={17}/> Uitloggen
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-surface-dark z-40 px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center">
            <Wrench className="text-white" size={12}/>
          </div>
          <span className="text-white font-bold text-sm">{staffName || 'Staff'}</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => { setShowNotifications(!showNotifications); setUnreadCount(0); }} className="relative text-white/70 hover:text-white/60 transition-colors" aria-label="Meldingen">
            <Bell size={18} />
            {unreadCount > 0 && <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white font-bold flex items-center justify-center">{unreadCount}</span>}
          </button>
          <button onClick={logout} className="text-white/70 hover:text-red-400 transition-colors" aria-label="Uitloggen"><LogOut size={18}/></button>
        </div>
        {showNotifications && (
          <div className="absolute top-full right-4 mt-1 w-64 bg-surface-dark border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden z-50">
            <div className="p-3 border-b border-white/[0.06]">
              <p className="text-white text-xs font-bold">Meldingen</p>
            </div>
            {notifications.length === 0 ? (
              <p className="text-white/70 text-xs p-3">Geen meldingen</p>
            ) : (
              <div className="max-h-48 overflow-y-auto">
                {notifications.map((n, i) => (
                  <div key={i} className="px-3 py-2 border-b border-white/[0.04] last:border-0 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${n.type === 'urgent' ? 'bg-red-400' : n.type === 'inspectie' ? 'bg-blue-400' : n.type === 'transport' ? 'bg-warning' : 'bg-primary-light'}`} />
                    <span className="text-white/60 text-xs">{n.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface-dark z-40 border-t border-white/[0.06] safe-bottom">
        <div className="grid grid-cols-5 gap-0">
          {NAV_ITEMS.map(item => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className={`flex flex-col items-center justify-center py-2.5 gap-0.5 transition-colors ${active ? 'text-primary-light' : 'text-white/70 active:text-white/60'}`}>
                <item.icon size={20} strokeWidth={active ? 2.5 : 1.5} />
                <span className={`text-[10px] font-medium ${active ? 'text-primary-light' : ''}`}>{item.label}</span>
                {active && <div className="w-1 h-1 rounded-full bg-primary-light mt-0.5" />}
              </Link>
            );
          })}
        </div>
      </nav>

      <main className="flex-1 md:ml-64 p-4 md:p-6 pt-16 md:pt-6 pb-24 md:pb-6">{children}</main>
    </div>
  );
}
