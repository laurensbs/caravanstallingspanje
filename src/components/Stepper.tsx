'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface StepperProps {
  current: number; // 0-indexed
  steps: string[];
}

// Mockup-stepper: navy voor actief, green voor afgerond, grijs voor toekomstig.
// Wordt gebruikt door alle MultiStepShell-flows (koelkast/airco/transport/etc).
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
        return (
          <div key={label} className="flex items-center gap-2 sm:gap-3 flex-1 last:flex-none">
            <div className="flex items-center gap-2.5 min-w-0">
              <motion.div
                animate={{
                  scale: active ? 1 : 0.94,
                  backgroundColor: done
                    ? 'var(--green)'
                    : active
                      ? 'var(--navy)'
                      : 'var(--bg)',
                }}
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                className="rounded-full flex items-center justify-center shrink-0"
                style={{
                  width: 28,
                  height: 28,
                  fontFamily: 'var(--sora)',
                  fontWeight: 700,
                  fontSize: 12.5,
                  border: done || active ? 'none' : '1px solid var(--line)',
                  color: done || active ? '#fff' : 'var(--muted)',
                  boxShadow: active ? '0 0 0 4px rgba(47,66,84,0.10)' : 'none',
                }}
              >
                {done ? <Check size={14} strokeWidth={3} /> : i + 1}
              </motion.div>
              <span
                className="whitespace-nowrap transition-colors"
                style={{
                  fontFamily: 'var(--sora)',
                  fontSize: 13,
                  fontWeight: active || done ? 600 : 500,
                  color: active ? 'var(--navy)' : done ? 'var(--green)' : 'var(--muted)',
                }}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className="flex-1 h-px transition-colors"
                style={{ backgroundColor: done ? 'var(--green)' : 'var(--line)' }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
