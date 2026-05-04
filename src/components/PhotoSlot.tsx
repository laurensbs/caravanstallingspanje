// PhotoSlot — reserveert layout-ruimte voor toekomstige fotografie zonder
// CLS bij later toevoegen.
//
// Twee modi:
//   1. Zonder `src`: **onzichtbaar** placeholder — alleen aspect-ratio.
//      Layout staat al op z'n plek, foto kan later gevuld worden.
//   2. Met `src`: rendert via next/image met aspect-ratio behouden.
//      Vervang gewoon de prop wanneer je URL's beschikbaar hebt.
//
// Gebruik:
//   <PhotoSlot ratio="4/3" />
//   <PhotoSlot ratio="hero" src="/brand/workshop.jpg" alt="Onze werkplaats" priority />

import Image from 'next/image';
import type { CSSProperties, ReactNode } from 'react';

const RATIOS = {
  '4/3': '4 / 3',
  '3/2': '3 / 2',
  '16/9': '16 / 9',
  '1/1': '1 / 1',
  hero: '5 / 4',
} as const;

type Props = {
  ratio?: keyof typeof RATIOS;
  className?: string;
  /** Foto-URL. Zonder src: onzichtbare placeholder. */
  src?: string;
  /** Alt-tekst voor de foto. Verplicht als `src` gezet is. */
  alt?: string;
  /** LCP-foto's bovenaan: priority=true zodat next/image preload doet. */
  priority?: boolean;
  /** Sizes-attribuut voor responsive image — default desktop-half / mobile-full. */
  sizes?: string;
  /** Aanvullend label voor screenreaders zonder src. Default decoratief. */
  ariaLabel?: string;
  /** Slot-children: voor tijdelijke overlays (badge, caption). */
  children?: ReactNode;
  style?: CSSProperties;
};

export default function PhotoSlot({
  ratio = '4/3',
  className = '',
  src,
  alt,
  priority,
  sizes = '(min-width: 1024px) 50vw, 100vw',
  ariaLabel,
  children,
  style,
}: Props) {
  const aspectRatio = RATIOS[ratio];

  if (src) {
    return (
      <div
        className={`relative overflow-hidden ${className}`}
        style={{ aspectRatio, ...style }}
      >
        <Image
          src={src}
          alt={alt ?? ''}
          fill
          priority={priority}
          sizes={sizes}
          className="object-cover"
        />
        {children}
      </div>
    );
  }

  return (
    <div
      className={`overflow-hidden ${className}`}
      style={{
        aspectRatio,
        background: 'var(--cs-surface-2, var(--color-surface-2))',
        ...style,
      }}
      role={ariaLabel ? 'img' : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
    >
      {children}
    </div>
  );
}
