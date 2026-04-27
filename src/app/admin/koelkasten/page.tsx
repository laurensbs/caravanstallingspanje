'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Refrigerator, Plus, Search, ChevronDown, ChevronUp, Edit2, Trash2, Calendar, AlertCircle, CheckCircle, MapPin, Mail, Tag } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { useAdminI18n } from '@/lib/admin-i18n';

type Booking = {
  id: number;
  camping: string | null;
  start_date: string | null;
  end_date: string | null;
  spot_number: string | null;
  status: 'compleet' | 'controleren';
  notes: string | null;
};

type Fridge = {
  id: number;
  name: string;
  email: string | null;
  extra_email: string | null;
  device_type: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  bookings: Booking[];
};

const STATUS_BADGE: Record<string, string> = {
  compleet: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  controleren: 'bg-amber-50 text-amber-700 border-amber-200',
};

const emptyFridge = { name: '', email: '', extra_email: '', device_type: 'Grote koelkast', notes: '' };
const emptyBooking: { camping: string; start_date: string; end_date: string; spot_number: string; status: 'compleet' | 'controleren'; notes: string } = { camping: '', start_date: '', end_date: '', spot_number: '', status: 'compleet', notes: '' };

function formatDate(s: string | null) {
  if (!s) return '';
  const d = new Date(s);
  return d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' });
}

function formatPeriod(b: Booking) {
  const start = formatDate(b.start_date);
  const end = formatDate(b.end_date);
  if (!start && !end) return '—';
  if (!end) return start;
  return `${start} – ${end}`;
}

export default function KoelkastenPage() {
  const { t } = useAdminI18n();
  const [year, setYear] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [fridges, setFridges] = useState<Fridge[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<{ totalFridges: number; totalBookings: number; byStatus: { status: string; count: string }[] }>({ totalFridges: 0, totalBookings: 0, byStatus: [] });
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const [showFridgeForm, setShowFridgeForm] = useState(false);
  const [editingFridge, setEditingFridge] = useState<Fridge | null>(null);
  const [fridgeForm, setFridgeForm] = useState(emptyFridge);

  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingFridgeId, setBookingFridgeId] = useState<number | null>(null);
  const [editingBookingId, setEditingBookingId] = useState<number | null>(null);
  const [bookingForm, setBookingForm] = useState(emptyBooking);

  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'fridge' | 'booking'; id: number } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (year > 0) params.set('year', String(year));
      if (statusFilter) params.set('status', statusFilter);
      if (searchQuery) params.set('search', searchQuery);
      const res = await fetch(`/api/admin/fridges?${params}`, { credentials: 'include' });
      const data = await res.json();
      setFridges(data.fridges || []);
    } catch { setFridges([]); }
    setLoading(false);
  }, [year, statusFilter, searchQuery]);

  const loadStats = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/fridges?stats=true${year > 0 ? `&year=${year}` : ''}`, { credentials: 'include' });
      setStats(await res.json());
    } catch { /* ignore */ }
  }, [year]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { loadStats(); }, [loadStats]);

  const submitFridge = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingFridge ? `/api/admin/fridges/${editingFridge.id}` : '/api/admin/fridges';
    const method = editingFridge ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(fridgeForm), credentials: 'include' });
    if (res.ok) {
      setShowFridgeForm(false);
      setEditingFridge(null);
      setFridgeForm(emptyFridge);
      load(); loadStats();
    }
  };

  const openEditFridge = (f: Fridge) => {
    setFridgeForm({
      name: f.name,
      email: f.email || '',
      extra_email: f.extra_email || '',
      device_type: f.device_type,
      notes: f.notes || '',
    });
    setEditingFridge(f);
    setShowFridgeForm(true);
  };

  const submitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingFridgeId) return;
    const url = editingBookingId ? `/api/admin/fridges/bookings/${editingBookingId}` : `/api/admin/fridges/${bookingFridgeId}/bookings`;
    const method = editingBookingId ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(bookingForm), credentials: 'include' });
    if (res.ok) {
      setShowBookingForm(false);
      setBookingFridgeId(null);
      setEditingBookingId(null);
      setBookingForm(emptyBooking);
      load(); loadStats();
    }
  };

  const openNewBooking = (fridgeId: number) => {
    setBookingFridgeId(fridgeId);
    setEditingBookingId(null);
    setBookingForm(emptyBooking);
    setShowBookingForm(true);
  };

  const openEditBooking = (fridgeId: number, b: Booking) => {
    setBookingFridgeId(fridgeId);
    setEditingBookingId(b.id);
    setBookingForm({
      camping: b.camping || '',
      start_date: b.start_date ? b.start_date.split('T')[0] : '',
      end_date: b.end_date ? b.end_date.split('T')[0] : '',
      spot_number: b.spot_number || '',
      status: b.status,
      notes: b.notes || '',
    });
    setShowBookingForm(true);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    const url = deleteConfirm.type === 'fridge'
      ? `/api/admin/fridges/${deleteConfirm.id}`
      : `/api/admin/fridges/bookings/${deleteConfirm.id}`;
    await fetch(url, { method: 'DELETE', credentials: 'include' });
    setDeleteConfirm(null);
    load(); loadStats();
  };

  const years = useMemo(() => {
    const set = new Set<number>();
    fridges.forEach(f => f.bookings.forEach(b => { if (b.start_date) set.add(new Date(b.start_date).getFullYear()); }));
    return Array.from(set).sort((a, b) => b - a);
  }, [fridges]);

  const completeCount = parseInt(stats.byStatus.find(s => s.status === 'compleet')?.count || '0');
  const checkCount = parseInt(stats.byStatus.find(s => s.status === 'controleren')?.count || '0');

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Refrigerator className="text-primary" size={24} /> {t('Koelkasten')}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {stats.totalFridges} {t('klanten')} · {stats.totalBookings} {t('periodes')} · {completeCount} {t('compleet')} · {checkCount} {t('controleren')}
          </p>
        </div>
        <button onClick={() => { setEditingFridge(null); setFridgeForm(emptyFridge); setShowFridgeForm(true); }} className="bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm transition-colors">
          <Plus size={16} /> {t('Nieuwe koelkast')}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t('Zoek naam, e-mail of camping...')}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary"
          />
        </div>
        <select value={year} onChange={e => setYear(parseInt(e.target.value))} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary">
          <option value={0}>{t('Alle jaren')}</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary">
          <option value="">{t('Alle statussen')}</option>
          <option value="compleet">{t('Compleet')}</option>
          <option value="controleren">{t('Controleren')}</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 text-sm">{t('Laden...')}</div>
        ) : fridges.length === 0 ? (
          <div className="p-12 text-center">
            <Refrigerator className="mx-auto text-gray-300 mb-3" size={36} />
            <p className="text-gray-500 text-sm">{t('Geen koelkasten gevonden')}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {fridges.map(f => {
              const expanded = expandedId === f.id;
              const hasCheck = f.bookings.some(b => b.status === 'controleren');
              return (
                <div key={f.id} className={hasCheck ? 'bg-amber-50/30' : ''}>
                  <div className="px-4 py-3 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                    <button onClick={() => setExpandedId(expanded ? null : f.id)} className="text-gray-400 hover:text-gray-600">
                      {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900 text-sm">{f.name}</span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{f.device_type}</span>
                        {hasCheck && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full flex items-center gap-1"><AlertCircle size={11} />{t('Controleren')}</span>}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        {f.email && <span className="flex items-center gap-1"><Mail size={11} />{f.email}</span>}
                        <span>{f.bookings.length} {t('periode(s)')}</span>
                      </div>
                    </div>
                    <button onClick={() => openNewBooking(f.id)} className="text-xs px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 font-medium flex items-center gap-1">
                      <Plus size={12} /> {t('Periode')}
                    </button>
                    <button onClick={() => openEditFridge(f)} className="text-gray-400 hover:text-primary p-1.5 rounded-lg hover:bg-gray-100" title={t('Bewerken')}>
                      <Edit2 size={15} />
                    </button>
                    <button onClick={() => setDeleteConfirm({ type: 'fridge', id: f.id })} className="text-gray-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50" title={t('Verwijderen')}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                  {expanded && (
                    <div className="px-4 pb-4 pl-12 space-y-2">
                      {f.notes && (
                        <div className="bg-blue-50/50 border border-blue-100 rounded-lg px-3 py-2 text-xs text-blue-800">
                          <strong>{t('Notitie klant')}:</strong> {f.notes}
                        </div>
                      )}
                      {f.extra_email && (
                        <div className="text-xs text-gray-500 flex items-center gap-1.5"><Mail size={11} /> {t('Extra')}: {f.extra_email}</div>
                      )}
                      {f.bookings.length === 0 ? (
                        <p className="text-xs text-gray-400 italic">{t('Geen periodes')}</p>
                      ) : (
                        <div className="space-y-1.5">
                          {f.bookings.map(b => (
                            <div key={b.id} className="bg-white border border-gray-200 rounded-lg px-3 py-2.5 flex items-center gap-3">
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border ${STATUS_BADGE[b.status]}`}>
                                {b.status === 'compleet' ? <CheckCircle size={10} className="inline mr-1" /> : <AlertCircle size={10} className="inline mr-1" />}
                                {b.status}
                              </span>
                              <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2 text-xs">
                                <span className="flex items-center gap-1 text-gray-700"><MapPin size={11} className="text-gray-400" />{b.camping || '—'}</span>
                                <span className="flex items-center gap-1 text-gray-700"><Calendar size={11} className="text-gray-400" />{formatPeriod(b)}</span>
                                {b.spot_number && <span className="flex items-center gap-1 text-gray-700"><Tag size={11} className="text-gray-400" />{b.spot_number}</span>}
                                {b.notes && <span className="text-gray-500 italic truncate" title={b.notes}>{b.notes}</span>}
                              </div>
                              <button onClick={() => openEditBooking(f.id, b)} className="text-gray-400 hover:text-primary p-1 rounded hover:bg-gray-100"><Edit2 size={13} /></button>
                              <button onClick={() => setDeleteConfirm({ type: 'booking', id: b.id })} className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50"><Trash2 size={13} /></button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Fridge form */}
      <Modal open={showFridgeForm} onClose={() => setShowFridgeForm(false)} title={editingFridge ? t('Koelkast bewerken') : t('Nieuwe koelkast')} size="lg">
        <form onSubmit={submitFridge} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">{t('Naam')}</label>
            <input required value={fridgeForm.name} onChange={e => setFridgeForm({ ...fridgeForm, name: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">{t('E-mail')}</label>
              <input type="email" value={fridgeForm.email} onChange={e => setFridgeForm({ ...fridgeForm, email: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">{t('Extra e-mail')}</label>
              <input type="email" value={fridgeForm.extra_email} onChange={e => setFridgeForm({ ...fridgeForm, extra_email: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">{t('Soort apparaat')}</label>
            <input value={fridgeForm.device_type} onChange={e => setFridgeForm({ ...fridgeForm, device_type: e.target.value })} list="device-types" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary" />
            <datalist id="device-types">
              <option value="Grote koelkast" />
              <option value="Tafelmodel koelkast" />
              <option value="Airco" />
              <option value="Grote koelkast + airco" />
              <option value="Grote koelkast + airco unit" />
            </datalist>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">{t('Notities')}</label>
            <textarea rows={2} value={fridgeForm.notes} onChange={e => setFridgeForm({ ...fridgeForm, notes: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowFridgeForm(false)} className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">{t('Annuleren')}</button>
            <button type="submit" className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-lg text-sm font-semibold">{editingFridge ? t('Opslaan') : t('Toevoegen')}</button>
          </div>
        </form>
      </Modal>

      {/* Booking form */}
      <Modal open={showBookingForm} onClose={() => setShowBookingForm(false)} title={editingBookingId ? t('Periode bewerken') : t('Nieuwe periode')} size="lg">
        <form onSubmit={submitBooking} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">{t('Camping')}</label>
            <input value={bookingForm.camping} onChange={e => setBookingForm({ ...bookingForm, camping: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">{t('Startdatum')}</label>
              <input type="date" value={bookingForm.start_date} onChange={e => setBookingForm({ ...bookingForm, start_date: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">{t('Einddatum')}</label>
              <input type="date" value={bookingForm.end_date} onChange={e => setBookingForm({ ...bookingForm, end_date: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">{t('Pleknummer')}</label>
              <input value={bookingForm.spot_number} onChange={e => setBookingForm({ ...bookingForm, spot_number: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">{t('Status')}</label>
              <select value={bookingForm.status} onChange={e => setBookingForm({ ...bookingForm, status: e.target.value as 'compleet' | 'controleren' })} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary">
                <option value="compleet">{t('Compleet')}</option>
                <option value="controleren">{t('Controleren')}</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">{t('Opmerking')}</label>
            <textarea rows={2} value={bookingForm.notes} onChange={e => setBookingForm({ ...bookingForm, notes: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowBookingForm(false)} className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">{t('Annuleren')}</button>
            <button type="submit" className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-lg text-sm font-semibold">{editingBookingId ? t('Opslaan') : t('Toevoegen')}</button>
          </div>
        </form>
      </Modal>

      {/* Delete confirm */}
      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title={t('Verwijderen?')} size="sm">
        <p className="text-sm text-gray-600 mb-5">
          {deleteConfirm?.type === 'fridge'
            ? t('Weet je zeker dat je deze koelkast en alle bijbehorende periodes wilt verwijderen?')
            : t('Weet je zeker dat je deze periode wilt verwijderen?')}
        </p>
        <div className="flex justify-end gap-2">
          <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">{t('Annuleren')}</button>
          <button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold">{t('Verwijderen')}</button>
        </div>
      </Modal>
    </div>
  );
}
