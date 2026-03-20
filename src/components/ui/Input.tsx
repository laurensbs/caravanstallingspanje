'use client';

import { forwardRef, InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  icon,
  hint,
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-muted block mb-2 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted/40 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full ${icon ? 'pl-10' : 'pl-4'} pr-4 py-3 bg-gray-50 border rounded-xl text-sm text-gray-900
            focus:ring-2 focus:ring-primary/15 focus:border-primary/30 outline-none transition-all
            placeholder:text-gray-500/60
            ${error ? 'border-danger/50 focus:ring-danger/20 focus:border-danger/30' : 'border-gray-300/40'}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="text-danger text-xs mt-1.5 font-medium">{error}</p>}
      {hint && !error && <p className="text-muted text-xs mt-1.5">{hint}</p>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
