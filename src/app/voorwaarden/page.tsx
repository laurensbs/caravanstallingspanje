import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageHero from '@/components/PageHero';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Algemene Voorwaarden',
  description: 'Algemene voorwaarden van Caravanstalling Spanje voor stallingscontracten en dienstverlening.',
};

const TOC = [
  { id: 'definities', label: 'Art. 1 — Definities' },
  { id: 'toepasselijkheid', label: 'Art. 2 — Toepasselijkheid' },
  { id: 'overeenkomst', label: 'Art. 3 — Stallingsovereenkomst' },
  { id: 'tarieven', label: 'Art. 4 — Tarieven & betaling' },
  { id: 'beveiliging', label: 'Art. 5 — Beveiliging & verzekering' },
  { id: 'onderhoud', label: 'Art. 6 — Onderhoud & reparatie' },
  { id: 'aansprakelijkheid', label: 'Art. 7 — Aansprakelijkheid' },
  { id: 'opzegging', label: 'Art. 8 — Opzegging' },
  { id: 'recht', label: 'Art. 9 — Toepasselijk recht' },
  { id: 'contact', label: 'Art. 10 — Contact' },
];

export default function VoorwaardenPage() {
  return (
    <>
      <Header />
      <PageHero badge="Juridisch" title="Algemene Voorwaarden" subtitle="De voorwaarden voor stallingscontracten en dienstverlening bij Caravanstalling Spanje." image="https://u.cubeupload.com/laurensbos/caravanstoragespain.jpg" />

      <div className="bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
          <div className="flex gap-12">
            {/* Sticky TOC sidebar */}
            <aside className="hidden lg:block w-56 shrink-0">
              <nav className="sticky top-28 space-y-1">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Inhoud</p>
                {TOC.map(item => (
                  <Link key={item.id} href={`#${item.id}`} className="block text-sm text-gray-500 hover:text-primary transition-colors py-1 underline-grow">
                    {item.label}
                  </Link>
                ))}
              </nav>
            </aside>

            {/* Content */}
            <div className="flex-1 max-w-3xl prose-custom space-y-6 text-gray-500 text-sm leading-relaxed">
              <p><strong className="text-gray-900">Laatst bijgewerkt:</strong> 1 januari 2026</p>

              <h2 id="definities" className="text-xl font-bold text-gray-900 mt-8 mb-3 scroll-mt-28">Artikel 1 — Definities</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Verhuurder:</strong> Caravan Storage Spain S.L., gevestigd te Sant Climent de Peralta, Girona, Spanje.</li>
                <li><strong>Huurder:</strong> de natuurlijke of rechtspersoon die een stallingsovereenkomst aangaat.</li>
                <li><strong>Object:</strong> de caravan, camper of aanhanger die door de huurder wordt gestald.</li>
                <li><strong>Terrein:</strong> het afgesloten en beveiligde stallingsterrein van de verhuurder.</li>
              </ul>

              <h2 id="toepasselijkheid" className="text-xl font-bold text-gray-900 mt-8 mb-3 scroll-mt-28">Artikel 2 — Toepasselijkheid</h2>
              <p>Deze voorwaarden zijn van toepassing op alle overeenkomsten tussen verhuurder en huurder met betrekking tot stalling, onderhoud, reparatie, transport en overige dienstverlening. Door ondertekening van het contract of gebruik van onze diensten gaat u akkoord met deze voorwaarden.</p>

              <h2 id="overeenkomst" className="text-xl font-bold text-gray-900 mt-8 mb-3 scroll-mt-28">Artikel 3 — Stallingsovereenkomst</h2>
              <p>3.1. De stallingsovereenkomst wordt aangegaan voor de overeengekomen periode en wordt automatisch verlengd tenzij schriftelijk opgezegd met een opzegtermijn van één kalendermaand.</p>
              <p>3.2. De huurder ontvangt een contractnummer en een toegewezen stallingsplek. Verwisseling van plek is uitsluitend met toestemming van de verhuurder.</p>
              <p>3.3. Alleen het in het contract vermelde object mag op de toegewezen plek worden geplaatst.</p>

              <h2 id="tarieven" className="text-xl font-bold text-gray-900 mt-8 mb-3 scroll-mt-28">Artikel 4 — Tarieven en betaling</h2>
              <p>4.1. De maandelijkse stallingskosten worden bij aanvang van elke maand gefactureerd. Betaling geschiedt binnen 14 dagen na factuurdatum.</p>
              <p>4.2. Bij niet-tijdige betaling geldt een wettelijke rente conform Spaans recht. Na 30 dagen in verzuim behouden wij het recht om het object niet vrij te geven tot alle openstaande bedragen zijn voldaan.</p>
              <p>4.3. Tarieven kunnen jaarlijks worden aangepast. Wijzigingen worden minimaal 2 maanden van tevoren schriftelijk medegedeeld.</p>

              <h2 id="beveiliging" className="text-xl font-bold text-gray-900 mt-8 mb-3 scroll-mt-28">Artikel 5 — Beveiliging en verzekering</h2>
              <p>5.1. Het terrein is beveiligd met Securitas Direct alarm, 24/7 camerabewaking en hekwerk. Toegang is uitsluitend met toestemming van de verhuurder.</p>
              <p>5.2. Alle gestalde objecten zijn standaard verzekerd tegen brand en diefstal via onze collectieve polis. De huurder wordt aangeraden een aanvullende caravanverzekering af te sluiten.</p>
              <p>5.3. De verhuurder is niet aansprakelijk voor schade door overmacht, waaronder maar niet beperkt tot natuurrampen, waterschade door extreme neerslag, of vandalisme door derden ondanks beveiligingsmaatregelen.</p>

              <h2 id="onderhoud" className="text-xl font-bold text-gray-900 mt-8 mb-3 scroll-mt-28">Artikel 6 — Onderhoud en reparatie</h2>
              <p>6.1. Onderhoud en reparatie worden uitsluitend uitgevoerd na schriftelijke opdracht of akkoord via het klantportaal.</p>
              <p>6.2. De verhuurder hanteert gangbare uurlonen en materialenkosten. Een offerte wordt vooraf verstrekt voor werkzaamheden boven €250.</p>
              <p>6.3. De huurder wordt tijdig geïnformeerd bij constatering van calamiteiten of veiligheidsproblemen aan het object.</p>

              <h2 id="aansprakelijkheid" className="text-xl font-bold text-gray-900 mt-8 mb-3 scroll-mt-28">Artikel 7 — Aansprakelijkheid</h2>
              <p>7.1. De aansprakelijkheid van de verhuurder is beperkt tot het bedrag dat door de verzekering wordt uitgekeerd.</p>
              <p>7.2. De huurder is verantwoordelijk voor het actueel houden van contactgegevens en het melden van bijzonderheden aan het object.</p>

              <h2 id="opzegging" className="text-xl font-bold text-gray-900 mt-8 mb-3 scroll-mt-28">Artikel 8 — Opzegging</h2>
              <p>8.1. Opzegging geschiedt schriftelijk (e-mail of brief) met inachtneming van een opzegtermijn van één kalendermaand.</p>
              <p>8.2. Bij opzegging dient het object binnen 14 dagen na het einde van de overeenkomst te worden opgehaald. Na deze termijn worden stallingskosten in rekening gebracht.</p>

              <h2 id="recht" className="text-xl font-bold text-gray-900 mt-8 mb-3 scroll-mt-28">Artikel 9 — Toepasselijk recht</h2>
              <p>Op deze overeenkomst is Spaans recht van toepassing. Geschillen worden voorgelegd aan de bevoegde rechter in Girona, Spanje.</p>

              <h2 id="contact" className="text-xl font-bold text-gray-900 mt-8 mb-3 scroll-mt-28">Artikel 10 — Contact</h2>
              <p>Voor vragen over deze voorwaarden kunt u contact opnemen via info@caravanstalling-spanje.com of bellen naar +34 650 036 755.</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
