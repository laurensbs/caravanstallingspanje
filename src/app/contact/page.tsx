'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useState } from 'react';
import { Send, CheckCircle, AlertTriangle, MapPin, Phone, Mail, Clock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error();
      setStatus('sent');
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch {
      setStatus('error');
    }
  };

  const inputClass = 'w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/30 transition-all placeholder:text-gray-400';

  return (
    <>
      <Header />

      {/* Hero */}
      <section className="relative bg-primary-dark text-white py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-dark via-primary/80 to-primary-dark" />
        <div className="absolute inset-0 dot-pattern opacity-20" />
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center">
            <span className="text-accent text-xs font-bold tracking-[0.2em] uppercase mb-4 block">Contact</span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-6">
              Neem <span className="gradient-text">Contact</span> op
            </h1>
            <p className="text-white/50 max-w-2xl mx-auto text-lg leading-relaxed">
              Heeft u vragen of wilt u een offerte aanvragen? Wij reageren binnen 24 uur.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main content */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-5 gap-8 sm:gap-12">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-3"
            >
              <h2 className="text-2xl font-black text-primary-dark mb-2">Stuur ons een bericht</h2>
              <p className="text-muted text-sm mb-8">Vul het formulier in en wij nemen zo snel mogelijk contact met u op.</p>

              {status === 'sent' ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 flex items-start gap-4"
                >
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                    <CheckCircle className="text-emerald-600" size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-emerald-800 text-lg">Bericht verzonden!</p>
                    <p className="text-sm text-emerald-700 mt-1">Wij nemen zo snel mogelijk contact met u op. Gemiddeld reageren wij binnen 24 uur.</p>
                    <button onClick={() => setStatus('idle')} className="text-emerald-600 font-semibold text-sm mt-4 hover:underline inline-flex items-center gap-1">
                      Nog een bericht sturen <ArrowRight size={12} />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="text-xs font-bold text-gray-500 mb-2 block">Uw naam *</label>
                      <input type="text" placeholder="Jan Jansen" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 mb-2 block">E-mailadres *</label>
                      <input type="email" placeholder="jan@voorbeeld.nl" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className={inputClass} />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="text-xs font-bold text-gray-500 mb-2 block">Telefoonnummer</label>
                      <input type="tel" placeholder="+31 6 12345678" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 mb-2 block">Onderwerp</label>
                      <select value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className={`${inputClass} ${!form.subject ? 'text-gray-400' : 'text-gray-900'}`}>
                        <option value="">Kies een onderwerp</option>
                        <option>Stalling informatie</option>
                        <option>Stalling aanvragen</option>
                        <option>Caravanverhuur</option>
                        <option>Onderhoud & reparatie</option>
                        <option>Transport aanvragen</option>
                        <option>Overig</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-2 block">Uw bericht *</label>
                    <textarea placeholder="Beschrijf uw vraag of verzoek..." required rows={6} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} className={`${inputClass} resize-none`} />
                  </div>
                  {status === 'error' && (
                    <div className="flex items-center gap-2.5 bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-200">
                      <AlertTriangle size={16} /> Er is iets misgegaan. Probeer het opnieuw.
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="bg-gradient-to-r from-accent to-accent-light hover:from-accent-light hover:to-accent text-white font-bold px-8 py-4 rounded-xl text-sm transition-all duration-300 shadow-lg shadow-accent/20 hover:shadow-accent/40 inline-flex items-center gap-2 disabled:opacity-50"
                  >
                    <Send size={16} /> {status === 'sending' ? 'Verzenden...' : 'Verstuur bericht'}
                  </button>
                </form>
              )}
            </motion.div>

            {/* Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="lg:col-span-2"
            >
              <div className="bg-surface rounded-3xl p-8 border border-gray-100 space-y-7">
                <h3 className="font-black text-primary-dark text-lg">Contactgegevens</h3>

                {[
                  { icon: MapPin, label: 'Adres', value: 'Ctra de Palamos, 91\n17110 Sant Climent de Peralta\nGirona, Spanje' },
                  { icon: Phone, label: 'Telefoon', value: '+34 972 00 00 00' },
                  { icon: Mail, label: 'E-mail', value: 'info@caravanstalling-spanje.com' },
                  { icon: Clock, label: 'Openingstijden', value: 'Maandag t/m vrijdag: 09:30 - 16:30\nZaterdag en zondag: Gesloten' },
                ].map(item => (
                  <div key={item.label} className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                      <item.icon size={16} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 mb-0.5">{item.label}</p>
                      <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Map placeholder */}
              <div className="mt-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-3xl aspect-[4/3] flex items-center justify-center border border-gray-100">
                <div className="text-center">
                  <MapPin size={32} className="text-primary/20 mx-auto mb-2" />
                  <p className="text-muted text-xs font-medium">Google Maps</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
