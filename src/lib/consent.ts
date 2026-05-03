// Consent management — bewaart granulaire keuzes in een cookie en biedt
// helper-hooks voor componenten die op consent moeten wachten (analytics,
// marketing-pixels, embedded media).
//
// We schrijven naar cookie i.p.v. localStorage zodat server-side rendering
// (en Consent Mode v2 backend-signalen later) er ook bij kan.

export type ConsentCategory = 'essential' | 'analytics' | 'marketing';

export interface ConsentState {
  essential: true; // altijd waar — essentieel kan niet worden uitgezet
  analytics: boolean;
  marketing: boolean;
  /** ISO timestamp van laatste keuze. Voor compliance-bewijs en re-prompt na 12 maanden. */
  decidedAt: string | null;
  /** Versie van de cookie/privacy-policy waartegen deze keuze is gemaakt.
   *  Bij bump → banner opnieuw tonen. */
  version: number;
}

export const CONSENT_VERSION = 1;
export const CONSENT_COOKIE = 'cs_consent';
const ONE_YEAR_SEC = 365 * 24 * 3600;

export const DEFAULT_CONSENT: ConsentState = {
  essential: true,
  analytics: false,
  marketing: false,
  decidedAt: null,
  version: CONSENT_VERSION,
};

export function parseConsent(raw: string | undefined): ConsentState {
  if (!raw) return DEFAULT_CONSENT;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw));
    if (typeof parsed !== 'object' || parsed === null) return DEFAULT_CONSENT;
    if (parsed.version !== CONSENT_VERSION) return DEFAULT_CONSENT;
    return {
      essential: true,
      analytics: !!parsed.analytics,
      marketing: !!parsed.marketing,
      decidedAt: typeof parsed.decidedAt === 'string' ? parsed.decidedAt : null,
      version: CONSENT_VERSION,
    };
  } catch {
    return DEFAULT_CONSENT;
  }
}

export function serializeConsent(state: ConsentState): string {
  return encodeURIComponent(
    JSON.stringify({
      analytics: state.analytics,
      marketing: state.marketing,
      decidedAt: state.decidedAt,
      version: state.version,
    }),
  );
}

/** Schrijft consent-cookie. SameSite=Lax zodat normale navigatie 'm meeneemt;
 *  geen Secure-flag in dev (anders werkt 'ie niet op http://localhost). */
export function writeConsentCookie(state: ConsentState) {
  if (typeof document === 'undefined') return;
  const isHttps = location.protocol === 'https:';
  const value = serializeConsent(state);
  document.cookie = `${CONSENT_COOKIE}=${value}; Path=/; Max-Age=${ONE_YEAR_SEC}; SameSite=Lax${isHttps ? '; Secure' : ''}`;
}

export function readConsentCookie(): ConsentState {
  if (typeof document === 'undefined') return DEFAULT_CONSENT;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${CONSENT_COOKIE}=([^;]+)`));
  return parseConsent(match?.[1]);
}

export function hasConsentDecision(state: ConsentState): boolean {
  return state.decidedAt !== null;
}
