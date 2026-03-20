'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, MapPin, Globe, Phone, ChevronLeft, ChevronRight, ExternalLink, Share2, Star, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import CtaSection from '@/components/CtaSection';
import A from '@/components/AnimateIn';

type Item = Record<string, any>;
type ImageData = { id: number; url: string; alt_text: string | null; is_cover: boolean };

type GuideDetailConfig = {
  apiType: string;
  backLabel: string;
  backHref: string;
  renderBadges?: (item: Item) => React.ReactNode;
  renderInfo?: (item: Item) => React.ReactNode;
  renderAmenities?: (item: Item) => React.ReactNode;
};

export default function GuideDetailPage({ config }: { config: GuideDetailConfig }) {
  const params = useParams();
  const slug = params.slug as string;
  const [item, setItem] = useState<Item | null>(null);
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/guide/${config.apiType}/${slug}`);
        if (!res.ok) { setNotFound(true); setLoading(false); return; }
        const data = await res.json();
        setItem(data.item);
        setImages(data.images || []);
      } catch { setNotFound(true); }
      setLoading(false);
    })();
  }, [config.apiType, slug]);

  if (loading) {
    return (
      <><Header />
        <div className="min-h-[60vh] flex items-center justify-center bg-surface">
          <Loader2 size={24} className="animate-spin text-primary" />
        </div>
        <Footer />
      </>
    );
  }

  if (notFound || !item) {
    return (
      <><Header />
        <div className="min-h-[60vh] flex items-center justify-center bg-surface">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Niet gevonden</h1>
            <p className="text-gray-500 mb-6">Dit item bestaat niet of is verwijderd.</p>
            <Link href={config.backHref} className="inline-flex items-center gap-2 bg-primary hover:bg-primary-light text-white font-bold px-6 py-3 rounded-xl text-sm transition-all">
              <ArrowLeft size={15} /> {config.backLabel}
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const name = (item.name || item.title) as string;
  const description = (item.description || item.content) as string | null;
  const coverImg = images.find(img => img.is_cover) || images[0];
  const allImages = images.length > 0 ? images : coverImg ? [coverImg] : [];
  const hasMap = item.latitude && item.longitude;

  return (
    <>
      <Header />

      {/* Hero with image gallery */}
      <section className="relative bg-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0">
          {coverImg ? (
            <Image src={allImages[activeImage]?.url || coverImg.url} alt={name} fill sizes="100vw" className="img-cover opacity-30" priority />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-700" />
          )}
          <div className="hero-overlay absolute inset-0" />
        </div>
        <div className="absolute inset-0 dot-pattern opacity-20" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-14 sm:pt-20 pb-10 sm:pb-14">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <Link href={config.backHref} className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-xs font-medium transition-colors mb-6">
              <ArrowLeft size={12} /> {config.backLabel}
            </Link>

            <div className="flex flex-wrap items-center gap-2 mb-4">
              {config.renderBadges?.(item)}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.1] mb-3">{name}</h1>

            <div className="flex flex-wrap items-center gap-3 text-white/60 text-sm">
              {item.town && (
                <span className="flex items-center gap-1"><MapPin size={13} /> {String(item.town)}{item.region ? `, ${String(item.region)}` : ''}</span>
              )}
              {item.website && (
                <a href={String(item.website)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-white transition-colors">
                  <Globe size={13} /> Website
                </a>
              )}
              {item.phone && (
                <a href={`tel:${String(item.phone)}`} className="flex items-center gap-1 hover:text-white transition-colors">
                  <Phone size={13} /> {String(item.phone)}
                </a>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Image gallery */}
      {allImages.length > 1 && (
        <section className="bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-6">
            <div className="relative rounded-2xl overflow-hidden aspect-[16/8] sm:aspect-[16/6]">
              <Image
                src={allImages[activeImage]?.url || ''}
                alt={allImages[activeImage]?.alt_text || name}
                fill
                sizes="100vw"
                className="img-cover"
              />
              <button
                onClick={() => setActiveImage(i => (i - 1 + allImages.length) % allImages.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => setActiveImage(i => (i + 1) % allImages.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-colors"
              >
                <ChevronRight size={18} />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {allImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-2 h-2 rounded-full transition-colors ${i === activeImage ? 'bg-white' : 'bg-white/40'}`}
                  />
                ))}
              </div>
            </div>

            {/* Thumbnails */}
            <div className="flex gap-2 mt-3 overflow-x-auto pb-2 scrollbar-hide">
              {allImages.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(i)}
                  className={`relative w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${
                    i === activeImage ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <Image src={img.url} alt="" fill sizes="64px" className="img-cover" />
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Content */}
      <section className="py-10 sm:py-16 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2">
              <A>
                {description && (
                  <div className="bg-card rounded-2xl border border-gray-200 p-6 sm:p-8 mb-6">
                    <h2 className="text-lg font-bold mb-4">Over {name}</h2>
                    <div className="text-gray-500 leading-relaxed whitespace-pre-line text-[15px]">
                      {description}
                    </div>
                  </div>
                )}
              </A>

              {/* Amenities / Custom content */}
              {config.renderAmenities && (
                <A delay={0.1}>
                  <div className="bg-card rounded-2xl border border-gray-200 p-6 sm:p-8 mb-6">
                    {config.renderAmenities(item)}
                  </div>
                </A>
              )}

              {/* Map */}
              {hasMap && (
                <A delay={0.2}>
                  <div className="bg-card rounded-2xl border border-gray-200 p-6 sm:p-8">
                    <h2 className="text-lg font-bold mb-4">Locatie</h2>
                    <div className="rounded-xl overflow-hidden aspect-[16/9]">
                      <iframe
                        title="Locatie op kaart"
                        src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${item.latitude},${item.longitude}&zoom=14`}
                        className="w-full h-full border-0"
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>
                    {item.address && <p className="text-sm text-gray-500 mt-3 flex items-center gap-1.5"><MapPin size={13} /> {String(item.address)}</p>}
                  </div>
                </A>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              <A delay={0.1}>
                {/* Info card */}
                {config.renderInfo && (
                  <div className="bg-card rounded-2xl border border-gray-200 p-6">
                    <h3 className="font-bold text-[15px] mb-4">Informatie</h3>
                    {config.renderInfo(item)}
                  </div>
                )}
              </A>

              {/* Quick actions */}
              <A delay={0.15}>
                <div className="bg-card rounded-2xl border border-gray-200 p-6 space-y-3">
                  {item.website && (
                    <a
                      href={String(item.website)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 w-full bg-primary hover:bg-primary-light text-white font-bold px-5 py-3 rounded-xl text-sm transition-all justify-center"
                    >
                      <ExternalLink size={14} /> Bezoek website
                    </a>
                  )}
                  {item.phone && (
                    <a
                      href={`tel:${String(item.phone)}`}
                      className="flex items-center gap-2 w-full bg-accent hover:bg-accent/90 text-white font-bold px-5 py-3 rounded-xl text-sm transition-all justify-center"
                    >
                      <Phone size={14} /> Bellen
                    </a>
                  )}
                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({ title: name, url: window.location.href });
                      } else {
                        navigator.clipboard.writeText(window.location.href);
                      }
                    }}
                    className="flex items-center gap-2 w-full bg-gray-100 hover:bg-gray-300/20 text-gray-900 font-bold px-5 py-3 rounded-xl text-sm transition-all justify-center"
                  >
                    <Share2 size={14} /> Delen
                  </button>
                </div>
              </A>

              {/* CTA mini */}
              <A delay={0.2}>
                <div className="bg-gradient-to-br from-primary/10 to-ocean/10 rounded-2xl border border-primary/20 p-6 text-center">
                  <p className="text-xs font-bold text-primary tracking-[0.15em] uppercase mb-2">Stalling nodig?</p>
                  <p className="text-sm text-gray-500 mb-4">Stal uw caravan veilig aan de Costa Brava.</p>
                  <Link href="/stalling" className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary-light text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-all">
                    Meer informatie
                  </Link>
                </div>
              </A>
            </div>
          </div>
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
