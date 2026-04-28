// Talks to the reparatiepanel project's /api/intake endpoint to forward
// service requests submitted through the public website. Pattern mirrors
// src/lib/holded.ts: thin wrapper, env-driven config, friendly error mapping.

const DEFAULT_BASE = "https://caravanreparatiespanje.vercel.app";

function baseUrl(): string {
  return (process.env.HUB_INBOX_URL || DEFAULT_BASE).replace(/\/$/, "");
}

function apiKey(): string {
  const key = process.env.HUB_INBOX_KEY;
  if (!key) throw new Error("HUB_INBOX_KEY ontbreekt");
  return key;
}

export type IntakeType = "repair" | "service" | "inspection" | "transport";

export interface IntakePayload {
  type: IntakeType;
  customer: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
  unit?: {
    registration?: string;
    brand?: string;
    model?: string;
    year?: number;
    length?: string;
  };
  title: string;
  description: string;
  locationHint?: string;
  serviceCategory?: string;
  transport?: {
    from: string;
    to: string;
    preferredDate?: string;
  };
  metadata?: Record<string, string>;
}

export interface IntakeResult {
  repairJobId: string;
  publicCode: string;
}

export async function sendIntake(payload: IntakePayload): Promise<IntakeResult> {
  const res = await fetch(`${baseUrl()}/api/intake`, {
    method: "POST",
    headers: {
      "x-intake-key": apiKey(),
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  let body: unknown;
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = { raw: text };
  }

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      throw new Error("Reparatiepanel weigert de API-key — configuratie nakijken.");
    }
    if (res.status === 400) {
      const msg =
        body && typeof body === "object" && "error" in body && typeof (body as { error: unknown }).error === "string"
          ? (body as { error: string }).error
          : "Ongeldige aanvraag";
      throw new Error(msg);
    }
    if (res.status >= 500) {
      throw new Error("Reparatiepanel onbereikbaar. Probeer het opnieuw of bel ons.");
    }
    throw new Error(`Reparatiepanel HTTP ${res.status}`);
  }

  if (!body || typeof body !== "object" || !("ok" in body)) {
    throw new Error("Onverwacht antwoord van reparatiepanel");
  }
  const ok = (body as { ok: boolean }).ok;
  if (!ok) {
    const msg = (body as { error?: string }).error || "Reparatiepanel-fout";
    throw new Error(msg);
  }
  const result = body as unknown as { repairJobId: string; publicCode: string };
  return {
    repairJobId: result.repairJobId,
    publicCode: result.publicCode,
  };
}
