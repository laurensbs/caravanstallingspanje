'use client';
import GuideAdminPage from '@/components/GuideAdminPage';

export default function AdminGidsBlogPage() {
  return (
    <GuideAdminPage
      config={{
        type: 'blog',
        imageType: 'blog',
        title: 'Blog Artikelen',
        fields: [
          { key: 'title', label: 'Titel', type: 'text', required: true, placeholder: 'Artikel titel' },
          { key: 'slug', label: 'Slug', type: 'text', required: true, placeholder: 'artikel-slug' },
          { key: 'category', label: 'Categorie', type: 'select', options: [{ value: 'Onderhoud', label: 'Onderhoud' }, { value: 'Reisgids', label: 'Reisgids' }, { value: 'Tips', label: 'Tips & Advies' }, { value: 'Regio', label: 'Regio Info' }, { value: 'Nieuws', label: 'Nieuws' }, { value: 'Algemeen', label: 'Algemeen' }] },
          { key: 'author', label: 'Auteur', type: 'text', placeholder: 'Caravanstalling Spanje' },
          { key: 'read_time', label: 'Leestijd', type: 'text', placeholder: '5 min' },
          { key: 'excerpt', label: 'Samenvatting', type: 'textarea', colSpan: 2, placeholder: 'Korte samenvatting voor in de kaartjes...' },
          { key: 'content', label: 'Inhoud (Markdown)', type: 'textarea', colSpan: 2, placeholder: '# Titel\n\nJe artikel tekst hier...' },
          { key: 'is_featured', label: 'Uitgelicht', type: 'boolean', placeholder: 'Toon als uitgelicht artikel' },
          { key: 'is_published', label: 'Gepubliceerd', type: 'boolean', placeholder: 'Zichtbaar op de website' },
        ],
        tableColumns: [
          { key: 'title', label: 'Titel' },
          { key: 'category', label: 'Categorie' },
          { key: 'is_published', label: 'Status', render: (item) => (
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${item.is_published ? 'bg-accent/10 text-accent' : 'bg-warm-gray/10 text-warm-gray'}`}>
              {item.is_published ? 'Gepubliceerd' : 'Concept'}
            </span>
          )},
        ],
        filterOptions: [
          { key: 'category', label: 'Alle categorieën', options: [{ value: 'Onderhoud', label: 'Onderhoud' }, { value: 'Reisgids', label: 'Reisgids' }, { value: 'Tips', label: 'Tips & Advies' }, { value: 'Regio', label: 'Regio Info' }, { value: 'Nieuws', label: 'Nieuws' }] },
        ],
      }}
    />
  );
}
