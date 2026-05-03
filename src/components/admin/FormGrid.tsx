'use client';

import { ReactNode } from 'react';

// 12-koloms grid-primitive voor admin-Drawer-forms. Drie components:
//   <FormGrid> → grid-container (12 cols, gap = --space-field)
//   <FormCol span={6}> → cell (1..12)
//   <FormSection title="..."> → groep met heading
//
// Drawer-forms in /admin/stalling, /transport, /koelkasten gebruiken nu
// `grid grid-cols-1 md:grid-cols-2 gap-3` ad-hoc. Met FormGrid wordt
// span-keuze expliciet en consistent (2 = phone, 4 = code, 6 = naam, 12 = textarea).

type GridProps = {
  children: ReactNode;
  className?: string;
};

export function FormGrid({ children, className = '' }: GridProps) {
  return (
    <div
      className={`grid grid-cols-12 ${className}`}
      style={{ gap: 'calc(var(--space-field) * 1.5)' }}
    >
      {children}
    </div>
  );
}

type ColSpan = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

type ColProps = {
  children: ReactNode;
  /** Aantal kolommen op desktop (md+). Default 12 = volle breedte. */
  span?: ColSpan;
  /** Aantal kolommen op mobile (<md). Default 12. */
  spanMobile?: ColSpan;
  className?: string;
};

const SPAN_CLASS: Record<ColSpan, string> = {
  1: 'md:col-span-1', 2: 'md:col-span-2', 3: 'md:col-span-3', 4: 'md:col-span-4',
  5: 'md:col-span-5', 6: 'md:col-span-6', 7: 'md:col-span-7', 8: 'md:col-span-8',
  9: 'md:col-span-9', 10: 'md:col-span-10', 11: 'md:col-span-11', 12: 'md:col-span-12',
};

const SPAN_MOBILE_CLASS: Record<ColSpan, string> = {
  1: 'col-span-1', 2: 'col-span-2', 3: 'col-span-3', 4: 'col-span-4',
  5: 'col-span-5', 6: 'col-span-6', 7: 'col-span-7', 8: 'col-span-8',
  9: 'col-span-9', 10: 'col-span-10', 11: 'col-span-11', 12: 'col-span-12',
};

export function FormCol({ children, span = 12, spanMobile = 12, className = '' }: ColProps) {
  return (
    <div className={`${SPAN_MOBILE_CLASS[spanMobile]} ${SPAN_CLASS[span]} ${className}`}>
      {children}
    </div>
  );
}

type SectionProps = {
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function FormSection({ title, description, children, className = '' }: SectionProps) {
  return (
    <section className={`space-y-3 ${className}`}>
      {title && (
        <header className="space-y-0.5">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
            {title}
          </h3>
          {description && (
            <p className="text-[12px] text-text-muted leading-relaxed">{description}</p>
          )}
        </header>
      )}
      {children}
    </section>
  );
}
