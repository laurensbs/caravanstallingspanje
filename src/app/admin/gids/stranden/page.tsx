'use client';
import GuideAdminPage from '@/components/GuideAdminPage';

export default function AdminGidsStrandenPage() {
  return (
    <GuideAdminPage
      config={{
        type: 'stranden',
        imageType: 'beach',
        title: 'Stranden',
        fields: [
          { key: 'name', label: 'Naam', type: 'text', required: true, placeholder: 'Strandnaam' },
          { key: 'slug', label: 'Slug', type: 'text', required: true, placeholder: 'strand-naam' },
          { key: 'region', label: 'Regio', type: 'text', placeholder: 'Costa Brava' },
          { key: 'beach_type', label: 'Type strand', type: 'select', options: [{ value: 'zand', label: 'Zandstrand' }, { value: 'kiezel', label: 'Kiezelstrand' }, { value: 'cala', label: 'Cala (inham)' }, { value: 'rots', label: 'Rotsstrand' }] },
          { key: 'lat', label: 'Latitude', type: 'number', placeholder: '41.9...' },
          { key: 'lng', label: 'Longitude', type: 'number', placeholder: '3.1...' },
          { key: 'description', label: 'Beschrijving', type: 'textarea', colSpan: 2, placeholder: 'Beschrijving van het strand...' },
          { key: 'facilities', label: 'Faciliteiten', type: 'tags', colSpan: 2, placeholder: 'Voeg faciliteit toe (Enter)' },
          { key: 'is_featured', label: 'Uitgelicht', type: 'boolean', placeholder: 'Toon op homepage' },
          { key: 'is_active', label: 'Actief', type: 'boolean', placeholder: 'Zichtbaar op de website' },
        ],
        tableColumns: [
          { key: 'name', label: 'Naam' },
          { key: 'region', label: 'Regio' },
          { key: 'beach_type', label: 'Type', render: (item) => {
            const types: Record<string, string> = { zand: 'Zand', kiezel: 'Kiezel', cala: 'Cala', rots: 'Rots' };
            return types[item.beach_type as string] || String(item.beach_type || '');
          }},
        ],
        filterOptions: [
          { key: 'beach_type', label: 'Alle types', options: [{ value: 'zand', label: 'Zandstrand' }, { value: 'kiezel', label: 'Kiezelstrand' }, { value: 'cala', label: 'Cala' }, { value: 'rots', label: 'Rotsstrand' }] },
        ],
      }}
    />
  );
}
