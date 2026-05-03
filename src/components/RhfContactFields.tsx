'use client';

import {
  type Control,
  type FieldErrors,
  type FieldPath,
  type FieldValues,
  type Path,
  type UseFormRegister,
  useController,
} from 'react-hook-form';
import CampingPicker from './CampingPicker';
import { Field, fieldCls } from './ServiceForm';
import { useLocale } from './LocaleProvider';

// Rhf-variant van ContactFields uit ServiceForm. Gebruikt in dienst-pagina's
// die migreren naar useZodForm. Bestaande state-based ContactFields blijft
// staan — die wordt incrementeel uitgefaseerd, zonder risico op alle 4
// callers tegelijk.
//
// Generic over `T extends FieldValues` zodat we 'm in elk Zod-schema kunnen
// inzetten dat de standaard contact-velden bevat (name/email/phone/address/
// postal_code/city/country/vat_number/registration/brand/model/locationHint).
//
// Het schema bepaalt of velden verplicht zijn (Zod-side); deze component
// rendert alleen labels, native required-attributen blijven uit (we vertrouwen
// op Zod via rhf's `noValidate`-aanpak).

type Props<T extends FieldValues> = {
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  /** Voor `CampingPicker` — controlled component, niet via register. */
  control: Control<T>;
  showRegistration?: boolean;
  showLocation?: boolean;
};

// Helper: rhf typt FieldErrors als hierarchische tree. We weten welke keys
// we gebruiken; cast naar `unknown` om TS gelukkig te houden zonder branded
// types voor elke individuele veld-error.
function err<T extends FieldValues>(errors: FieldErrors<T>, key: string): string | undefined {
  const e = (errors as unknown as Record<string, { message?: string } | undefined>)[key];
  return e?.message;
}

export default function RhfContactFields<T extends FieldValues>({
  register,
  errors,
  control,
  showRegistration = true,
  showLocation = true,
}: Props<T>) {
  const { t } = useLocale();

  // Casts naar Path<T> zodat we de generische API kunnen invullen met onze
  // bekende keys. De caller is verantwoordelijk dat het schema deze keys
  // ook echt heeft — TypeScript dwingt 't af op caller-niveau.
  const k = (s: string) => s as Path<T>;

  return (
    <div className="space-y-3">
      <Field label={t('contact.name')} required>
        <input
          {...register(k('name'))}
          autoComplete="name"
          aria-invalid={!!err(errors, 'name')}
          aria-describedby={err(errors, 'name') ? 'cf-err-name' : undefined}
          className={fieldCls}
        />
        <FieldError id="cf-err-name" message={err(errors, 'name')} />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label={t('contact.email')} required>
          <input
            {...register(k('email'))}
            type="email"
            inputMode="email"
            autoComplete="email"
            aria-invalid={!!err(errors, 'email')}
            aria-describedby={err(errors, 'email') ? 'cf-err-email' : undefined}
            className={fieldCls}
          />
          <FieldError id="cf-err-email" message={err(errors, 'email')} />
        </Field>
        <Field label={t('contact.phone')} required>
          <input
            {...register(k('phone'))}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            aria-invalid={!!err(errors, 'phone')}
            aria-describedby={err(errors, 'phone') ? 'cf-err-phone' : undefined}
            className={fieldCls}
          />
          <FieldError id="cf-err-phone" message={err(errors, 'phone')} />
        </Field>
      </div>

      <Field label="Adres" required>
        <input
          {...register(k('address'))}
          autoComplete="street-address"
          placeholder="Straat 12"
          aria-invalid={!!err(errors, 'address')}
          aria-describedby={err(errors, 'address') ? 'cf-err-address' : undefined}
          className={fieldCls}
        />
        <FieldError id="cf-err-address" message={err(errors, 'address')} />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Field label="Postcode" required>
          <input
            {...register(k('postal_code'))}
            autoComplete="postal-code"
            placeholder="1234 AB"
            aria-invalid={!!err(errors, 'postal_code')}
            aria-describedby={err(errors, 'postal_code') ? 'cf-err-pc' : undefined}
            className={fieldCls}
          />
          <FieldError id="cf-err-pc" message={err(errors, 'postal_code')} />
        </Field>
        <Field label="Plaats" required>
          <input
            {...register(k('city'))}
            autoComplete="address-level2"
            placeholder="Amsterdam"
            aria-invalid={!!err(errors, 'city')}
            aria-describedby={err(errors, 'city') ? 'cf-err-city' : undefined}
            className={fieldCls}
          />
          <FieldError id="cf-err-city" message={err(errors, 'city')} />
        </Field>
        <Field label="Land" required>
          <input
            {...register(k('country'))}
            autoComplete="country-name"
            aria-invalid={!!err(errors, 'country')}
            aria-describedby={err(errors, 'country') ? 'cf-err-country' : undefined}
            className={fieldCls}
          />
          <FieldError id="cf-err-country" message={err(errors, 'country')} />
        </Field>
      </div>

      <Field label="BTW-nummer" hint="Optioneel — alleen voor zakelijke klanten">
        <input
          {...register(k('vat_number'))}
          placeholder="NL123456789B01"
          className={fieldCls}
        />
      </Field>

      {showRegistration && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field label={t('contact.registration')}>
            <input {...register(k('registration'))} placeholder="12-AB-34" className={fieldCls} />
          </Field>
          <Field label={t('contact.brand')}>
            <input {...register(k('brand'))} placeholder="Hobby" className={fieldCls} />
          </Field>
          <Field label={t('contact.model')}>
            <input {...register(k('model'))} placeholder="Excellent" className={fieldCls} />
          </Field>
        </div>
      )}

      {showLocation && (
        <Field label={t('contact.location-hint-label')} hint={t('contact.location-hint-help')}>
          <CampingPickerControlled control={control} name={k('locationHint')} />
        </Field>
      )}
    </div>
  );
}

// CampingPicker neemt een value+onChange (controlled), past niet bij register().
// useController bridged 'm naar rhf's interne form-state.
function CampingPickerControlled<T extends FieldValues>({
  control,
  name,
}: {
  control: Control<T>;
  name: FieldPath<T>;
}) {
  const { t } = useLocale();
  const { field } = useController({ control, name });
  return (
    <CampingPicker
      value={typeof field.value === 'string' ? field.value : ''}
      onChange={(v) => field.onChange(v)}
      placeholder={t('fridge.camping-placeholder')}
      ariaLabel={t('contact.location-hint-label')}
    />
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1 text-[12px] text-danger">
      {message}
    </p>
  );
}
