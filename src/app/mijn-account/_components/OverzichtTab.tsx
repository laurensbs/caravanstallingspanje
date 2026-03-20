'use client';
import { fmt, fmtDate } from '@/lib/format';
import { Caravan, FileText, Receipt, MessageSquare, Wrench, Gift, ClipboardCheck, CheckCircle2, Clock, AlertCircle, Calendar, MapPin, Activity, ArrowRight, Sun, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import type { CustomerData, CaravanItem, Invoice, Contract } from './types';

interface Props {
  customer: CustomerData;
  caravans: CaravanItem[];
  invoices: Invoice[];
  contracts: Contract[];
  setTab: (tab: string) => void;
}

export default function OverzichtTab({ customer, caravans, invoices, contracts, setTab }: Props) {
  const openInvoices = invoices.filter(i => i.status !== 'betaald' && i.status !== 'geannuleerd');
  const overdueInvoices = openInvoices.filter(i => new Date(i.due_date) < new Date());
  const expiringContracts = contracts.filter(c => c.status === 'actief' && new Date(c.end_date) < new Date(Date.now() + 60 * 86400000));
  const expiringDocs = caravans.filter(c =>
    (c.insurance_expiry && new Date(c.insurance_expiry) < new Date(Date.now() + 30 * 86400000)) ||
    (c.apk_expiry && new Date(c.apk_expiry) < new Date(Date.now() + 30 * 86400000))
  );

  const nextActions: { icon: React.ElementType; label: string; desc: string; tab: string; color: string; urgent?: boolean }[] = [];
  if (overdueInvoices.length > 0) nextActions.push({ icon: Receipt, label: `${overdueInvoices.length} achterstallige factuur${overdueInvoices.length > 1 ? 'en' : ''} betalen`, desc: `Totaal: ${fmt(overdueInvoices.reduce((s, i) => s + Number(i.total), 0))}`, tab: 'facturen', color: 'border-danger/30 bg-danger/[0.04]', urgent: true });
  else if (openInvoices.length > 0) nextActions.push({ icon: Receipt, label: `${openInvoices.length} openstaande factuur${openInvoices.length > 1 ? 'en' : ''}`, desc: `${fmt(openInvoices.reduce((s, i) => s + Number(i.total), 0))} openstaand`, tab: 'facturen', color: 'border-warning/30 bg-warning/[0.04]' });
  if (expiringDocs.length > 0) nextActions.push({ icon: AlertCircle, label: `Documenten verlopen binnenkort`, desc: `${expiringDocs.length} caravan${expiringDocs.length > 1 ? 's' : ''} met verlopende verzekering/APK`, tab: 'caravans', color: 'border-warning/30 bg-warning/[0.04]', urgent: true });
  if (expiringContracts.length > 0) nextActions.push({ icon: FileText, label: `Contract verloopt binnenkort`, desc: `${expiringContracts[0]?.contract_number} — ${fmtDate(expiringContracts[0]?.end_date)}`, tab: 'contracten', color: 'border-ocean/30 bg-ocean/[0.04]' });
  if (caravans.length === 0) nextActions.push({ icon: Caravan, label: 'Registreer uw caravan', desc: 'Voeg uw eerste caravan toe aan uw account', tab: 'caravans', color: 'border-primary/30 bg-primary/[0.04]' });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Goedemorgen' : hour < 18 ? 'Goedemiddag' : 'Goedenavond';

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-primary/[0.08] via-accent/[0.06] to-ocean/[0.08] rounded-2xl border border-primary/20 p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/[0.04] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sun size={18} className="text-primary" />
              <span className="text-sm font-medium text-primary">{greeting}</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{customer.name}</h2>
            <p className="text-sm text-gray-500/70 mt-2">
              {caravans.length > 0
                ? `${caravans.length} caravan${caravans.length > 1 ? 's' : ''} veilig gestald · ${contracts.filter(c => c.status === 'actief').length} actief contract${contracts.filter(c => c.status === 'actief').length !== 1 ? 'en' : ''}`
                : 'Welkom bij uw persoonlijke stallingportaal'
              }
            </p>
          </div>
          {caravans.length > 0 && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-accent/10 rounded-full">
              <Sparkles size={13} className="text-accent" />
              <span className="text-xs font-bold text-accent">Alles in orde</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Next Actions */}
      {nextActions.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          className="card-premium p-5">
          <h3 className="text-xs font-bold text-gray-500/60 uppercase tracking-widest mb-3 flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-primary rounded-full" /> Volgende acties
          </h3>
          <div className="space-y-2">
            {nextActions.map((a, i) => (
              <button key={i} onClick={() => setTab(a.tab)} className={`w-full flex items-center gap-4 rounded-xl p-4 border transition-all hover:shadow-md hover:-translate-y-0.5 text-left ${a.color}`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${a.urgent ? 'bg-danger/10' : 'bg-gray-100'}`}>
                  <a.icon size={18} className={a.urgent ? 'text-danger' : 'text-gray-500'} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold ${a.urgent ? 'text-danger' : 'text-gray-900'}`}>{a.label}</p>
                  <p className="text-xs text-gray-500/70">{a.desc}</p>
                </div>
                <ArrowRight size={16} className="text-gray-500/40 shrink-0" />
              </button>
            ))}
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          { icon: Caravan, value: caravans.length, label: 'Gestalde caravans', bg: 'from-ocean/15 to-ocean/5', text: 'text-ocean' },
          { icon: FileText, value: contracts.filter(c => c.status === 'actief').length, label: 'Actieve contracten', bg: 'from-accent/15 to-accent/5', text: 'text-accent' },
          { icon: Receipt, value: openInvoices.length, label: 'Openstaande facturen', bg: 'from-warning/15 to-warning/5', text: 'text-warning' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 + i * 0.08 }}
            className="card-premium p-6">
            <div className={`w-12 h-12 bg-gradient-to-br ${s.bg} rounded-xl flex items-center justify-center mb-4 shadow-sm`}><s.icon size={22} className={s.text} /></div>
            <p className="stat-number text-3xl">{s.value}</p>
            <p className="text-sm text-gray-500/70 mt-1 font-medium">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.35 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: Wrench, label: 'Service aanvragen', tab: 'diensten', color: 'from-primary/12 to-primary/5 text-primary' },
          { icon: MessageSquare, label: 'Bericht sturen', tab: 'berichten', color: 'from-ocean/12 to-ocean/5 text-ocean' },
          { icon: Gift, label: 'Vriend uitnodigen', tab: 'doorverwijzen', color: 'from-accent/12 to-accent/5 text-accent' },
          { icon: ClipboardCheck, label: 'Inspecties bekijken', tab: 'inspecties', color: 'from-warning/12 to-warning/5 text-warning' },
        ].map(a => (
          <button key={a.tab} onClick={() => setTab(a.tab)} className="card-premium p-4 text-center group">
            <div className={`w-11 h-11 bg-gradient-to-br ${a.color} rounded-xl flex items-center justify-center mx-auto mb-2.5 group-hover:scale-110 transition-transform shadow-sm`}>
              <a.icon size={18} />
            </div>
            <p className="text-xs font-bold text-gray-900">{a.label}</p>
          </button>
        ))}
      </motion.div>

      {/* Caravan Summary Cards */}
      {caravans.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.4 }}
          className="card-premium p-6">
          <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-4"><Caravan size={18} className="text-primary" /> Uw caravans</h3>
          <div className="space-y-3">
            {caravans.map(c => (
              <div key={c.id} className="bg-gradient-to-r from-gray-100 to-transparent rounded-xl border border-gray-100 p-4 flex items-center justify-between hover:shadow-sm transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-ocean/15 to-ocean/5 rounded-lg flex items-center justify-center shadow-sm">
                    <Caravan size={18} className="text-ocean" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">{c.brand} {c.model}</p>
                    <p className="text-xs text-gray-500/60">{c.license_plate} &middot; Plek {c.spot_label}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${c.status === 'gestald' ? 'bg-accent/10 text-accent border border-accent/20' : 'bg-warning/10 text-warning border border-warning/20'}`}>
                  {c.status === 'gestald' ? <CheckCircle2 size={11} /> : <Clock size={11} />} {c.status}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Status Timeline */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.45 }}
        className="card-premium p-6">
        <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-6"><Activity size={18} className="text-primary" /> Status tijdlijn</h3>
        <div className="space-y-0">
          {(() => {
            const timeline: { icon: React.ElementType; label: string; date: string; status: 'done' | 'active' | 'upcoming'; color: string }[] = [];

            contracts.filter(c => c.status === 'actief').forEach(c => {
              timeline.push({ icon: FileText, label: `Contract ${c.contract_number} gestart`, date: c.start_date, status: 'done', color: 'bg-accent/100' });
              timeline.push({ icon: Calendar, label: `Contract ${c.contract_number} eindigt`, date: c.end_date, status: new Date(c.end_date) > new Date() ? 'upcoming' : 'done', color: 'bg-warning/100' });
            });

            invoices.slice(0, 5).forEach(inv => {
              if (inv.status === 'betaald') {
                timeline.push({ icon: CheckCircle2, label: `Factuur ${inv.invoice_number} betaald`, date: inv.due_date, status: 'done', color: 'bg-accent/100' });
              } else {
                timeline.push({ icon: Receipt, label: `Factuur ${inv.invoice_number} open (${fmt(inv.total)})`, date: inv.due_date, status: 'active', color: 'bg-ocean/100' });
              }
            });

            caravans.forEach(c => {
              if (c.insurance_expiry && new Date(c.insurance_expiry) < new Date(Date.now() + 30 * 86400000)) {
                timeline.push({ icon: AlertCircle, label: `Verzekering ${c.brand} ${c.model} verloopt`, date: c.insurance_expiry, status: 'active', color: 'bg-danger/100' });
              }
              if (c.apk_expiry && new Date(c.apk_expiry) < new Date(Date.now() + 30 * 86400000)) {
                timeline.push({ icon: AlertCircle, label: `APK ${c.brand} ${c.model} verloopt`, date: c.apk_expiry, status: 'active', color: 'bg-danger/100' });
              }
            });

            timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            if (timeline.length === 0) return <p className="text-sm text-gray-500/70">Geen recente activiteit</p>;

            return timeline.slice(0, 8).map((item, i) => (
              <div key={i} className="flex gap-4 relative">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full ${item.color} flex items-center justify-center flex-shrink-0 ${item.status === 'upcoming' ? 'opacity-40' : ''}`}>
                    <item.icon size={14} className="text-white" />
                  </div>
                  {i < Math.min(timeline.length, 8) - 1 && <div className="w-px h-8 bg-gray-200" />}
                </div>
                <div className={`pb-6 ${item.status === 'upcoming' ? 'opacity-50' : ''}`}>
                  <p className="text-sm font-medium text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-500/70">{fmtDate(item.date)}</p>
                </div>
              </div>
            ));
          })()}
        </div>
      </motion.div>
    </div>
  );
}
