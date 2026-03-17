'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useState } from 'react';
import { Send, CheckCircle, AlertTriangle } from 'lucide-react';

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

  return (
    <>
      <Header />

      <section className="bg-primary-dark text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact</h1>
          <p className="text-white/70 max-w-2xl text-lg">Heeft u vragen of wilt u een offerte aanvragen? Neem gerust contact met ons op.</p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 grid md:grid-cols-2 gap-12">
          {/* Form */}
          <div>
            <h2 className="text-2xl font-bold text-primary-dark mb-6">Stuur ons een bericht</h2>
            {status === 'sent' ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 flex items-start gap-3">
                <CheckCircle className="text-success shrink-0 mt-0.5" size={20} />
                <div><p className="font-semibold text-green-800">Bericht verzonden!</p><p className="text-sm text-green-700">Wij nemen zo snel mogelijk contact met u op.</p></div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" placeholder="Uw naam *" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                <input type="email" placeholder="E-mailadres *" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                <input type="tel" placeholder="Telefoonnummer" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                <select value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-muted">
                  <option value="">Onderwerp kiezen</option>
                  <option>Stalling informatie</option>
                  <option>Offerte aanvragen</option>
                  <option>Onderhoud & reparatie</option>
                  <option>Transport aanvragen</option>
                  <option>Overig</option>
                </select>
                <textarea placeholder="Uw bericht *" required rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none" />
                {status === 'error' && (
                  <div className="flex items-center gap-2 text-danger text-sm"><AlertTriangle size={14} /> Er is iets misgegaan. Probeer het opnieuw.</div>
                )}
                <button type="submit" disabled={status === 'sending'} className="bg-primary hover:bg-primary-light text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors inline-flex items-center gap-2 disabled:opacity-50">
                  <Send size={16} /> {status === 'sending' ? 'Verzenden...' : 'Verstuur bericht'}
                </button>
              </form>
            )}
          </div>

          {/* Info */}
          <div>
            <h2 className="text-2xl font-bold text-primary-dark mb-6">Contactgegevens</h2>
            <div className="space-y-4 text-sm">
              <div><p className="font-semibold">Adres</p><p className="text-muted">Ctra de Palamos, 91<br />17110 Sant Climent de Peralta<br />Girona, Spanje</p></div>
              <div><p className="font-semibold">Telefoon</p><p className="text-muted">+34 972 00 00 00</p></div>
              <div><p className="font-semibold">E-mail</p><p className="text-muted">info@caravanstalling-spanje.com</p></div>
              <div><p className="font-semibold">Openingstijden</p><p className="text-muted">Maandag t/m vrijdag: 09:30 - 16:30<br />Zaterdag en zondag: Gesloten</p></div>
            </div>
            {/* Map placeholder */}
            <div className="mt-6 bg-surface rounded-2xl h-48 flex items-center justify-center text-muted text-sm">
              Google Maps hier
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
