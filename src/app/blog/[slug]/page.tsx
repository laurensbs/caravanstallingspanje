'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, Clock, Calendar, Tag, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { BLOG_POSTS, getLocalizedPost } from '@/lib/blog-data';
import { useLocale } from '@/lib/i18n';

const categoryColors: Record<string, string> = {
  'Onderhoud': 'bg-ocean/10 text-ocean',
  'Reisgids': 'bg-accent/10 text-accent',
};

export default function BlogPostPage() {
  const params = useParams();
  const { locale } = useLocale();
  const slug = params.slug as string;
  const post = getLocalizedPost(slug, locale);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? Math.min(window.scrollY / h, 1) : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!post) {
    return (
      <>
        <Header />
        <div className="min-h-[60vh] flex items-center justify-center bg-surface">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Artikel niet gevonden</h1>
            <p className="text-gray-500 mb-6">Dit artikel bestaat niet of is verwijderd.</p>
            <Link href="/blog" className="inline-flex items-center gap-2 bg-primary hover:bg-primary-light text-white font-bold px-6 py-3 rounded-xl text-sm transition-all">
              <ArrowLeft size={15} /> Terug naar blog
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const currentIndex = BLOG_POSTS.findIndex(p => p.slug === slug);
  const relatedPosts = BLOG_POSTS.filter((_, i) => i !== currentIndex).slice(0, 3);

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: post.image,
    datePublished: post.date,
    author: { '@type': 'Organization', name: 'Caravanstalling Spanje' },
    publisher: { '@type': 'Organization', name: 'Caravanstalling Spanje', url: 'https://caravanstalling-spanje.com' },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `https://caravanstalling-spanje.com/blog/${slug}` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <Header />

      {/* Reading progress bar */}
      <div className="fixed top-0 left-0 right-0 h-[3px] z-50">
        <div className="h-full bg-gradient-to-r from-primary to-ocean transition-[width] duration-100" style={{ width: `${progress * 100}%` }} />
      </div>

      {/* Hero */}
      <section className="relative bg-primary text-white py-16 sm:py-24 overflow-hidden">
        <div className="absolute inset-0">
          <Image src={post.image} alt="Achtergrondafbeelding" fill sizes="100vw" className="img-cover opacity-20" priority />
          <div className="hero-overlay absolute inset-0" />
        </div>
        <div className="absolute inset-0 dot-pattern opacity-20" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <Link href="/blog" className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-xs font-medium transition-colors mb-6">
              <ArrowLeft size={12} /> Terug naar blog
            </Link>
            <div className="flex items-center gap-3 mb-5">
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${categoryColors[post.category] || 'bg-primary/10 text-primary'}`}>
                {post.category}
              </span>
              <span className="flex items-center gap-1.5 text-white/60 text-xs"><Calendar size={11} /> {new Date(post.date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              <span className="flex items-center gap-1.5 text-white/60 text-xs"><Clock size={11} /> {post.readTime} leestijd</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.1] mb-4 text-white">{post.title}</h1>
            <p className="text-white/70 text-base sm:text-lg leading-relaxed max-w-3xl">{post.excerpt}</p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 sm:py-16 bg-card">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="prose-custom">
            {(() => {
              let headingCount = 0;
              return post.content.map((block, i) => {
                const lines = block.split('\n');
                return (
                  <div key={i} className="mb-8">
                    {lines.map((line, j) => {
                      if (line.startsWith('## ')) {
                        headingCount++;
                        return (
                          <React.Fragment key={j}>
                            {headingCount > 1 && headingCount % 2 === 0 && (
                              <div className="flex items-center gap-4 my-10">
                                <div className="flex-1 h-px bg-gray-300/20" />
                                <span className="text-primary/40 text-lg">&#9830;</span>
                                <div className="flex-1 h-px bg-gray-300/20" />
                              </div>
                            )}
                            <h2 className="text-xl sm:text-2xl font-bold mt-10 mb-4">{line.replace('## ', '')}</h2>
                          </React.Fragment>
                        );
                      }
                      if (line.startsWith('> ')) {
                        return (
                          <blockquote key={j} className="border-l-4 border-primary pl-5 my-6 italic text-gray-900/80 text-[15px] leading-relaxed">
                            {line.replace('> ', '')}
                          </blockquote>
                        );
                      }
                      if (line.startsWith('**') && line.endsWith('**')) {
                        return <p key={j} className="font-bold text-gray-900 mb-2">{line.replace(/\*\*/g, '')}</p>;
                      }
                      if (line.startsWith('- ')) {
                        return <li key={j} className="text-gray-500 leading-relaxed ml-4 mb-1 list-disc">{line.replace('- ', '')}</li>;
                      }
                      if (line.trim() === '') return null;
                      const parts = line.split(/(\*\*.*?\*\*)/g);
                      return (
                        <p key={j} className="text-gray-500 leading-relaxed mb-4">
                          {parts.map((part, k) => {
                            if (part.startsWith('**') && part.endsWith('**')) {
                              return <strong key={k} className="text-gray-900 font-semibold">{part.replace(/\*\*/g, '')}</strong>;
                            }
                            return <span key={k}>{part}</span>;
                          })}
                        </p>
                      );
                    })}
                  </div>
                );
              });
            })()}
          </motion.article>

          {/* Service CTA */}
          {post.cta && (
            <div className="mt-10 p-6 sm:p-8 bg-gray-50 rounded-2xl border border-gray-200 text-center">
              <p className="text-xs font-bold text-primary tracking-[0.15em] uppercase mb-2">Tip</p>
              <p className="font-bold text-lg mb-4">Laat het ons voor u regelen</p>
              <Link href={post.cta.href} className="inline-flex items-center gap-2 bg-primary hover:bg-primary-light text-white font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-sm">
                {post.cta.label} <ArrowRight size={14} />
              </Link>
            </div>
          )}

          {/* Share */}
          <div className="mt-12 pt-8 border-t border-gray-200 flex items-center justify-between">
            <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-light transition-colors">
              <ArrowLeft size={14} /> Alle artikelen
            </Link>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: post.title, text: post.excerpt, url: window.location.href });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                }
              }}
              className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-primary transition-colors"
            >
              <Share2 size={14} /> Delen
            </button>
          </div>
        </div>
      </section>

      {/* Related */}
      {relatedPosts.length > 0 && (
        <section className="py-16 sm:py-20 bg-surface">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl font-bold mb-2">Meer lezen</h2>
            <div className="section-divider mt-3 mb-10" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPosts.map(rp => (
                <Link key={rp.slug} href={`/blog/${rp.slug}`} className="group block">
                  <div className="card-editorial">
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <Image src={rp.image} alt={rp.title} fill sizes="(max-width: 640px) 100vw, 33vw" className="img-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="card-editorial-overlay" />
                      <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                        <div className="flex items-center gap-3 text-xs text-white/70 mb-2">
                          <span>{rp.category}</span>
                          <span>{rp.readTime}</span>
                        </div>
                        <h3 className="font-bold text-[15px] leading-snug">{rp.title}</h3>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-primary relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-20" />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14 sm:py-16 text-center relative">
          <h2 className="text-2xl font-bold text-white mb-4">Uw caravan veilig stallen?</h2>
          <p className="text-white/60 mb-6 max-w-md mx-auto text-sm">Neem contact op of vraag direct een stallingsplek aan. Wij reageren binnen 24 uur.</p>
          <Link href="/reserveren" className="bg-primary hover:bg-primary-light text-white font-bold px-8 py-3.5 rounded-xl text-sm transition-all duration-200 inline-flex items-center gap-2 shadow-sm">
            Direct reserveren <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
