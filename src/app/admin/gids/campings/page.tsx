'use client';
import GuideAdminPage from '@/components/GuideAdminPage';

export default function AdminGidsCampingsPage() {
  return (
    <GuideAdminPage
      config={{
        type: 'campings',
        imageType: 'camping',
        title: 'Campings',
        fields: [
          { key: 'name', label: 'Naam', type: 'text', required: true, placeholder: 'Camping naam' },
          { key: 'slug', label: 'Slug', type: 'text', required: true, placeholder: 'camping-naam' },
          { key: 'town', label: 'Plaats', type: 'text', placeholder: 'Bijv. Pals' },
          { key: 'region', label: 'Regio', type: 'text', placeholder: 'Costa Brava' },
          { key: 'stars', label: 'Sterren', type: 'number', placeholder: '1-5' },
          { key: 'price_range', label: 'Prijsklasse', type: 'select', options: [{ value: '€', label: '€' }, { value: '€€', label: '€€' }, { value: '€€€', label: '€€€' }, { value: '€€€€', label: '€€€€' }] },
          { key: 'address', label: 'Adres', type: 'text', placeholder: 'Volledig adres' },
          { key: 'website', label: 'Website', type: 'url', placeholder: 'https://...' },
          { key: 'phone', label: 'Telefoon', type: 'text', placeholder: '+34 ...' },
          { key: 'lat', label: 'Latitude', type: 'number', placeholder: '41.9...' },
          { key: 'lng', label: 'Longitude', type: 'number', placeholder: '3.1...' },
          { key: 'description', label: 'Beschrijving', type: 'textarea', colSpan: 2, placeholder: 'Beschrijving van de camping...' },
          { key: 'amenities', label: 'Voorzieningen', type: 'tags', colSpan: 2, placeholder: 'Voeg voorziening toe (Enter)' },
          { key: 'highlights', label: 'Highlights', type: 'tags', colSpan: 2, placeholder: 'Voeg highlight toe (Enter)' },
          { key: 'is_featured', label: 'Uitgelicht', type: 'boolean', placeholder: 'Toon op homepage' },
          { key: 'is_active', label: 'Actief', type: 'boolean', placeholder: 'Zichtbaar op de website' },
        ],
        tableColumns: [
          { key: 'name', label: 'Naam' },
          { key: 'town', label: 'Plaats' },
          { key: 'stars', label: 'Sterren', render: (item) => '★'.repeat(item.stars as number || 0) },
          { key: 'price_range', label: 'Prijs' },
        ],
        filterOptions: [
          { key: 'stars', label: 'Alle sterren', options: [{ value: '5', label: '5 sterren' }, { value: '4', label: '4 sterren' }, { value: '3', label: '3 sterren' }] },
        ],
      }}
    />
  );
}
