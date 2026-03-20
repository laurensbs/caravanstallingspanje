'use client';
import GuideAdminPage from '@/components/GuideAdminPage';

export default function AdminGidsPlaatsenPage() {
  return (
    <GuideAdminPage
      config={{
        type: 'plaatsen',
        imageType: 'place',
        title: 'Plaatsen & Dorpen',
        fields: [
          { key: 'name', label: 'Naam', type: 'text', required: true, placeholder: 'Plaatsnaam' },
          { key: 'slug', label: 'Slug', type: 'text', required: true, placeholder: 'plaatsnaam' },
          { key: 'region', label: 'Regio', type: 'text', placeholder: 'Costa Brava' },
          { key: 'population', label: 'Inwoners', type: 'text', placeholder: 'Ca. 10.000' },
          { key: 'best_season', label: 'Beste seizoen', type: 'text', placeholder: 'Mei - Oktober' },
          { key: 'lat', label: 'Latitude', type: 'number', placeholder: '41.9...' },
          { key: 'lng', label: 'Longitude', type: 'number', placeholder: '3.1...' },
          { key: 'description', label: 'Beschrijving', type: 'textarea', colSpan: 2, placeholder: 'Beschrijving van de plaats...' },
          { key: 'highlights', label: 'Highlights', type: 'tags', colSpan: 2, placeholder: 'Voeg highlight toe (Enter)' },
          { key: 'is_featured', label: 'Uitgelicht', type: 'boolean', placeholder: 'Toon op homepage' },
          { key: 'is_active', label: 'Actief', type: 'boolean', placeholder: 'Zichtbaar op de website' },
        ],
        tableColumns: [
          { key: 'name', label: 'Naam' },
          { key: 'region', label: 'Regio' },
          { key: 'population', label: 'Inwoners' },
        ],
      }}
    />
  );
}
