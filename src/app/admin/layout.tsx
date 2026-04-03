'use client';

import { useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useVisibleInterval } from '@/hooks/useVisibleInterval';
import {
  LayoutDashboard, Users, Caravan, MapPin, FileText, Receipt, UserCog,
  ClipboardList, Truck, Settings, LogOut, Menu, X, Bell, Search, ChevronDown,
  Wrench, MessageSquare, Shield, Eye, EyeOff, Lock, User, ArrowRight, AlertCircle,
  BarChart3, CalendarDays, Package, Map as MapIcon, Palmtree, Mountain, UtensilsCrossed, BookOpen, Tent, Star, Tag,
  ChevronRight, GripVertical,
} from 'lucide-react';

type NavItem = { href: string; icon: typeof LayoutDashboard; label: string; roles: string[] };
type NavSection = { id: string; label: string; items: NavItem[] };

const NAV_SECTIONS: NavSection[] = [
  { id: 'dashboard', label: '', items: [
    { href: '/admin', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'staff'] },
  ]},
  { id: 'beheer', label: 'Beheer', items: [
    { href: '/admin/klanten', icon: Users, label: 'Klanten', roles: ['admin'] },
    { href: '/admin/caravans', icon: Caravan, label: 'Caravans', roles: ['admin'] },
    { href: '/admin/locaties', icon: MapPin, label: 'Locaties & Plekken', roles: ['admin'] },
  ]},
  { id: 'financieel', label: 'Financieel', items: [
    { href: '/admin/contracten', icon: FileText, label: 'Contracten', roles: ['admin'] },
    { href: '/admin/facturen', icon: Receipt, label: 'Facturen', roles: ['admin'] },
    { href: '/admin/rapportages', icon: BarChart3, label: 'Rapportages', roles: ['admin'] },
  ]},
  { id: 'operationeel', label: 'Operationeel', items: [
    { href: '/admin/transport', icon: Truck, label: 'Transport', roles: ['admin', 'staff'] },
    { href: '/admin/taken', icon: ClipboardList, label: 'Taken', roles: ['admin', 'staff'] },
    { href: '/admin/diensten', icon: Wrench, label: 'Service aanvragen', roles: ['admin', 'staff'] },
    { href: '/admin/pakketten', icon: Package, label: 'Pakketten & Diensten', roles: ['admin'] },
    { href: '/admin/planning', icon: CalendarDays, label: 'Planning', roles: ['admin', 'staff'] },
  ]},
  { id: 'websitebeheer', label: 'Websitebeheer', items: [
    { href: '/admin/gids/campings', icon: Tent, label: 'Campings', roles: ['admin'] },
    { href: '/admin/gids/plaatsen', icon: MapIcon, label: 'Plaatsen', roles: ['admin'] },
    { href: '/admin/gids/stranden', icon: Palmtree, label: 'Stranden', roles: ['admin'] },
    { href: '/admin/gids/bezienswaardigheden', icon: Mountain, label: 'Bezienswaardigheden', roles: ['admin'] },
    { href: '/admin/gids/restaurants', icon: UtensilsCrossed, label: 'Restaurants', roles: ['admin'] },
    { href: '/admin/gids/blog', icon: BookOpen, label: 'Blog Artikelen', roles: ['admin'] },
  ]},
  { id: 'overig', label: 'Overig', items: [
    { href: '/admin/berichten', icon: MessageSquare, label: 'Berichten', roles: ['admin', 'staff'] },
    { href: '/admin/reviews', icon: Star, label: 'Reviews', roles: ['admin'] },
    { href: '/admin/kortingscodes', icon: Tag, label: 'Kortingscodes', roles: ['admin'] },
    { href: '/admin/medewerkers', icon: UserCog, label: 'Medewerkers', roles: ['admin'] },
    { href: '/admin/instellingen', icon: Settings, label: 'Instellingen', roles: ['admin'] },
  ]},
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [role, setRole] = useState<'admin' | 'staff'>('admin');
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<'admin' | 'staff'>('admin');
  const [loginEmail, setLoginEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [rememberEmail, setRememberEmail] = useState(false);

  // Notifications
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<{ id: number; message: string; type: string; created_at: string; read: boolean }[]>([]);
  const unreadCount = notifications.filter(n => !n.read).length;

  // Global search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ type: string; label: string; id: number | string; href: string }[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [searching, setSearching] = useState(false);

  // Sidebar preferences per account
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [sectionOrder, setSectionOrder] = useState<string[]>([]);
  const [dragSection, setDragSection] = useState<string | null>(null);

  const checkAuth = useCallback(() => {
    fetch('/api/admin/auth/me', { credentials: 'include' })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => { setAuthenticated(true); setUserName(d.name || 'Admin'); setRole(d.role === 'staff' ? 'staff' : 'admin'); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const savedRole = localStorage.getItem('admin_panel_role') as 'admin' | 'staff' | null;
    if (savedRole === 'admin' || savedRole === 'staff') setSelectedRole(savedRole);
    const savedEmail = localStorage.getItem('admin_saved_email');
    if (savedEmail) { setLoginEmail(savedEmail); setRememberEmail(true); }
    checkAuth();
  }, [checkAuth]);

  // Load sidebar prefs when user is authenticated
  useEffect(() => {
    if (!userName) return;
    try {
      const raw = localStorage.getItem(`sidebar_prefs_${userName}`);
      if (raw) {
        const prefs = JSON.parse(raw);
        if (prefs.collapsed) setCollapsedSections(prefs.collapsed);
        if (prefs.order) setSectionOrder(prefs.order);
      }
    } catch { /* ignore corrupt data */ }
  }, [userName]);

  const saveSidebarPrefs = useCallback((collapsed: Record<string, boolean>, order: string[]) => {
    if (!userName) return;
    localStorage.setItem(`sidebar_prefs_${userName}`, JSON.stringify({ collapsed, order }));
  }, [userName]);

  const toggleSection = useCallback((sectionId: string) => {
    setCollapsedSections(prev => {
      const next = { ...prev, [sectionId]: !prev[sectionId] };
      saveSidebarPrefs(next, sectionOrder);
      return next;
    });
  }, [saveSidebarPrefs, sectionOrder]);

  const orderedSections = useMemo(() => {
    const filtered = NAV_SECTIONS
      .map(s => ({ ...s, items: s.items.filter(i => i.roles.includes(role)) }))
      .filter(s => s.items.length > 0);
    if (sectionOrder.length === 0) return filtered;
    const orderMap = new Map(sectionOrder.map((id, i) => [id, i]));
    return [...filtered].sort((a, b) => (orderMap.get(a.id) ?? 999) - (orderMap.get(b.id) ?? 999));
  }, [role, sectionOrder]);

  const handleSectionDragStart = useCallback((e: React.DragEvent, sectionId: string) => {
    setDragSection(sectionId);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleSectionDragEnd = useCallback(() => {
    setDragSection(null);
  }, []);

  const handleSectionDrop = useCallback((targetSectionId: string) => {
    if (!dragSection || dragSection === targetSectionId) { setDragSection(null); return; }
    const currentOrder = orderedSections.map(s => s.id);
    const fromIdx = currentOrder.indexOf(dragSection);
    const toIdx = currentOrder.indexOf(targetSectionId);
    if (fromIdx === -1 || toIdx === -1) { setDragSection(null); return; }
    const newOrder = [...currentOrder];
    newOrder.splice(fromIdx, 1);
    newOrder.splice(toIdx, 0, dragSection);
    setSectionOrder(newOrder);
    saveSidebarPrefs(collapsedSections, newOrder);
    setDragSection(null);
  }, [dragSection, orderedSections, saveSidebarPrefs, collapsedSections]);

  // Load notifications
  const loadNotifs = useCallback(() => {
    if (!authenticated) return;
    fetch('/api/admin/dashboard', { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        const notifs: typeof notifications = [];
        if (d.stats?.openInvoices > 0) notifs.push({ id: 1, message: `${d.stats.openInvoices} openstaande facturen`, type: 'factuur', created_at: new Date().toISOString(), read: false });
        if (d.stats?.pendingTasks > 0) notifs.push({ id: 2, message: `${d.stats.pendingTasks} openstaande taken`, type: 'taak', created_at: new Date().toISOString(), read: false });
        if (d.stats?.pendingServices > 0) notifs.push({ id: 3, message: `${d.stats.pendingServices} dienstaanvragen wachten op actie`, type: 'dienst', created_at: new Date().toISOString(), read: false });
        if ((d.recent || []).length > 0) {
          d.recent.slice(0, 5).forEach((a: { id: number; action: string; entity_label: string; created_at: string }, i: number) => {
            notifs.push({ id: 10 + i, message: `${a.action}: ${a.entity_label}`, type: 'activiteit', created_at: a.created_at, read: true });
          });
        }
        setNotifications(notifs);
      })
      .catch(() => {});
  }, [authenticated]);
  useVisibleInterval(loadNotifs, 30000);

  // Global search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) { setSearchResults([]); setShowSearch(false); return; }
    const timer = setTimeout(async () => {
      setSearching(true);
      setShowSearch(true);
      try {
        const q = encodeURIComponent(searchQuery);
        const [custRes, caravRes, contRes] = await Promise.all([
          fetch(`/api/admin/customers?search=${q}`, { credentials: 'include' }).then(r => r.json()).catch(() => ({ customers: [] })),
          fetch(`/api/admin/caravans?search=${q}`, { credentials: 'include' }).then(r => r.json()).catch(() => ({ caravans: [] })),
          fetch(`/api/admin/contracts?search=${q}`, { credentials: 'include' }).then(r => r.json()).catch(() => ({ contracts: [] })),
        ]);
        const results: typeof searchResults = [];
        (custRes.customers || []).slice(0, 5).forEach((c: { id: number; first_name: string; last_name: string; email: string }) => {
          results.push({ type: 'Klant', label: `${c.first_name} ${c.last_name} (${c.email})`, id: c.id, href: `/admin/klanten` });
        });
        (caravRes.caravans || []).slice(0, 5).forEach((c: { id: number; brand: string; model: string; license_plate: string }) => {
          results.push({ type: 'Caravan', label: `${c.brand} ${c.model || ''} — ${c.license_plate || ''}`, id: c.id, href: `/admin/caravans` });
        });
        (contRes.contracts || []).slice(0, 5).forEach((c: { id: number; contract_number: string }) => {
          results.push({ type: 'Contract', label: c.contract_number, id: c.id, href: `/admin/contracten` });
        });
        setSearchResults(results);
      } catch { setSearchResults([]); }
      setSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password }),
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAuthenticated(true);
        setRole(data.role === 'staff' ? 'staff' : 'admin');
        setUserName(data.name);
        localStorage.setItem('admin_panel_role', selectedRole);
        if (rememberEmail) {
          localStorage.setItem('admin_saved_email', loginEmail);
        } else {
          localStorage.removeItem('admin_saved_email');
        }
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
    setLoginEmail('');
    setUserName('');
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-surface-dark">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-white/70 text-sm">Laden...</p>
      </div>
    </div>
  );

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-surface-dark flex items-center justify-center px-6 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#e2725b]/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-sky-900/10 rounded-full blur-[120px]" />
        </div>
        <div className="w-full max-w-md relative">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-primary-light rounded-2xl mb-6 shadow-lg shadow-primary/20">
              <Shield className="text-white" size={28} />
            </div>
            <h1 className="text-white font-bold text-3xl tracking-tight">Beheerportaal</h1>
            <p className="text-white/70 text-sm mt-3">Caravanstalling Spanje</p>
          </div>

          <div className="bg-surface/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-3xl p-8 space-y-5 shadow-2xl">
            {/* Role selector tabs */}
            <div>
              <label className="text-white/70 text-xs font-bold uppercase tracking-widest block mb-2.5">Inloggen als</label>
              <div className="flex bg-surface/[0.04] rounded-xl p-1 border border-white/[0.06]">
                {(['admin', 'staff'] as const).map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => { setSelectedRole(r); setLoginError(''); }}
                    className={`flex-1 py-3 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                      selectedRole === r
                        ? 'bg-gradient-to-r from-primary to-primary-light text-white shadow-lg shadow-primary/20'
                        : 'text-white/70 hover:text-white/70'
                    }`}
                  >
                    {r === 'admin' ? <Shield size={15} /> : <User size={15} />}
                    {r === 'admin' ? 'Admin' : 'Staff'}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email field */}
              <div>
                <label className="text-white/70 text-xs font-bold uppercase tracking-widest block mb-2.5">E-mailadres</label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={e => { setLoginEmail(e.target.value); setLoginError(''); }}
                    className="w-full bg-surface/[0.04] border border-white/[0.08] rounded-xl pl-10 pr-4 py-3.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 placeholder:text-white/15 transition-all"
                    placeholder="admin@example.com"
                    autoFocus
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password field */}
              <div>
                <label className="text-white/70 text-xs font-bold uppercase tracking-widest block mb-2.5">Wachtwoord</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => { setPassword(e.target.value); setLoginError(''); }}
                    className="w-full bg-surface/[0.04] border border-white/[0.08] rounded-xl pl-10 pr-12 py-3.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 placeholder:text-white/15 transition-all"
                    placeholder="••••••••"
                    autoFocus
                    autoComplete="current-password"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/60 transition-colors" aria-label={showPw ? "Wachtwoord verbergen" : "Wachtwoord tonen"}>
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember + Error */}
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberEmail}
                  onChange={e => {
                    setRememberEmail(e.target.checked);
                    if (!e.target.checked) localStorage.removeItem('admin_saved_email');
                  }}
                  className="w-4 h-4 rounded border-white/20 bg-surface/[0.04] text-primary focus:ring-primary/30 accent-primary"
                />
                <span className="text-white/50 text-xs font-medium">Onthoud mijn e-mailadres</span>
              </label>

              {/* Error */}
              {loginError && (
                <div className="flex items-start gap-2.5 bg-danger/100/10 border border-danger/10 text-danger text-sm p-3.5 rounded-xl">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loginLoading}
                className="w-full bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loginLoading ? 'Bezig...' : 'Inloggen'}
                {!loginLoading && <ArrowRight size={16} />}
              </button>
            </form>
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-5 mt-6">
            <span className="flex items-center gap-1.5 text-xs text-white/20 font-medium">
              <Shield size={12} /> Beveiligde verbinding
            </span>
            <span className="flex items-center gap-1.5 text-xs text-white/20 font-medium">
              <Lock size={12} /> Versleuteld
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-[270px] bg-surface-dark flex flex-col transform transition-transform md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-16 px-5 border-b border-white/[0.06] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-light rounded-lg flex items-center justify-center text-white text-xs font-bold">CS</div>
            <div>
              <span className="text-white font-bold text-sm block leading-tight">Caravanstalling</span>
              <span className="text-white/70 text-xs">{role === 'admin' ? 'Admin Panel' : 'Staff Portal'}</span>
            </div>
          </div>
          <button className="md:hidden text-white/70" onClick={() => setSidebarOpen(false)} aria-label="Zijmenu sluiten"><X size={20} /></button>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto custom-scrollbar">
          {orderedSections.map(section => {
            if (!section.label) {
              return section.items.map(n => {
                const active = pathname === n.href;
                return (
                  <Link key={n.href} href={n.href} onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active ? 'bg-surface/[0.08] text-white shadow-sm' : 'text-white/60 hover:text-white/80 hover:bg-surface/[0.03]'}`}>
                    <n.icon size={17} className={active ? 'text-primary' : ''} /> {n.label}
                    {active && <div className="w-1.5 h-1.5 rounded-full bg-primary ml-auto" />}
                  </Link>
                );
              });
            }
            const isCollapsed = collapsedSections[section.id] ?? false;
            const isDragging = dragSection === section.id;
            return (
              <div key={section.id}
                onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                onDrop={() => handleSectionDrop(section.id)}
                className={`transition-opacity ${isDragging ? 'opacity-40' : ''}`}
              >
                <button
                  draggable
                  onDragStart={e => handleSectionDragStart(e, section.id)}
                  onDragEnd={handleSectionDragEnd}
                  onClick={() => toggleSection(section.id)}
                  className="flex items-center gap-1 w-full text-left px-3 pt-5 pb-1.5 group cursor-pointer"
                >
                  <GripVertical size={12} className="text-white/10 group-hover:text-white/30 shrink-0 cursor-grab active:cursor-grabbing" />
                  <span className="text-xs font-bold text-white/20 uppercase tracking-widest flex-1 select-none">{section.label}</span>
                  <ChevronRight size={12} className={`text-white/20 group-hover:text-white/40 transition-transform duration-200 ${isCollapsed ? '' : 'rotate-90'}`} />
                </button>
                <div className={`overflow-hidden transition-all duration-200 ${isCollapsed ? 'max-h-0' : 'max-h-[500px]'}`}>
                  {section.items.map(n => {
                    const active = pathname === n.href || (n.href !== '/admin' && pathname.startsWith(n.href));
                    return (
                      <Link key={n.href} href={n.href} onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active ? 'bg-surface/[0.08] text-white shadow-sm' : 'text-white/60 hover:text-white/80 hover:bg-surface/[0.03]'}`}>
                        <n.icon size={17} className={active ? 'text-primary' : ''} /> {n.label}
                        {active && <div className="w-1.5 h-1.5 rounded-full bg-primary ml-auto" />}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
        <div className="shrink-0 p-3 border-t border-white/[0.06]">
          <div className="flex items-center gap-3 px-3 mb-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-light rounded-lg flex items-center justify-center text-white text-xs font-bold">{userName.charAt(0)}</div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">{userName}</p>
              <p className="text-white/70 text-xs">{role}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:text-danger hover:bg-red-400/5 w-full transition-all">
            <LogOut size={17} /> Uitloggen
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-surface border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button className="md:hidden text-gray-500/70 hover:text-gray-500" onClick={() => setSidebarOpen(true)} aria-label="Menu openen"><Menu size={20} /></button>
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3.5 py-2.5 w-full md:w-80 border border-gray-200 relative">
              <Search size={15} className="text-gray-500/50" />
              <input
                placeholder="Zoek klanten, caravans, contracten..."
                className="bg-transparent text-sm outline-none flex-1 text-gray-500 placeholder:text-gray-500/50"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => { if (searchResults.length > 0) setShowSearch(true); }}
                onBlur={() => setTimeout(() => setShowSearch(false), 200)}
              />
              {showSearch && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-surface rounded-xl border border-gray-200 shadow-xl z-50 max-h-80 overflow-y-auto">
                  {searching ? (
                    <div className="p-4 text-center text-sm text-gray-500/70">Zoeken...</div>
                  ) : searchResults.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500/70">Geen resultaten</div>
                  ) : searchResults.map((r, i) => (
                    <Link key={i} href={r.href} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
                      <span className="text-xs font-bold text-gray-500/50 uppercase w-16 shrink-0">{r.type}</span>
                      <span className="text-sm text-gray-900 truncate">{r.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <button onClick={() => setShowNotifications(!showNotifications)} className="relative text-gray-500/50 hover:text-gray-500 transition-colors" aria-label="Notificaties">
                <Bell size={19} />
                {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center">{unreadCount}</span>}
              </button>
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-surface rounded-xl border border-gray-200 shadow-xl z-50 max-h-96 overflow-y-auto">
                  <div className="p-3 border-b border-gray-200 flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-900">Notificaties</span>
                    {unreadCount > 0 && <span className="text-xs font-bold text-primary">{unreadCount} nieuw</span>}
                  </div>
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-sm text-gray-500/70">Geen notificaties</div>
                  ) : notifications.map(n => (
                    <div key={n.id} className={`px-4 py-3 border-b border-gray-100 last:border-0 ${!n.read ? 'bg-primary/[0.03]' : ''}`}>
                      <div className="flex items-start gap-2">
                        {!n.read && <div className="w-2 h-2 bg-primary rounded-full mt-1.5 shrink-0" />}
                        <div>
                          <p className="text-sm text-gray-900">{n.message}</p>
                          <p className="text-xs text-gray-500/50 mt-0.5">{new Date(n.created_at).toLocaleString('nl-NL', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="h-6 w-px bg-gray-100" />
            <div className="flex items-center gap-2.5 text-sm">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-light rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm shadow-primary/20">{userName.charAt(0)}</div>
              <div className="hidden md:block">
                <p className="font-semibold text-sm text-gray-900">{userName}</p>
                <p className="text-xs text-gray-500/70">{role}</p>
              </div>
              <ChevronDown size={14} className="text-gray-500/50" />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50">
          {children}
        </main>
      </div>

      {/* Overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden" onClick={() => setSidebarOpen(false)} />}
    </div>
  );
}
