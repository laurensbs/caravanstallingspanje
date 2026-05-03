'use client';

import LegalShell from '@/components/LegalShell';
import { useLocale } from '@/components/LocaleProvider';

const LAST_UPDATED = '2026-05-03';

export default function CookiesPage() {
  const { t, locale } = useLocale();
  const isNl = locale === 'nl';
  return (
    <LegalShell title={t('legal.cookies-title')} lastUpdated={LAST_UPDATED}>
      {isNl ? <NL /> : <EN />}
    </LegalShell>
  );
}

function NL() {
  return (
    <>
      <p>
        Cookies zijn kleine tekstbestanden die je browser opslaat. We gebruiken ze om
        de site te laten werken en — alleen met jouw toestemming — om 'm te verbeteren.
      </p>

      <h2>Categorieën</h2>
      <table>
        <thead>
          <tr>
            <th>Naam</th>
            <th>Categorie</th>
            <th>Doel</th>
            <th>Bewaartijd</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>cs_locale</td>
            <td>Essentieel</td>
            <td>Onthoudt je taalkeuze (NL/EN).</td>
            <td>12 maanden</td>
          </tr>
          <tr>
            <td>cs_consent</td>
            <td>Essentieel</td>
            <td>Bewaart je cookie-keuze. Zonder deze cookie zou de banner steeds opnieuw verschijnen.</td>
            <td>12 maanden</td>
          </tr>
          <tr>
            <td>admin_token</td>
            <td>Essentieel</td>
            <td>Sessie van het beheerportaal. HttpOnly. Alleen op /admin.</td>
            <td>7 dagen</td>
          </tr>
          <tr>
            <td>idea_voted_*</td>
            <td>Essentieel</td>
            <td>Voorkomt dat je twee keer op hetzelfde idee stemt.</td>
            <td>12 maanden</td>
          </tr>
        </tbody>
      </table>

      <h2>Analytische en marketing-cookies</h2>
      <p>
        We zetten <strong>geen</strong> analytische of marketing-cookies tot je
        daarvoor expliciet toestemming geeft via de banner. Dit is in lijn met de
        Spaanse LSSI-CE en de Nederlandse Telecomwet (cookiewet).
      </p>

      <h2>Toestemming wijzigen</h2>
      <p>
        Open de cookiebanner opnieuw om je keuze aan te passen. Of verwijder de
        cookie <code>cs_consent</code> in je browser; bij een volgend bezoek krijg
        je de banner opnieuw.
      </p>
    </>
  );
}

function EN() {
  return (
    <>
      <p>
        Cookies are small text files your browser stores. We use them to make the
        site work and — only with your consent — to improve it.
      </p>

      <h2>Categories</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Purpose</th>
            <th>Lifetime</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>cs_locale</td>
            <td>Essential</td>
            <td>Remembers your language choice (NL/EN).</td>
            <td>12 months</td>
          </tr>
          <tr>
            <td>cs_consent</td>
            <td>Essential</td>
            <td>Stores your cookie preference. Without it the banner would re-appear every visit.</td>
            <td>12 months</td>
          </tr>
          <tr>
            <td>admin_token</td>
            <td>Essential</td>
            <td>Admin portal session. HttpOnly. Only on /admin.</td>
            <td>7 days</td>
          </tr>
          <tr>
            <td>idea_voted_*</td>
            <td>Essential</td>
            <td>Prevents double-voting on ideas.</td>
            <td>12 months</td>
          </tr>
        </tbody>
      </table>

      <h2>Analytics and marketing cookies</h2>
      <p>
        We do <strong>not</strong> set analytics or marketing cookies until you give
        explicit consent via the banner. This complies with Spanish LSSI-CE and the
        EU ePrivacy directive.
      </p>

      <h2>Change your consent</h2>
      <p>
        Re-open the banner to change your choice. Or delete the <code>cs_consent</code>
        cookie in your browser; the banner will re-appear on your next visit.
      </p>
    </>
  );
}
