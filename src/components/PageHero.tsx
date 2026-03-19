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
    <section className="relative bg-hero text-white py-16 sm:py-32 overflow-hidden wave-divider">
      {/* Background image or gradient */}
      <div className="absolute inset-0">
        {image ? (
          <>
            <Image src={image} alt="Achtergrondafbeelding" fill sizes="100vw" className="object-cover opacity-25" priority />
            <div className="hero-overlay absolute inset-0" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary-dark via-primary/80 to-primary-dark opacity-40" />
        )}
      </div>
      <div className="absolute inset-0 dot-pattern opacity-15" />

      {/* Floating decorative orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute -bottom-32 -left-20 w-80 h-80 bg-accent/8 rounded-full blur-3xl animate-float-reverse" />
        <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-primary-light/30 rounded-full animate-float" />
        <div className="absolute top-1/4 left-1/5 w-2 h-2 bg-white/20 rounded-full animate-float-slow animation-delay-300" />
        <div className="absolute bottom-1/3 right-1/3 w-2 h-2 bg-primary/20 rounded-full animate-float animation-delay-500" />
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 bg-white/[0.07] border border-white/10 rounded-full px-4 py-1.5 mb-5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" />
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-primary-light">{badge}</span>
          </motion.div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black leading-[1.08] mb-5">{title}</h1>
          <p className="text-white/65 max-w-2xl mx-auto text-sm sm:text-lg leading-relaxed">{subtitle}</p>
        </motion.div>
        {children}
      </div>
    </section>
  );
}
