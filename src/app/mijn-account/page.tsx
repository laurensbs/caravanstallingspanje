'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from './_components/AccountContext';
import type { CaravanItem, Invoice, Contract } from './_components/types';
import OverzichtTab from './_components/OverzichtTab';

export default function MijnAccountPage() {
  const { customer } = useAccount();
  const router = useRouter();
  const [caravans, setCaravans] = useState<CaravanItem[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);

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
  }, []);

  if (!customer) return null;

  return (
    <OverzichtTab
      customer={customer}
      caravans={caravans}
      invoices={invoices}
      contracts={contracts}
      setTab={(tab: string) => {
        const routes: Record<string, string> = {
          caravans: '/mijn-account/caravans',
          contracten: '/mijn-account/caravans',
          facturen: '/mijn-account/caravans',
          berichten: '/mijn-account/berichten',
          diensten: '/mijn-account/aanvragen',
          profiel: '/mijn-account/profiel',
        };
        router.push(routes[tab] || '/mijn-account');
      }}
    />
  );
}
