'use client';

import { useState } from 'react';
import { Mail, Send, Loader2, AlertCircle } from 'lucide-react';
import PublicHero from '@/components/PublicHero';
import PublicFooter from '@/components/PublicFooter';
import { Field, fieldCls, Section } from '@/components/ServiceForm';
import { useLocale } from '@/components/LocaleProvider';
import { MotionFade } from '@/components/motion/MotionPrimitives';
import { useZodForm } from '@/lib/forms';
import { contactMessageSchema } from '@/lib/validations';
import type { z } from 'zod';

type FormValues = z.input<typeof contactMessageSchema>;

export default function ContactPage() {
  const { t } = useLocale();
  const [serverError, setServerError] = useState('');

  const form = useZodForm<FormValues>(contactMessageSchema, {
    defaultValues: { name: '', email: '', phone: '', subject: '', message: '' },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  const submit = async (values: FormValues) => {
    setServerError('');
    try {
      const res = await fetch('/api/order/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setServerError(data.error || t('common.send-failed'));
        return;
      }
      window.location.href = `/diensten/bedankt?ref=${encodeURIComponent(data.ref)}`;
    } catch {
      setServerError(t('common.connection-error'));
    }
  };

  return (
    <main
      id="main"
      className="min-h-screen page-public page-public-dark flex flex-col"
      style={{ background: 'linear-gradient(180deg, #0A1929 0%, #050D18 100%)' }}
    >
      <PublicHero
        back={{ href: '/', label: t('common.brand') }}
        title={t('contact.heading')}
        intro={t('contact.intro')}
      />
      <div className="max-w-2xl mx-auto px-5 sm:px-6 py-8 sm:py-14 w-full">
        <MotionFade>
          <form onSubmit={handleSubmit(submit)} noValidate className="space-y-7">
            <Section title={t('contact.section-details')}>
              <Field label={t('common.name')} required>
                <input
                  {...register('name')}
                  autoComplete="name"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? 'err-name' : undefined}
                  className={fieldCls}
                />
                <FieldError id="err-name" message={errors.name?.message} />
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label={t('common.email')} required>
                  <input
                    {...register('email')}
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'err-email' : undefined}
                    className={fieldCls}
                  />
                  <FieldError id="err-email" message={errors.email?.message} />
                </Field>
                <Field label={`${t('common.phone')} ${t('common.optional')}`}>
                  <input
                    {...register('phone')}
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    aria-invalid={!!errors.phone}
                    aria-describedby={errors.phone ? 'err-phone' : undefined}
                    className={fieldCls}
                  />
                  <FieldError id="err-phone" message={errors.phone?.message} />
                </Field>
              </div>
            </Section>

            <Section title={t('contact.section-message')}>
              <Field label={`${t('contact.subject')} ${t('common.optional')}`}>
                <input
                  {...register('subject')}
                  placeholder={t('contact.subject-placeholder')}
                  aria-invalid={!!errors.subject}
                  className={fieldCls}
                />
              </Field>
              <Field label={t('contact.message')} required>
                <textarea
                  {...register('message')}
                  rows={6}
                  placeholder={t('contact.message-placeholder')}
                  aria-invalid={!!errors.message}
                  aria-describedby={errors.message ? 'err-message' : undefined}
                  className={`${fieldCls} min-h-[140px] py-2 resize-y`}
                />
                <FieldError id="err-message" message={errors.message?.message} />
              </Field>
            </Section>

            {serverError && (
              <div
                role="alert"
                aria-live="polite"
                className="rounded-[var(--radius-md)] bg-danger-soft text-danger px-4 py-3 text-[14px] inline-flex items-start gap-2"
              >
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="press-spring w-full h-14 rounded-[var(--radius-lg)] bg-accent text-accent-fg font-semibold text-[15px] hover:bg-accent-hover transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={16} />}
              {isSubmitting ? t('common.sending') : t('contact.submit')}
            </button>

            <p className="text-[12px] text-text-muted text-center inline-flex items-center justify-center gap-1.5 w-full">
              <Mail size={12} /> {t('contact.or-mail')}
              <a
                href="mailto:info@caravanstalling-spanje.com"
                className="text-text underline-offset-4 hover:underline"
              >
                info@caravanstalling-spanje.com
              </a>
            </p>
          </form>
        </MotionFade>
      </div>
      <PublicFooter />
    </main>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1 text-[12px] text-danger" role="alert">
      {message}
    </p>
  );
}
