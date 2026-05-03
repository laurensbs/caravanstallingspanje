'use client';

import LegalShell from '@/components/LegalShell';
import { useLocale } from '@/components/LocaleProvider';

const LAST_UPDATED = '2026-05-03';

export default function ProcessorsPage() {
  const { t, locale } = useLocale();
  const isNl = locale === 'nl';
  return (
    <LegalShell title={t('legal.processors-title')} lastUpdated={LAST_UPDATED}>
      {isNl ? <NL /> : <EN />}
    </LegalShell>
  );
}

const ROWS = [
  {
    name: 'Stripe Payments Europe Ltd.',
    purposeNl: 'Betalingsverwerking (kaart, iDEAL, Bancontact, Apple/Google Pay).',
    purposeEn: 'Payment processing (card, iDEAL, Bancontact, Apple/Google Pay).',
    location: 'Ierland (EU)',
    locationEn: 'Ireland (EU)',
    dpa: 'https://stripe.com/legal/dpa',
  },
  {
    name: 'Holded SL',
    purposeNl: 'Facturatie en boekhoudkoppeling.',
    purposeEn: 'Invoicing and accounting integration.',
    location: 'Spanje (EU)',
    locationEn: 'Spain (EU)',
    dpa: 'https://www.holded.com/legal',
  },
  {
    name: 'Resend, Inc.',
    purposeNl: 'Transactionele e-mail (bevestigingen, herinneringen).',
    purposeEn: 'Transactional email (confirmations, reminders).',
    location: 'VS (SCC + EU-data-region)',
    locationEn: 'US (SCC + EU data region)',
    dpa: 'https://resend.com/legal/dpa',
  },
  {
    name: 'Neon, Inc.',
    purposeNl: 'PostgreSQL-database (klant- en boekingsgegevens).',
    purposeEn: 'PostgreSQL database (customer and booking data).',
    location: 'EU (eu-central-1)',
    locationEn: 'EU (eu-central-1)',
    dpa: 'https://neon.tech/dpa',
  },
  {
    name: 'Vercel Inc.',
    purposeNl: 'Hosting en CDN voor de website.',
    purposeEn: 'Website hosting and CDN.',
    location: 'EU + VS (SCC)',
    locationEn: 'EU + US (SCC)',
    dpa: 'https://vercel.com/legal/dpa',
  },
];

function NL() {
  return (
    <>
      <p>
        Onderstaande partijen verwerken gegevens namens ons. Voor elk hebben we
        een verwerkersovereenkomst (DPA) en — waar van toepassing — Standard
        Contractual Clauses voor doorgifte buiten de EU.
      </p>

      <table>
        <thead>
          <tr>
            <th>Verwerker</th>
            <th>Doel</th>
            <th>Locatie</th>
            <th>DPA</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((r) => (
            <tr key={r.name}>
              <td>{r.name}</td>
              <td>{r.purposeNl}</td>
              <td>{r.location}</td>
              <td>
                <a href={r.dpa} target="_blank" rel="noopener noreferrer">link</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p>
        Vragen over deze lijst? Mail{' '}
        <a href="mailto:info@caravanstalling-spanje.com">info@caravanstalling-spanje.com</a>.
      </p>
    </>
  );
}

function EN() {
  return (
    <>
      <p>
        The parties below process data on our behalf. We have a DPA with each, and
        — where applicable — Standard Contractual Clauses for transfers outside
        the EU.
      </p>

      <table>
        <thead>
          <tr>
            <th>Processor</th>
            <th>Purpose</th>
            <th>Location</th>
            <th>DPA</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((r) => (
            <tr key={r.name}>
              <td>{r.name}</td>
              <td>{r.purposeEn}</td>
              <td>{r.locationEn}</td>
              <td>
                <a href={r.dpa} target="_blank" rel="noopener noreferrer">link</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p>
        Questions? Email{' '}
        <a href="mailto:info@caravanstalling-spanje.com">info@caravanstalling-spanje.com</a>.
      </p>
    </>
  );
}
