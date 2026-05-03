'use client';

import LegalShell from '@/components/LegalShell';
import { useLocale } from '@/components/LocaleProvider';

const LAST_UPDATED = '2026-05-03';

// Privacy-verklaring AVG-conform. Niet-juridisch perfect — laat finale
// versie door een AVG-jurist nakijken. De tekst is bewust toegankelijk
// zonder juridisch jargon zodat klanten 'm écht lezen.

export default function PrivacyPage() {
  const { t, locale } = useLocale();
  const isNl = locale === 'nl';

  return (
    <LegalShell title={t('legal.privacy-title')} lastUpdated={LAST_UPDATED}>
      {isNl ? <NL /> : <EN />}
    </LegalShell>
  );
}

function NL() {
  return (
    <>
      <p>
        Caravan Storage Spain S.L. (&ldquo;wij&rdquo;) verwerkt persoonsgegevens van klanten en
        websitebezoekers. Deze verklaring legt uit welke gegevens we verwerken, waarom,
        hoe lang, en welke rechten je hebt onder de AVG.
      </p>

      <h2>Wie zijn wij?</h2>
      <p>
        <strong>Caravan Storage Spain S.L.</strong>
        <br />
        Ctra de Palamos 9, 17110 Sant Climent de Peralta, Girona, Spanje
        <br />
        E-mail: <a href="mailto:info@caravanstalling-spanje.com">info@caravanstalling-spanje.com</a>
        <br />
        Telefoon: +34 633 77 86 99
      </p>

      <h2>Welke gegevens verwerken we?</h2>
      <ul>
        <li><strong>Contactgegevens</strong>: naam, e-mail, telefoon, adres.</li>
        <li><strong>Voertuiggegevens</strong>: kenteken, merk, model, locatie.</li>
        <li><strong>Boekingsgegevens</strong>: data, dienst, bedrag, status.</li>
        <li><strong>Betaalgegevens</strong>: via Stripe — wij zien geen volledige kaartgegevens.</li>
        <li><strong>Communicatie</strong>: berichten via formulier, mail of telefoon.</li>
        <li><strong>Technisch</strong>: IP-adres, browser, sessiecookies (zie cookiebeleid).</li>
      </ul>

      <h2>Waarom verwerken we ze?</h2>
      <ul>
        <li>Uitvoering van overeenkomst (stalling, transport, reparatie, koelkast/airco-huur).</li>
        <li>Wettelijke verplichting (facturatie, BTW, bewaarplicht 7 jaar).</li>
        <li>Gerechtvaardigd belang (fraudepreventie, IT-beveiliging, klantcontact).</li>
        <li>Toestemming (analytics/marketing-cookies, nieuwsbrief — alleen na opt-in).</li>
      </ul>

      <h2>Hoe lang bewaren we ze?</h2>
      <ul>
        <li>Boeking + factuurgegevens: 7 jaar (fiscale bewaarplicht).</li>
        <li>Klantcontact zonder boeking: 24 maanden, daarna automatisch verwijderd.</li>
        <li>Sessie- en consentcookies: max. 12 maanden.</li>
      </ul>

      <h2>Met wie delen we?</h2>
      <p>
        Alleen met partijen die nodig zijn om de dienst te leveren. Een volledige lijst
        staat op <a href="/verwerkers">/verwerkers</a>. Korte samenvatting:
      </p>
      <ul>
        <li><strong>Stripe</strong> — betalingen.</li>
        <li><strong>Holded</strong> — facturatie.</li>
        <li><strong>Resend</strong> — transactionele e-mail.</li>
        <li><strong>Neon (Postgres)</strong> — onze database (EU-regio).</li>
        <li><strong>Vercel</strong> — hosting.</li>
      </ul>
      <p>We verkopen of verhuren je gegevens nooit aan derden voor advertentiedoeleinden.</p>

      <h2>Jouw rechten</h2>
      <ul>
        <li><strong>Inzage</strong>: opvragen welke gegevens we hebben.</li>
        <li><strong>Rectificatie</strong>: laten corrigeren als iets fout staat.</li>
        <li><strong>Verwijdering</strong>: laten wissen (waar geen wettelijke bewaarplicht geldt).</li>
        <li><strong>Beperking</strong> en <strong>bezwaar</strong>: beperken of bezwaar maken tegen verwerking.</li>
        <li><strong>Dataportabiliteit</strong>: een export ontvangen in machine-leesbaar formaat.</li>
        <li><strong>Toestemming intrekken</strong>: voor analytics/marketing op elk moment via de cookiebanner.</li>
      </ul>
      <p>
        Stuur je verzoek naar <a href="mailto:info@caravanstalling-spanje.com">info@caravanstalling-spanje.com</a>.
        We reageren binnen 30 dagen. Niet tevreden? Je kunt klagen bij de Spaanse
        toezichthouder (AEPD) of de Nederlandse Autoriteit Persoonsgegevens.
      </p>

      <h2>Beveiliging</h2>
      <p>
        We gebruiken HSTS, encrypted database-verbindingen, JWT-authenticatie en
        rate-limiting. Persoonsgegevens worden alleen binnen de EU verwerkt of bij
        partijen met passende waarborgen (Standard Contractual Clauses).
      </p>

      <h2>Wijzigingen</h2>
      <p>
        Bij belangrijke wijzigingen vragen we opnieuw je toestemming via de banner.
        Kleine wijzigingen verschijnen hier met een nieuwe &ldquo;laatst bijgewerkt&rdquo;-datum.
      </p>
    </>
  );
}

function EN() {
  return (
    <>
      <p>
        Caravan Storage Spain S.L. (&ldquo;we&rdquo;) processes personal data from customers and
        website visitors. This statement explains which data we process, why, for how
        long, and what rights you have under the GDPR.
      </p>

      <h2>Who we are</h2>
      <p>
        <strong>Caravan Storage Spain S.L.</strong>
        <br />
        Ctra de Palamos 9, 17110 Sant Climent de Peralta, Girona, Spain
        <br />
        Email: <a href="mailto:info@caravanstalling-spanje.com">info@caravanstalling-spanje.com</a>
        <br />
        Phone: +34 633 77 86 99
      </p>

      <h2>What data do we process?</h2>
      <ul>
        <li><strong>Contact details</strong>: name, email, phone, address.</li>
        <li><strong>Vehicle details</strong>: number plate, brand, model, location.</li>
        <li><strong>Booking data</strong>: dates, service, amount, status.</li>
        <li><strong>Payment data</strong>: via Stripe — we never see full card details.</li>
        <li><strong>Communications</strong>: messages via form, email or phone.</li>
        <li><strong>Technical</strong>: IP address, browser, session cookies (see cookie policy).</li>
      </ul>

      <h2>Why do we process it?</h2>
      <ul>
        <li>Performance of contract (storage, transport, repair, fridge/AC rental).</li>
        <li>Legal obligation (invoicing, VAT, 7-year retention).</li>
        <li>Legitimate interest (fraud prevention, IT security, customer contact).</li>
        <li>Consent (analytics/marketing cookies, newsletter — opt-in only).</li>
      </ul>

      <h2>How long do we keep it?</h2>
      <ul>
        <li>Booking + invoice data: 7 years (tax retention).</li>
        <li>Customer contact without booking: 24 months, then automatically deleted.</li>
        <li>Session and consent cookies: max 12 months.</li>
      </ul>

      <h2>Who do we share with?</h2>
      <p>
        Only parties needed to deliver the service. A full list is on <a href="/verwerkers">/verwerkers</a>. Summary:
      </p>
      <ul>
        <li><strong>Stripe</strong> — payments.</li>
        <li><strong>Holded</strong> — invoicing.</li>
        <li><strong>Resend</strong> — transactional email.</li>
        <li><strong>Neon (Postgres)</strong> — our database (EU region).</li>
        <li><strong>Vercel</strong> — hosting.</li>
      </ul>
      <p>We never sell or rent your data to third parties for advertising.</p>

      <h2>Your rights</h2>
      <ul>
        <li><strong>Access</strong>: request the data we hold about you.</li>
        <li><strong>Rectification</strong>: correct inaccuracies.</li>
        <li><strong>Erasure</strong>: deletion (where no legal retention applies).</li>
        <li><strong>Restriction</strong> and <strong>objection</strong>: limit or object to processing.</li>
        <li><strong>Portability</strong>: receive an export in a machine-readable format.</li>
        <li><strong>Withdraw consent</strong>: for analytics/marketing at any time via the cookie banner.</li>
      </ul>
      <p>
        Send requests to <a href="mailto:info@caravanstalling-spanje.com">info@caravanstalling-spanje.com</a>.
        We respond within 30 days. Not satisfied? You can complain to the Spanish data
        protection authority (AEPD) or the Dutch Autoriteit Persoonsgegevens.
      </p>

      <h2>Security</h2>
      <p>
        We use HSTS, encrypted database connections, JWT authentication and rate
        limiting. Personal data is processed only within the EU or with parties
        offering appropriate safeguards (Standard Contractual Clauses).
      </p>

      <h2>Changes</h2>
      <p>
        For material changes we ask for your consent again via the banner. Minor
        edits appear here with an updated &ldquo;last updated&rdquo; date.
      </p>
    </>
  );
}
