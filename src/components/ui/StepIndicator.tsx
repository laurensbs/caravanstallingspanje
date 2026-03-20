'use client';

import { Check } from 'lucide-react';

interface Step {
  label: string;
  description?: string;
}

interface StepIndicatorProps {
  steps: Step[];
  current: number;
}

export default function StepIndicator({ steps, current }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-between w-full max-w-2xl mx-auto">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center">
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300
              ${i < current ? 'bg-accent text-white' : i === current ? 'bg-primary text-white ring-4 ring-primary/20' : 'bg-gray-100 text-gray-500'}
            `}>
              {i < current ? <Check size={18} /> : i + 1}
            </div>
            <span className={`text-xs font-semibold mt-2 text-center ${i <= current ? 'text-gray-900' : 'text-gray-500'}`}>
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-3 rounded-full transition-all duration-300 ${i < current ? 'bg-accent' : 'bg-gray-300'}`} />
          )}
        </div>
      ))}
    </div>
  );
}
