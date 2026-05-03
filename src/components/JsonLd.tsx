import { jsonLdString } from '@/lib/seo';

// Server component — geen 'use client'. JSON-LD hoort bij de SSR HTML zodat
// Googlebot 'm direct ziet zonder JS te executen.
//
// `<` wordt geescaped via jsonLdString om eventuele XSS via dynamic content
// in JSON-strings te voorkomen.

type Props = {
  payload: Record<string, unknown> | Array<Record<string, unknown>>;
  /** Optioneel id-suffix om 'em uit elkaar te kunnen houden in devtools. */
  id?: string;
};

export default function JsonLd({ payload, id }: Props) {
  return (
    <script
      type="application/ld+json"
      id={id ? `ld-${id}` : undefined}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: jsonLdString(payload) }}
    />
  );
}
