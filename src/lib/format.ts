export const fmt = (n: number) => new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(n);

export const fmtDate = (d: string | undefined | null) => d ? new Date(d).toLocaleDateString('nl-NL') : '-';

export const PRIORITY_COLORS: Record<string, string> = {
  laag: 'bg-ocean/15 text-ocean-dark',
  normaal: 'bg-sand text-surface-dark',
  hoog: 'bg-warning/15 text-warning',
  urgent: 'bg-danger/15 text-danger',
};
