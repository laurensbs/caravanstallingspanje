'use client';
import { fmt, fmtDate } from "@/lib/format";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, User, Caravan, FileText, Receipt, Mail, Phone, MapPin, Calendar, MessageSquare, Activity, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface CustomerDetail {
  id: number; customer_number: string; first_name: string; last_name: string;
  email: string; phone: string; address: string; city: string; postal_code: string;
  country: string; company_name: string; notes: string; created_at: string;
}

export default function CustomerDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [caravans, setCaravans] = useState<{ id: number; brand: string; model: string; license_plate: string; status: string; location_name: string; spot_label: string }[]>([]);
  const [contracts, setContracts] = useState<{ id: number; contract_number: string; start_date: string; end_date: string; monthly_rate: number; status: string }[]>([]);
  const [invoices, setInvoices] = useState<{ id: number; invoice_number: string; total: number; status: string; due_date: string }[]>([]);
  const [activity, setActivity] = useState<{ id: number; action: string; entity_label: string; created_at: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/customers/${id}`, { credentials: 'include' }).then(r => r.json()),
      fetch(`/api/admin/caravans?customer_id=${id}`, { credentials: 'include' }).then(r => r.json()).catch(() => ({ caravans: [] })),
      fetch(`/api/admin/contracts?customer_id=${id}`, { credentials: 'include' }).then(r => r.json()).catch(() => ({ contracts: [] })),
      fetch(`/api/admin/invoices?customer_id=${id}`, { credentials: 'include' }).then(r => r.json()).catch(() => ({ invoices: [] })),
    ]).then(([cust, car, cont, inv]) => {
      setCustomer(cust.customer || cust);
      setCaravans(car.caravans || []);
      setContracts(cont.contracts || []);
      setInvoices(inv.invoices || []);
      setActivity(cust.activity || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  const STATUS_COLORS: Record<string, string> = {
    betaald: 'bg-accent/10 text-primary-dark border-accent/30',
    open: 'bg-ocean/10 text-ocean-dark border-ocean/30',
    actief: 'bg-accent/10 text-primary-dark border-accent/30',
    verlopen: 'bg-danger/10 text-danger border-danger/30',
    gestald: 'bg-accent/10 text-primary-dark border-accent/30',
    in_transit: 'bg-ocean/10 text-ocean-dark border-ocean/30',
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;
  if (!customer) return <div className="text-center py-16"><p className="text-warm-gray">Klant niet gevonden</p><Link href="/admin/klanten" className="text-primary text-sm mt-2 inline-block">Terug naar klanten</Link></div>;

  const totalRevenue = invoices.filter(i => i.status === 'betaald').reduce((s, i) => s + i.total, 0);
  const openInvoices = invoices.filter(i => i.status !== 'betaald');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/klanten" className="text-warm-gray/50 hover:text-warm-gray transition-colors"><ArrowLeft size={20} /></Link>
        <div>
          <h1 className="text-2xl font-black text-surface-dark">{customer.first_name} {customer.last_name}</h1>
          <p className="text-sm text-warm-gray/70">{customer.customer_number} — Klant sinds {fmtDate(customer.created_at)}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Caravan, value: caravans.length, label: 'Caravans', color: 'text-ocean', bg: 'bg-ocean/10' },
          { icon: FileText, value: contracts.filter(c => c.status === 'actief').length, label: 'Actieve contracten', color: 'text-accent', bg: 'bg-accent/10' },
          { icon: Receipt, value: fmt(totalRevenue), label: 'Totale omzet', color: 'text-primary', bg: 'bg-primary/10' },
          { icon: AlertCircle, value: openInvoices.length, label: 'Open facturen', color: 'text-warning', bg: 'bg-warning/10' },
        ].map(s => (
          <div key={s.label} className="bg-surface rounded-2xl border border-sand-dark/20 p-5">
            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}><s.icon size={18} className={s.color} /></div>
            <p className="text-xl font-black text-surface-dark">{s.value}</p>
            <p className="text-xs text-warm-gray/70 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact info */}
        <div className="bg-surface rounded-2xl border border-sand-dark/20 p-6">
          <h2 className="font-bold text-surface-dark mb-4 flex items-center gap-2"><User size={16} className="text-primary" /> Contactgegevens</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3"><Mail size={14} className="text-warm-gray/50" /><span className="text-warm-gray">{customer.email}</span></div>
            <div className="flex items-center gap-3"><Phone size={14} className="text-warm-gray/50" /><span className="text-warm-gray">{customer.phone || '-'}</span></div>
            <div className="flex items-center gap-3"><MapPin size={14} className="text-warm-gray/50" /><span className="text-warm-gray">{[customer.address, customer.postal_code, customer.city, customer.country].filter(Boolean).join(', ') || '-'}</span></div>
            {customer.company_name && <div className="flex items-center gap-3"><User size={14} className="text-warm-gray/50" /><span className="text-warm-gray">{customer.company_name}</span></div>}
            {customer.notes && <div className="mt-3 p-3 bg-sand/40 rounded-xl text-xs text-warm-gray">{customer.notes}</div>}
          </div>
        </div>

        {/* Caravans */}
        <div className="lg:col-span-2 bg-surface rounded-2xl border border-sand-dark/20 p-6">
          <h2 className="font-bold text-surface-dark mb-4 flex items-center gap-2"><Caravan size={16} className="text-ocean" /> Caravans ({caravans.length})</h2>
          {caravans.length === 0 ? <p className="text-sm text-warm-gray/70">Geen caravans</p> : (
            <div className="space-y-3">
              {caravans.map(c => (
                <div key={c.id} className="flex items-center justify-between p-3 bg-sand/40 rounded-xl">
                  <div>
                    <p className="text-sm font-semibold text-surface-dark">{c.brand} {c.model}</p>
                    <p className="text-xs text-warm-gray/70">{c.license_plate} — {c.location_name || '-'} {c.spot_label || ''}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${STATUS_COLORS[c.status] || 'bg-sand/40 text-warm-gray border-sand-dark/30'}`}>{c.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Contracts */}
      <div className="bg-surface rounded-2xl border border-sand-dark/20 p-6">
        <h2 className="font-bold text-surface-dark mb-4 flex items-center gap-2"><FileText size={16} className="text-accent" /> Contracten ({contracts.length})</h2>
        {contracts.length === 0 ? <p className="text-sm text-warm-gray/70">Geen contracten</p> : (
          <table className="w-full text-sm">
            <thead className="text-xs text-warm-gray/70 uppercase border-b border-sand-dark/20">
              <tr><th className="text-left pb-2">Contract</th><th className="text-left pb-2">Periode</th><th className="text-right pb-2">Bedrag/mnd</th><th className="text-center pb-2">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-sand-dark/10">
              {contracts.map(c => (
                <tr key={c.id} className="hover:bg-sand/30">
                  <td className="py-3 font-mono text-xs">{c.contract_number}</td>
                  <td className="py-3 text-xs text-warm-gray">{fmtDate(c.start_date)} — {fmtDate(c.end_date)}</td>
                  <td className="py-3 text-right font-bold">{fmt(c.monthly_rate)}</td>
                  <td className="py-3 text-center"><span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${STATUS_COLORS[c.status] || 'bg-sand/40 text-warm-gray border-sand-dark/30'}`}>{c.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Invoices */}
      <div className="bg-surface rounded-2xl border border-sand-dark/20 p-6">
        <h2 className="font-bold text-surface-dark mb-4 flex items-center gap-2"><Receipt size={16} className="text-warning" /> Facturen ({invoices.length})</h2>
        {invoices.length === 0 ? <p className="text-sm text-warm-gray/70">Geen facturen</p> : (
          <table className="w-full text-sm">
            <thead className="text-xs text-warm-gray/70 uppercase border-b border-sand-dark/20">
              <tr><th className="text-left pb-2">Factuur</th><th className="text-right pb-2">Bedrag</th><th className="text-left pb-2">Vervaldatum</th><th className="text-center pb-2">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-sand-dark/10">
              {invoices.map(i => (
                <tr key={i.id} className="hover:bg-sand/30">
                  <td className="py-3 font-mono text-xs">{i.invoice_number}</td>
                  <td className="py-3 text-right font-bold">{fmt(i.total)}</td>
                  <td className="py-3 text-xs text-warm-gray">{fmtDate(i.due_date)}</td>
                  <td className="py-3 text-center"><span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${STATUS_COLORS[i.status] || 'bg-sand/40 text-warm-gray border-sand-dark/30'}`}>{i.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
