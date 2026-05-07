// Vaste checklist-structuur voor caravan-keuringscertificaten.
// Bron: BOVAG-rapport-template (zie 3 PDF-voorbeelden in plan-file).
//
// Deze definitie wordt:
//  - Door reparatie-paneel gebruikt om monteur-formulier te renderen (zelfde
//    keys/labels), zodat saved data 1-op-1 mapt op stallings-side struct.
//  - Door stallings-site gebruikt voor PDF-render + admin-overzicht.
//
// SYNC: copy-paste dit bestand 1-op-1 naar
//   /Users/laurens/Desktop/Caravanstalling/Sites/caravanreparatiespanje/src/lib/inspection-checklist.ts
// als je de structuur wijzigt. Klein bestand, lage onderhoudslast,
// voorkomt cross-repo type-import bridges.

export type InspectionStatus = 'ok' | 'attention' | 'fail';

export interface ChecklistItem {
  /** Stabiele machine-key. NIET wijzigen na productie — JSONB-data verwijst hiernaar. */
  key: string;
  /** Label dat zowel in monteur-form als PDF + klant-portaal verschijnt. */
  label: string;
}

export interface ChecklistSection {
  key: string;
  label: string;
  items: ChecklistItem[];
}

export const CHECKLIST: ChecklistSection[] = [
  {
    key: 'onderstel',
    label: 'Onderstel',
    items: [
      { key: 'oplooprem', label: 'Oplooprem / koppeling' },
      { key: 'stabilisator', label: 'Stabilisator controle' },
      { key: 'oploop_schokdemper', label: 'Oploop rem schokdemper' },
      { key: 'breekkabel', label: 'Breekkabel, ring en geleiding' },
      { key: 'stofhoes', label: 'Stofhoes' },
      { key: 'chassisbouten', label: 'Chassisbouten / moeren' },
      { key: 'chassisraam', label: 'Chassisraam en dissel' },
      { key: 'reservewielhouder', label: 'Reservewielhouder' },
      { key: 'neuswiel', label: 'Neuswiel' },
      { key: 'uitdraai_steunen', label: 'Uitdraai steunen' },
      { key: 'banden_algemeen', label: 'Algehele controle banden' },
      { key: 'velgen', label: 'Velgen' },
      { key: 'as_schokdempers', label: 'As(sen) schokdempers' },
      { key: 'rubbers', label: 'Rubbers' },
      { key: 'remvoeringen', label: 'Remvoeringen en trommels' },
      { key: 'terugrij_automaat', label: 'Terugrij automaat' },
      { key: 'wiellagers', label: 'Wiellagers, naven, keerring' },
      { key: 'remkabels', label: 'Remkabels en ophanging' },
      { key: 'remmen_handrem', label: 'Afstelling remmen / handrem' },
    ],
  },
  {
    key: 'opbouw',
    label: 'Opbouw',
    items: [
      { key: 'bevestiging_opbouw', label: 'Bevestiging opbouw en vloer' },
      { key: 'bevestiging_leidingen', label: 'Bevestiging leidingen' },
      { key: 'rangeergrepen', label: 'Bevestiging rangeergrepen' },
      { key: 'lengte_driehoeken', label: 'Lengte driehoeken' },
      { key: 'zij_reflectoren', label: 'Zij reflectoren' },
      { key: 'kentekenplaat', label: 'Kentekenplaat' },
      { key: 'bodemcontrole', label: 'Bodemcontrole' },
      { key: 'lijstwerk', label: 'Lijstwerk' },
    ],
  },
  {
    key: 'electro',
    label: 'Electro',
    items: [
      { key: 'netaansluiting_230', label: 'Netaansluiting 230 V' },
      { key: 'massa', label: 'Massa van 12 - 220 V' },
      { key: 'zekeringautomaat', label: 'Zekeringautomaat' },
      { key: 'installatie_verlichting', label: '12 / 230 V installatie / verlichting' },
      { key: 'omvormer', label: 'Omvormer' },
      { key: 'accu', label: 'Accu' },
      { key: 'richtingaanwijzers', label: 'Richtingaanwijzers' },
      { key: 'remlichten', label: 'Remlichten' },
      { key: 'achter_kentekenverlichting', label: 'Achter- en kentekenverlichting' },
      { key: 'mistachterlicht', label: 'Mistachterlicht' },
      { key: 'breedtelichten', label: 'Breedtelichten' },
      { key: 'stekker_7_13', label: '7 / 13-polige stekker' },
      { key: 'contour_zijverlichting', label: 'Contour- en zijverlichting' },
      { key: 'achteruitrijlamp', label: 'Achteruitrijlamp' },
    ],
  },
  {
    key: 'gas',
    label: 'Gas',
    items: [
      { key: 'koelkast', label: 'Koelkast' },
      { key: 'gasstel', label: 'Gasstel' },
      { key: 'kachel', label: 'Kachel' },
      { key: 'afvoer_kachel', label: 'Afvoer kachel' },
      { key: 'gasleidingen', label: 'Gasleidingen' },
      { key: 'gasslang', label: 'Gasslang' },
      { key: 'drukregelaar', label: 'Drukregelaar (jaartal)' },
      { key: 'gasflessen', label: 'Gasflessen (aantal)' },
    ],
  },
  {
    key: 'veiligheid',
    label: 'Veiligheid',
    items: [
      { key: 'breekkabel_handrem', label: 'Breekkabel + handrem' },
      { key: 'remkabels_noodvoorz', label: 'Remkabels + noodvoorziening' },
      { key: 'reflecterende_strepen', label: 'Reflecterende strepen' },
      { key: 'eerstehulp', label: 'EHBO-set / blusmiddel (advies)' },
    ],
  },
];

// Banden-data is een aparte structuur — niet als checklist-items.
export type TyrePosition = 'left' | 'left_tandem' | 'right' | 'right_tandem' | 'reserve';

export const TYRE_POSITIONS: Array<{ key: TyrePosition; label: string }> = [
  { key: 'left', label: 'Links' },
  { key: 'left_tandem', label: 'Links (tandemas)' },
  { key: 'right', label: 'Rechts' },
  { key: 'right_tandem', label: 'Rechts (tandemas)' },
  { key: 'reserve', label: 'Reserve' },
];

export interface TyreReading {
  bar: string | null;        // '2,7'
  profile: string | null;    // '4,5' (mm)
  dot: string | null;        // '2118'
  status: InspectionStatus;
  note: string | null;
}

// Format die naar de DB / over de wire gaat. JSONB op stallings-site.
export interface InspectionItemResult {
  key: string;
  status: InspectionStatus;
  note: string | null;
}

export interface InspectionSectionResult {
  key: string;
  items: InspectionItemResult[];
}

export interface InspectionTyresResult {
  left: TyreReading;
  left_tandem?: TyreReading;
  right: TyreReading;
  right_tandem?: TyreReading;
  reserve: TyreReading;
}

export type OverallResult = 'goedgekeurd' | 'afgekeurd';

export interface InspectionCertificateData {
  certificateNumber: string;        // CSS-YYYYMMDD-NNNN
  inspectionDate: string;           // ISO date YYYY-MM-DD
  technicianName: string;
  overallResult: OverallResult;
  technicianNotes: string | null;
  sections: InspectionSectionResult[];
  tyres: InspectionTyresResult;
  // Snapshots — gevuld op moment van versturen, blijven onveranderd
  customer: {
    name: string;
    address: string | null;
    postalCity: string | null;       // '1234 AB Amsterdam'
    customerNumber: string | null;   // KL-00428
  };
  caravan: {
    brand: string | null;
    model: string | null;
    registration: string | null;
    chassis: string | null;
  };
}

// Helper: aggregate-status per sectie voor de overzichts-cards op pagina 1
// van de PDF (✓ groen / ⚠ oranje / ✗ rood).
export function aggregateSectionStatus(items: InspectionItemResult[]): InspectionStatus {
  if (items.some((it) => it.status === 'fail')) return 'fail';
  if (items.some((it) => it.status === 'attention')) return 'attention';
  return 'ok';
}

// Validatie: heeft elke verplichte item een status?
// Niet-strict — items mogen overgeslagen worden (krijgen dan 'ok' default
// in de PDF). Maar als alle items 'ok' zijn moet overallResult ook
// 'goedgekeurd' zijn — anders is er een mismatch.
export function isCertificateConsistent(data: InspectionCertificateData): { ok: boolean; reason?: string } {
  const allItems = data.sections.flatMap((s) => s.items);
  const hasFail = allItems.some((it) => it.status === 'fail');
  if (hasFail && data.overallResult === 'goedgekeurd') {
    return { ok: false, reason: 'Heeft afgekeurde items maar overallResult is goedgekeurd' };
  }
  if (!hasFail && data.overallResult === 'afgekeurd' && !data.technicianNotes) {
    // Afgekeurd zonder fail-items én zonder notitie — dat is verdacht.
    return { ok: false, reason: 'Afgekeurd zonder fail-items en zonder toelichting' };
  }
  return { ok: true };
}
