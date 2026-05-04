'use client';

import { type FieldValues, useForm, type UseFormProps, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ZodType } from 'zod';

// Dunne wrapper rond useForm + zodResolver. Vermijdt dat elke form-component
// de twee imports en het resolver-boilerplate herhaalt. Geeft een type-safe
// `form`-object terug dat je rechtstreeks kunt destructueren.
//
// Gebruik:
//   const form = useZodForm(contactMessageSchema, { defaultValues });
//   <form onSubmit={form.handleSubmit(submit)}>...</form>
//
// `mode: 'onBlur'` is bewust: errors verschijnen pas als de gebruiker een
// veld verlaat — agressievere `onChange`-validatie voelt vijandig op mobile.
// Na een eerste submit schakelt rhf automatisch over op `onChange` zodat de
// gebruiker direct ziet of een fix het probleem oplost.

export function useZodForm<TInput extends FieldValues, TOutput extends FieldValues = TInput>(
  schema: ZodType<TOutput, TInput>,
  options?: Omit<UseFormProps<TInput>, 'resolver'>,
): UseFormReturn<TInput> {
  return useForm<TInput>({
    mode: 'onBlur',
    reValidateMode: 'onChange',
    ...options,
    // Cast omdat react-hook-form's resolver-types strikter zijn dan onze
    // generic toelaat — runtime-gedrag is identiek.
    resolver: zodResolver(schema) as unknown as UseFormProps<TInput>['resolver'],
  });
}

/** Geeft het eerste error-message dat in de form-state hangt. Handig voor
 *  een rolerror-banner bovenaan: "Er ontbreekt nog iets — kijk de gemarkeerde
 *  velden na". */
export function firstErrorMessage<T extends FieldValues>(form: UseFormReturn<T>): string | null {
  const errors = form.formState.errors;
  for (const key of Object.keys(errors)) {
    const e = (errors as Record<string, { message?: string } | undefined>)[key];
    if (e?.message) return e.message;
  }
  return null;
}

/** Scroll + focus naar het eerste veld met een rhf-error. Aanroepen vanuit
 *  de submit-error-tak van handleSubmit. Werkt door `name`-attributen die
 *  rhf zelf op inputs zet via register(). */
export function focusFirstError<T extends FieldValues>(form: UseFormReturn<T>): void {
  if (typeof document === 'undefined') return;
  const errors = form.formState.errors;
  const firstKey = Object.keys(errors)[0];
  if (!firstKey) return;
  // Probeer 't echte input-element via name= attribuut.
  const el = document.querySelector<HTMLElement>(`[name="${firstKey}"]`);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    // Iets later focussen zodat de scroll niet door focus geinterrupteerd wordt.
    setTimeout(() => {
      try { el.focus({ preventScroll: true }); } catch { /* noop */ }
    }, 200);
  }
}

/** Vriendelijke samenvatting voor een error-banner — niet rauwe Zod-zinnen.
 *  Gebruik in <MotionShake> bovenaan de form bij submit-fail. */
export function summaryError<T extends FieldValues>(form: UseFormReturn<T>): string | null {
  const errors = form.formState.errors;
  const count = Object.keys(errors).length;
  if (count === 0) return null;
  if (count === 1) return firstErrorMessage(form) || 'Eén veld klopt nog niet.';
  return 'Een paar velden zijn nog niet ingevuld of niet correct.';
}
