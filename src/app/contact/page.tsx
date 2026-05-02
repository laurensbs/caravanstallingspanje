'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, Loader2 } from 'lucide-react';
import PublicHero from '@/components/PublicHero';
import PublicFooter from '@/components/PublicFooter';
import { Field, fieldCls, Section } from '@/components/ServiceForm';
import { useLocale } from '@/components/LocaleProvider';

export default function ContactPage() {
  const { t } = useLocale();
  const [form, setForm] = useState({
    name: '', email: '', phone: '', subject: '', message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/order/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || t('common.send-failed'));
        return;
      }
      window.location.href = `/diensten/bedankt?ref=${encodeURIComponent(data.ref)}`;
    } catch {
      setError(t('common.connection-error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen page-public page-public-dark flex flex-col" style={{ background: 'linear-gradient(180deg, #0A1929 0%, #050D18 100%)' }}>
      <PublicHero
        back={{ href: '/', label: t('common.brand') }}
        title={t('contact.heading')}
        intro={t('contact.intro')}
      />
      <div className="max-w-2xl mx-auto px-5 sm:px-6 py-8 sm:py-14">
        <motion.form
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          onSubmit={submit}
          className="space-y-7"
        >
          <Section title={t('contact.section-details')}>
            <Field label={t('common.name')} required>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                autoComplete="name"
                className={fieldCls}
              />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label={t('common.email')} required>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  autoComplete="email"
                  className={fieldCls}
                />
              </Field>
              <Field label={`${t('common.phone')} ${t('common.optional')}`}>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  autoComplete="tel"
                  className={fieldCls}
                />
              </Field>
            </div>
          </Section>

          <Section title={t('contact.section-message')}>
            <Field label={`${t('contact.subject')} ${t('common.optional')}`}>
              <input
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder={t('contact.subject-placeholder')}
                className={fieldCls}
              />
            </Field>
            <Field label={t('contact.message')} required>
              <textarea
                required
                rows={6}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder={t('contact.message-placeholder')}
                className={`${fieldCls} min-h-[140px] py-2 resize-y`}
              />
            </Field>
          </Section>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[var(--radius-md)] bg-danger-soft text-danger px-4 py-3 text-[14px]"
            >
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="press-spring w-full h-14 rounded-[var(--radius-lg)] bg-accent text-accent-fg font-semibold text-[15px] hover:bg-accent-hover transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={16} />}
            {submitting ? t('common.sending') : t('contact.submit')}
          </button>

          <p className="text-[12px] text-text-muted text-center inline-flex items-center justify-center gap-1.5 w-full">
            <Mail size={12} /> {t('contact.or-mail')}
            <a href="mailto:info@caravanstalling-spanje.com" className="text-text underline-offset-4 hover:underline">
              info@caravanstalling-spanje.com
            </a>
          </p>
        </motion.form>
      </div>
      <PublicFooter />
    </main>
  );
}
