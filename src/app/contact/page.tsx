'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';
import { MapPin, Phone, Mail, Clock, MessageCircle, ArrowRight, Shield, Star, Users } from 'lucide-react';
import { useState } from 'react';
import A from '@/components/AnimateIn';
import PageHero from '@/components/PageHero';
import QuizModal from '@/components/QuizModal';


export default function ContactPage() {
  const [quizOpen, setQuizOpen] = useState(false);

  return (
    <>
      <Header />

      <PageHero
        badge="Contact"
        title={<>Neem <span className="gradient-text">contact</span> op</>}
        subtitle="Vertel ons waar u naar zoekt en ontvang binnen 1 werkdag een persoonlijk voorstel. Wij spreken Nederlands, Engels en Spaans."
        image="https://u.cubeupload.com/laurensbos/caravanstoragespain6.jpg"
      />

      {/* Quick Contact Options */}
      <section className="py-12 sm:py-20 bg-surface relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-accent/[0.04] rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <A>
            <div className="text-center mb-10">
              <span className="inline-flex items-center gap-2 bg-primary/8 rounded-full px-3 py-1 mb-3"><span className="w-1.5 h-1.5 rounded-full bg-primary" /><span className="text-primary text-xs font-bold tracking-[0.15em] uppercase">Contact</span></span>
              <h2 className="text-xl sm:text-3xl font-black mb-2">Hoe wilt u contact opnemen?</h2>
              <p className="text-warm-gray text-sm sm:text-base max-w-xl mx-auto">Kies de manier die u het beste uitkomt.</p>
            </div>
          </A>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-5 mb-10">
            {/* Quiz CTA — Primary */}
            <A className="col-span-2 sm:col-span-3">
              <button
                onClick={() => setQuizOpen(true)}
                className="w-full bg-gradient-to-br from-accent to-accent-dark text-white rounded-2xl p-5 sm:p-10 text-left hover:shadow-2xl transition-all group cursor-pointer relative overflow-hidden"
              >
                <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/[0.04] rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-3 py-1 text-xs font-bold mb-3">
                      <Star size={12} /> Aanbevolen
                    </div>
                    <h3 className="text-lg sm:text-2xl font-black mb-1">Ontvang een voorstel op maat</h3>
                    <p className="text-white/80 text-sm leading-relaxed max-w-lg">
                      Beantwoord een paar korte vragen — wij sturen u binnen 1 werkdag een persoonlijk voorstel.
                    </p>
                    <div className="flex items-center gap-2 mt-3 sm:mt-5 text-xs sm:text-sm font-bold">
                      <span className="inline-flex items-center gap-1.5 bg-white/15 rounded-lg px-2.5 py-1 sm:px-3 sm:py-1.5"><Shield size={13} /> Vrijblijvend</span>
                      <span className="inline-flex items-center gap-1.5 bg-white/15 rounded-lg px-2.5 py-1 sm:px-3 sm:py-1.5"><Clock size={13} /> 30 sec</span>
                    </div>
                  </div>
                  <div className="hidden sm:flex w-14 h-14 bg-white/20 rounded-2xl items-center justify-center shrink-0 group-hover:bg-white/30 transition-colors">
                    <ArrowRight size={24} />
                  </div>
                </div>
              </button>
            </A>

            {/* Call */}
            <A delay={0.1}>
              <a href="tel:+34650036755" className="block card-premium p-4 sm:p-6 h-full">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-hero/10 rounded-xl flex items-center justify-center mb-3">
                  <Phone size={18} className="text-hero" />
                </div>
                <h3 className="font-black text-base sm:text-lg mb-1">Bel ons</h3>
                <p className="text-warm-gray text-xs sm:text-sm leading-relaxed mb-2">Direct aan de lijn — NL, EN, ES.</p>
                <p className="text-primary font-bold text-sm">+34 650 036 755</p>
              </a>
            </A>

            {/* WhatsApp */}
            <A delay={0.15}>
              <a href="https://wa.me/34650036755" target="_blank" rel="noopener noreferrer" className="block card-premium p-4 sm:p-6 h-full">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#25D366]/10 rounded-xl flex items-center justify-center mb-3">
                  <MessageCircle size={18} className="text-[#25D366]" />
                </div>
                <h3 className="font-black text-base sm:text-lg mb-1">WhatsApp</h3>
                <p className="text-warm-gray text-xs sm:text-sm leading-relaxed mb-2">Foto&apos;s, vragen of snelle reactie.</p>
                <p className="text-[#25D366] font-bold text-sm">Start gesprek →</p>
              </a>
            </A>

            {/* Email — only visible on sm+ to keep 2-col grid clean on mobile */}
            <A delay={0.2} className="col-span-2 sm:col-span-1">
              <a href="mailto:info@caravanstalling-spanje.com" className="block card-premium p-4 sm:p-6 h-full">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-3">
                  <Mail size={18} className="text-primary" />
                </div>
                <h3 className="font-black text-base sm:text-lg mb-1">E-mail</h3>
                <p className="text-warm-gray text-xs sm:text-sm leading-relaxed mb-2">Reactie binnen 1 werkdag.</p>
                <p className="text-primary font-bold text-xs sm:text-sm break-all">info@caravanstalling-spanje.com</p>
              </a>
            </A>
          </div>

          {/* Trust bar */}
          <A delay={0.25}>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-warm-gray">
              <span className="inline-flex items-center gap-1.5"><Star size={14} className="text-yellow-500 fill-yellow-500" /> 4.8 Google Reviews</span>
              <span className="inline-flex items-center gap-1.5"><Shield size={14} className="text-accent" /> 15+ jaar ervaring</span>
              <span className="inline-flex items-center gap-1.5"><Users size={14} className="text-primary" /> 200+ tevreden klanten</span>
            </div>
          </A>
        </div>
      </section>

      {/* Contact Info + Image */}
      <section className="py-12 sm:py-20 bg-premium-warm relative overflow-hidden">
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-primary/[0.04] rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <A>
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
                <Image
                  src="https://u.cubeupload.com/laurensbos/caravanstoragespain2.jpg"
                  alt="Caravanstalling in Spanje"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </A>

            <A delay={0.1}>
              <div>
                <p className="text-xs font-bold tracking-[0.2em] uppercase text-primary mb-3">Onze locatie</p>
                <h2 className="text-xl sm:text-3xl font-black mb-4">Bezoek ons in Spanje</h2>
                <div className="space-y-4 mb-6">
                  {[
                    { icon: MapPin, label: 'Adres', value: 'Ctra de Palamós, 91\n17110 Sant Climent de Peralta\nGirona, Spanje' },
                    { icon: Clock, label: 'Openingstijden', value: 'Maandag t/m vrijdag: 09:30 – 16:30\nWeekend: gesloten' },
                    { icon: Phone, label: 'Telefoon', value: '+34 650 036 755', href: 'tel:+34650036755' },
                    { icon: Mail, label: 'E-mail', value: 'info@caravanstalling-spanje.com', href: 'mailto:info@caravanstalling-spanje.com' },
                  ].map(c => (
                    <div key={c.label} className="flex gap-4">
                      <div className="w-10 h-10 bg-card rounded-xl flex items-center justify-center border border-sand-dark/[0.06] shrink-0">
                        <c.icon size={16} className="text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-warm-gray uppercase tracking-wider mb-0.5">{c.label}</p>
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
            </A>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
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

      <QuizModal open={quizOpen} onClose={() => setQuizOpen(false)} source="contact-page" />
      <Footer />
    </>
  );
}
