'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Mail, Send, Loader2, AlertCircle, MessageSquare } from 'lucide-react';
import MarketingPage from '@/components/marketing/MarketingPage';
import { Field, fieldCls, Section } from '@/components/ServiceForm';
import { useLocale } from '@/components/LocaleProvider';
import { MotionFade } from '@/components/motion/MotionPrimitives';
import { useZodForm, focusFirstError, summaryError } from '@/lib/forms';
import { contactMessageSchema } from '@/lib/validations';
import { MotionShake } from '@/components/motion/MotionPrimitives';
import type { z } from 'zod';

type FormValues = z.input<typeof contactMessageSchema>;

// useSearchParams forceert dynamic-rendering. Wrap in Suspense voor build —
// Next eist 't expliciet zodat de server de bailout kan plannen.
export default function ContactPage() {
  return (
    <Suspense fallback={null}>
      <ContactPageInner />
    </Suspense>
  );
}

function ContactPageInner() {
  const { t } = useLocale();
  const [serverError, setServerError] = useState('');
  const searchParams = useSearchParams();
  const initialSubject = searchParams.get('subject') ?? '';

  const form = useZodForm<FormValues>(contactMessageSchema, {
    defaultValues: { name: '', email: '', phone: '', subject: initialSubject, message: '' },
  });

  // Sync subject als de query later verandert (back-button etc.).
  useEffect(() => {
    if (initialSubject) form.setValue('subject', initialSubject);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSubject]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitted },
  } = form;

  const inlineSummary = isSubmitted ? summaryError(form) : null;
  const [shakeTick, setShakeTick] = useState(0);

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
    <MarketingPage
      hero={{
        title: t('contact.heading'),
        intro: t('contact.intro'),
        back: { href: '/', label: t('common.brand') },
        icon: MessageSquare,
      }}
    >
      <div className="max-w-2xl mx-auto px-5 sm:px-6 py-10 sm:py-14 w-full">
        <MotionFade>
          <form
            onSubmit={handleSubmit(submit, () => {
              setShakeTick((n) => n + 1);
              focusFirstError(form);
            })}
            noValidate
            className="space-y-7"
          >
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

            {(inlineSummary || serverError) && (
              <MotionShake trigger={shakeTick + (serverError ? 1000 : 0)}>
                <div
                  role="alert"
                  aria-live="polite"
                  className="rounded-[var(--radius-md)] bg-danger-soft text-danger px-4 py-3 text-[14px] inline-flex items-start gap-2"
                >
                  <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden />
                  <span>{serverError || inlineSummary}</span>
                </div>
              </MotionShake>
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
    </MarketingPage>
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
