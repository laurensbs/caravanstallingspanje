'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Clock, Calendar, Tag, BookOpen } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { BLOG_POSTS } from '@/lib/blog-data';

function A({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const v = useInView(ref, { once: true, margin: '-60px' });
  return <motion.div ref={ref} initial={{ opacity: 0, y: 32 }} animate={v ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay, ease: [0.25, 0.4, 0.25, 1] }} className={className}>{children}</motion.div>;
}

const categoryColors: Record<string, string> = {
  'Onderhoud': 'bg-ocean/10 text-ocean',
  'Reisgids': 'bg-accent/10 text-accent',
};

export default function BlogPage() {
  const featured = BLOG_POSTS[0];
  const rest = BLOG_POSTS.slice(1);

  return (
    <>
      <Header />

      {/* Hero */}
      <section className="relative bg-surface-dark text-white py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0">
          <Image src="https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?auto=format&fit=crop&w=1920&q=80" alt="" fill className="img-cover opacity-20" priority />
          <div className="hero-overlay absolute inset-0" />
        </div>
        <div className="absolute inset-0 dot-pattern opacity-20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="text-primary-light text-xs font-bold tracking-[0.2em] uppercase mb-4">Blog & Reisgidsen</p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.08] mb-6">
              Tips, gidsen & <span className="gradient-text">caravankennis</span>
            </h1>
            <p className="text-white/50 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
              Praktische onderhoudstips, reisgidsen voor de Costa Brava en alles wat u moet weten over het stallen van uw caravan in Spanje.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Featured post */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <A>
            <Link href={`/blog/${featured.slug}`} className="group block">
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                <div className="relative aspect-[16/10] rounded-2xl overflow-hidden">
                  <Image src={featured.image} alt={featured.title} fill className="img-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-4 left-4">
                    <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${categoryColors[featured.category] || 'bg-primary/10 text-primary'}`}>
                      {featured.category}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-4 text-xs text-warm-gray mb-4">
                    <span className="flex items-center gap-1.5"><Calendar size={12} /> {new Date(featured.date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    <span className="flex items-center gap-1.5"><Clock size={12} /> {featured.readTime} leestijd</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black mb-4 group-hover:text-primary transition-colors">{featured.title}</h2>
                  <p className="text-warm-gray leading-relaxed mb-6">{featured.excerpt}</p>
                  <span className="inline-flex items-center gap-2 text-primary font-bold text-sm group-hover:gap-3 transition-all">
                    Lees verder <ArrowRight size={15} />
                  </span>
                </div>
              </div>
            </Link>
          </A>
        </div>
      </section>

      {/* All posts grid */}
      <section className="py-16 sm:py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <A className="mb-12">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black">Alle artikelen</h2>
                <div className="section-divider mt-4" />
              </div>
              <div className="flex items-center gap-2 text-sm text-warm-gray">
                <BookOpen size={15} /> {BLOG_POSTS.length} artikelen
              </div>
            </div>
          </A>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map((post, i) => (
              <A key={post.slug} delay={i * 0.08}>
                <Link href={`/blog/${post.slug}`} className="group block h-full">
                  <div className="bg-white rounded-2xl overflow-hidden border border-sand-dark/20 h-full flex flex-col card-hover">
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <Image src={post.image} alt={post.title} fill className="img-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-3 left-3">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${categoryColors[post.category] || 'bg-primary/10 text-primary'}`}>
                          {post.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-center gap-3 text-[11px] text-warm-gray mb-3">
                        <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(post.date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        <span className="flex items-center gap-1"><Clock size={10} /> {post.readTime}</span>
                      </div>
                      <h3 className="font-bold text-[16px] leading-snug mb-2 group-hover:text-primary transition-colors">{post.title}</h3>
                      <p className="text-sm text-warm-gray leading-relaxed flex-1 mb-4">{post.excerpt}</p>
                      <span className="inline-flex items-center gap-1.5 text-primary font-semibold text-xs group-hover:gap-2.5 transition-all">
                        Lees meer <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                </Link>
              </A>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-surface-dark relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-20" />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center relative">
          <A>
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-4">Uw caravan in goede handen</h2>
            <p className="text-white/40 mb-8 max-w-lg mx-auto">Wilt u uw caravan veilig stallen aan de Costa Brava? Neem contact op of vraag direct een plek aan.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/reserveren" className="bg-primary hover:bg-primary-dark text-white font-bold px-8 py-3.5 rounded-xl text-sm transition-all duration-200 inline-flex items-center gap-2 shadow-sm">
                Direct reserveren <ArrowRight size={15} />
              </Link>
              <Link href="/contact" className="text-white/60 hover:text-white font-medium px-6 py-3.5 rounded-xl text-sm transition-colors inline-flex items-center gap-2 border border-white/10 hover:border-white/20">
                Contact opnemen
              </Link>
            </div>
          </A>
        </div>
      </section>

      <Footer />
    </>
  );
}
