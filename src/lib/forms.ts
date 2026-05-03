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
