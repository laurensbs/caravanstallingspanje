import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageHero from '@/components/PageHero';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacybeleid',
  description: 'Lees hoe Caravanstalling Spanje omgaat met uw persoonsgegevens conform de AVG/GDPR.',
};

const TOC = [
  { id: 'verwerkingsverantwoordelijke', label: '1. Verwerkingsverantwoordelijke' },
  { id: 'welke-gegevens', label: '2. Welke gegevens' },
  { id: 'grondslag', label: '3. Grondslag & doeleinden' },
  { id: 'bewaartermijn', label: '4. Bewaartermijn' },
  { id: 'derden', label: '5. Delen met derden' },
  { id: 'rechten', label: '6. Uw rechten' },
  { id: 'cookies', label: '7. Cookies' },
  { id: 'beveiliging', label: '8. Beveiliging' },
  { id: 'klachten', label: '9. Klachten' },
];

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <PageHero badge="Juridisch" title="Privacybeleid" subtitle="Hoe wij omgaan met uw persoonsgegevens conform de AVG/GDPR." image="https://u.cubeupload.com/laurensbos/caravanstoragespain.jpg" />

      <div className="bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
          <div className="flex gap-12">
            {/* Sticky TOC sidebar */}
            <aside className="hidden lg:block w-56 shrink-0">
              <nav className="sticky top-28 space-y-1">
                <p className="text-xs font-bold text-warm-gray uppercase tracking-wider mb-3">Inhoud</p>
                {TOC.map(item => (
                  <Link key={item.id} href={`#${item.id}`} className="block text-sm text-warm-gray hover:text-primary transition-colors py-1 underline-grow">
                    {item.label}
                  </Link>
                ))}
              </nav>
            </aside>

            {/* Content */}
            <div className="flex-1 max-w-3xl prose-custom space-y-6 text-warm-gray text-sm leading-relaxed">
              <p><strong className="text-surface-dark">Laatst bijgewerkt:</strong> 1 januari 2026</p>

              <p>Caravan Storage Spain S.L. (hierna: &quot;Caravanstalling Spanje&quot;, &quot;wij&quot;, &quot;ons&quot;) respecteert uw privacy en verwerkt persoonsgegevens in overeenstemming met de Algemene Verordening Gegevensbescherming (AVG/GDPR) en de Spaanse LOPDGDD.</p>

              <h2 id="verwerkingsverantwoordelijke" className="text-xl font-bold text-surface-dark mt-8 mb-3 scroll-mt-28">1. Verwerkingsverantwoordelijke</h2>
              <p>Caravan Storage Spain S.L.<br />Ctra de Palamos 91, 17110 Sant Climent de Peralta, Girona, Spanje<br />E-mail: info@caravanstalling-spanje.com<br />Telefoon: +34 650 036 755</p>

              <h2 id="welke-gegevens" className="text-xl font-bold text-surface-dark mt-8 mb-3 scroll-mt-28">2. Welke gegevens verzamelen wij?</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Contactgegevens:</strong> naam, e-mailadres, telefoonnummer, adres</li>
                <li><strong>Caravangegevens:</strong> merk, model, kenteken, bouwjaar</li>
                <li><strong>Contractgegevens:</strong> stallingstype, looptijd, facturatiegegevens</li>
                <li><strong>Technische gegevens:</strong> IP-adres, browsertype, paginabezoeken (via cookies)</li>
                <li><strong>Communicatie:</strong> berichten via het contactformulier of e-mail</li>
              </ul>

              <h2 id="grondslag" className="text-xl font-bold text-surface-dark mt-8 mb-3 scroll-mt-28">3. Grondslag en doeleinden</h2>
              <p>Wij verwerken uw gegevens op basis van:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Uitvoering van de overeenkomst:</strong> het uitvoeren van stallingscontracten, facturatie en servicemeldingen.</li>
                <li><strong>Gerechtvaardigd belang:</strong> website-analyse, beveiliging en fraudepreventie.</li>
                <li><strong>Toestemming:</strong> het versturen van nieuwsbrieven of marketingcommunicatie (u kunt zich altijd afmelden).</li>
                <li><strong>Wettelijke verplichting:</strong> belastingadministratie en boekhoudverplichtingen.</li>
              </ul>

              <h2 id="bewaartermijn" className="text-xl font-bold text-surface-dark mt-8 mb-3 scroll-mt-28">4. Bewaartermijn</h2>
              <p>Wij bewaren uw gegevens niet langer dan noodzakelijk. Contractgegevens en facturen worden 7 jaar bewaard conform Spaanse belastingwetgeving. Contactformulierberichten worden na 12 maanden verwijderd. Klantportaal-accounts worden 6 maanden na beëindiging van het contract verwijderd.</p>

              <h2 id="derden" className="text-xl font-bold text-surface-dark mt-8 mb-3 scroll-mt-28">5. Delen met derden</h2>
              <p>Wij delen uw gegevens alleen met:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Betalingsverwerkers:</strong> Stripe voor het verwerken van online betalingen.</li>
                <li><strong>Hosting:</strong> Vercel (serverlocatie: Frankfurt, Duitsland) en Neon (database).</li>
                <li><strong>Beveiligingsdienst:</strong> Securitas Direct voor alarmmeldingen (geen persoonsgegevens gedeeld).</li>
              </ul>
              <p>Wij verkopen uw gegevens nooit aan derden.</p>

              <h2 id="rechten" className="text-xl font-bold text-surface-dark mt-8 mb-3 scroll-mt-28">6. Uw rechten</h2>
              <p>U heeft het recht op:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Inzage in uw persoonsgegevens</li>
                <li>Rectificatie van onjuiste gegevens</li>
                <li>Verwijdering (&quot;recht op vergetelheid&quot;)</li>
                <li>Beperking van de verwerking</li>
                <li>Overdraagbaarheid van uw gegevens</li>
                <li>Bezwaar tegen verwerking</li>
              </ul>
              <p>Neem contact met ons op via info@caravanstalling-spanje.com om uw rechten uit te oefenen. Wij reageren binnen 30 dagen.</p>

              <h2 id="cookies" className="text-xl font-bold text-surface-dark mt-8 mb-3 scroll-mt-28">7. Cookies</h2>
              <p>Onze website gebruikt functionele cookies (noodzakelijk voor het functioneren van de website) en analytische cookies (om het gebruik van de website te meten). U kunt cookies beheren via uw browserinstellingen.</p>

              <h2 id="beveiliging" className="text-xl font-bold text-surface-dark mt-8 mb-3 scroll-mt-28">8. Beveiliging</h2>
              <p>Wij nemen passende technische en organisatorische maatregelen om uw gegevens te beschermen, waaronder versleutelde verbindingen (TLS/SSL), toegangsbeperking, en regelmatige beveiligingsaudits.</p>

              <h2 id="klachten" className="text-xl font-bold text-surface-dark mt-8 mb-3 scroll-mt-28">9. Klachten</h2>
              <p>Heeft u een klacht over onze gegevensverwerking? Neem eerst contact met ons op. U kunt ook een klacht indienen bij de Spaanse toezichthouder (Agencia Española de Protección de Datos, www.aepd.es) of de Autoriteit Persoonsgegevens in Nederland (www.autoriteitpersoonsgegevens.nl).</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
