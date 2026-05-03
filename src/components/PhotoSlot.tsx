// PhotoSlot — reserveert layout-ruimte voor toekomstige fotografie zonder
// CLS bij later toevoegen. Bewust **onzichtbaar** in deze fase: geen
// placeholder-icoon, geen text. Achtergrond matcht het surrounding panel
// zodat het slot niet als "leeg" voelt.
//
// Gebruik:
//   <PhotoSlot ratio="4/3" className="rounded-2xl" />
//   <PhotoSlot ratio="hero" />
//
// Wanneer een echte <Image> beschikbaar is, vervang je dit element direct
// — de aspect-ratio is identiek dus de pagina shift niet.

import type { CSSProperties, ReactNode } from 'react';

const RATIOS = {
  '4/3': '4 / 3',
  '3/2': '3 / 2',
  '16/9': '16 / 9',
  '1/1': '1 / 1',
  hero: '5 / 4', // hero-portret op desktop, kantelt naar landscape op mobile via CSS-clamp
} as const;

type Props = {
  ratio?: keyof typeof RATIOS;
  className?: string;
  /** Alt-tekst-equivalent voor screenreaders — leeg = decoratief, default `aria-hidden`. */
  ariaLabel?: string;
  /** Slot-children: voor wanneer je tijdelijk een echte placeholder/foto wilt
   *  invoegen zonder de wrapper te vervangen. */
  children?: ReactNode;
  style?: CSSProperties;
};

export default function PhotoSlot({
  ratio = '4/3',
  className = '',
  ariaLabel,
  children,
  style,
}: Props) {
  return (
    <div
      className={`overflow-hidden ${className}`}
      style={{
        aspectRatio: RATIOS[ratio],
        // Een paar tinten weg van transparant zodat het op donkere navy
        // niet als gat oogt — context-token kiest licht/donker zelf.
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
