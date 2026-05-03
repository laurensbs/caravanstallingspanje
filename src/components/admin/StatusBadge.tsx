'use client';

import { ReactNode } from 'react';
import { Badge } from '@/components/ui';

// Eén bron van waarheid voor status-rendering in admin. Vermijdt dat
// /stalling, /transport, /koelkasten ieder een eigen STATUS_OPTIONS-array
// met verschillende kleuren onderhouden. Mapping is hier intentioneel
// uitgespeld zodat reviewers in één file zien welke kleur bij welke status
// hoort.
//
// Niet gebruikt voor publieke status (bv. fridge.sold-out) — daar is i18n
// belangrijker dan kleurconsistentie.

type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'accent';

// Canonieke statussen over alle entiteiten. Onbekende statussen vallen
// terug op `neutral` met de raw-status als label.
const STATUS_MAP: Record<string, { tone: Tone; label: string }> = {
  // Workflow-statussen
  'controleren':   { tone: 'warning', label: 'Review' },
  'akkoord':       { tone: 'accent',  label: 'Approved' },
  'compleet':      { tone: 'accent',  label: 'Complete' },
  'betaald':       { tone: 'success', label: 'Paid' },
  'afgewezen':     { tone: 'danger',  label: 'Rejected' },
  'archived':      { tone: 'neutral', label: 'Archived' },

  // Contact-inbox
  'open':          { tone: 'warning', label: 'Open' },
  'handled':       { tone: 'success', label: 'Handled' },

  // Ideas-inbox
  'new':           { tone: 'warning', label: 'New' },
  'shortlist':     { tone: 'accent',  label: 'Shortlist' },
  'in_progress':   { tone: 'accent',  label: 'In progress' },
  'done':          { tone: 'success', label: 'Completed' },

  // Waitlist
  'genotificeerd': { tone: 'success', label: 'Contacted' },
};

type Props = {
  status: string;
  /** Override label (bv. voor i18n). Zonder override valt 't op de mapping
   *  of de raw status zelf terug. */
  label?: ReactNode;
  className?: string;
};

export default function StatusBadge({ status, label, className }: Props) {
  const entry = STATUS_MAP[status];
  const tone = entry?.tone ?? 'neutral';
  const text = label ?? entry?.label ?? status;
  return <Badge tone={tone} className={className}>{text}</Badge>;
}

export type { Tone };
export { STATUS_MAP };
