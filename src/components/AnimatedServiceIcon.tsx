'use client';

import { motion, useReducedMotion } from 'framer-motion';
import {
  Wind, Truck, Refrigerator, Wrench, Search, Warehouse, Sparkles,
  type LucideIcon,
} from 'lucide-react';

export type ServiceIconKind =
  | 'airco' | 'transport' | 'fridge' | 'repair' | 'inspection'
  | 'storage' | 'service';

const ICON_MAP: Record<ServiceIconKind, LucideIcon> = {
  airco: Wind,
  transport: Truck,
  fridge: Refrigerator,
  repair: Wrench,
  inspection: Search,
  storage: Warehouse,
  service: Sparkles,
};

interface Props {
  kind: ServiceIconKind;
  size?: number;
  /** Animeert continu (idle); anders alleen bij hover op de parent. */
  loop?: boolean;
  className?: string;
}

/**
 * Subtiel-geanimeerde dienst-iconen. Elk icoon krijgt een eigen idle
 * beweging die bij het concept past:
 *  - airco: trage rotatie (waaier)
 *  - transport: zachte horizontale "wiebel" (rijdt)
 *  - fridge: ademende schaal (koelt)
 *  - repair: kort knikken (sleutelen)
 *  - inspection: zacht zwenken (zoeken)
 *  - storage: vaste kalmte met hover-tilt
 *  - service: glinster (opacity-pulse via filter)
 *
 * Respecteert prefers-reduced-motion → geen animatie.
 */
export default function AnimatedServiceIcon({
  kind, size = 18, loop = true, className,
}: Props) {
  const reduce = useReducedMotion();
  const Icon = ICON_MAP[kind];

  const baseProps = {
    className,
    style: { display: 'inline-block', transformOrigin: '50% 50%' as const },
  };

  if (reduce) {
    return <Icon size={size} className={className} />;
  }

  switch (kind) {
    case 'airco':
      return (
        <motion.span
          {...baseProps}
          animate={loop ? { rotate: 360 } : undefined}
          whileHover={!loop ? { rotate: 360 } : undefined}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
        >
          <Icon size={size} />
        </motion.span>
      );
    case 'transport':
      return (
        <motion.span
          {...baseProps}
          animate={loop ? { x: [0, 2, 0, -1, 0] } : undefined}
          whileHover={!loop ? { x: [0, 4, 0] } : undefined}
          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Icon size={size} />
        </motion.span>
      );
    case 'fridge':
      return (
        <motion.span
          {...baseProps}
          animate={loop ? { scale: [1, 1.04, 1] } : undefined}
          whileHover={!loop ? { scale: 1.08 } : undefined}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Icon size={size} />
        </motion.span>
      );
    case 'repair':
      return (
        <motion.span
          {...baseProps}
          animate={loop ? { rotate: [0, -12, 0, 12, 0] } : undefined}
          whileHover={!loop ? { rotate: [0, -15, 0, 15, 0] } : undefined}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1.2 }}
        >
          <Icon size={size} />
        </motion.span>
      );
    case 'inspection':
      return (
        <motion.span
          {...baseProps}
          animate={loop ? { x: [0, 2, -2, 0], y: [0, -1, 1, 0] } : undefined}
          whileHover={!loop ? { x: [0, 3, -3, 0] } : undefined}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Icon size={size} />
        </motion.span>
      );
    case 'storage':
      return (
        <motion.span
          {...baseProps}
          whileHover={{ rotate: [-2, 2, 0], transition: { duration: 0.6 } }}
        >
          <Icon size={size} />
        </motion.span>
      );
    case 'service':
      return (
        <motion.span
          {...baseProps}
          animate={loop ? { rotate: [0, 8, -8, 0], scale: [1, 1.05, 1] } : undefined}
          whileHover={!loop ? { rotate: [0, 15, -15, 0] } : undefined}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.8 }}
        >
          <Icon size={size} />
        </motion.span>
      );
  }
}
