export const fmt = (n: number) => new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(n);

export const fmtDate = (d: string | undefined | null) => d ? new Date(d).toLocaleDateString('nl-NL') : '-';

export const PRIORITY_COLORS: Record<string, string> = {
  laag: 'bg-ocean/15 text-ocean-dark',
  normaal: 'bg-sand text-surface-dark',
  hoog: 'bg-warning/15 text-warning',
  urgent: 'bg-danger/15 text-danger',
};

export const CARAVAN_STATUS_COLORS: Record<string, string> = {
  gestald: 'bg-accent/15 text-accent-dark',
  op_camping: 'bg-ocean/15 text-ocean-dark',
  in_transit: 'bg-warning/15 text-warning',
  onderhoud: 'bg-orange-100 text-orange-700',
  verkocht: 'bg-sand text-warm-gray',
};

export const CONTRACT_STATUS_COLORS: Record<string, string> = {
  actief: 'bg-accent/15 text-accent-dark',
  verlopen: 'bg-danger/15 text-danger',
  opgezegd: 'bg-sand text-warm-gray',
  concept: 'bg-warning/15 text-warning',
};

export const INVOICE_STATUS_COLORS: Record<string, string> = {
  open: 'bg-ocean/15 text-ocean-dark',
  verzonden: 'bg-warning/15 text-warning',
  betaald: 'bg-accent/15 text-accent-dark',
  achterstallig: 'bg-danger/15 text-danger',
  geannuleerd: 'bg-sand text-warm-gray',
};

export const TRANSPORT_STATUS_COLORS: Record<string, string> = {
  aangevraagd: 'bg-ocean/15 text-ocean-dark',
  gepland: 'bg-warning/15 text-warning',
  onderweg: 'bg-primary/15 text-primary',
  afgeleverd: 'bg-accent/15 text-primary-dark',
  geannuleerd: 'bg-sand text-warm-gray',
};

export const TASK_STATUS_COLORS: Record<string, string> = {
  open: 'bg-ocean/15 text-ocean-dark',
  in_uitvoering: 'bg-warning/15 text-warning',
  afgerond: 'bg-accent/15 text-primary-dark',
};

export const SERVICE_STATUS_COLORS: Record<string, string> = {
  aangevraagd: 'bg-ocean/15 text-ocean-dark',
  goedgekeurd: 'bg-warning/15 text-warning',
  in_uitvoering: 'bg-primary/15 text-primary',
  afgerond: 'bg-accent/15 text-primary-dark',
  geannuleerd: 'bg-sand text-warm-gray',
};

export const CUSTOMER_STATUS_COLORS: Record<string, string> = {
  betaald: 'bg-accent/10 text-primary-dark border-accent/30',
  open: 'bg-ocean/10 text-ocean-dark border-ocean/30',
  actief: 'bg-accent/10 text-primary-dark border-accent/30',
  verlopen: 'bg-danger/10 text-danger border-danger/30',
  gestald: 'bg-accent/10 text-primary-dark border-accent/30',
  in_transit: 'bg-ocean/10 text-ocean-dark border-ocean/30',
  verzonden: 'bg-warning/10 text-warning border-warning/30',
};
