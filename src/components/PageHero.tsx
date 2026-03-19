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
    <section className="relative bg-hero text-white py-14 sm:py-28 overflow-hidden">
      <div className="absolute inset-0">
        {image ? (
          <>
            <Image src={image} alt="Achtergrondafbeelding" fill sizes="100vw" className="object-cover opacity-20" priority />
            <div className="hero-overlay absolute inset-0" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary-dark via-primary/80 to-primary-dark opacity-40" />
        )}
      </div>
      <div className="absolute inset-0 dot-pattern opacity-20" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <p className={`text-xs font-bold tracking-[0.2em] uppercase mb-3 ${image ? 'text-primary-light' : 'text-primary'}`}>{badge}</p>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black leading-[1.08] mb-4">{title}</h1>
          <p className="text-white/70 max-w-2xl mx-auto text-sm sm:text-lg leading-relaxed">{subtitle}</p>
        </motion.div>
        {children}
      </div>
    </section>
  );
}
