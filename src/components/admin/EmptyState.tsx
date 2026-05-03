'use client';

import { ReactNode } from 'react';
import { type LucideIcon, Inbox } from 'lucide-react';

// Lege-staat voor admin-tabellen en filterresultaten. Vermijd "Geen rijen" in
// 12px-grijs — dat voelt alsof er iets stuk is. Een nette card met icoon,
// titel en een actie helpt de gebruiker verder.

type Props = {
  /** Korte titel — bv. "Geen klanten gevonden" of "Nog geen reserveringen". */
  title: string;
  /** Optionele uitleg of next-step. */
  description?: string;
  /** Lucide-icoon. Default Inbox. */
  icon?: LucideIcon;
  /** Optionele primaire actie (Button of Link). */
  action?: ReactNode;
  className?: string;
};

export default function EmptyState({ title, description, icon: Icon = Inbox, action, className = '' }: Props) {
  return (
    <div
      className={`card-surface p-10 sm:p-12 text-center ${className}`}
      role="status"
    >
      <div
        className="cs-empty-icon w-12 h-12 mx-auto rounded-full bg-surface-2 border border-border flex items-center justify-center text-text-subtle mb-4"
      >
        <Icon size={20} aria-hidden />
      </div>
      <h2 className="text-[15px] font-semibold text-text">{title}</h2>
      {description && (
        <p className="text-[13px] text-text-muted mt-1.5 leading-relaxed max-w-md mx-auto">
          {description}
        </p>
      )}
      {action && <div className="mt-5 inline-flex">{action}</div>}
    </div>
  );
}
