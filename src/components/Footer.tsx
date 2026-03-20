'use client';

import Link from 'next/link';
import { useState, FormEvent } from 'react';
import { MapPin, Phone, Mail, Clock, Facebook, Star, ArrowRight, Shield, Truck, Wrench, ChevronDown, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { useT } from '@/lib/i18n';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export default function Footer() {
  const t = useT();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const toggleSection = (key: string) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <footer className="relative bg-gray-900 text-white/60 overflow-hidden">
      {/* CTA Banner */}
      <div className="relative border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
          <div className="bg-white/[0.06] rounded-2xl p-6 sm:p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6 border border-white/8">
            <div>
              <h3 className="text-white text-xl sm:text-2xl md:text-3xl font-bold mb-2">{t('footer.cta.title')}</h3>
              <p className="text-white/60 text-sm max-w-lg">{t('footer.cta.desc')}</p>
            </div>
            <Link
              href="/stalling"
              className="shrink-0 bg-primary hover:bg-primary-light text-white font-semibold px-8 py-4 rounded-xl text-sm transition-all duration-200 shadow-lg shadow-primary/20 hover:shadow-primary/30 inline-flex items-center gap-2"
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
              <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xs">CS</span>
              </div>
              <div>
                <span className="text-white font-bold text-sm block leading-tight">CARAVANSTALLING</span>
                <span className="text-primary-light text-[9px] font-semibold tracking-[0.2em] uppercase">Spanje</span>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-4">
              {t('footer.brand')}
            </p>
            <div className="flex items-center gap-1 text-primary-light mb-1">
              {[1,2,3,4,5].map(i => <Star key={i} size={13} fill="currentColor" />)}
              <span className="text-white/60 text-xs ml-1.5 font-medium">4.9 / 5 Google</span>
            </div>
          </motion.div>

          {/* Services */}
          <motion.div variants={fadeUp}>
            <button onClick={() => toggleSection('services')} className="w-full flex items-center justify-between sm:pointer-events-none mb-5">
              <h4 className="text-white font-bold text-sm flex items-center gap-2">
                <Wrench size={14} className="text-primary-light" /> {t('footer.services')}
              </h4>
              <ChevronDown size={14} className={`text-white/70 sm:hidden transition-transform ${openSections.services ? 'rotate-180' : ''}`} />
            </button>
            <ul className={`space-y-2.5 ${openSections.services ? 'block' : 'hidden sm:block'}`}>
              {[
                { href: '/stalling', label: 'Caravanstalling' },
                { href: '/diensten', label: 'Onderhoud & Reparatie' },
                { href: '/diensten', label: 'Schoonmaak' },
                { href: '/diensten', label: 'Transport' },
                { href: '/stalling', label: 'Caravanverhuur' },
                { href: '/tarieven', label: 'Tarieven' },
              ].map(l => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm hover:text-primary-light transition-colors duration-300 inline-flex items-center gap-1.5 group">
                    <ArrowRight size={10} className="text-white/20 group-hover:text-primary-light group-hover:translate-x-0.5 transition-all" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Links */}
          <motion.div variants={fadeUp}>
            <button onClick={() => toggleSection('links')} className="w-full flex items-center justify-between sm:pointer-events-none mb-5">
              <h4 className="text-white font-bold text-sm flex items-center gap-2">
                <Shield size={14} className="text-primary-light" /> {t('footer.quicklinks')}
              </h4>
              <ChevronDown size={14} className={`text-white/70 sm:hidden transition-transform ${openSections.links ? 'rotate-180' : ''}`} />
            </button>
            <ul className={`space-y-2.5 ${openSections.links ? 'block' : 'hidden sm:block'}`}>
              {[
                { href: '/locaties', label: 'Onze Locaties' },
                { href: '/blog', label: 'Costa Brava Gids' },
                { href: '/blog/artikelen', label: 'Blog & Tips' },
                { href: '/mijn-account', label: 'Mijn Account' },
                { href: '/contact', label: 'Contact' },
                { href: '/privacy', label: 'Privacybeleid' },
                { href: '/voorwaarden', label: 'Voorwaarden' },
                { href: '/stalling', label: t('footer.cta.btn') },
              ].map(l => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm hover:text-primary-light transition-colors duration-300 inline-flex items-center gap-1.5 group">
                    <ArrowRight size={10} className="text-white/20 group-hover:text-primary-light group-hover:translate-x-0.5 transition-all" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div variants={fadeUp}>
            <button onClick={() => toggleSection('contact')} className="w-full flex items-center justify-between sm:pointer-events-none mb-5">
              <h4 className="text-white font-bold text-sm flex items-center gap-2">
                <Truck size={14} className="text-primary-light" /> {t('footer.contact')}
              </h4>
              <ChevronDown size={14} className={`text-white/70 sm:hidden transition-transform ${openSections.contact ? 'rotate-180' : ''}`} />
            </button>
            <div className={`${openSections.contact ? 'block' : 'hidden sm:block'}`}>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin size={14} className="shrink-0 mt-0.5 text-primary/40" />
                <a href="https://www.google.com/maps/search/?api=1&query=Ctra+de+Palamos+91+17110+Sant+Climent+de+Peralta+Girona" target="_blank" rel="noopener noreferrer" className="hover:text-primary-light transition-colors">Ctra de Palamos, 91<br />17110 Sant Climent de Peralta<br />Girona, Spanje</a>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={13} className="text-primary/40" />
                <a href="tel:+34650036755" className="hover:text-primary-light transition-colors">+34 650 036 755</a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={13} className="text-primary/40" />
                <a href="mailto:info@caravanstalling-spanje.com" className="hover:text-primary-light transition-colors">info@caravanstalling-spanje.com</a>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock size={13} className="text-primary/40" />
                <span>Ma-Vr 09:30 - 16:30</span>
              </li>
            </ul>
            <div className="flex items-center gap-3 mt-5">
              <a
                href="https://www.facebook.com/caravanstallingspanjecostabrava"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-primary/10 flex items-center justify-center text-white/60 hover:text-primary-light transition-all duration-300"
              >
                <Facebook size={16} />
              </a>
            </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Newsletter */}
      <div className="relative border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="text-white font-bold text-sm mb-1">Nieuwsbrief</h4>
              <p className="text-white/60 text-xs max-w-md">Ontvang tips, aanbiedingen en nieuws over caravanstalling aan de Costa Brava. Maximaal 1x per maand, geen spam.</p>
            </div>
            {newsletterStatus === 'success' ? (
              <p className="text-accent-light font-bold text-sm">✓ Ingeschreven!</p>
            ) : newsletterStatus === 'error' ? (
              <div className="text-center sm:text-left">
                <p className="text-red-400 font-bold text-sm mb-1">Inschrijving mislukt</p>
                <button onClick={() => setNewsletterStatus('idle')} className="text-white/70 text-xs underline hover:text-white transition-colors">Probeer opnieuw</button>
              </div>
            ) : (
              <form
                onSubmit={async (e: FormEvent) => {
                  e.preventDefault();
                  if (!newsletterEmail) return;
                  setNewsletterStatus('loading');
                  try {
                    const res = await fetch('/api/newsletter/subscribe', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ email: newsletterEmail }),
                    });
                    if (res.ok) {
                      setNewsletterStatus('success');
                    } else {
                      setNewsletterStatus('error');
                    }
                  } catch {
                    setNewsletterStatus('error');
                  }
                }}
                className="flex gap-2 w-full sm:w-auto"
              >
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={e => setNewsletterEmail(e.target.value)}
                  placeholder="Uw e-mailadres"
                  aria-label="E-mailadres voor nieuwsbrief"
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-primary/50 w-full sm:w-64 transition-colors"
                />
                <button
                  type="submit"
                  disabled={newsletterStatus === 'loading'}
                  className="bg-primary hover:bg-primary-light text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all inline-flex items-center gap-1.5 shrink-0 disabled:opacity-60"
                >
                  <Send size={13} /> Inschrijven
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5 py-5 pb-20 md:pb-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/70">
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
