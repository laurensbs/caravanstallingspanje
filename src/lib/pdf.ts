import { renderToBuffer } from '@react-pdf/renderer';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import React from 'react';

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, color: '#1C2B3A' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  brand: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: '#1C2B3A' },
  brandSub: { fontSize: 8, color: '#6B7280', marginTop: 2 },
  title: { fontSize: 20, fontFamily: 'Helvetica-Bold', color: '#1C2B3A', marginBottom: 6 },
  subtitle: { fontSize: 10, color: '#6B7280', marginBottom: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  label: { color: '#6B7280', fontSize: 9 },
  value: { fontFamily: 'Helvetica-Bold', fontSize: 10 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 12, fontFamily: 'Helvetica-Bold', marginBottom: 8, paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#F9FAFB', padding: 8, borderRadius: 4, marginBottom: 4 },
  tableRow: { flexDirection: 'row', padding: 8, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  col1: { flex: 3 },
  col2: { flex: 1, textAlign: 'right' },
  col3: { flex: 1, textAlign: 'right' },
  col4: { flex: 1, textAlign: 'right' },
  totalRow: { flexDirection: 'row', padding: 8, marginTop: 4, backgroundColor: '#1C2B3A', borderRadius: 4 },
  totalLabel: { flex: 3, fontFamily: 'Helvetica-Bold', color: '#FFFFFF' },
  totalValue: { flex: 1, textAlign: 'right', fontFamily: 'Helvetica-Bold', color: '#FFFFFF', fontSize: 12 },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, fontSize: 7, color: '#9CA3AF', textAlign: 'center', borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 8 },
  badge: { backgroundColor: '#10B981', color: '#FFFFFF', fontSize: 8, padding: '3 8', borderRadius: 10, fontFamily: 'Helvetica-Bold' },
  badgePending: { backgroundColor: '#F59E0B', color: '#FFFFFF', fontSize: 8, padding: '3 8', borderRadius: 10, fontFamily: 'Helvetica-Bold' },
});

interface InvoiceData {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  status: string;
  customer: { name: string; email: string; phone: string; address?: string };
  items: { description: string; quantity: number; unitPrice: number; total: number }[];
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
}

function InvoicePDF({ data }: { data: InvoiceData }) {
  return React.createElement(Document, null,
    React.createElement(Page, { size: 'A4', style: styles.page },
      // Header
      React.createElement(View, { style: styles.header },
        React.createElement(View, null,
          React.createElement(Text, { style: styles.brand }, 'Caravanstalling Spanje'),
          React.createElement(Text, { style: styles.brandSub }, 'Ctra. de Torroella, km 3 · 17141 Sant Climent de Peralta'),
          React.createElement(Text, { style: styles.brandSub }, 'info@caravanstalling-spanje.com · +34 650 036 755'),
        ),
        React.createElement(View, { style: { alignItems: 'flex-end' } },
          React.createElement(Text, { style: styles.title }, data.invoiceNumber),
          React.createElement(Text, { style: { ...styles.label, marginBottom: 4 } }, `Datum: ${data.date}`),
          React.createElement(Text, { style: styles.label }, `Vervaldatum: ${data.dueDate}`),
          React.createElement(Text, { style: data.status === 'betaald' ? styles.badge : styles.badgePending }, data.status.toUpperCase()),
        ),
      ),
      // Customer info
      React.createElement(View, { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, 'Factuuradres'),
        React.createElement(Text, { style: styles.value }, data.customer.name),
        React.createElement(Text, { style: styles.label }, data.customer.email),
        React.createElement(Text, { style: styles.label }, data.customer.phone),
        data.customer.address ? React.createElement(Text, { style: styles.label }, data.customer.address) : null,
      ),
      // Items table
      React.createElement(View, { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, 'Regeloverzicht'),
        React.createElement(View, { style: styles.tableHeader },
          React.createElement(Text, { style: { ...styles.col1, fontFamily: 'Helvetica-Bold', fontSize: 8, color: '#6B7280' } }, 'Omschrijving'),
          React.createElement(Text, { style: { ...styles.col2, fontFamily: 'Helvetica-Bold', fontSize: 8, color: '#6B7280' } }, 'Aantal'),
          React.createElement(Text, { style: { ...styles.col3, fontFamily: 'Helvetica-Bold', fontSize: 8, color: '#6B7280' } }, 'Prijs'),
          React.createElement(Text, { style: { ...styles.col4, fontFamily: 'Helvetica-Bold', fontSize: 8, color: '#6B7280' } }, 'Totaal'),
        ),
        ...data.items.map((item, i) =>
          React.createElement(View, { key: i, style: styles.tableRow },
            React.createElement(Text, { style: styles.col1 }, item.description),
            React.createElement(Text, { style: styles.col2 }, String(item.quantity)),
            React.createElement(Text, { style: styles.col3 }, `€${item.unitPrice.toFixed(2)}`),
            React.createElement(Text, { style: styles.col4 }, `€${item.total.toFixed(2)}`),
          ),
        ),
        // Subtotal
        React.createElement(View, { style: { ...styles.row, marginTop: 12 } },
          React.createElement(Text, { style: styles.label }, 'Subtotaal'),
          React.createElement(Text, { style: styles.value }, `€${data.subtotal.toFixed(2)}`),
        ),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.label }, 'BTW (21%)'),
          React.createElement(Text, { style: styles.value }, `€${data.tax.toFixed(2)}`),
        ),
        React.createElement(View, { style: styles.totalRow },
          React.createElement(Text, { style: styles.totalLabel }, 'Totaal'),
          React.createElement(Text, { style: styles.totalValue }, `€${data.total.toFixed(2)}`),
        ),
      ),
      // Notes
      data.notes ? React.createElement(View, { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, 'Opmerkingen'),
        React.createElement(Text, { style: { fontSize: 9, color: '#6B7280', lineHeight: 1.5 } }, data.notes),
      ) : null,
      // Footer
      React.createElement(View, { style: styles.footer },
        React.createElement(Text, null, 'Caravanstalling Spanje S.L. · NIF: B12345678 · IBAN: ES12 3456 7890 1234 5678 9012'),
        React.createElement(Text, null, 'Dit document is automatisch gegenereerd en geldig zonder handtekening.'),
      ),
    ),
  );
}

interface ContractData {
  contractNumber: string;
  date: string;
  customer: { name: string; email: string; phone: string };
  caravan: { brand: string; model: string; licensePlate: string; length: string };
  spot: { label: string; type: string; location: string };
  monthlyPrice: number;
  startDate: string;
  endDate?: string;
}

function ContractPDF({ data }: { data: ContractData }) {
  return React.createElement(Document, null,
    React.createElement(Page, { size: 'A4', style: styles.page },
      // Header
      React.createElement(View, { style: styles.header },
        React.createElement(View, null,
          React.createElement(Text, { style: styles.brand }, 'Caravanstalling Spanje'),
          React.createElement(Text, { style: styles.brandSub }, 'Stallingovereenkomst'),
        ),
        React.createElement(View, { style: { alignItems: 'flex-end' } },
          React.createElement(Text, { style: styles.title }, data.contractNumber),
          React.createElement(Text, { style: styles.label }, `Datum: ${data.date}`),
        ),
      ),
      // Customer
      React.createElement(View, { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, 'Klantgegevens'),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.label }, 'Naam'),
          React.createElement(Text, { style: styles.value }, data.customer.name),
        ),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.label }, 'E-mail'),
          React.createElement(Text, { style: styles.value }, data.customer.email),
        ),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.label }, 'Telefoon'),
          React.createElement(Text, { style: styles.value }, data.customer.phone),
        ),
      ),
      // Caravan
      React.createElement(View, { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, 'Caravangegevens'),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.label }, 'Merk/Model'),
          React.createElement(Text, { style: styles.value }, `${data.caravan.brand} ${data.caravan.model}`),
        ),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.label }, 'Kenteken'),
          React.createElement(Text, { style: styles.value }, data.caravan.licensePlate),
        ),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.label }, 'Lengte'),
          React.createElement(Text, { style: styles.value }, data.caravan.length),
        ),
      ),
      // Stalling
      React.createElement(View, { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, 'Stallinggegevens'),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.label }, 'Locatie'),
          React.createElement(Text, { style: styles.value }, data.spot.location),
        ),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.label }, 'Plektype'),
          React.createElement(Text, { style: styles.value }, data.spot.type),
        ),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.label }, 'Pleknummer'),
          React.createElement(Text, { style: styles.value }, data.spot.label),
        ),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.label }, 'Ingangsdatum'),
          React.createElement(Text, { style: styles.value }, data.startDate),
        ),
        data.endDate ? React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.label }, 'Einddatum'),
          React.createElement(Text, { style: styles.value }, data.endDate),
        ) : null,
        React.createElement(View, { style: { ...styles.row, marginTop: 8 } },
          React.createElement(Text, { style: { ...styles.label, fontSize: 11 } }, 'Maandtarief'),
          React.createElement(Text, { style: { ...styles.value, fontSize: 14, color: '#B8860B' } }, `€${data.monthlyPrice.toFixed(2)}`),
        ),
      ),
      // Footer
      React.createElement(View, { style: styles.footer },
        React.createElement(Text, null, 'Caravanstalling Spanje S.L. · NIF: B12345678 · Deze overeenkomst wordt automatisch verlengd tenzij 1 maand voor einddatum opgezegd.'),
      ),
    ),
  );
}

export async function generateInvoicePDF(data: InvoiceData): Promise<Buffer> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return renderToBuffer(React.createElement(InvoicePDF, { data }) as any);
}

export async function generateContractPDF(data: ContractData): Promise<Buffer> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return renderToBuffer(React.createElement(ContractPDF, { data }) as any);
}
