'use client';
import GuideAdminPage from '@/components/GuideAdminPage';

export default function AdminGidsBezienswaardighedenPage() {
  return (
    <GuideAdminPage
      config={{
        type: 'bezienswaardigheden',
        imageType: 'attraction',
        title: 'Bezienswaardigheden',
        fields: [
          { key: 'name', label: 'Naam', type: 'text', required: true, placeholder: 'Naam bezienswaardigheid' },
          { key: 'slug', label: 'Slug', type: 'text', required: true, placeholder: 'naam-bezienswaardigheid' },
          { key: 'region', label: 'Regio', type: 'text', placeholder: 'Costa Brava' },
          { key: 'category', label: 'Categorie', type: 'select', options: [{ value: 'museum', label: 'Museum' }, { value: 'natuur', label: 'Natuur' }, { value: 'historisch', label: 'Historisch' }, { value: 'activiteit', label: 'Activiteit' }, { value: 'park', label: 'Park / Tuin' }] },
          { key: 'address', label: 'Adres', type: 'text', placeholder: 'Volledig adres' },
          { key: 'website', label: 'Website', type: 'url', placeholder: 'https://...' },
          { key: 'price_info', label: 'Prijsinformatie', type: 'text', placeholder: 'Bijv. €14 volwassenen, €10 kinderen' },
          { key: 'opening_hours', label: 'Openingstijden', type: 'text', placeholder: 'Bijv. Di-Zo 10:00-18:00' },
          { key: 'lat', label: 'Latitude', type: 'number', placeholder: '41.9...' },
          { key: 'lng', label: 'Longitude', type: 'number', placeholder: '3.1...' },
          { key: 'description', label: 'Beschrijving', type: 'textarea', colSpan: 2, placeholder: 'Beschrijving...' },
          { key: 'is_featured', label: 'Uitgelicht', type: 'boolean', placeholder: 'Toon op homepage' },
          { key: 'is_active', label: 'Actief', type: 'boolean', placeholder: 'Zichtbaar op de website' },
        ],
        tableColumns: [
          { key: 'name', label: 'Naam' },
          { key: 'region', label: 'Regio' },
          { key: 'category', label: 'Categorie', render: (item) => {
            const cats: Record<string, string> = { museum: 'Museum', natuur: 'Natuur', historisch: 'Historisch', activiteit: 'Activiteit', park: 'Park / Tuin' };
            return cats[item.category as string] || String(item.category || '');
          }},
        ],
        filterOptions: [
          { key: 'category', label: 'Alle categorieën', options: [{ value: 'museum', label: 'Museum' }, { value: 'natuur', label: 'Natuur' }, { value: 'historisch', label: 'Historisch' }, { value: 'activiteit', label: 'Activiteit' }, { value: 'park', label: 'Park / Tuin' }] },
        ],
      }}
    />
  );
}
