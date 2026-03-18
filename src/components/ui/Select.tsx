'use client';

import { forwardRef, SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  options: { value: string; label: string }[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  error,
  icon,
  options,
  placeholder,
  className = '',
  id,
  ...props
}, ref) => {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="text-[11px] font-semibold text-muted block mb-2 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted/40 pointer-events-none">
            {icon}
          </div>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`
            w-full ${icon ? 'pl-10' : 'pl-4'} pr-8 py-3 bg-sand/40 border rounded-xl text-sm text-surface-dark
            focus:ring-2 focus:ring-primary/15 focus:border-primary/30 outline-none transition-all appearance-none
            ${error ? 'border-danger/50' : 'border-sand-dark/40'}
            ${className}
          `}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      {error && <p className="text-danger text-xs mt-1.5 font-medium">{error}</p>}
    </div>
  );
});

Select.displayName = 'Select';
export default Select;
