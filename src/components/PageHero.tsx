'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

interface PageHeroProps {
  badge: string;
  title: React.ReactNode;
  subtitle: string;
  image?: string;
  children?: React.ReactNode;
}

export default function PageHero({ badge, title, subtitle, image, children }: PageHeroProps) {
  return (
    <section className="relative bg-gray-900 text-white py-20 sm:py-28 overflow-hidden">
      {/* Background image — clearly visible */}
      <div className="absolute inset-0">
        {image ? (
          <>
            <Image src={image} alt="" fill sizes="100vw" className="object-cover opacity-45" priority />
            <div className="hero-overlay absolute inset-0" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800 opacity-80" />
        )}
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-4 py-1.5 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
            <span className="text-xs font-semibold tracking-[0.15em] uppercase text-white/90">{badge}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] mb-5 text-white">{title}</h1>
          <p className="text-white/80 max-w-2xl mx-auto text-sm sm:text-lg leading-relaxed">{subtitle}</p>
        </motion.div>
        {children}
      </div>
    </section>
  );
}
