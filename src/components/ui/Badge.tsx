'use client';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'accent';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-500',
  success: 'bg-accent/10 text-accent-dark',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-danger/10 text-danger',
  info: 'bg-ocean/10 text-ocean-dark',
  accent: 'bg-primary/10 text-primary-dark',
};

const dotColors: Record<BadgeVariant, string> = {
  default: 'bg-warm-gray',
  success: 'bg-accent',
  warning: 'bg-warning',
  danger: 'bg-danger',
  info: 'bg-ocean',
  accent: 'bg-primary',
};

export default function Badge({ children, variant = 'default', size = 'sm', dot = false, className = '' }: BadgeProps) {
  return (
    <span className={`
      inline-flex items-center gap-1.5 font-semibold rounded-full
      ${variants[variant]}
      ${size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-xs'}
      ${className}
    `}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />}
      {children}
    </span>
  );
}
