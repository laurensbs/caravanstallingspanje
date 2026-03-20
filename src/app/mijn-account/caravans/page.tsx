'use client';

import { useState, useEffect } from 'react';
import { Caravan, FileText, Receipt, ClipboardCheck, Upload } from 'lucide-react';
import type { CaravanItem, Invoice, Contract } from '../_components/types';
import CaravansTab from '../_components/CaravansTab';
import ContractenTab from '../_components/ContractenTab';
import FacturenTab from '../_components/FacturenTab';
import InspectiesTab from '../_components/InspectiesTab';
import DocumentenTab from '../_components/DocumentenTab';

const SECTIONS = [
  { id: 'caravans', label: 'Caravans', icon: Caravan },
  { id: 'contracten', label: 'Contracten', icon: FileText },
  { id: 'facturen', label: 'Facturen', icon: Receipt },
  { id: 'inspecties', label: 'Inspecties', icon: ClipboardCheck },
  { id: 'documenten', label: 'Documenten', icon: Upload },
];

export default function CaravansPage() {
  const [section, setSection] = useState('caravans');
  const [caravans, setCaravans] = useState<CaravanItem[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [inspections, setInspections] = useState<{ id: number; caravan_name: string; inspection_date: string; type: string; status: string; notes: string }[]>([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/customer/caravans', { credentials: 'include' }).then(r => r.json()),
      fetch('/api/customer/invoices', { credentials: 'include' }).then(r => r.json()),
      fetch('/api/customer/contracts', { credentials: 'include' }).then(r => r.json()),
    ]).then(([c, i, co]) => {
      setCaravans(c.caravans || []);
      setInvoices(i.invoices || []);
      setContracts(co.contracts || []);
    }).catch(() => {});
    fetch('/api/customer/inspections', { credentials: 'include' }).then(r => r.json()).then(d => setInspections(d.inspections || [])).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      {/* Section tabs */}
      <div className="flex gap-1 overflow-x-auto bg-card rounded-2xl shadow-lg shadow-gray-200/30 border border-gray-200 p-1 no-scrollbar">
        {SECTIONS.map(s => (
          <button key={s.id} onClick={() => setSection(s.id)} className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${section === s.id ? 'bg-gradient-to-r from-primary to-primary-light text-white shadow-lg shadow-primary/20' : 'text-gray-500/60 hover:text-gray-500 hover:bg-gray-50'}`}>
            <s.icon size={16} />{s.label}
          </button>
        ))}
      </div>

      {section === 'caravans' && <CaravansTab caravans={caravans} />}
      {section === 'contracten' && <ContractenTab contracts={contracts} />}
      {section === 'facturen' && <FacturenTab invoices={invoices} />}
      {section === 'inspecties' && <InspectiesTab inspections={inspections} />}
      {section === 'documenten' && <DocumentenTab />}
    </div>
  );
}
