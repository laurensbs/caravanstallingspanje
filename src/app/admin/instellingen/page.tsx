'use client';

import { useState, useEffect } from 'react';
import { Settings, Save, Shield, Bell, Euro, Building } from 'lucide-react';

export default function InstellingenPage() {
  const [activeTab, setActiveTab] = useState('bedrijf');
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    company_name: 'Caravan Storage Spain S.L.',
    company_email: 'info@caravanstalling-spanje.com',
    company_phone: '',
    company_address: 'Ctra de Palamos, 91',
    company_city: 'Sant Climent de Peralta',
    company_postal: '17110',
    company_country: 'Spanje',
    company_kvk: '',
    company_btw: '',
    default_tax_rate: '21',
    invoice_prefix: 'FAC',
    contract_prefix: 'CON',
    auto_renewal_default: true,
    inspection_interval_days: '14',
    insurance_reminder_days: '30',
    apk_reminder_days: '30',
    email_new_booking: true,
    email_invoice: true,
    email_inspection: false,
  });

  useEffect(() => {
    fetch('/api/admin/settings', { credentials: 'include' })
      .then(r => r.json())
      .then(data => { if (data.settings) setSettings(s => ({...s, ...data.settings})); })
      .catch(() => {});
  }, []);

  const save = async () => {
    setSaving(true);
    await fetch('/api/admin/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ settings }), credentials: 'include' });
    setSaving(false);
  };

  const tabs = [
    { id: 'bedrijf', label: 'Bedrijfsgegevens', icon: Building },
    { id: 'facturatie', label: 'Facturatie', icon: Euro },
    { id: 'operatie', label: 'Operatie', icon: Settings },
    { id: 'notificaties', label: 'Notificaties', icon: Bell },
    { id: 'beveiliging', label: 'Beveiliging', icon: Shield },
  ];

  const Input = ({ label, field, type = 'text' }: { label: string; field: string; type?: string }) => (
    <div>
      <label className="text-xs font-semibold text-slate-500 block mb-1">{label}</label>
      <input type={type} value={(settings as Record<string,string|number|boolean>)[field] as string || ''} onChange={e => setSettings(s => ({...s, [field]: e.target.value}))} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-slate-50/50 focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 outline-none transition-all" />
    </div>
  );

  const Toggle = ({ label, desc, field }: { label: string; desc: string; field: string }) => (
    <div className="flex items-center justify-between py-3">
      <div><p className="text-sm font-medium text-slate-700">{label}</p><p className="text-xs text-slate-400">{desc}</p></div>
      <button type="button" onClick={() => setSettings(s => ({...s, [field]: !(s as Record<string,string|number|boolean>)[field]}))} className={`w-10 h-6 rounded-full transition ${(settings as Record<string,string|number|boolean>)[field] ? 'bg-amber-500' : 'bg-slate-300'} relative`}>
        <span className={`w-4 h-4 bg-white rounded-full absolute top-1 transition ${(settings as Record<string,string|number|boolean>)[field] ? 'left-5' : 'left-1'}`} />
      </button>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-black text-slate-900">Instellingen</h1>
        <button onClick={save} disabled={saving} className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"><Save size={16} />{saving ? 'Opslaan...' : 'Opslaan'}</button>
      </div>

      <div className="flex gap-6">
        <div className="w-56 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-slate-100 p-2 space-y-1">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-left transition-all ${activeTab === t.id ? 'bg-gradient-to-r from-amber-50 to-amber-100/50 text-amber-700 font-semibold border border-amber-200/50' : 'hover:bg-slate-50 text-slate-400 hover:text-slate-600'}`}><t.icon size={16} />{t.label}</button>
            ))}
          </div>
        </div>

        <div className="flex-1 bg-white rounded-2xl border border-slate-100 p-6">
          {activeTab === 'bedrijf' && (
            <div className="space-y-4">
              <h2 className="font-bold mb-4">Bedrijfsgegevens</h2>
              <Input label="Bedrijfsnaam" field="company_name" />
              <div className="grid grid-cols-2 gap-4">
                <Input label="E-mail" field="company_email" type="email" />
                <Input label="Telefoon" field="company_phone" />
              </div>
              <Input label="Adres" field="company_address" />
              <div className="grid grid-cols-3 gap-4">
                <Input label="Stad" field="company_city" />
                <Input label="Postcode" field="company_postal" />
                <Input label="Land" field="company_country" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="KVK / CIF" field="company_kvk" />
                <Input label="BTW-nummer" field="company_btw" />
              </div>
            </div>
          )}

          {activeTab === 'facturatie' && (
            <div className="space-y-4">
              <h2 className="font-bold mb-4">Facturatie-instellingen</h2>
              <div className="grid grid-cols-3 gap-4">
                <Input label="Standaard BTW %" field="default_tax_rate" type="number" />
                <Input label="Factuur prefix" field="invoice_prefix" />
                <Input label="Contract prefix" field="contract_prefix" />
              </div>
              <Toggle label="Automatische verlenging" desc="Standaard automatisch verlengen voor nieuwe contracten" field="auto_renewal_default" />
            </div>
          )}

          {activeTab === 'operatie' && (
            <div className="space-y-4">
              <h2 className="font-bold mb-4">Operationele instellingen</h2>
              <div className="grid grid-cols-3 gap-4">
                <Input label="Inspectie-interval (dagen)" field="inspection_interval_days" type="number" />
                <Input label="Verzekering herinnering (dagen voor vervaldatum)" field="insurance_reminder_days" type="number" />
                <Input label="APK herinnering (dagen voor vervaldatum)" field="apk_reminder_days" type="number" />
              </div>
            </div>
          )}

          {activeTab === 'notificaties' && (
            <div className="space-y-2">
              <h2 className="font-bold mb-4">E-mail notificaties</h2>
              <Toggle label="Nieuwe boeking" desc="E-mail bij nieuwe contractaanvraag" field="email_new_booking" />
              <Toggle label="Factuur verstuurd" desc="Bevestiging bij versturen factuur" field="email_invoice" />
              <Toggle label="Inspectie rapport" desc="E-mail na afronding inspectie" field="email_inspection" />
            </div>
          )}

          {activeTab === 'beveiliging' && (
            <div className="space-y-6">
              <h2 className="font-bold mb-4">Beveiliging</h2>
              <div className="p-4 bg-slate-50 rounded-xl">
                <h3 className="font-medium text-sm text-slate-700 mb-2">Wachtwoord wijzigen</h3>
                <div className="space-y-3">
                  <input type="password" placeholder="Huidig wachtwoord" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-amber-400/20 outline-none" />
                  <input type="password" placeholder="Nieuw wachtwoord" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-amber-400/20 outline-none" />
                  <input type="password" placeholder="Bevestig nieuw wachtwoord" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-amber-400/20 outline-none" />
                  <button className="bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold px-4 py-2 rounded-xl text-sm shadow-md shadow-amber-500/20">Wijzigen</button>
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <h3 className="font-medium text-sm text-slate-700 mb-2">Database</h3>
                <p className="text-xs text-slate-400 mb-3">Initialiseer de database of reset alle tabellen.</p>
                <div className="flex gap-2">
                  <button onClick={async () => { await fetch('/api/setup', { method: 'POST' }); alert('Database geïnitialiseerd'); }} className="bg-green-600 text-white font-semibold px-4 py-2 rounded-xl text-sm">Database initialiseren</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
