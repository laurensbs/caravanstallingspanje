'use client';
import GuideAdminPage from '@/components/GuideAdminPage';

export default function AdminGidsRestaurantsPage() {
  return (
    <GuideAdminPage
      config={{
        type: 'restaurants',
        imageType: 'restaurant',
        title: 'Restaurants',
        fields: [
          { key: 'name', label: 'Naam', type: 'text', required: true, placeholder: 'Restaurantnaam' },
          { key: 'slug', label: 'Slug', type: 'text', required: true, placeholder: 'restaurant-naam' },
          { key: 'region', label: 'Regio', type: 'text', placeholder: 'Costa Brava' },
          { key: 'cuisine_type', label: 'Keuken', type: 'text', placeholder: 'Bijv. Catalaans, Zeevrucht, Tapas' },
          { key: 'price_range', label: 'Prijsklasse', type: 'select', options: [{ value: '€', label: '€ Budget' }, { value: '€€', label: '€€ Gemiddeld' }, { value: '€€€', label: '€€€ Upscale' }, { value: '€€€€', label: '€€€€ Fine dining' }] },
          { key: 'address', label: 'Adres', type: 'text', placeholder: 'Volledig adres' },
          { key: 'website', label: 'Website', type: 'url', placeholder: 'https://...' },
          { key: 'phone', label: 'Telefoon', type: 'text', placeholder: '+34 ...' },
          { key: 'lat', label: 'Latitude', type: 'number', placeholder: '41.9...' },
          { key: 'lng', label: 'Longitude', type: 'number', placeholder: '3.1...' },
          { key: 'description', label: 'Beschrijving', type: 'textarea', colSpan: 2, placeholder: 'Beschrijving van het restaurant...' },
          { key: 'is_featured', label: 'Uitgelicht', type: 'boolean', placeholder: 'Toon op homepage' },
          { key: 'is_active', label: 'Actief', type: 'boolean', placeholder: 'Zichtbaar op de website' },
        ],
        tableColumns: [
          { key: 'name', label: 'Naam' },
          { key: 'cuisine_type', label: 'Keuken' },
          { key: 'price_range', label: 'Prijs' },
          { key: 'region', label: 'Regio' },
        ],
        filterOptions: [
          { key: 'cuisine_type', label: 'Alle keukens', options: [{ value: 'Catalaans', label: 'Catalaans' }, { value: 'Zeevrucht', label: 'Zeevrucht' }, { value: 'Tapas', label: 'Tapas' }, { value: 'Mediterraan', label: 'Mediterraan' }, { value: 'Internationaal', label: 'Internationaal' }] },
        ],
      }}
    />
  );
}
