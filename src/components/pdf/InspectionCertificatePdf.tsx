// Server-side PDF-renderer voor keuringscertificaten.
// Wordt aangeroepen vanuit /api/account/inspection-certs/[id]/pdf en
// /api/admin/inspection-certs/[id]/pdf.
//
// Stijl matcht de 3 PDF-voorbeelden uit /Users/laurens/Desktop/...keuringen/
// (BOVAG-template): blauwe header-balk, oranje accent-onderlijn, secties als
// donkerblauwe gekleurde headers met witte tekst, status-icoontjes per item.

import {
  Document, Page, Text, View, StyleSheet, Image, Font,
} from '@react-pdf/renderer';
import type {
  InspectionItemResult, InspectionSectionResult, InspectionTyresResult,
} from '@/lib/inspection-checklist';
import { CHECKLIST, TYRE_POSITIONS, aggregateSectionStatus } from '@/lib/inspection-checklist';
import type { InspectionCertificateRow } from '@/lib/db';

// ─── Brand-kleuren (matchen de PDF-voorbeelden) ───
const NAVY = '#1F2A36';
const NAVY_DARK = '#0F1B24';
const ORANGE = '#F4B942';
const GREEN = '#22C55E';
const GREEN_SOFT = '#DCFCE7';
const AMBER = '#F59E0B';
const AMBER_SOFT = '#FEF3C7';
const RED = '#EF4444';
const RED_SOFT = '#FEE2E2';
const GRAY_LIGHT = '#F3F4F6';
const GRAY_BORDER = '#E5E7EB';
const TEXT_MUTED = '#6B7280';

// React-pdf gebruikt geen browser-fonts; we registreren Helvetica-defaults
// (built-in) zodat we geen network-fetch hoeven te doen tijdens render.
// Custom fonts kunnen later via Font.register als we typografie willen
// uniformeren met de site (Sora/Inter).
void Font;

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: NAVY,
    paddingTop: 24,
    paddingBottom: 60,
    paddingHorizontal: 28,
    backgroundColor: '#fff',
  },
  // Topbar met logo + titel rechts
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: NAVY,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginBottom: 10,
    borderRadius: 4,
  },
  topbarLogo: {
    backgroundColor: '#fff',
    borderRadius: 4,
    padding: 6,
    width: 130,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topbarLogoImg: {
    height: 24,
    width: 'auto',
  },
  topbarTitleRight: {
    color: '#fff',
    textAlign: 'right',
  },
  topbarTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  topbarSubtitle: {
    fontSize: 7.5,
    color: '#A0AEC0',
    marginTop: 2,
  },

  // Pagina 1 grote titel
  bigTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: NAVY,
    textAlign: 'center',
    marginTop: 18,
  },
  bigTitleAccent: {
    width: 80,
    height: 2,
    backgroundColor: ORANGE,
    alignSelf: 'center',
    marginTop: 4,
    marginBottom: 6,
  },
  bigSubtitle: {
    fontSize: 10,
    color: TEXT_MUTED,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 18,
  },

  // Cert-nr + datum-rij
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 9,
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  metaLabel: { color: TEXT_MUTED },
  metaValue: { fontWeight: 'bold', marginLeft: 6 },

  // Sectie-card (klant-info, gecontroleerde onderdelen)
  card: {
    borderWidth: 1,
    borderColor: GRAY_BORDER,
    borderRadius: 4,
    marginBottom: 10,
  },
  cardHeader: {
    backgroundColor: NAVY,
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 9,
    paddingVertical: 5,
    paddingHorizontal: 8,
    letterSpacing: 0.5,
  },
  cardBody: {
    padding: 10,
    backgroundColor: GRAY_LIGHT,
  },

  // Klant-grid (2 koloms)
  gridRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  gridCol: { flex: 1 },
  fieldLabel: {
    fontSize: 7.5,
    color: TEXT_MUTED,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 1,
  },
  fieldValue: {
    fontSize: 10,
    color: NAVY,
  },

  // Resultaat-banner pagina 1
  resultBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderWidth: 2,
    borderRadius: 4,
    marginVertical: 8,
  },
  resultBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  resultBadgeText: {
    fontSize: 7,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  resultDesc: {
    fontSize: 9,
    color: NAVY,
  },

  // Per-sectie status-rijen op pagina 1
  sectionStatusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  sectionStatusCell: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  statusBox: {
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  statusBoxText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 9,
  },
  sectionStatusLabel: {
    fontSize: 9.5,
    fontWeight: 'bold',
  },
  sectionStatusSub: {
    fontSize: 7.5,
    color: TEXT_MUTED,
  },

  // Bevindingen-lijst pagina 1 (afgekeurd-template)
  findingsList: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: GRAY_LIGHT,
  },
  findingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  findingBox: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  findingBoxText: { color: '#fff', fontSize: 8, fontWeight: 'bold' },
  findingTitle: { fontSize: 9, fontWeight: 'bold' },
  findingDesc: { fontSize: 8.5, color: NAVY },

  // Bevindingen-rij pagina 2/3
  inspRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: GRAY_BORDER,
  },
  inspRowAlt: {
    backgroundColor: '#FAFBFC',
  },
  inspBox: {
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  inspBoxText: { color: '#fff', fontWeight: 'bold', fontSize: 9 },
  inspLabel: { fontSize: 9, fontWeight: 'bold', flex: 0.45 },
  inspNote: { fontSize: 8.5, color: TEXT_MUTED, fontStyle: 'italic', flex: 0.55 },

  inspSectionHeader: {
    backgroundColor: NAVY,
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    padding: 6,
    marginTop: 12,
    marginBottom: 0,
    borderTopRightRadius: 2,
    borderTopLeftRadius: 2,
  },

  // Banden-tabel
  tyresGrid: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  tyreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: GRAY_BORDER,
  },
  tyreLabel: { fontSize: 9, fontWeight: 'bold', flex: 0.25 },
  tyreCell: { flex: 0.2, flexDirection: 'column' },
  tyreCellLabel: { fontSize: 7, color: TEXT_MUTED },
  tyreCellValue: { fontSize: 9 },
  tyreNote: { fontSize: 8, color: RED, fontStyle: 'italic', flex: 0.35 },

  // Notities monteur
  techNotes: {
    borderWidth: 1,
    borderColor: GRAY_BORDER,
    borderRadius: 3,
    padding: 8,
    marginTop: 6,
    fontSize: 9,
    lineHeight: 1.5,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 18,
    left: 28,
    right: 28,
    fontSize: 7.5,
    color: TEXT_MUTED,
    paddingTop: 6,
    borderTopWidth: 0.5,
    borderTopColor: GRAY_BORDER,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  // Uitvoerder + stempel pagina 1
  signRow: {
    flexDirection: 'row',
    marginTop: 14,
    gap: 10,
  },
  signCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: GRAY_BORDER,
    borderRadius: 3,
    padding: 10,
    minHeight: 70,
  },
  signLabel: {
    fontSize: 7.5,
    color: TEXT_MUTED,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  signValue: { fontSize: 10, fontWeight: 'bold' },
  signLine: {
    borderTopWidth: 0.5,
    borderTopColor: GRAY_BORDER,
    borderTopStyle: 'dashed',
    marginTop: 14,
    marginBottom: 2,
  },
  signFooter: {
    fontSize: 7.5,
    color: TEXT_MUTED,
    fontStyle: 'italic',
  },
  stamp: {
    borderWidth: 1.5,
    borderColor: ORANGE,
    borderStyle: 'solid',
    borderRadius: 3,
    padding: 6,
    width: 80,
    alignSelf: 'center',
    marginTop: 12,
    transform: 'rotate(-6deg)',
  },
  stampText: {
    color: ORANGE,
    fontSize: 8,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});

function colorForStatus(s: string): { bg: string; soft: string } {
  if (s === 'fail') return { bg: RED, soft: RED_SOFT };
  if (s === 'attention') return { bg: AMBER, soft: AMBER_SOFT };
  return { bg: GREEN, soft: GREEN_SOFT };
}

function StatusBox({ status, size = 14 }: { status: string; size?: number }) {
  const { bg } = colorForStatus(status);
  const icon = status === 'fail' ? '✗' : status === 'attention' ? '!' : '✓';
  return (
    <View style={[styles.statusBox, { backgroundColor: bg, width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.statusBoxText, { fontSize: size * 0.62 }]}>{icon}</Text>
    </View>
  );
}

interface Props {
  cert: InspectionCertificateRow;
  logoBase64?: string; // optional embedded data:image/png;base64,...
}

export default function InspectionCertificatePdf({ cert, logoBase64 }: Props) {
  const sections: InspectionSectionResult[] = Array.isArray(cert.sections_data)
    ? (cert.sections_data as InspectionSectionResult[])
    : [];
  const tyres = (cert.tyres_data as InspectionTyresResult | null) || null;
  const isPassed = cert.overall_result === 'goedgekeurd';
  const allItems = sections.flatMap((s) => s.items);
  const fails = allItems.filter((i) => i.status === 'fail');
  const attentions = allItems.filter((i) => i.status === 'attention');

  return (
    <Document
      title={`Keuringscertificaat ${cert.certificate_number}`}
      author="Caravan Storage Spain"
      subject="Officiële verklaring van onderhoudsbeurt en keuring"
    >
      {/* PAGINA 1 — certificaat */}
      <Page size="A4" style={styles.page}>
        <Topbar logoBase64={logoBase64} pageInfo="Pagina 1" />

        <Text style={styles.bigTitle}>CERTIFICATE OF INSPECTION</Text>
        <View style={styles.bigTitleAccent} />
        <Text style={styles.bigSubtitle}>
          Officiële verklaring van onderhoudsbeurt en keuring
        </Text>

        <View style={styles.metaRow}>
          <View style={{ flexDirection: 'row' }}>
            <Text style={styles.metaLabel}>Certificaatnummer:</Text>
            <Text style={styles.metaValue}>{cert.certificate_number}</Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <Text style={styles.metaLabel}>Datum keuring:</Text>
            <Text style={styles.metaValue}>{formatDate(cert.inspection_date)}</Text>
          </View>
        </View>

        {/* Klant + voertuig */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>KLANT- EN VOERTUIGGEGEVENS</Text>
          <View style={styles.cardBody}>
            <View style={styles.gridRow}>
              <View style={styles.gridCol}>
                <Text style={styles.fieldLabel}>Klant</Text>
                <Text style={styles.fieldValue}>{cert.customer_name_snapshot || '—'}</Text>
              </View>
              <View style={styles.gridCol}>
                <Text style={styles.fieldLabel}>Merk</Text>
                <Text style={styles.fieldValue}>{cert.caravan_brand_snapshot || '—'}</Text>
              </View>
            </View>
            <View style={styles.gridRow}>
              <View style={styles.gridCol}>
                <Text style={styles.fieldLabel}>Adres</Text>
                <Text style={styles.fieldValue}>{cert.customer_address_snapshot || '—'}</Text>
              </View>
              <View style={styles.gridCol}>
                <Text style={styles.fieldLabel}>Type</Text>
                <Text style={styles.fieldValue}>{cert.caravan_model_snapshot || '—'}</Text>
              </View>
            </View>
            <View style={styles.gridRow}>
              <View style={styles.gridCol}>
                <Text style={styles.fieldLabel}>Postcode/plaats</Text>
                <Text style={styles.fieldValue}>{cert.customer_postal_city_snapshot || '—'}</Text>
              </View>
              <View style={styles.gridCol}>
                <Text style={styles.fieldLabel}>Kenteken</Text>
                <Text style={styles.fieldValue}>{cert.caravan_registration_snapshot || '—'}</Text>
              </View>
            </View>
            <View style={styles.gridRow}>
              <View style={styles.gridCol}>
                <Text style={styles.fieldLabel}>Klantnummer</Text>
                <Text style={styles.fieldValue}>{cert.customer_number_snapshot || '—'}</Text>
              </View>
              <View style={styles.gridCol}>
                <Text style={styles.fieldLabel}>Chassisnr</Text>
                <Text style={styles.fieldValue}>{cert.caravan_chassis_snapshot || '—'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Gecontroleerde onderdelen — overzicht per sectie */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>GECONTROLEERDE ONDERDELEN</Text>
          <View style={styles.cardBody}>
            <Text style={{ fontSize: 9, marginBottom: 8, lineHeight: 1.4 }}>
              Bovengenoemde caravan is bij Caravan Storage Spain onderworpen aan een volledige
              onderhoudsbeurt en keuring volgens de geldende BOVAG-richtlijnen. De volgende
              categorieën zijn gecontroleerd, met onderstaand resultaat per onderdeel:
            </Text>
            <View style={styles.sectionStatusGrid}>
              {CHECKLIST.map((sectionDef) => {
                const dataSection = sections.find((s) => s.key === sectionDef.key);
                const items = dataSection?.items || [];
                const status = items.length > 0 ? aggregateSectionStatus(items) : 'ok';
                return (
                  <View key={sectionDef.key} style={styles.sectionStatusCell}>
                    <StatusBox status={status} />
                    <View>
                      <Text style={styles.sectionStatusLabel}>{sectionDef.label}</Text>
                      <Text style={styles.sectionStatusSub}>{summaryFor(sectionDef.key)}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* Resultaat-banner */}
        <View
          style={[
            styles.resultBanner,
            isPassed
              ? { backgroundColor: GREEN_SOFT, borderColor: GREEN }
              : { backgroundColor: RED_SOFT, borderColor: RED },
          ]}
        >
          <View
            style={[
              styles.resultBadge,
              isPassed ? { borderColor: GREEN } : { borderColor: RED },
            ]}
          >
            <Text style={[styles.resultBadgeText, { color: isPassed ? GREEN : RED }]}>
              {isPassed ? 'GOED-\nGEKEURD' : 'AFGE-\nKEURD'}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.resultTitle, { color: isPassed ? GREEN : RED }]}>
              RESULTAAT: {isPassed ? 'GOEDGEKEURD' : 'AFGEKEURD'}
            </Text>
            <Text style={styles.resultDesc}>
              {isPassed
                ? 'Deze caravan voldoet aan alle gecontroleerde punten en is veilig voor gebruik op de openbare weg.'
                : 'Deze caravan is NIET goedgekeurd. Reparatie is noodzakelijk voordat de caravan veilig op de openbare weg kan worden gebruikt.'}
            </Text>
          </View>
        </View>

        {/* Bevindingen — alleen bij afgekeurd op pagina 1 */}
        {!isPassed && (fails.length > 0 || attentions.length > 0) && (
          <View style={styles.card}>
            <Text style={styles.cardHeader}>BEVINDINGEN EN BENODIGDE ACTIES</Text>
            <View style={styles.findingsList}>
              {[...fails, ...attentions].slice(0, 8).map((f) => (
                <View style={styles.findingRow} key={`p1-${f.key}`}>
                  <View style={[styles.findingBox, { backgroundColor: colorForStatus(f.status).bg }]}>
                    <Text style={styles.findingBoxText}>{f.status === 'fail' ? '✗' : '!'}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.findingTitle}>{labelForKey(f.key)}</Text>
                    {f.note && <Text style={styles.findingDesc}>{f.note}</Text>}
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Uitvoerder + stempel */}
        <View style={styles.signRow}>
          <View style={styles.signCard}>
            <Text style={styles.signLabel}>UITGEVOERD DOOR</Text>
            <Text style={styles.signValue}>{cert.technician_name} — Caravan Storage Spain</Text>
            <View style={styles.signLine} />
            <Text style={styles.signFooter}>Handtekening monteur</Text>
          </View>
          <View style={styles.signCard}>
            <Text style={styles.signLabel}>BEDRIJFSSTEMPEL</Text>
            <View style={styles.stamp}>
              <Text style={styles.stampText}>CARAVAN{'\n'}STORAGE{'\n'}SPAIN</Text>
            </View>
          </View>
        </View>

        <Footer pageInfo="Pagina 1 van 3" />
      </Page>

      {/* PAGINA 2 — bevindingen detail */}
      <Page size="A4" style={styles.page}>
        <Topbar logoBase64={logoBase64} pageInfo="Pagina 2" />
        <Text style={[styles.bigTitle, { fontSize: 16, marginTop: 6, textAlign: 'left' }]}>
          Inspectierapport — Bevindingen
        </Text>
        <View style={[styles.bigTitleAccent, { alignSelf: 'flex-start', marginBottom: 8 }]} />
        <Text style={[styles.metaRow, { fontSize: 8, color: TEXT_MUTED }]}>
          Certificaat: {cert.certificate_number} · {cert.customer_name_snapshot} · Kenteken {cert.caravan_registration_snapshot || '—'} · Datum {formatDate(cert.inspection_date)}
        </Text>

        <View style={{ flexDirection: 'row', marginBottom: 6, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: GRAY_LIGHT, borderRadius: 3 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 14 }}>
            <StatusBox status="ok" size={11} /><Text style={{ fontSize: 8.5, marginLeft: 4 }}>Akkoord</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 14 }}>
            <StatusBox status="attention" size={11} /><Text style={{ fontSize: 8.5, marginLeft: 4 }}>Aandachtspunt</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <StatusBox status="fail" size={11} /><Text style={{ fontSize: 8.5, marginLeft: 4 }}>Reparatie nodig</Text>
          </View>
        </View>

        {/* Sectie-detail: alleen 'onderstel' + 'opbouw' op pagina 2 — rest pagina 3 */}
        {CHECKLIST.filter((s) => ['onderstel', 'opbouw', 'electro'].includes(s.key)).map((sectionDef) => {
          const dataSection = sections.find((s) => s.key === sectionDef.key);
          return <SectionDetail key={sectionDef.key} sectionDef={sectionDef} dataSection={dataSection} />;
        })}

        <Footer pageInfo="Pagina 2 van 3" />
      </Page>

      {/* PAGINA 3 — bevindingen + banden + notities */}
      <Page size="A4" style={styles.page}>
        <Topbar logoBase64={logoBase64} pageInfo="Pagina 3" />
        <Text style={[styles.bigTitle, { fontSize: 16, marginTop: 6, textAlign: 'left' }]}>
          Inspectierapport — Bevindingen
        </Text>
        <View style={[styles.bigTitleAccent, { alignSelf: 'flex-start', marginBottom: 8 }]} />
        <Text style={[styles.metaRow, { fontSize: 8, color: TEXT_MUTED }]}>
          Certificaat: {cert.certificate_number} · {cert.customer_name_snapshot} · Kenteken {cert.caravan_registration_snapshot || '—'} · Datum {formatDate(cert.inspection_date)}
        </Text>

        {CHECKLIST.filter((s) => ['gas', 'veiligheid'].includes(s.key)).map((sectionDef) => {
          const dataSection = sections.find((s) => s.key === sectionDef.key);
          return <SectionDetail key={sectionDef.key} sectionDef={sectionDef} dataSection={dataSection} />;
        })}

        {/* Banden-tabel */}
        {tyres && (
          <View style={{ marginTop: 8 }}>
            <Text style={styles.inspSectionHeader}>BANDEN</Text>
            <View style={styles.tyresGrid}>
              {TYRE_POSITIONS.map((pos) => {
                const reading = (tyres as unknown as Record<string, { bar?: string|null; profile?: string|null; dot?: string|null; status?: string; note?: string|null }>)[pos.key];
                if (!reading) return null;
                return (
                  <View style={styles.tyreRow} key={pos.key}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 0.25 }}>
                      <StatusBox status={reading.status || 'ok'} size={11} />
                      <Text style={[styles.tyreLabel, { marginLeft: 6, flex: 0 }]}>{pos.label}</Text>
                    </View>
                    <View style={styles.tyreCell}>
                      <Text style={styles.tyreCellLabel}>BAR</Text>
                      <Text style={styles.tyreCellValue}>{reading.bar || '—'}</Text>
                    </View>
                    <View style={styles.tyreCell}>
                      <Text style={styles.tyreCellLabel}>PROFIEL</Text>
                      <Text style={styles.tyreCellValue}>{reading.profile || '—'}</Text>
                    </View>
                    <View style={styles.tyreCell}>
                      <Text style={styles.tyreCellLabel}>DOT</Text>
                      <Text style={styles.tyreCellValue}>{reading.dot || '—'}</Text>
                    </View>
                    {reading.note && (
                      <Text style={styles.tyreNote}>{reading.note}</Text>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Opmerkingen monteur */}
        {cert.technician_notes && (
          <View style={{ marginTop: 14 }}>
            <Text style={styles.inspSectionHeader}>OPMERKINGEN MONTEUR</Text>
            <Text style={styles.techNotes}>{cert.technician_notes}</Text>
          </View>
        )}

        <Footer pageInfo="Pagina 3 van 3" />
      </Page>
    </Document>
  );
}

// ─── Helpers ────

function labelForKey(itemKey: string): string {
  for (const sec of CHECKLIST) {
    const it = sec.items.find((i) => i.key === itemKey);
    if (it) return `${sec.label} — ${it.label}`;
  }
  return itemKey;
}

function summaryFor(sectionKey: string): string {
  const map: Record<string, string> = {
    onderstel: 'Koppeling, remmen, chassis, wiellagers, stabilisator',
    opbouw: 'Bevestigingen, reflectoren, bodem, lijstwerk',
    electro: '230 V / 12 V installatie, accu, verlichting, stekkers',
    gas: 'Koelkast, kachel, gasleidingen, drukregelaar, flessen',
    veiligheid: 'Breekkabel, handrem, remkabels, noodvoorziening',
  };
  return map[sectionKey] || '';
}

function formatDate(s: string): string {
  // 'YYYY-MM-DD' → 'DD-MM-YYYY'
  if (!s) return '—';
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (!m) return s;
  return `${m[3]}-${m[2]}-${m[1]}`;
}

function Topbar({ logoBase64, pageInfo }: { logoBase64?: string; pageInfo: string }) {
  void pageInfo;
  return (
    <View style={styles.topbar}>
      <View style={styles.topbarLogo}>
        {logoBase64 ? (
          <Image style={styles.topbarLogoImg} src={logoBase64} />
        ) : (
          <Text style={{ color: NAVY, fontSize: 8, fontWeight: 'bold' }}>CARAVAN STORAGE SPAIN</Text>
        )}
      </View>
      <View style={styles.topbarTitleRight}>
        <Text style={styles.topbarTitle}>CERTIFICAAT VAN KEURING</Text>
        <Text style={styles.topbarSubtitle}>Certificado de inspección</Text>
        <Text style={styles.topbarSubtitle}>Certificate of Inspection</Text>
      </View>
    </View>
  );
}

function Footer({ pageInfo }: { pageInfo: string }) {
  return (
    <View style={styles.footer} fixed>
      <View>
        <Text>Caravan Storage Spain · www.caravanstoragespain.com · info@caravanstoragespain.com</Text>
        <Text style={{ marginTop: 1, fontStyle: 'italic' }}>
          Inspectie uitgevoerd volgens BOVAG-richtlijnen · Geldigheid: 12 maanden na inspectiedatum
        </Text>
      </View>
      <Text>{pageInfo}</Text>
    </View>
  );
}

function SectionDetail({
  sectionDef,
  dataSection,
}: {
  sectionDef: typeof CHECKLIST[number];
  dataSection?: InspectionSectionResult;
}) {
  const items = dataSection?.items || [];
  const itemMap = new Map<string, InspectionItemResult>();
  for (const it of items) itemMap.set(it.key, it);

  // Filter: alleen items met status 'fail' of 'attention' tonen, plus alle 'ok'-items
  // collapsed samengevat. Voor leesbaarheid tonen we toch alle items zoals in PDF-template.
  return (
    <View>
      <Text style={styles.inspSectionHeader}>{sectionDef.label.toUpperCase()}</Text>
      {sectionDef.items.map((itemDef, idx) => {
        const result = itemMap.get(itemDef.key);
        const status = result?.status || 'ok';
        const note = result?.note || null;
        return (
          <View
            key={itemDef.key}
            style={[styles.inspRow, idx % 2 === 1 ? styles.inspRowAlt : {}]}
          >
            <StatusBox status={status} size={12} />
            <Text style={styles.inspLabel}>{itemDef.label}</Text>
            <Text style={styles.inspNote}>{note || ''}</Text>
          </View>
        );
      })}
    </View>
  );
}
