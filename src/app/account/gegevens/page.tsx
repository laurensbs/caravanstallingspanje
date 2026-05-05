'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Save, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import AccountLayout from '@/components/account/AccountLayout';
import { useLocale } from '@/components/LocaleProvider';

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
  const { t } = useLocale();
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
      <AccountLayout>
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin" style={{ color: 'var(--muted)' }} />
        </div>
      </AccountLayout>
    );
  }

  const set = <K extends keyof CustomerForm>(k: K, v: CustomerForm[K]) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <AccountLayout customerName={form.name} customerEmail={email}>
      <motion.header
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <span className="eyebrow-mk">{t('pt1.brand')}</span>
        <h1 className="h2-mk" style={{ marginTop: 4, fontSize: 'clamp(1.6rem, 3.2vw, 2.2rem)' }}>
          Mijn gegevens
        </h1>
        <p className="lead-mk" style={{ marginTop: 8, fontSize: 14 }}>
          Wijzigingen worden meteen ook in onze boekhouding bijgewerkt.
        </p>
      </motion.header>

      <form onSubmit={submit} className="card-mk" style={{ padding: 28, maxWidth: 720 }}>
        <div className="field-mk">
          <label htmlFor="acc-name">Naam</label>
          <input id="acc-name" type="text" value={form.name} onChange={(e) => set('name', e.target.value)} required />
        </div>

        <div className="field-mk">
          <label htmlFor="acc-email">E-mail</label>
          <input id="acc-email" type="email" value={email} disabled style={{ background: 'var(--bg)', color: 'var(--muted)' }} />
          <div className="hint">E-mailadres wijzigen? Stuur ons een bericht.</div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <div className="field-mk">
            <label htmlFor="acc-phone">Telefoon</label>
            <input id="acc-phone" type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
          </div>
          <div className="field-mk">
            <label htmlFor="acc-mobile">Mobiel</label>
            <input id="acc-mobile" type="tel" value={form.mobile} onChange={(e) => set('mobile', e.target.value)} />
          </div>
        </div>

        <h3 style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 11, letterSpacing: 2.4, textTransform: 'uppercase', color: 'var(--muted)', margin: '20px 0 12px' }}>
          Factuuradres
        </h3>

        <div className="field-mk">
          <label htmlFor="acc-address">Adres</label>
          <input id="acc-address" type="text" value={form.address} onChange={(e) => set('address', e.target.value)} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4">
          <div className="field-mk">
            <label htmlFor="acc-postal">Postcode</label>
            <input id="acc-postal" type="text" value={form.postal_code} onChange={(e) => set('postal_code', e.target.value)} />
          </div>
          <div className="field-mk">
            <label htmlFor="acc-city">Plaats</label>
            <input id="acc-city" type="text" value={form.city} onChange={(e) => set('city', e.target.value)} />
          </div>
          <div className="field-mk">
            <label htmlFor="acc-country">Land</label>
            <input id="acc-country" type="text" value={form.country} onChange={(e) => set('country', e.target.value)} />
          </div>
        </div>
        <div className="field-mk">
          <label htmlFor="acc-vat">BTW-nummer (optioneel)</label>
          <input id="acc-vat" type="text" value={form.vat_number} onChange={(e) => set('vat_number', e.target.value)} placeholder="NL123456789B01" />
        </div>

        {error && (
          <div role="alert" style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', padding: 12, borderRadius: 10, fontSize: 13, margin: '14px 0' }}>
            <AlertCircle size={14} style={{ marginTop: 2, flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {savedAt && !error && (
          <div role="status" style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--green-soft)', border: '1px solid var(--green)', color: 'var(--green)', padding: 12, borderRadius: 10, fontSize: 13, margin: '14px 0' }}>
            <CheckCircle2 size={15} aria-hidden />
            <span>Opgeslagen.</span>
          </div>
        )}

        <div style={{ paddingTop: 20, borderTop: '1px solid var(--line)', marginTop: 14 }}>
          <button type="submit" disabled={submitting} className="btn btn-primary disabled:opacity-50">
            {submitting ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <Save size={15} aria-hidden />}
            {submitting ? 'Opslaan…' : 'Opslaan'}
          </button>
        </div>
      </form>
    </AccountLayout>
  );
}
