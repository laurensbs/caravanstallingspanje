'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { MapPin, Phone, Mail, Clock, Send, ArrowRight, MessageCircle, CheckCircle } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { useRef, useState, FormEvent } from 'react';

function A({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const v = useInView(ref, { once: true, margin: '-60px' });
  return <motion.div ref={ref} initial={{ opacity: 0, y: 32 }} animate={v ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay, ease: [0.25, 0.4, 0.25, 1] }} className={className}>{children}</motion.div>;
}

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
      phone: (form.elements.namedItem('phone') as HTMLInputElement).value,
      subject: (form.elements.namedItem('subject') as HTMLSelectElement).value,
      message: (form.elements.namedItem('message') as HTMLTextAreaElement).value,
    };
    try {
      await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header />

      {/* Hero */}
      <section className="relative bg-surface-dark text-white py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-dark via-primary/80 to-primary-dark" />
        <div className="absolute inset-0 dot-pattern opacity-20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="text-primary text-xs font-bold tracking-[0.2em] uppercase mb-4">Contact</p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.08] mb-6">
              Neem <span className="gradient-text">contact</span> op
            </h1>
            <p className="text-white/50 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
              Heeft u vragen, wilt u een offerte of een afspraak maken? Wij staan graag voor u klaar.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Grid */}
      <section className="py-20 sm:py-28 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">

            {/* Form */}
            <A className="lg:col-span-3">
              {submitted ? (
                <div className="bg-surface rounded-2xl p-10 sm:p-14 text-center border border-sand-dark/[0.04]">
                  <div className="w-16 h-16 bg-accent/15 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="text-accent" size={32} />
                  </div>
                  <h2 className="text-2xl font-black mb-3">Bericht verzonden</h2>
                  <p className="text-warm-gray leading-relaxed mb-6">Bedankt voor uw bericht. Wij nemen zo spoedig mogelijk contact met u op, meestal binnen 1 werkdag.</p>
                  <Link href="/" className="text-primary hover:text-surface-dark font-bold text-sm inline-flex items-center gap-1">
                    Terug naar home <ArrowRight size={14} />
                  </Link>
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl font-black mb-1">Stuur ons een bericht</h2>
                  <p className="text-warm-gray text-sm mb-8">Vul het formulier in en wij reageren binnen 1 werkdag.</p>

                  <form onSubmit={(e) => { handleSubmit(e); }} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="name" className="block text-xs font-bold mb-1.5">Naam *</label>
                        <input id="name" name="name" type="text" required className="w-full border border-sand-dark/[0.08] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" placeholder="Uw naam" />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-xs font-bold mb-1.5">E-mail *</label>
                        <input id="email" name="email" type="email" required className="w-full border border-sand-dark/[0.08] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" placeholder="uw@email.com" />
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="phone" className="block text-xs font-bold mb-1.5">Telefoon</label>
                        <input id="phone" name="phone" type="tel" className="w-full border border-sand-dark/[0.08] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" placeholder="+31 6 1234 5678" />
                      </div>
                      <div>
                        <label htmlFor="subject" className="block text-xs font-bold mb-1.5">Onderwerp *</label>
                        <select id="subject" name="subject" required className="w-full border border-sand-dark/[0.08] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all bg-surface">
                          <option value="">Kies een onderwerp</option>
                          <option value="stalling">Stalling aanvragen</option>
                          <option value="reparatie">Reparatie & Onderhoud</option>
                          <option value="caravanrepair">CaravanRepair®</option>
                          <option value="transport">Transport</option>
                          <option value="verkoop">Verkoop</option>
                          <option value="verhuur">Verhuur (fietsen/koelkast/airco)</option>
                          <option value="schoonmaak">Schoonmaak</option>
                          <option value="overig">Overig</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-xs font-bold mb-1.5">Bericht *</label>
                      <textarea id="message" name="message" rows={5} required className="w-full border border-sand-dark/[0.08] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all resize-none" placeholder="Waar kunnen wij u mee helpen?" />
                    </div>
                    <button type="submit" disabled={loading} className="bg-accent hover:bg-accent-dark text-white font-bold px-8 py-3.5 rounded-xl text-sm transition-all inline-flex items-center gap-2 shadow-sm disabled:opacity-60">
                      {loading ? 'Verzenden...' : 'Verstuur bericht'} <Send size={14} />
                    </button>
                  </form>
                </div>
              )}
            </A>

            {/* Contact Info Sidebar */}
            <A delay={0.15} className="lg:col-span-2">
              <div className="space-y-6">
                <div className="bg-surface rounded-2xl p-7 border border-sand-dark/[0.04]">
                  <h3 className="font-black text-lg mb-5">Contactgegevens</h3>
                  <div className="space-y-5">
                    {[
                      { icon: Phone, label: 'Telefoon', value: '+34 650 036 755', href: 'tel:+34650036755' },
                      { icon: Mail, label: 'E-mail', value: 'info@caravanstalling-spanje.com', href: 'mailto:info@caravanstalling-spanje.com' },
                      { icon: MapPin, label: 'Adres', value: 'Ctra de Palamós, 91\n17110 Sant Climent de Peralta\nGirona, Spanje', href: undefined },
                      { icon: Clock, label: 'Openingstijden', value: 'Maandag t/m vrijdag\n09:30 – 16:30\nWeekend: gesloten', href: undefined },
                    ].map(c => (
                      <div key={c.label} className="flex gap-4">
                        <div className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center border border-sand-dark/[0.04] shrink-0">
                          <c.icon size={16} className="text-primary" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-warm-gray uppercase tracking-wider mb-0.5">{c.label}</p>
                          {c.href ? (
                            <a href={c.href} className="text-sm font-medium hover:text-primary transition-colors">{c.value}</a>
                          ) : (
                            <p className="text-sm font-medium whitespace-pre-line">{c.value}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-surface rounded-2xl p-7 border border-sand-dark/[0.04]">
                  <h3 className="font-black text-lg mb-3">Liever direct bellen?</h3>
                  <p className="text-sm text-warm-gray leading-relaxed mb-4">Wij spreken Nederlands, Engels en Spaans. Bel ons gerust tijdens openingstijden.</p>
                  <a href="tel:+34650036755" className="bg-surface-dark hover:bg-primary text-white font-bold px-6 py-3 rounded-xl text-sm transition-all inline-flex items-center gap-2 w-full justify-center">
                    <Phone size={15} /> Bel +34 650 036 755
                  </a>
                </div>

                <div className="bg-surface rounded-2xl p-7 border border-sand-dark/[0.04]">
                  <h3 className="font-black text-lg mb-3">WhatsApp</h3>
                  <p className="text-sm text-warm-gray leading-relaxed mb-4">Stuur ons een WhatsApp-bericht. Handig voor foto&apos;s van schade of vragen onderweg.</p>
                  <a href="https://wa.me/34650036755" target="_blank" rel="noopener noreferrer" className="bg-[#25D366] hover:bg-[#22C35E] text-white font-bold px-6 py-3 rounded-xl text-sm transition-all inline-flex items-center gap-2 w-full justify-center">
                    <MessageCircle size={15} /> WhatsApp ons
                  </a>
                </div>
              </div>
            </A>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <A>
            <div className="rounded-2xl overflow-hidden border border-sand-dark/[0.04]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2975.8!2d3.14!3d42.01!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12ba8d9e42ceae9f%3A0x4af8d0d99ced30a2!2sCtra.%20de%20Palam%C3%B3s%2C%2091%2C%2017110%20Sant%20Climent%20de%20Peralta%2C%20Girona%2C%20Spain!5e0!3m2!1snl!2snl!4v1"
                width="100%"
                height="400"
                className="border-0 w-full"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Locatie Caravanstalling Spanje"
              />
            </div>
          </A>
        </div>
      </section>

      <Footer />
    </>
  );
}
