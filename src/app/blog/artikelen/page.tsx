'use client';
import GuideCategoryPage from '@/components/GuideCategoryPage';

export default function ArtikelenPage() {
  return (
    <GuideCategoryPage
      config={{
        apiType: 'blog',
        title: 'Blog & Artikelen',
        badge: 'Blog',
        subtitle: 'Tips, verhalen en reisinspiratie voor de Costa Brava.',
        heroImage: '/images/costa-brava-blog.jpg',
        basePath: '/blog/artikelen',
        renderBadges: (item) => (
          <>
            {item.tags && Array.isArray(item.tags) && (item.tags as string[]).slice(0, 2).map((tag: string) => (
              <span key={tag} className="bg-hero/70 backdrop-blur text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </>
        ),
        renderMeta: (item) => (
          <div className="flex items-center gap-1 text-xs text-warm-gray">
            {item.author && <span>{String(item.author)}</span>}
            {item.published_at && (
              <span>· {new Date(String(item.published_at)).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            )}
          </div>
        ),
      }}
    />
  );
}
