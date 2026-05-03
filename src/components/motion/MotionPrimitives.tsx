'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';
import { fadeUp, respectMotion, stagger, useReducedMotion } from '@/lib/motion';

// Drie kleine wrappers die het overgrote deel van onze motion-behoefte
// dekken. Elke component respecteert prefers-reduced-motion. Geen
// IntersectionObserver-hacks — `whileInView` doet 't werk.

type FadeProps = Omit<HTMLMotionProps<'div'>, 'initial' | 'animate' | 'variants'> & {
  children: ReactNode;
  /** Alleen animeren wanneer de component de viewport bereikt. */
  inView?: boolean;
  delay?: number;
};

export function MotionFade({ children, inView = false, delay = 0, ...rest }: FadeProps) {
  const reduced = useReducedMotion();
  const variants = respectMotion(reduced, fadeUp);
  if (inView) {
    return (
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={variants}
        transition={{ delay }}
        {...rest}
      >
        {children}
      </motion.div>
    );
  }
  return (
    <motion.div initial="hidden" animate="show" variants={variants} transition={{ delay }} {...rest}>
      {children}
    </motion.div>
  );
}

type StaggerProps = Omit<HTMLMotionProps<'div'>, 'initial' | 'animate' | 'variants'> & {
  children: ReactNode;
  inView?: boolean;
  gap?: number;
  delay?: number;
};

export function MotionStagger({ children, inView = false, gap = 0.06, delay = 0, ...rest }: StaggerProps) {
  const reduced = useReducedMotion();
  const variants = reduced ? respectMotion(true, stagger()) : stagger(delay, gap);
  if (inView) {
    return (
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
        variants={variants}
        {...rest}
      >
        {children}
      </motion.div>
    );
  }
  return (
    <motion.div initial="hidden" animate="show" variants={variants} {...rest}>
      {children}
    </motion.div>
  );
}

/** Item binnenin <MotionStagger>. Erft variants van de parent. */
export function MotionItem({ children, ...rest }: HTMLMotionProps<'div'> & { children: ReactNode }) {
  const reduced = useReducedMotion();
  const variants = respectMotion(reduced, fadeUp);
  return (
    <motion.div variants={variants} {...rest}>
      {children}
    </motion.div>
  );
}

/** Error-shake op een vlak. `trigger` toggle-prop: elke wijziging activeert
 *  één shake. Gebruik op error-banners boven forms. Reduced-motion: stilstand. */
type ShakeProps = Omit<HTMLMotionProps<'div'>, 'animate' | 'variants'> & {
  children: ReactNode;
  trigger: number | string | boolean;
};

export function MotionShake({ children, trigger, ...rest }: ShakeProps) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      key={String(trigger)}
      animate={
        reduced
          ? { x: 0 }
          : { x: [0, -6, 6, -4, 4, -2, 2, 0] }
      }
      transition={{ duration: 0.42, ease: [0.36, 0.07, 0.19, 0.97] }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/** Spring-bounce voor success-checkmarks. Mount-driven (niet trigger). */
export function MotionBounce({ children, ...rest }: HTMLMotionProps<'div'> & { children: ReactNode }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? { scale: 1, opacity: 1 } : { scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={
        reduced
          ? { duration: 0 }
          : { type: 'spring', stiffness: 380, damping: 22 }
      }
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/** Subtiele page-in transitie voor route-changes — fade + tiny lift.
 *  Mount op de top-level main per pagina. ≤300ms zodat 't niet vertraagt. */
export function MotionPageTransition({ children, ...rest }: HTMLMotionProps<'div'> & { children: ReactNode }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? { opacity: 1 } : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        reduced
          ? { duration: 0 }
          : { duration: 0.28, ease: [0.16, 1, 0.3, 1] }
      }
      {...rest}
    >
      {children}
    </motion.div>
  );
}
