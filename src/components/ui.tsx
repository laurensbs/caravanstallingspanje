'use client';

import { forwardRef, ButtonHTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ReactNode } from 'react';

// ─── Button ───
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const buttonBase = 'inline-flex items-center justify-center gap-2 font-medium rounded-[var(--radius-md)] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed select-none';

const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-accent-fg hover:bg-accent-hover active:scale-[0.98]',
  secondary: 'bg-surface text-text border border-border hover:border-border-strong active:scale-[0.98]',
  ghost: 'bg-transparent text-text hover:bg-surface-2',
  danger: 'bg-danger text-white hover:opacity-90 active:scale-[0.98]',
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading, className = '', children, disabled, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`${buttonBase} ${buttonVariants[variant]} ${buttonSizes[size]} ${className}`}
      {...props}
    >
      {loading ? <Spinner size={size === 'sm' ? 12 : 14} /> : children}
    </button>
  );
});

// ─── Input ───
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, className = '', id, ...props },
  ref
) {
  const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-medium text-text">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={`w-full h-10 px-3 text-sm bg-surface border ${error ? 'border-danger' : 'border-border'} rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent transition-colors placeholder:text-text-subtle ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
      {hint && !error && <p className="text-xs text-text-muted">{hint}</p>}
    </div>
  );
});

// ─── Textarea ───
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, className = '', id, rows = 3, ...props },
  ref
) {
  const inputId = id || (label ? `textarea-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-medium text-text">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={inputId}
        rows={rows}
        className={`w-full px-3 py-2 text-sm bg-surface border ${error ? 'border-danger' : 'border-border'} rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent transition-colors placeholder:text-text-subtle resize-none ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
});

// ─── Select ───
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, className = '', id, children, ...props },
  ref
) {
  const inputId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-medium text-text">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={inputId}
        className={`w-full h-10 px-3 text-sm bg-surface border ${error ? 'border-danger' : 'border-border'} rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent transition-colors ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
});

// ─── Badge ───
type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'accent';

interface BadgeProps {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
}

const badgeTones: Record<BadgeTone, string> = {
  neutral: 'bg-surface-2 text-text-muted border-border',
  success: 'bg-success-soft text-success border-transparent',
  warning: 'bg-warning-soft text-warning border-transparent',
  danger: 'bg-danger-soft text-danger border-transparent',
  accent: 'bg-text text-accent-fg border-transparent',
};

export function Badge({ tone = 'neutral', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 h-5 text-[10px] font-medium uppercase tracking-wider rounded-[var(--radius-full)] border ${badgeTones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

// ─── Spinner ───
export function Spinner({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className="animate-spin"
      aria-hidden
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3" />
      <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

// ─── Skeleton ───
export function Skeleton({ className = '', delayMs }: { className?: string; delayMs?: number }) {
  return (
    <div
      className={`bg-surface-2 rounded-[var(--radius-md)] ${className}`}
      style={{
        animation: 'shimmer 1.6s ease-in-out infinite',
        animationDelay: delayMs ? `${delayMs}ms` : undefined,
      }}
    />
  );
}

// Presets — matchend met content-shape zodat de skeleton echt voorvertoont
// wat er komt, niet een generic balk. Geen pulse die niet bij de inhoud past.

/** Skeleton voor één tekst-regel. `lines` rendert meerdere regels met
 *  variabele breedte voor natuurlijk leesritme. */
export function SkeletonText({ lines = 1, className = '' }: { lines?: number; className?: string }) {
  const widths = ['100%', '92%', '78%', '85%', '64%'];
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-3"
          delayMs={i * 30}
          // inline style met variabele breedte zodat 't niet als blok aanvoelt
          {...({ style: { width: widths[i % widths.length] } } as object)}
        />
      ))}
    </div>
  );
}

/** Skeleton voor een card — header + body-text + footer-actie-zone. */
export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`card-surface p-5 space-y-3 ${className}`}>
      <div className="flex items-center gap-3">
        <Skeleton className="w-9 h-9 rounded-full" />
        <Skeleton className="h-3.5 flex-1 max-w-[180px]" />
      </div>
      <SkeletonText lines={2} />
      <div className="flex gap-2 pt-1">
        <Skeleton className="h-7 w-20" />
        <Skeleton className="h-7 w-16" />
      </div>
    </div>
  );
}

/** Skeleton voor een tabel-rij in admin. */
export function SkeletonRow({ cols = 4, className = '' }: { cols?: number; className?: string }) {
  return (
    <div className={`flex items-center gap-4 px-4 py-3 ${className}`}>
      <Skeleton className="w-8 h-8 rounded-full" />
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} className="h-3 flex-1" delayMs={i * 20} />
      ))}
    </div>
  );
}

/** Skeleton voor een hero-blok (eyebrow + title + intro + CTA). Reserveert
 *  de exacte ruimte van een typische hero zodat CLS<0.05 blijft. */
export function SkeletonHero({ className = '' }: { className?: string }) {
  return (
    <div className={`space-y-4 py-10 ${className}`}>
      <Skeleton className="h-3 w-32" />
      <Skeleton className="h-10 w-3/4 max-w-[520px]" />
      <Skeleton className="h-4 w-2/3 max-w-[420px]" />
      <div className="flex gap-3 pt-2">
        <Skeleton className="h-12 w-36 rounded-[var(--radius-lg)]" />
        <Skeleton className="h-12 w-28 rounded-[var(--radius-lg)]" />
      </div>
    </div>
  );
}
