'use client';

import { useEffect, useState } from 'react';
import type { Transition, Variants } from 'framer-motion';

// Eén bron voor motion-tokens zodat duur/easing consistent is over de site.
// Zelfde easing als de bestaande hero-animaties (Apple-achtige out-cubic).

export const EASE_OUT = [0.16, 1, 0.3, 1] as const;
export const EASE_IN_OUT = [0.4, 0, 0.2, 1] as const;

export const DURATION = {
  fast: 0.18,
  base: 0.32,
  slow: 0.5,
} as const;

/** Detecteert `prefers-reduced-motion` met SSR-safe default. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return reduced;
}

/** Variants voor een fade-up patroon. Stagger-children werkt door
 *  `staggerChildren` op de parent te zetten. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.base, ease: EASE_OUT } satisfies Transition,
  },
};

export const stagger = (delay = 0, gap = 0.06): Variants => ({
  hidden: {},
  show: {
    transition: {
      staggerChildren: gap,
      delayChildren: delay,
    },
  },
});

/** Wanneer reduced-motion: variants leveren die geen transform/opacity-anim
 *  doen — alleen direct visible. Component-niveau alternatief voor de
 *  globale CSS-`prefers-reduced-motion` rule die alleen duration kapt. */
export function respectMotion(reduced: boolean, variants: Variants): Variants {
  if (!reduced) return variants;
  return {
    hidden: { opacity: 1 },
    show: { opacity: 1, transition: { duration: 0 } },
  };
}
