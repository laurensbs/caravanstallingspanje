// Publieke referentiecodes voor klant-zichtbare bevestigingen.
// Format: PREFIX-{id}. Prefix maakt op één blik duidelijk wat het is.

export type RefKind = 'koelkast' | 'airco' | 'stalling' | 'transport' | 'service' | 'reparatie' | 'inspectie';

const PREFIXES: Record<RefKind, string> = {
  koelkast: 'KK',
  airco: 'AC',
  stalling: 'ST',
  transport: 'TR',
  service: 'SR',
  reparatie: 'RE',
  inspectie: 'IN',
};

const PREFIX_TO_KIND: Record<string, RefKind> = Object.fromEntries(
  Object.entries(PREFIXES).map(([k, v]) => [v, k as RefKind])
);

export function formatRef(kind: RefKind, id: number | string): string {
  return `${PREFIXES[kind]}-${id}`;
}

export function parseRef(ref: string): { kind: RefKind; id: string } | null {
  const m = ref.match(/^([A-Z]{2})-(.+)$/);
  if (!m) return null;
  const kind = PREFIX_TO_KIND[m[1]];
  if (!kind) return null;
  return { kind, id: m[2] };
}

// Mapping van fridge device_type → ref-prefix. Airco krijgt eigen prefix.
export function refKindForFridge(deviceType: string): RefKind {
  return deviceType === 'Airco' ? 'airco' : 'koelkast';
}
