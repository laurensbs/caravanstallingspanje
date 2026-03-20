'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, Calendar, Clock, Tag, Share2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import CtaSection from '@/components/CtaSection';

type Item = Record<string, any>;

export default function ArtikelDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? Math.min(window.scrollY / h, 1) : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/guide/blog/${slug}`);
        if (!res.ok) { setNotFound(true); setLoading(false); return; }
        const data = await res.json();
        setItem(data.item);
      } catch { setNotFound(true); }
      setLoading(false);
    })();
  }, [slug]);

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
            <h1 className="text-2xl font-black mb-4">Artikel niet gevonden</h1>
            <p className="text-warm-gray mb-6">Dit artikel bestaat niet of is verwijderd.</p>
            <Link href="/blog/artikelen" className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold px-6 py-3 rounded-xl text-sm transition-all">
              <ArrowLeft size={15} /> Alle artikelen
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const title = String(item.title || '');
  const content = String(item.content || '');
  const excerpt = String(item.excerpt || '');
  const coverImage = item.cover_image as string | null;
  const tags = Array.isArray(item.tags) ? item.tags as string[] : [];
  const publishedAt = item.published_at ? new Date(String(item.published_at)) : null;
  const author = String(item.author || 'Caravanstalling Spanje');

  return (
    <>
      <Header />

      {/* Reading progress bar */}
      <div className="fixed top-0 left-0 right-0 h-[3px] z-50">
        <div className="h-full bg-gradient-to-r from-primary to-ocean transition-[width] duration-100" style={{ width: `${progress * 100}%` }} />
      </div>

      {/* Hero */}
      <section className="relative bg-hero text-white py-16 sm:py-24 overflow-hidden">
        <div className="absolute inset-0">
          {coverImage && <Image src={coverImage} alt="" fill sizes="100vw" className="img-cover opacity-20" priority />}
          <div className="hero-overlay absolute inset-0" />
        </div>
        <div className="absolute inset-0 dot-pattern opacity-20" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <Link href="/blog/artikelen" className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-xs font-medium transition-colors mb-6">
              <ArrowLeft size={12} /> Alle artikelen
            </Link>
            <div className="flex flex-wrap items-center gap-3 mb-5">
              {tags.slice(0, 3).map(tag => (
                <span key={tag} className="bg-white/10 backdrop-blur text-white text-xs font-bold px-3 py-1 rounded-full">{tag}</span>
              ))}
              {publishedAt && (
                <span className="flex items-center gap-1.5 text-white/60 text-xs">
                  <Calendar size={11} /> {publishedAt.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-[1.1] mb-4">{title}</h1>
            {excerpt && <p className="text-white/70 text-base sm:text-lg leading-relaxed max-w-3xl">{excerpt}</p>}
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 sm:py-16 bg-card">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <div className="prose-custom text-warm-gray leading-relaxed whitespace-pre-line text-[15px]">
              {(() => {
                let headingCount = 0;
                return content.split('\n').map((line, i) => {
                  if (line.startsWith('## ')) {
                    headingCount++;
                    return (
                      <React.Fragment key={i}>
                        {headingCount > 1 && headingCount % 2 === 0 && (
                          <div className="flex items-center gap-4 my-10">
                            <div className="flex-1 h-px bg-sand-dark/20" />
                            <span className="text-primary/40 text-lg">&#9830;</span>
                            <div className="flex-1 h-px bg-sand-dark/20" />
                          </div>
                        )}
                        <h2 className="text-xl sm:text-2xl font-black mt-10 mb-4 text-surface-dark">{line.replace('## ', '')}</h2>
                      </React.Fragment>
                    );
                  }
                  if (line.startsWith('### ')) {
                    return <h3 key={i} className="text-lg font-bold mt-8 mb-3 text-surface-dark">{line.replace('### ', '')}</h3>;
                  }
                  if (line.startsWith('> ')) {
                    return (
                      <blockquote key={i} className="border-l-4 border-primary pl-5 my-6 italic text-surface-dark/80 text-[15px] leading-relaxed">
                        {line.replace('> ', '')}
                      </blockquote>
                    );
                  }
                  if (line.startsWith('- ')) {
                    return <li key={i} className="ml-4 mb-1 list-disc">{line.replace('- ', '')}</li>;
                  }
                  if (line.trim() === '') return <br key={i} />;
                  const parts = line.split(/(\*\*.*?\*\*)/g);
                  return (
                    <p key={i} className="mb-4">
                      {parts.map((part, k) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                          return <strong key={k} className="text-surface-dark font-semibold">{part.replace(/\*\*/g, '')}</strong>;
                        }
                        return <span key={k}>{part}</span>;
                      })}
                    </p>
                  );
                });
              })()}
            </div>
          </motion.article>

          {/* Author & Share */}
          <div className="mt-12 pt-8 border-t border-sand-dark/20 flex items-center justify-between">
            <div className="text-sm text-warm-gray">
              Door <span className="font-semibold text-surface-dark">{author}</span>
            </div>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title, text: excerpt, url: window.location.href });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                }
              }}
              className="inline-flex items-center gap-2 text-sm font-semibold text-warm-gray hover:text-primary transition-colors"
            >
              <Share2 size={14} /> Delen
            </button>
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
