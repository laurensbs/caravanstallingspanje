'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Save, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import MarketingPage from '@/components/marketing/MarketingPage';

type CustomerForm = {
  name: string;
  phone: string;
  mobile: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
  vat_number: string;
};

const empty: CustomerForm = {
  name: '', phone: '', mobile: '', address: '', city: '',
  postal_code: '', country: '', vat_number: '',
};

export default function GegevensPage() {
  const router = useRouter();
  const [form, setForm] = useState<CustomerForm>(empty);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch('/api/account/me', { credentials: 'include' });
        if (res.status === 401) { router.push('/account/login'); return; }
        const data = await res.json();
        if (!alive) return;
        if (data.customer.mustChangePassword) {
          router.push('/account/wachtwoord-wijzigen?first=1');
          return;
        }
        setForm({
          name: data.customer.name || '',
          phone: data.customer.phone || '',
          mobile: data.customer.mobile || '',
          address: data.customer.address || '',
          city: data.customer.city || '',
          postal_code: data.customer.postal_code || '',
          country: data.customer.country || 'ES',
          vat_number: data.customer.vat_number || '',
        });
        setEmail(data.customer.email || '');
      } catch {
        if (alive) router.push('/account/login');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/account/update-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Opslaan mislukt.');
        return;
      }
      setSavedAt(Date.now());
    } catch {
      setError('Verbindingsfout. Probeer het zo opnieuw.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <MarketingPage
        hero={{ title: 'Mijn gegevens', back: { href: '/account', label: 'Terug naar portaal' }, variant: 'compact' }}
      >
        <section className="max-w-2xl mx-auto px-5 sm:px-6 py-8 sm:py-12 flex justify-center">
          <Loader2 className="animate-spin" style={{ color: 'var(--color-terracotta)' }} />
        </section>
      </MarketingPage>
    );
  }

  const inputCls = "w-full h-12 px-3.5 text-[15px] bg-white text-[var(--color-marketing-ink)] border border-[var(--color-marketing-line)] rounded-[var(--radius-md)] transition-colors focus:outline-none focus:ring-2 focus:border-[color:var(--color-terracotta)] focus:ring-[color:var(--color-terracotta-soft)]";
  const labelCls = "block text-[13px] font-medium";
  const labelStyle = { color: 'var(--color-marketing-ink)' };
  const set = <K extends keyof CustomerForm>(k: K, v: CustomerForm[K]) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <MarketingPage
      hero={{
        title: 'Mijn gegevens',
        intro: 'Wijzigingen worden meteen ook in onze boekhouding bijgewerkt.',
        back: { href: '/account', label: 'Terug naar portaal' },
        variant: 'compact',
      }}
    >
      <section className="max-w-2xl mx-auto px-5 sm:px-6 py-8 sm:py-12">
        <motion.form
          onSubmit={submit}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mk-card p-6 sm:p-8 space-y-6"
        >
          <div className="space-y-1.5">
            <label className={labelCls} style={labelStyle}>E-mail</label>
            <input
              type="email"
              value={email}
              disabled
              className={`${inputCls} opacity-60 cursor-not-allowed`}
            />
            <p className="text-[12px]" style={{ color: 'var(--color-marketing-ink-soft)' }}>
              E-mail wijzigen? Stuur een bericht via <a href="/contact" className="underline">contact</a>.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className={labelCls} style={labelStyle}>Naam</label>
            <input
              type="text"
              required
              autoComplete="name"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className={labelCls} style={labelStyle}>Telefoon</label>
              <input
                type="tel"
                autoComplete="tel"
                value={form.phone}
                onChange={(e) => set('phone', e.target.value)}
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <label className={labelCls} style={labelStyle}>Mobiel</label>
              <input
                type="tel"
                value={form.mobile}
                onChange={(e) => set('mobile', e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className={labelCls} style={labelStyle}>Adres</label>
            <input
              type="text"
              autoComplete="street-address"
              value={form.address}
              onChange={(e) => set('address', e.target.value)}
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-[1fr_2fr_1fr] gap-3">
            <div className="space-y-1.5">
              <label className={labelCls} style={labelStyle}>Postcode</label>
              <input
                type="text"
                autoComplete="postal-code"
                value={form.postal_code}
                onChange={(e) => set('postal_code', e.target.value)}
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <label className={labelCls} style={labelStyle}>Stad</label>
              <input
                type="text"
                autoComplete="address-level2"
                value={form.city}
                onChange={(e) => set('city', e.target.value)}
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <label className={labelCls} style={labelStyle}>Land</label>
              <input
                type="text"
                autoComplete="country-name"
                value={form.country}
                onChange={(e) => set('country', e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className={labelCls} style={labelStyle}>BTW-nummer <span className="text-[12px]" style={{ color: 'var(--color-marketing-ink-soft)' }}>(optioneel)</span></label>
            <input
              type="text"
              value={form.vat_number}
              onChange={(e) => set('vat_number', e.target.value)}
              className={inputCls}
            />
          </div>

          {error && (
            <div role="alert" className="flex items-start gap-2 rounded-[var(--radius-md)] bg-danger-soft text-danger px-4 py-3 text-[13px]">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {savedAt && Date.now() - savedAt < 4000 && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2 rounded-[var(--radius-md)] px-4 py-3 text-[13px]"
              style={{ background: 'var(--color-terracotta-soft)', color: 'var(--color-terracotta-deep)' }}
            >
              <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
              <span>Gegevens opgeslagen.</span>
            </motion.div>
          )}

          <div className="pt-4 border-t" style={{ borderColor: 'var(--color-marketing-line)' }}>
            <button
              type="submit"
              disabled={submitting}
              className="mk-btn-primary w-full justify-center disabled:opacity-50"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {submitting ? 'Opslaan…' : 'Wijzigingen opslaan'}
            </button>
          </div>
        </motion.form>
      </section>
    </MarketingPage>
  );
}
