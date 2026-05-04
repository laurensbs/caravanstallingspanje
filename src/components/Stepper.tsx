'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface StepperProps {
  current: number; // 0-indexed
  steps: string[];
}

export default function Stepper({ current, steps }: StepperProps) {
  return (
    <div
      className="flex items-center gap-2 sm:gap-3 mb-7"
      role="progressbar"
      aria-valuenow={current + 1}
      aria-valuemin={1}
      aria-valuemax={steps.length}
    >
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        const filled = done || active;
        return (
          <div key={label} className="flex items-center gap-2 sm:gap-3 flex-1 last:flex-none">
            <div className="flex items-center gap-2.5 min-w-0">
              <motion.div
                animate={{
                  scale: active ? 1 : 0.92,
                  backgroundColor: filled ? 'var(--color-terracotta)' : '#fff',
                }}
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                className="w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-semibold border shrink-0"
                style={{
                  borderColor: filled ? 'var(--color-terracotta)' : 'var(--color-marketing-line)',
                  color: filled ? '#fff' : 'var(--color-marketing-ink-soft)',
                  boxShadow: active ? '0 0 0 4px rgba(217,110,60,0.12)' : 'none',
                }}
              >
                {done ? <Check size={13} strokeWidth={3} /> : i + 1}
              </motion.div>
              <span
                className="text-[12px] sm:text-sm whitespace-nowrap transition-colors"
                style={{
                  color: active
                    ? 'var(--color-navy)'
                    : 'var(--color-marketing-ink-soft)',
                  fontWeight: active ? 600 : 400,
                }}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className="flex-1 h-px transition-colors"
                style={{
                  backgroundColor: done ? 'var(--color-terracotta)' : 'var(--color-marketing-line)',
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
