'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Refrigerator, Wind, Truck, Loader2, ExternalLink, Mail, Check, AlertTriangle,
  PlayCircle, RefreshCw,
} from 'lucide-react';
import { Button, Input, Badge } from '@/components/ui';
import PageHeader from '@/components/admin/PageHeader';

type Kind = 'koelkast' | 'airco' | 'transport';

type RunResult = {
  ok: boolean;
  kind: Kind;
  ref?: string;
  bookingId?: number;
  fridgeId?: number;
  transportId?: number;
  customerId?: number;
  holdedInvoiceId?: string;
  holdedInvoiceNum?: string;
  mailSent?: boolean;
  receiptUrl?: string;
  adminUrl?: string;
  log: string[];
  error?: string;
};

export default function TestFlowPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('Test Klant');
  const [skipMail, setSkipMail] = useState(false);
  const [running, setRunning] = useState<Kind | null>(null);
  const [results, setResults] = useState<RunResult[]>([]);

  const run = async (kind: Kind) => {
    if (!email || !email.includes('@')) {
      toast.error('Vul eerst een geldig e-mailadres in');
      return;
    }
    setRunning(kind);
    try {
      const res = await fetch('/api/admin/test-flow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind, email, name, skipMail }),
        credentials: 'include',
      });
      const data = await res.json();
      setResults((prev) => [{ ...data, kind }, ...prev]);
      if (data.ok) {
        toast.success(`Test-flow ${kind} doorlopen — check ${email}`);
      } else {
        toast.error(`Test mislukt: ${data.error || 'onbekend'}`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Test mislukt');
    } finally {
      setRunning(null);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Beheer"
        title="Test-flow"
        description="Doorloop volledig wat een klant ziet — booking aanmaken, status op betaald zetten, Holded pro forma, bevestigingsmail. Geen Stripe-betaling vereist."
      />

      <div className="card-surface p-6 mb-6 space-y-4 max-w-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Test e-mailadres"
            type="email"
            placeholder="jij@voorbeeld.nl"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            hint="Hier komt de bevestigingsmail aan."
          />
          <Input
            label="Klantnaam"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <label className="flex items-center gap-2 text-[13px] text-text-muted cursor-pointer">
          <input
            type="checkbox"
            checked={skipMail}
            onChange={(e) => setSkipMail(e.target.checked)}
            className="rounded"
          />
          Geen mail versturen (alleen DB + Holded)
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8 max-w-2xl">
        <TestButton
          kind="koelkast"
          icon={Refrigerator}
          label="Koelkast"
          desc="€40 · 7 dagen"
          color="cyan"
          running={running === 'koelkast'}
          disabled={running !== null}
          onClick={() => run('koelkast')}
        />
        <TestButton
          kind="airco"
          icon={Wind}
          label="Airco"
          desc="€50 · 7 dagen"
          color="amber"
          running={running === 'airco'}
          disabled={running !== null}
          onClick={() => run('airco')}
        />
        <TestButton
          kind="transport"
          icon={Truck}
          label="Transport"
          desc="€100 · heen-en-terug"
          color="violet"
          running={running === 'transport'}
          disabled={running !== null}
          onClick={() => run('transport')}
        />
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {results.map((r, i) => (
            <motion.div
              key={`${r.ref || i}-${i}`}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -8 }}
              className="card-surface p-5"
            >
              <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-text capitalize">{r.kind}</h3>
                    {r.ok
                      ? <Badge tone="success"><Check size={10} /> Geslaagd</Badge>
                      : <Badge tone="danger"><AlertTriangle size={10} /> Mislukt</Badge>}
                    {r.ref && <Badge tone="neutral">{r.ref}</Badge>}
                    {r.holdedInvoiceNum && (
                      <Badge tone="success">Holded {r.holdedInvoiceNum}</Badge>
                    )}
                    {r.mailSent && (
                      <Badge tone="success"><Mail size={10} /> Mail verzonden</Badge>
                    )}
                  </div>
                  {r.error && <p className="text-[12px] text-danger mt-1">{r.error}</p>}
                </div>
                <div className="flex flex-wrap gap-2">
                  {r.receiptUrl && (
                    <a href={r.receiptUrl} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="secondary">
                        <ExternalLink size={12} /> Klant-receipt
                      </Button>
                    </a>
                  )}
                  {r.adminUrl && (
                    <Link href={r.adminUrl}>
                      <Button size="sm" variant="ghost">
                        <ExternalLink size={12} /> Admin
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
              <pre className="text-[11px] font-mono leading-relaxed text-text-muted bg-surface-2 rounded-[var(--radius-md)] p-3 overflow-x-auto whitespace-pre-wrap break-words">
{r.log.join('\n')}
              </pre>
            </motion.div>
          ))}
        </AnimatePresence>
        {results.length > 0 && (
          <button
            type="button"
            onClick={() => setResults([])}
            className="text-[12px] text-text-muted hover:text-text underline-offset-4 hover:underline inline-flex items-center gap-1.5"
          >
            <RefreshCw size={11} /> Resultaten wissen
          </button>
        )}
      </div>

      <div className="mt-10 max-w-2xl card-surface p-5 bg-warning-soft border-warning">
        <h3 className="text-[13px] font-semibold uppercase tracking-[0.18em] mb-2 inline-flex items-center gap-2">
          <PlayCircle size={14} /> Hoe werkt het?
        </h3>
        <ol className="text-[13px] text-text-muted leading-relaxed space-y-1 list-decimal list-inside">
          <li>Vul jouw eigen e-mailadres in (zodat je de mail krijgt zoals klant).</li>
          <li>Klik op een dienst-knop — de complete backend-flow loopt door.</li>
          <li>Open <strong>Klant-receipt</strong> in nieuwe tab → check wat klant ziet.</li>
          <li>Open je inbox → check de bevestigingsmail in caravanstalling-stijl.</li>
          <li>Open <strong>Admin</strong> → check of de booking netjes binnenkomt.</li>
          <li>Open Holded → check of de pro forma is aangemaakt (geen echte factuur).</li>
        </ol>
        <p className="text-[12px] text-text-muted mt-3 italic">
          Test-bookings worden gemarkeerd met &quot;(TEST)&quot; in de naam zodat je ze later kunt
          herkennen en eventueel verwijderen.
        </p>
      </div>
    </>
  );
}

function TestButton({
  icon: Icon, label, desc, color, running, disabled, onClick,
}: {
  kind: Kind;
  icon: typeof Refrigerator;
  label: string;
  desc: string;
  color: 'cyan' | 'amber' | 'violet';
  running: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  const ringMap = {
    cyan: 'rgba(126,168,255,0.5)',
    amber: 'rgba(255,180,80,0.5)',
    violet: 'rgba(180,140,255,0.5)',
  } as const;
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="card-surface group hover-lift press-spring p-5 text-left disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-all"
      style={running ? { boxShadow: `0 0 0 2px ${ringMap[color]}` } : undefined}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-[var(--radius-md)] bg-surface-2 text-text flex items-center justify-center border border-border">
          <Icon size={18} />
        </div>
        {running ? (
          <Loader2 size={14} className="animate-spin text-text-muted" />
        ) : (
          <PlayCircle size={14} className="text-text-subtle group-hover:text-text transition-colors" />
        )}
      </div>
      <div className="text-[14px] font-semibold">{label}</div>
      <div className="text-[12px] text-text-muted mt-0.5">{desc}</div>
    </button>
  );
}
