'use client';

import { useState, useEffect, ReactNode } from 'react';
import { LayoutDashboard, ClipboardList, Search as SearchIcon, MapPin, LogOut, Menu, X, Eye, EyeOff } from 'lucide-react';
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

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-surface"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;

  if (!authenticated) return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8"><div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3"><ClipboardList className="text-primary" size={24}/></div><h1 className="text-xl font-bold">Staff Portal</h1><p className="text-sm text-muted">Caravan Storage Spain</p></div>
        <form onSubmit={login} className="space-y-4">
          {loginError && <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-xl">{loginError}</div>}
          <div><label className="text-xs font-medium text-muted block mb-1">E-mail</label><input type="email" required value={loginForm.email} onChange={e=>setLoginForm({...loginForm,email:e.target.value})} className="w-full border rounded-xl px-3 py-2.5 text-sm" /></div>
          <div><label className="text-xs font-medium text-muted block mb-1">Wachtwoord</label><div className="relative"><input type={showPw ? 'text' : 'password'} required value={loginForm.password} onChange={e=>setLoginForm({...loginForm,password:e.target.value})} className="w-full border rounded-xl px-3 py-2.5 text-sm pr-10" /><button type="button" onClick={()=>setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted">{showPw ? <EyeOff size={16}/> : <Eye size={16}/>}</button></div></div>
          <button type="submit" className="w-full bg-primary hover:bg-primary-light text-white font-semibold py-2.5 rounded-xl text-sm">Inloggen</button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface flex">
      <aside className="hidden md:flex w-56 bg-primary-dark flex-col fixed h-full">
        <div className="p-4 border-b border-white/10"><h2 className="text-white font-bold text-sm">Staff Portal</h2><p className="text-white/60 text-xs">Caravan Storage Spain</p></div>
        <nav className="flex-1 p-2 space-y-0.5">
          {NAV_ITEMS.map(item => { const active = pathname === item.href; return (
            <Link key={item.href} href={item.href} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm ${active ? 'bg-white/15 text-white font-medium' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}><item.icon size={18}/>{item.label}</Link>
          );})}
        </nav>
        <div className="p-4 border-t border-white/10">
          <p className="text-white/60 text-xs mb-2">{staffName}</p>
          <button onClick={logout} className="flex items-center gap-2 text-white/60 hover:text-white text-sm w-full"><LogOut size={16}/> Uitloggen</button>
        </div>
      </aside>

      <div className="md:hidden fixed top-0 left-0 right-0 bg-primary-dark z-40 px-4 py-3 flex items-center justify-between">
        <span className="text-white font-bold text-sm">Staff Portal</span>
        <button onClick={()=>setMobileMenuOpen(!mobileMenuOpen)} className="text-white"><Menu size={20}/></button>
      </div>
      {mobileMenuOpen && <div className="md:hidden fixed inset-0 bg-black/50 z-40"><div className="bg-primary-dark w-56 h-full p-4"><div className="flex justify-between items-center mb-4"><span className="text-white font-bold text-sm">Menu</span><button onClick={()=>setMobileMenuOpen(false)} className="text-white"><X size={20}/></button></div><nav className="space-y-1">{NAV_ITEMS.map(item=><Link key={item.href} href={item.href} onClick={()=>setMobileMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/10"><item.icon size={18}/>{item.label}</Link>)}</nav></div></div>}

      <main className="flex-1 md:ml-56 p-6 pt-16 md:pt-6">{children}</main>
    </div>
  );
}
