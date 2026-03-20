'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { Search, MapPin, Star, ChevronRight, ChevronLeft, ArrowRight, Loader2 } from 'lucide-react';
import A from '@/components/AnimateIn';
import PageHero from '@/components/PageHero';
import CtaSection from '@/components/CtaSection';

type Item = Record<string, any>;

type FilterDef = {
  key: string;
  label: string;
  options: { value: string; label: string }[];
};

type GuideCategoryConfig = {
  apiType: string;
  title: string;
  badge: string;
  subtitle: string;
  heroImage: string;
  basePath: string;
  filters?: FilterDef[];
  renderBadges?: (item: Item) => React.ReactNode;
  renderMeta?: (item: Item) => React.ReactNode;
};

export default function GuideCategoryPage({ config }: { config: GuideCategoryConfig }) {
  const [items, setItems] = useState<Item[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '12', search });
      Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
      const res = await fetch(`/api/guide/${config.apiType}?${params}`);
      const data = await res.json();
      setItems(data.items || []);
      setTotal(data.total || 0);
    } catch { setItems([]); }
    setLoading(false);
  }, [config.apiType, page, search, filters]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const totalPages = Math.ceil(total / 12);

  return (
    <>
      <Header />

      <PageHero
        badge={config.badge}
        title={<>{config.title}</>}
        subtitle={config.subtitle}
        image={config.heroImage}
      />

      <section className="py-8 sm:py-12 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Search & filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500/40" />
              <input
                type="text"
                placeholder="Zoeken..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-10 pr-4 py-3 bg-card border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            {config.filters?.map(f => (
              <select
                key={f.key}
                value={filters[f.key] || ''}
                onChange={e => { setFilters(prev => ({ ...prev, [f.key]: e.target.value })); setPage(1); }}
                className="px-4 py-3 bg-card border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">{f.label}</option>
                {f.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            ))}
          </div>

          {/* Results count */}
          <p className="text-sm text-gray-500 mb-6">{total} resultaten</p>

          {/* Grid */}
          {loading ? (
            <div className="py-20 text-center">
              <Loader2 size={24} className="animate-spin text-primary mx-auto mb-2" />
              <p className="text-sm text-gray-500">Laden...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-gray-500">Geen resultaten gevonden. Probeer een andere zoekterm.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {items.map((item, i) => (
                <A key={item.slug as string} delay={i * 0.05}>
                  <CategoryCard item={item} basePath={config.basePath} renderBadges={config.renderBadges} renderMeta={config.renderMeta} />
                </A>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-9 h-9 rounded-lg bg-card border border-gray-200 flex items-center justify-center text-gray-500 disabled:opacity-30"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                .map((p, i, arr) => {
                  const prev = arr[i - 1];
                  const showEllipsis = prev && p - prev > 1;
                  return (
                    <span key={p}>
                      {showEllipsis && <span className="px-1 text-gray-500/40">...</span>}
                      <button
                        onClick={() => setPage(p)}
                        className={`w-9 h-9 rounded-lg text-xs font-semibold transition-colors ${
                          p === page ? 'bg-primary text-white' : 'bg-card border border-gray-200 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {p}
                      </button>
                    </span>
                  );
                })}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-9 h-9 rounded-lg bg-card border border-gray-200 flex items-center justify-center text-gray-500 disabled:opacity-30"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </section>

      <CtaSection
        title="Caravan stallen aan de Costa Brava?"
        subtitle="Geniet van de regio terwijl wij voor uw caravan zorgen."
        primaryLabel="Direct reserveren"
        primaryHref="/reserveren"
        secondaryPhone={false}
        secondaryLabel="Meer informatie"
        secondaryHref="/stalling"
      />

      <Footer />
    </>
  );
}

function CategoryCard({ item, basePath, renderBadges, renderMeta }: {
  item: Item;
  basePath: string;
  renderBadges?: (item: Item) => React.ReactNode;
  renderMeta?: (item: Item) => React.ReactNode;
}) {
  const name = (item.name || item.title) as string;
  const cover = item.cover_image as string | null;
  const desc = (item.description || item.excerpt) as string | null;

  return (
    <Link href={`${basePath}/${item.slug}`} className="group block h-full">
      <div className="bg-card rounded-2xl overflow-hidden border border-gray-200 h-full flex flex-col card-hover">
        <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
          {cover ? (
            <Image src={cover} alt={name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-300 flex items-center justify-center">
              <MapPin size={32} className="text-gray-500/30" />
            </div>
          )}
          {renderBadges && (
            <div className="absolute top-3 left-3 flex gap-1.5">{renderBadges(item)}</div>
          )}
        </div>
        <div className="p-5 flex flex-col flex-1">
          <h3 className="font-bold text-[15px] leading-snug text-gray-900 group-hover:text-primary transition-colors mb-1.5 line-clamp-2">{name}</h3>
          {renderMeta && <div className="mb-2">{renderMeta(item)}</div>}
          {desc && <p className="text-sm text-gray-500 leading-relaxed flex-1 line-clamp-3 mb-3">{desc}</p>}
          <span className="inline-flex items-center gap-1 text-primary font-semibold text-xs group-hover:gap-2 transition-all mt-auto">
            Meer informatie <ChevronRight size={12} />
          </span>
        </div>
      </div>
    </Link>
  );
}
