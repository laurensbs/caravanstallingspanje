'use client';
import { fmt, fmtDate, CUSTOMER_STATUS_COLORS } from '@/lib/format';
import { Caravan, FileText, Receipt, MessageSquare, Wrench, Gift, ClipboardCheck, CheckCircle2, Clock, AlertCircle, Calendar, MapPin, Activity, ArrowRight, Sun } from 'lucide-react';
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
      <div className="bg-gradient-to-r from-primary/[0.08] via-accent/[0.06] to-ocean/[0.08] rounded-2xl border border-primary/20 p-6 md:p-8">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sun size={18} className="text-primary" />
              <span className="text-sm font-medium text-primary">{greeting}</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-surface-dark">{customer.name}</h2>
            <p className="text-sm text-warm-gray/70 mt-2">
              {caravans.length > 0
                ? `${caravans.length} caravan${caravans.length > 1 ? 's' : ''} veilig gestald · ${contracts.filter(c => c.status === 'actief').length} actief contract${contracts.filter(c => c.status === 'actief').length !== 1 ? 'en' : ''}`
                : 'Welkom bij uw persoonlijke stallingportaal'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Next Actions */}
      {nextActions.length > 0 && (
        <div className="bg-surface rounded-2xl border border-sand-dark/20 p-5">
          <h3 className="text-sm font-bold text-warm-gray/70 uppercase tracking-wider mb-3">Volgende acties</h3>
          <div className="space-y-2">
            {nextActions.map((a, i) => (
              <button key={i} onClick={() => setTab(a.tab)} className={`w-full flex items-center gap-4 rounded-xl p-4 border transition-all hover:shadow-md text-left ${a.color}`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${a.urgent ? 'bg-danger/10' : 'bg-sand/60'}`}>
                  <a.icon size={18} className={a.urgent ? 'text-danger' : 'text-warm-gray'} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold ${a.urgent ? 'text-danger' : 'text-surface-dark'}`}>{a.label}</p>
                  <p className="text-xs text-warm-gray/70">{a.desc}</p>
                </div>
                <ArrowRight size={16} className="text-warm-gray/40 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          { icon: Caravan, value: caravans.length, label: 'Gestalde caravans', bg: 'bg-ocean/10', text: 'text-ocean' },
          { icon: FileText, value: contracts.filter(c => c.status === 'actief').length, label: 'Actieve contracten', bg: 'bg-accent/10', text: 'text-accent' },
          { icon: Receipt, value: openInvoices.length, label: 'Openstaande facturen', bg: 'bg-warning/10', text: 'text-warning' },
        ].map(s => (
          <div key={s.label} className="bg-surface rounded-2xl border border-sand-dark/20 p-6 hover:shadow-lg hover:shadow-sand-dark/20 transition-all">
            <div className={`w-11 h-11 ${s.bg} rounded-xl flex items-center justify-center mb-4`}><s.icon size={20} className={s.text} /></div>
            <p className="text-3xl font-black text-surface-dark">{s.value}</p>
            <p className="text-sm text-warm-gray/70 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: Wrench, label: 'Service aanvragen', tab: 'diensten', color: 'bg-primary/10 text-primary' },
          { icon: MessageSquare, label: 'Bericht sturen', tab: 'berichten', color: 'bg-ocean/10 text-ocean' },
          { icon: Gift, label: 'Vriend uitnodigen', tab: 'doorverwijzen', color: 'bg-accent/10 text-accent' },
          { icon: ClipboardCheck, label: 'Inspecties bekijken', tab: 'inspecties', color: 'bg-warning/10 text-warning' },
        ].map(a => (
          <button key={a.tab} onClick={() => setTab(a.tab)} className="bg-surface rounded-xl border border-sand-dark/20 p-4 text-center hover:shadow-md transition-all group">
            <div className={`w-10 h-10 ${a.color} rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform`}>
              <a.icon size={18} />
            </div>
            <p className="text-xs font-semibold">{a.label}</p>
          </button>
        ))}
      </div>

      {/* Caravan Summary Cards */}
      {caravans.length > 0 && (
        <div className="bg-surface rounded-2xl border border-sand-dark/20 p-6">
          <h3 className="font-bold text-surface-dark flex items-center gap-2 mb-4"><Caravan size={18} className="text-primary" /> Uw caravans</h3>
          <div className="space-y-3">
            {caravans.map(c => (
              <div key={c.id} className="bg-white rounded-xl border border-sand-dark/10 p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-ocean/10 rounded-lg flex items-center justify-center">
                    <Caravan size={18} className="text-ocean" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">{c.brand} {c.model}</p>
                    <p className="text-xs text-warm-gray">{c.license_plate} &middot; Plek {c.spot_label}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${c.status === 'gestald' ? 'bg-accent/10 text-accent' : 'bg-warning/10 text-warning'}`}>
                    {c.status === 'gestald' ? <CheckCircle2 size={10} /> : <Clock size={10} />} {c.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status Timeline */}
      <div className="bg-surface rounded-2xl border border-sand-dark/20 p-6">
        <h3 className="font-bold text-surface-dark flex items-center gap-2 mb-6"><Activity size={18} className="text-primary" /> Status tijdlijn</h3>
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

            if (timeline.length === 0) return <p className="text-sm text-warm-gray/70">Geen recente activiteit</p>;

            return timeline.slice(0, 8).map((item, i) => (
              <div key={i} className="flex gap-4 relative">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full ${item.color} flex items-center justify-center flex-shrink-0 ${item.status === 'upcoming' ? 'opacity-40' : ''}`}>
                    <item.icon size={14} className="text-white" />
                  </div>
                  {i < Math.min(timeline.length, 8) - 1 && <div className="w-px h-8 bg-sand-dark/30" />}
                </div>
                <div className={`pb-6 ${item.status === 'upcoming' ? 'opacity-50' : ''}`}>
                  <p className="text-sm font-medium text-surface-dark">{item.label}</p>
                  <p className="text-xs text-warm-gray/70">{fmtDate(item.date)}</p>
                </div>
              </div>
            ));
          })()}
        </div>
      </div>
    </div>
  );
}
