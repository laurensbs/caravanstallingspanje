'use client';

import { ReactNode } from 'react';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  meta?: ReactNode;
}

export default function PageHeader({ eyebrow, title, description, actions, meta }: PageHeaderProps) {
  return (
    <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
      <div className="min-w-0">
        {eyebrow && (
          <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-text-muted mb-2">
            {eyebrow}
          </div>
        )}
        <h1 className="text-2xl sm:text-[26px] font-semibold tracking-tight text-text">
          {title}
        </h1>
        {description && (
          <p className="text-[13px] text-text-muted mt-1.5 leading-relaxed max-w-2xl">
            {description}
          </p>
        )}
        {meta && <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-text-muted">{meta}</div>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </header>
  );
}
