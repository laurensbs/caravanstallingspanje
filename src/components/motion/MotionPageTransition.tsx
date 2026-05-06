'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { EASE_OUT, DURATION, useReducedMotion } from '@/lib/motion';

// Subtiele fade-up bij route-mount. Volledige page (Topbar/Header/Footer
// zit erbuiten in de page-files zelf) krijgt zachte 320ms-fade — voorkomt
// de "blink-load" feeling tussen routes.
//
// Gebruik: wrap de <main>-inhoud in een page-component met deze component.
// Niet de hele <div>-root, want dan animeert ook header + footer mee, en
// die willen we statisch hebben (header is altijd zichtbaar tijdens
// navigatie en zou anders flickeren).
//
// Respecteert prefers-reduced-motion: dan geen animatie, alleen direct mount.
export default function MotionPageTransition({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  if (reduced) {
    return <div className={className}>{children}</div>;
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DURATION.base, ease: EASE_OUT, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
