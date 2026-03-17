'use client';

import Link from 'next/link';
import { MapPin, Phone, Mail, Clock, Facebook, Star, ArrowRight, Shield, Truck, Wrench } from 'lucide-react';
import { motion } from 'framer-motion';
import { useT } from '@/lib/i18n';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export default function Footer() {
  const t = useT();

  return (
    <footer className="relative bg-primary-dark text-white/60 overflow-hidden">
      {/* Gradient glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      {/* CTA Banner */}
      <div className="relative border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
          <div className="bg-gradient-to-r from-accent/10 via-accent/5 to-transparent rounded-3xl p-6 sm:p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6 border border-accent/10">
            <div>
              <h3 className="text-white text-xl sm:text-2xl md:text-3xl font-bold mb-2">{t('footer.cta.title')}</h3>
              <p className="text-white/50 text-sm max-w-lg">{t('footer.cta.desc')}</p>
            </div>
            <Link
              href="/stalling"
              className="shrink-0 bg-gradient-to-r from-accent to-accent-light hover:from-accent-light hover:to-accent text-white font-bold px-8 py-4 rounded-2xl text-sm transition-all duration-300 shadow-lg shadow-accent/20 hover:shadow-accent/40 hover:scale-[1.02] inline-flex items-center gap-2"
            >
              {t('footer.cta.btn')} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          transition={{ staggerChildren: 0.1 }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8"
        >
          {/* Brand */}
          <motion.div variants={fadeUp}>
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 bg-gradient-to-br from-accent to-accent-light rounded-xl flex items-center justify-center shadow-lg shadow-accent/10">
                <span className="text-white font-black text-xs">CS</span>
              </div>
              <div>
                <span className="text-white font-bold text-sm block leading-tight">CARAVANSTALLING</span>
                <span className="text-accent text-[9px] font-bold tracking-[0.2em] uppercase">Spanje</span>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-4">
              {t('footer.brand')}
            </p>
            <div className="flex items-center gap-1 text-accent mb-1">
              {[1,2,3,4,5].map(i => <Star key={i} size={13} fill="currentColor" />)}
              <span className="text-white/40 text-xs ml-1.5 font-medium">4.9 / 5 Google</span>
            </div>
          </motion.div>

          {/* Services */}
          <motion.div variants={fadeUp}>
            <h4 className="text-white font-bold text-sm mb-5 flex items-center gap-2">
              <Wrench size={14} className="text-accent" /> {t('footer.services')}
            </h4>
            <ul className="space-y-2.5">
              {[
                { href: '/stalling', label: 'Caravanstalling' },
                { href: '/diensten', label: 'Onderhoud & Reparatie' },
                { href: '/diensten', label: 'Schoonmaak' },
                { href: '/diensten', label: 'Transport' },
                { href: '/stalling', label: 'Caravanverhuur' },
                { href: '/tarieven', label: 'Tarieven' },
              ].map(l => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm hover:text-accent transition-colors duration-300 inline-flex items-center gap-1.5 group">
                    <ArrowRight size={10} className="text-white/20 group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Links */}
          <motion.div variants={fadeUp}>
            <h4 className="text-white font-bold text-sm mb-5 flex items-center gap-2">
              <Shield size={14} className="text-accent" /> {t('footer.quicklinks')}
            </h4>
            <ul className="space-y-2.5">
              {[
                { href: '/locaties', label: 'Onze Locaties' },
                { href: '/mijn-account', label: 'Mijn Account' },
                { href: '/contact', label: 'Contact' },
                { href: '/stalling', label: t('footer.cta.btn') },
              ].map(l => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm hover:text-accent transition-colors duration-300 inline-flex items-center gap-1.5 group">
                    <ArrowRight size={10} className="text-white/20 group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div variants={fadeUp}>
            <h4 className="text-white font-bold text-sm mb-5 flex items-center gap-2">
              <Truck size={14} className="text-accent" /> {t('footer.contact')}
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin size={14} className="shrink-0 mt-0.5 text-accent/60" />
                <span>Ctra de Palamos, 91<br />17110 Sant Climent de Peralta<br />Girona, Spanje</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={13} className="text-accent/60" />
                <a href="tel:+34972000000" className="hover:text-accent transition-colors">+34 972 00 00 00</a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={13} className="text-accent/60" />
                <a href="mailto:info@caravanstalling-spanje.com" className="hover:text-accent transition-colors">info@caravanstalling-spanje.com</a>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock size={13} className="text-accent/60" />
                <span>Ma-Vr 09:30 - 16:30</span>
              </li>
            </ul>
            <div className="flex items-center gap-3 mt-5">
              <a
                href="https://www.facebook.com/caravanstallingspanjecostabrava"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-accent/10 flex items-center justify-center text-white/40 hover:text-accent transition-all duration-300"
              >
                <Facebook size={16} />
              </a>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/30">
          <p>&copy; {new Date().getFullYear()} Caravan Storage Spain S.L.</p>
          <div className="flex gap-5">
            <Link href="/privacy" className="hover:text-white/60 transition-colors">Privacy</Link>
            <Link href="/voorwaarden" className="hover:text-white/60 transition-colors">Voorwaarden</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
