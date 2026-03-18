'use client';

import { forwardRef, ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'accent' | 'ghost' | 'danger' | 'outline';
type Size = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
}

const variants: Record<Variant, string> = {
  primary: 'bg-primary hover:bg-primary-dark text-white shadow-sm hover:shadow-md',
  secondary: 'bg-sand hover:bg-sand-dark text-surface-dark border border-sand-dark/50',
  accent: 'bg-accent hover:bg-accent-dark text-white shadow-sm hover:shadow-md',
  ghost: 'bg-transparent hover:bg-sand/50 text-warm-gray hover:text-surface-dark',
  danger: 'bg-danger hover:bg-red-700 text-white shadow-sm',
  outline: 'bg-transparent border border-sand-dark hover:border-primary/30 text-surface-dark hover:bg-sand/30',
};

const sizes: Record<Size, string> = {
  sm: 'px-3.5 py-1.5 text-xs gap-1.5 rounded-xl',
  md: 'px-5 py-2.5 text-sm gap-2 rounded-xl',
  lg: 'px-7 py-3.5 text-sm gap-2 rounded-2xl',
  xl: 'px-8 py-4 text-base gap-2.5 rounded-2xl',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconRight,
  fullWidth = false,
  className = '',
  children,
  disabled,
  ...props
}, ref) => (
  <button
    ref={ref}
    disabled={disabled || loading}
    className={`
      inline-flex items-center justify-center font-bold transition-all duration-200
      disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]
      ${variants[variant]} ${sizes[size]}
      ${fullWidth ? 'w-full' : ''}
      ${className}
    `}
    {...props}
  >
    {loading ? (
      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    ) : icon}
    {children}
    {iconRight}
  </button>
));

Button.displayName = 'Button';
export default Button;
