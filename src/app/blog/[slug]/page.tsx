'use client';

import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, Clock, Calendar, Tag, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { BLOG_POSTS, getPostBySlug } from '@/lib/blog-data';

const categoryColors: Record<string, string> = {
  'Onderhoud': 'bg-ocean/10 text-ocean',
  'Reisgids': 'bg-accent/10 text-accent',
};

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const post = getPostBySlug(slug);

  if (!post) {
    return (
      <>
        <Header />
        <div className="min-h-[60vh] flex items-center justify-center bg-surface">
          <div className="text-center">
            <h1 className="text-2xl font-black mb-4">Artikel niet gevonden</h1>
            <p className="text-warm-gray mb-6">Dit artikel bestaat niet of is verwijderd.</p>
            <Link href="/blog" className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold px-6 py-3 rounded-xl text-sm transition-all">
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

      {/* Hero */}
      <section className="relative bg-surface-dark text-white py-16 sm:py-24 overflow-hidden">
        <div className="absolute inset-0">
          <Image src={post.image} alt="" fill className="img-cover opacity-20" priority />
          <div className="hero-overlay absolute inset-0" />
        </div>
        <div className="absolute inset-0 dot-pattern opacity-20" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <Link href="/blog" className="inline-flex items-center gap-1.5 text-white/50 hover:text-white text-xs font-medium transition-colors mb-6">
              <ArrowLeft size={12} /> Terug naar blog
            </Link>
            <div className="flex items-center gap-3 mb-5">
              <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${categoryColors[post.category] || 'bg-primary/10 text-primary'}`}>
                {post.category}
              </span>
              <span className="flex items-center gap-1.5 text-white/40 text-xs"><Calendar size={11} /> {new Date(post.date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              <span className="flex items-center gap-1.5 text-white/40 text-xs"><Clock size={11} /> {post.readTime} leestijd</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-[1.1] mb-4">{post.title}</h1>
            <p className="text-white/50 text-base sm:text-lg leading-relaxed max-w-3xl">{post.excerpt}</p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="prose-custom">
            {post.content.map((block, i) => {
              const lines = block.split('\n');
              return (
                <div key={i} className="mb-8">
                  {lines.map((line, j) => {
                    if (line.startsWith('## ')) {
                      return <h2 key={j} className="text-xl sm:text-2xl font-black mt-10 mb-4">{line.replace('## ', '')}</h2>;
                    }
                    if (line.startsWith('**') && line.endsWith('**')) {
                      return <p key={j} className="font-bold text-surface-dark mb-2">{line.replace(/\*\*/g, '')}</p>;
                    }
                    if (line.startsWith('- ')) {
                      return <li key={j} className="text-warm-gray leading-relaxed ml-4 mb-1 list-disc">{line.replace('- ', '')}</li>;
                    }
                    if (line.trim() === '') return null;
                    // Handle inline bold
                    const parts = line.split(/(\*\*.*?\*\*)/g);
                    return (
                      <p key={j} className="text-warm-gray leading-relaxed mb-4">
                        {parts.map((part, k) => {
                          if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={k} className="text-surface-dark font-semibold">{part.replace(/\*\*/g, '')}</strong>;
                          }
                          return <span key={k}>{part}</span>;
                        })}
                      </p>
                    );
                  })}
                </div>
              );
            })}
          </motion.article>

          {/* Share */}
          <div className="mt-12 pt-8 border-t border-sand-dark/20 flex items-center justify-between">
            <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-dark transition-colors">
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
              className="inline-flex items-center gap-2 text-sm font-semibold text-warm-gray hover:text-primary transition-colors"
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
            <h2 className="text-2xl font-black mb-2">Meer lezen</h2>
            <div className="section-divider mt-3 mb-10" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPosts.map(rp => (
                <Link key={rp.slug} href={`/blog/${rp.slug}`} className="group block">
                  <div className="bg-white rounded-2xl overflow-hidden border border-sand-dark/20 card-hover">
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <Image src={rp.image} alt={rp.title} fill className="img-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-3 text-[11px] text-warm-gray mb-2">
                        <span>{rp.category}</span>
                        <span>{rp.readTime}</span>
                      </div>
                      <h3 className="font-bold text-[15px] leading-snug group-hover:text-primary transition-colors">{rp.title}</h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-surface-dark relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-20" />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14 sm:py-16 text-center relative">
          <h2 className="text-2xl font-black text-white mb-4">Uw caravan veilig stallen?</h2>
          <p className="text-white/40 mb-6 max-w-md mx-auto text-sm">Neem contact op of vraag direct een stallingsplek aan. Wij reageren binnen 24 uur.</p>
          <Link href="/reserveren" className="bg-primary hover:bg-primary-dark text-white font-bold px-8 py-3.5 rounded-xl text-sm transition-all duration-200 inline-flex items-center gap-2 shadow-sm">
            Direct reserveren <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
