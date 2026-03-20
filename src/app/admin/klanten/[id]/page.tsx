'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { fmt, fmtDate, CARAVAN_STATUS_COLORS, CONTRACT_STATUS_COLORS, INVOICE_STATUS_COLORS, SERVICE_STATUS_COLORS } from '@/lib/format';
import {
  ArrowLeft, User, Mail, Phone, MapPin, Building2, Calendar, Edit2,
  Caravan, FileText, Receipt, Wrench, MessageSquare, AlertTriangle,
  ExternalLink, Trash2, Clock
} from 'lucide-react';
import Modal from '@/components/ui/Modal';

interface Customer {
  id: number; customer_number: string; first_name: string; last_name: string; email: string;
  phone: string; address: string; city: string; postal_code: string; country: string;
  company_name: string; notes: string; created_at: string; updated_at: string;
}

interface CaravanItem {
  id: number; brand: string; model: string; license_plate: string; year: number;
  length_m: number; weight_kg: number; status: string; location_name: string; spot_label: string;
  insurance_expiry: string; apk_expiry: string;
}

interface Contract {
  id: number; contract_number: string; caravan_name: string; location_name: string;
  start_date: string; end_date: string; monthly_rate: number; status: string; auto_renew: boolean;
}

interface Invoice {
  id: number; invoice_number: string; description: string; total: number;
  due_date: string; status: string; paid_date: string;
}

interface ServiceRequest {
  id: number; service_type: string; description: string; status: string; created_at: string;
  caravan_name: string;
}

interface Message {
  id: number; name: string; subject: string; message: string; created_at: string; is_read: boolean;
}

type Tab = 'overzicht' | 'caravans' | 'contracten' | 'facturen' | 'diensten' | 'berichten';

export default function CustomerDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [caravans, setCaravans] = useState<CaravanItem[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('overzicht');
  const [showEdit, setShowEdit] = useState(false);
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone: '', address: '', city: '', postal_code: '', country: 'Nederland', company_name: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/customers/${id}?full=true`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        if (d.customer) {
          setCustomer(d.customer);
          setCaravans(d.caravans || []);
          setContracts(d.contracts || []);
          setInvoices(d.invoices || []);
          setServiceRequests(d.serviceRequests || []);
          setMessages(d.messages || []);
          setForm({
            first_name: d.customer.first_name, last_name: d.customer.last_name,
            email: d.customer.email, phone: d.customer.phone || '',
            address: d.customer.address || '', city: d.customer.city || '',
            postal_code: d.customer.postal_code || '', country: d.customer.country || 'Nederland',
            company_name: d.customer.company_name || '', notes: d.customer.notes || ''
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await fetch(`/api/admin/customers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
      credentials: 'include',
    });
    setCustomer(prev => prev ? { ...prev, ...form } : prev);
    setShowEdit(false);
    setSaving(false);
  };

  const handleDelete = async () => {
    await fetch(`/api/admin/customers/${id}`, { method: 'DELETE', credentials: 'include' });
    router.push('/admin/klanten');
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!customer) return (
    <div className="text-center py-20">
      <p className="text-gray-500/70 text-lg mb-4">Klant niet gevonden</p>
      <Link href="/admin/klanten" className="text-primary font-semibold hover:underline">← Terug naar klanten</Link>
    </div>
  );

  const activeContracts = contracts.filter(c => c.status === 'actief').length;
  const openInvoices = invoices.filter(i => i.status === 'open' || i.status === 'verzonden').length;
  const overdueInvoices = invoices.filter(i => i.status !== 'betaald' && i.status !== 'geannuleerd' && i.due_date && new Date(i.due_date) < new Date()).length;
  const totalRevenue = invoices.filter(i => i.status === 'betaald').reduce((sum, i) => sum + Number(i.total), 0);
  const openServices = serviceRequests.filter(s => s.status !== 'afgerond' && s.status !== 'geannuleerd').length;

  const warnings: string[] = [];
  caravans.forEach(c => {
    if (c.insurance_expiry && new Date(c.insurance_expiry) < new Date(Date.now() + 60 * 86400000)) warnings.push(`Verzekering ${c.brand} ${c.model || ''} verloopt ${fmtDate(c.insurance_expiry)}`);
    if (c.apk_expiry && new Date(c.apk_expiry) < new Date(Date.now() + 60 * 86400000)) warnings.push(`APK ${c.brand} ${c.model || ''} verloopt ${fmtDate(c.apk_expiry)}`);
  });
  contracts.forEach(c => {
    if (c.status === 'actief' && c.end_date && new Date(c.end_date) < new Date(Date.now() + 30 * 86400000)) warnings.push(`Contract ${c.contract_number} verloopt ${fmtDate(c.end_date)}`);
  });
  if (overdueInvoices > 0) warnings.push(`${overdueInvoices} achterstallige factuur(en)`);

  const tabs: { key: Tab; label: string; icon: typeof User; count?: number }[] = [
    { key: 'overzicht', label: 'Overzicht', icon: User },
    { key: 'caravans', label: 'Caravans', icon: Caravan, count: caravans.length },
    { key: 'contracten', label: 'Contracten', icon: FileText, count: contracts.length },
    { key: 'facturen', label: 'Facturen', icon: Receipt, count: invoices.length },
    { key: 'diensten', label: 'Dienstaanvragen', icon: Wrench, count: serviceRequests.length },
    { key: 'berichten', label: 'Berichten', icon: MessageSquare, count: messages.length },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/klanten" className="p-2 hover:bg-gray-50 rounded-xl transition-colors text-gray-500/70 hover:text-gray-500">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-light rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-primary/20">
              {customer.first_name.charAt(0)}{customer.last_name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{customer.first_name} {customer.last_name}</h1>
              <p className="text-sm text-gray-500/70">{customer.customer_number} · Klant sinds {fmtDate(customer.created_at)}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowEdit(true)} className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-light text-white rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 transition-all">
            <Edit2 size={14} /> Bewerken
          </button>
          <button onClick={() => setShowDelete(true)} className="p-2.5 hover:bg-danger/10 text-gray-500/50 hover:text-danger rounded-xl transition-all" title="Verwijderen">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="bg-warning/10 border border-warning/30 rounded-2xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} className="text-warning" />
            <span className="font-bold text-sm text-warning">Waarschuwingen</span>
          </div>
          <ul className="space-y-1">
            {warnings.map((w, i) => <li key={i} className="text-sm text-gray-500">{w}</li>)}
          </ul>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-surface rounded-2xl p-1.5 mb-6 border border-gray-200 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${tab === t.key ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500/70 hover:text-gray-500 hover:bg-gray-50'}`}>
            <t.icon size={15} />
            {t.label}
            {t.count !== undefined && t.count > 0 && <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${tab === t.key ? 'bg-white/20' : 'bg-gray-100 text-gray-500/70'}`}>{t.count}</span>}
          </button>
        ))}
      </div>

      {/* Overzicht tab */}
      {tab === 'overzicht' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { label: 'Caravans', value: caravans.length, color: 'text-primary' },
              { label: 'Actieve contracten', value: activeContracts, color: 'text-accent-dark' },
              { label: 'Open facturen', value: openInvoices, color: 'text-warning' },
              { label: 'Achterstallig', value: overdueInvoices, color: 'text-danger' },
              { label: 'Totale omzet', value: fmt(totalRevenue), color: 'text-accent-dark' },
            ].map(s => (
              <div key={s.label} className="bg-surface rounded-2xl p-4 border border-gray-200">
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-500/70 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-surface rounded-2xl p-6 border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4">Contactgegevens</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm"><Mail size={15} className="text-gray-500/50 shrink-0" /><span className="text-gray-500">{customer.email}</span></div>
                {customer.phone && <div className="flex items-center gap-3 text-sm"><Phone size={15} className="text-gray-500/50 shrink-0" /><span className="text-gray-500">{customer.phone}</span></div>}
                {(customer.address || customer.city) && <div className="flex items-start gap-3 text-sm"><MapPin size={15} className="text-gray-500/50 shrink-0 mt-0.5" /><span className="text-gray-500">{[customer.address, customer.postal_code, customer.city, customer.country].filter(Boolean).join(', ')}</span></div>}
                {customer.company_name && <div className="flex items-center gap-3 text-sm"><Building2 size={15} className="text-gray-500/50 shrink-0" /><span className="text-gray-500">{customer.company_name}</span></div>}
                <div className="flex items-center gap-3 text-sm"><Calendar size={15} className="text-gray-500/50 shrink-0" /><span className="text-gray-500">Klant sinds {fmtDate(customer.created_at)}</span></div>
              </div>
            </div>
            <div className="bg-surface rounded-2xl p-6 border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4">Notities</h3>
              <p className="text-sm text-gray-500 whitespace-pre-wrap">{customer.notes || 'Geen notities'}</p>
            </div>
          </div>

          {caravans.length > 0 && (
            <div className="bg-surface rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">Caravans</h3>
                <button onClick={() => setTab('caravans')} className="text-primary text-sm font-semibold hover:underline">Alles bekijken →</button>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {caravans.slice(0, 3).map(c => (
                  <div key={c.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900 text-sm">{c.brand} {c.model || ''}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CARAVAN_STATUS_COLORS[c.status] || 'bg-gray-100 text-gray-500'}`}>{c.status}</span>
                    </div>
                    <p className="text-xs text-gray-500/70">{c.license_plate} · {c.location_name || 'Geen locatie'}{c.spot_label ? ` — ${c.spot_label}` : ''}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {openServices > 0 && (
            <div className="bg-surface rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">Open dienstaanvragen</h3>
                <button onClick={() => setTab('diensten')} className="text-primary text-sm font-semibold hover:underline">Alles bekijken →</button>
              </div>
              <div className="space-y-2">
                {serviceRequests.filter(s => s.status !== 'afgerond' && s.status !== 'geannuleerd').slice(0, 3).map(s => (
                  <div key={s.id} className="flex items-center justify-between bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <div>
                      <span className="font-semibold text-gray-900 text-sm">{s.service_type}</span>
                      <span className="text-xs text-gray-500/70 ml-2">{fmtDate(s.created_at)}</span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${SERVICE_STATUS_COLORS[s.status] || 'bg-gray-100 text-gray-500'}`}>{s.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Caravans tab */}
      {tab === 'caravans' && (
        <div className="bg-surface rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500/70 uppercase tracking-wider">Caravan</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500/70 uppercase tracking-wider">Kenteken</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500/70 uppercase tracking-wider">Locatie</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500/70 uppercase tracking-wider">Verzekering</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500/70 uppercase tracking-wider">APK</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500/70 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {caravans.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500/70">Geen caravans</td></tr>
                ) : caravans.map(c => {
                  const insExpiring = c.insurance_expiry && new Date(c.insurance_expiry) < new Date(Date.now() + 60 * 86400000);
                  const apkExpiring = c.apk_expiry && new Date(c.apk_expiry) < new Date(Date.now() + 60 * 86400000);
                  return (
                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-gray-900">{c.brand} {c.model || ''}</p>
                        {c.year && <p className="text-xs text-gray-500/70">Bouwjaar {c.year}</p>}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs">{c.license_plate || '-'}</td>
                      <td className="px-4 py-3.5 text-gray-500">{c.location_name || '-'}{c.spot_label ? ` — ${c.spot_label}` : ''}</td>
                      <td className="px-4 py-3.5">
                        <span className={insExpiring ? 'text-danger font-semibold' : 'text-gray-500'}>{fmtDate(c.insurance_expiry)}</span>
                        {insExpiring && <AlertTriangle size={12} className="inline ml-1 text-danger" />}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={apkExpiring ? 'text-danger font-semibold' : 'text-gray-500'}>{fmtDate(c.apk_expiry)}</span>
                        {apkExpiring && <AlertTriangle size={12} className="inline ml-1 text-danger" />}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CARAVAN_STATUS_COLORS[c.status] || 'bg-gray-100 text-gray-500'}`}>{c.status}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Contracten tab */}
      {tab === 'contracten' && (
        <div className="bg-surface rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500/70 uppercase tracking-wider">Contractnr</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500/70 uppercase tracking-wider">Caravan</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500/70 uppercase tracking-wider">Periode</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500/70 uppercase tracking-wider">Maandtarief</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500/70 uppercase tracking-wider">Auto-verlengen</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500/70 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {contracts.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500/70">Geen contracten</td></tr>
                ) : contracts.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3.5 font-mono text-xs">{c.contract_number}</td>
                    <td className="px-4 py-3.5 text-gray-500">{c.caravan_name}</td>
                    <td className="px-4 py-3.5 text-gray-500">{fmtDate(c.start_date)} — {fmtDate(c.end_date)}</td>
                    <td className="px-4 py-3.5 font-semibold text-gray-900">{fmt(c.monthly_rate)}</td>
                    <td className="px-4 py-3.5 text-gray-500">{c.auto_renew ? 'Ja' : 'Nee'}</td>
                    <td className="px-4 py-3.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CONTRACT_STATUS_COLORS[c.status] || 'bg-gray-100 text-gray-500'}`}>{c.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Facturen tab */}
      {tab === 'facturen' && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-surface rounded-2xl p-4 border border-gray-200">
              <p className="text-xs text-gray-500/70">Totaal betaald</p>
              <p className="text-xl font-bold text-accent-dark">{fmt(totalRevenue)}</p>
            </div>
            <div className="bg-surface rounded-2xl p-4 border border-gray-200">
              <p className="text-xs text-gray-500/70">Openstaand</p>
              <p className="text-xl font-bold text-warning">{fmt(invoices.filter(i => i.status === 'open' || i.status === 'verzonden').reduce((s, i) => s + Number(i.total), 0))}</p>
            </div>
            <div className="bg-surface rounded-2xl p-4 border border-gray-200">
              <p className="text-xs text-gray-500/70">Achterstallig</p>
              <p className="text-xl font-bold text-danger">{fmt(invoices.filter(i => i.status !== 'betaald' && i.status !== 'geannuleerd' && i.due_date && new Date(i.due_date) < new Date()).reduce((s, i) => s + Number(i.total), 0))}</p>
            </div>
          </div>
          <div className="bg-surface rounded-2xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500/70 uppercase tracking-wider">Factuurnr</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500/70 uppercase tracking-wider">Omschrijving</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500/70 uppercase tracking-wider">Bedrag</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500/70 uppercase tracking-wider">Vervaldatum</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500/70 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {invoices.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500/70">Geen facturen</td></tr>
                  ) : invoices.map(i => (
                    <tr key={i.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3.5 font-mono text-xs">{i.invoice_number}</td>
                      <td className="px-4 py-3.5 text-gray-500 max-w-xs truncate">{i.description || '-'}</td>
                      <td className="px-4 py-3.5 font-semibold text-gray-900">{fmt(i.total)}</td>
                      <td className="px-4 py-3.5 text-gray-500">{fmtDate(i.due_date)}</td>
                      <td className="px-4 py-3.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${INVOICE_STATUS_COLORS[i.status] || 'bg-gray-100 text-gray-500'}`}>{i.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Dienstaanvragen tab */}
      {tab === 'diensten' && (
        <div className="bg-surface rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500/70 uppercase tracking-wider">Type</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500/70 uppercase tracking-wider">Caravan</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500/70 uppercase tracking-wider">Omschrijving</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500/70 uppercase tracking-wider">Datum</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500/70 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {serviceRequests.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500/70">Geen dienstaanvragen</td></tr>
                ) : serviceRequests.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3.5 font-semibold text-gray-900">{s.service_type}</td>
                    <td className="px-4 py-3.5 text-gray-500">{s.caravan_name || '-'}</td>
                    <td className="px-4 py-3.5 text-gray-500 max-w-xs truncate">{s.description || '-'}</td>
                    <td className="px-4 py-3.5 text-gray-500">{fmtDate(s.created_at)}</td>
                    <td className="px-4 py-3.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${SERVICE_STATUS_COLORS[s.status] || 'bg-gray-100 text-gray-500'}`}>{s.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Berichten tab */}
      {tab === 'berichten' && (
        <div className="bg-surface rounded-2xl border border-gray-200 overflow-hidden">
          {messages.length === 0 ? (
            <div className="p-8 text-center text-gray-500/70">Geen berichten gevonden</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {messages.map(m => (
                <div key={m.id} className={`p-4 hover:bg-gray-50 transition-colors ${!m.is_read ? 'bg-primary/[0.03]' : ''}`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      {!m.is_read && <div className="w-2 h-2 bg-primary rounded-full" />}
                      <span className="font-semibold text-gray-900 text-sm">{m.subject || 'Geen onderwerp'}</span>
                    </div>
                    <span className="text-xs text-gray-500/50 flex items-center gap-1"><Clock size={11} /> {fmtDate(m.created_at)}</span>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2">{m.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit modal */}
      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Klant bewerken" size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs font-semibold text-gray-500/70 block mb-1.5">Voornaam *</label><input required value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" /></div>
            <div><label className="text-xs font-semibold text-gray-500/70 block mb-1.5">Achternaam *</label><input required value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" /></div>
          </div>
          <div><label className="text-xs font-semibold text-gray-500/70 block mb-1.5">E-mail *</label><input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" /></div>
          <div><label className="text-xs font-semibold text-gray-500/70 block mb-1.5">Telefoon</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" /></div>
          <div><label className="text-xs font-semibold text-gray-500/70 block mb-1.5">Adres</label><input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs font-semibold text-gray-500/70 block mb-1.5">Postcode</label><input value={form.postal_code} onChange={e => setForm({ ...form, postal_code: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" /></div>
            <div><label className="text-xs font-semibold text-gray-500/70 block mb-1.5">Plaats</label><input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" /></div>
          </div>
          <div><label className="text-xs font-semibold text-gray-500/70 block mb-1.5">Land</label><input value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" /></div>
          <div><label className="text-xs font-semibold text-gray-500/70 block mb-1.5">Bedrijfsnaam</label><input value={form.company_name} onChange={e => setForm({ ...form, company_name: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" /></div>
          <div><label className="text-xs font-semibold text-gray-500/70 block mb-1.5">Notities</label><textarea rows={3} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm bg-gray-50 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" /></div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => setShowEdit(false)} className="px-4 py-2.5 text-sm font-medium text-gray-500/70 hover:text-gray-500 hover:bg-gray-50 rounded-xl transition-all">Annuleren</button>
            <button type="submit" disabled={saving} className="bg-primary hover:bg-primary-light text-white font-bold px-6 py-2.5 rounded-xl text-sm shadow-lg shadow-primary/20 transition-all disabled:opacity-60">{saving ? 'Opslaan...' : 'Opslaan'}</button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation */}
      <Modal open={showDelete} onClose={() => setShowDelete(false)} title="Klant verwijderen" size="sm">
        <p className="text-sm text-gray-500 mb-6">Weet u zeker dat u <strong>{customer.first_name} {customer.last_name}</strong> wilt verwijderen? Dit kan niet ongedaan worden gemaakt.</p>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setShowDelete(false)} className="px-4 py-2.5 text-sm font-medium text-gray-500/70 hover:text-gray-500 hover:bg-gray-50 rounded-xl transition-all">Annuleren</button>
          <button onClick={handleDelete} className="bg-danger hover:bg-danger/80 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all">Verwijderen</button>
        </div>
      </Modal>
    </div>
  );
}
