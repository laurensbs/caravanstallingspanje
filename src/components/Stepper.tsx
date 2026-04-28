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
      className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8"
      role="progressbar"
      aria-valuenow={current + 1}
      aria-valuemin={1}
      aria-valuemax={steps.length}
    >
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={label} className="flex items-center gap-2 sm:gap-3 flex-1 last:flex-none">
            <div className="flex items-center gap-2.5 min-w-0">
              <motion.div
                animate={{
                  scale: active ? 1 : 0.9,
                  backgroundColor: done || active ? 'var(--color-text)' : 'transparent',
                }}
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                className="w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-medium border shrink-0"
                style={{
                  borderColor: done || active ? 'var(--color-text)' : 'var(--color-border-strong)',
                  color: done || active ? 'var(--color-accent-fg)' : 'var(--color-text-muted)',
                }}
              >
                {done ? <Check size={13} strokeWidth={3} /> : i + 1}
              </motion.div>
              <span
                className={`text-[13px] sm:text-sm whitespace-nowrap transition-colors ${
                  active ? 'text-text font-medium' : 'text-text-muted'
                } hidden sm:inline`}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className="flex-1 h-px transition-colors"
                style={{
                  backgroundColor: done ? 'var(--color-text)' : 'var(--color-border)',
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
