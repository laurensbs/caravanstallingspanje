import { Resend } from 'resend';

let _resend: Resend | null = null;

function client(): Resend | null {
  if (_resend) return _resend;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  _resend = new Resend(key);
  return _resend;
}

function fromAddress(): string {
  // MAIL_FROM is set later when caravanstalling-spanje.com is verified.
  // Until then we send from Resend's test address — it works in production
  // but customers see it as "via resend.dev".
  return process.env.MAIL_FROM || 'Caravanstalling <onboarding@resend.dev>';
}

function replyTo(): string | undefined {
  return process.env.MAIL_REPLY_TO || 'info@caravanstalling-spanje.com';
}

export async function sendMail(params: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<{ ok: boolean; id?: string; error?: string }> {
  const r = client();
  if (!r) {
    console.warn('[email] RESEND_API_KEY missing — skipping send to', params.to);
    return { ok: false, error: 'mail provider not configured' };
  }
  try {
    const reply = replyTo();
    const res = await r.emails.send({
      from: fromAddress(),
      to: [params.to],
      subject: params.subject,
      html: params.html,
      text: params.text,
      replyTo: reply,
    });
    if (res.error) {
      return { ok: false, error: res.error.message };
    }
    return { ok: true, id: res.data?.id };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'send failed';
    return { ok: false, error: msg };
  }
}

// ─── Shared layout ────────────────────────────────────────

const STYLES = `
body{margin:0;background:#FAFAFA;color:#0A0A0A;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;-webkit-font-smoothing:antialiased}
.wrap{max-width:520px;margin:0 auto;padding:32px 24px}
.card{background:#fff;border:1px solid #EAEAEA;border-radius:16px;padding:32px;box-shadow:0 1px 2px rgba(0,0,0,.04)}
.brand{font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:#6B7280;margin-bottom:8px}
h1{font-size:22px;line-height:1.3;margin:0 0 12px;font-weight:600;letter-spacing:-.011em}
p{font-size:14px;line-height:1.55;margin:0 0 14px;color:#0A0A0A}
.muted{color:#6B7280}
.row{display:flex;justify-content:space-between;font-size:13px;padding:8px 0;border-bottom:1px solid #EAEAEA}
.row:last-child{border-bottom:0}
.btn{display:inline-block;background:#0A0A0A;color:#fff;text-decoration:none;padding:11px 18px;border-radius:8px;font-size:13px;font-weight:500;margin-top:8px}
.footer{margin-top:32px;padding-top:24px;border-top:1px solid #EAEAEA;font-size:11px;color:#9CA3AF;text-align:center}
.ref{font-family:ui-monospace,monospace;font-size:11px;color:#6B7280}
`;

function shell(content: string): string {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${STYLES}</style></head><body><div class="wrap"><div class="brand">Caravanstalling</div>${content}<div class="footer">Caravanstalling Spanje · Costa Brava<br/>Reageren? Antwoord direct op deze e-mail.</div></div></body></html>`;
}

function fmtEur(eur: number): string {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(eur);
}

function fmtDate(s: string | null | undefined): string {
  if (!s) return '—';
  return new Date(s).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
}

// ─── Templates ────────────────────────────────────────────

export function paymentReceivedHtml(input: {
  name: string;
  service: string;
  amountEur: number;
  reference: string;
  invoiceNumber?: string | null;
  publicUrl?: string | null;
}): { subject: string; html: string; text: string } {
  const subject = `Betaling ontvangen — ${input.service}`;
  const invoiceBlock = input.invoiceNumber
    ? `<div class="row"><span class="muted">Factuur</span><strong>${input.invoiceNumber}</strong></div>`
    : '';
  const linkBlock = input.publicUrl
    ? `<a class="btn" href="${input.publicUrl}">Factuur bekijken</a>`
    : '';
  const card = `
    <div class="card">
      <h1>Bedankt, ${escapeHtml(input.name)}</h1>
      <p>We hebben je betaling ontvangen. Hieronder staat een overzicht.</p>
      <div class="row"><span class="muted">Dienst</span><strong>${escapeHtml(input.service)}</strong></div>
      <div class="row"><span class="muted">Bedrag</span><strong>${fmtEur(input.amountEur)}</strong></div>
      ${invoiceBlock}
      ${linkBlock}
      <p class="ref">Referentie: ${escapeHtml(input.reference)}</p>
    </div>`;
  const text = `Bedankt ${input.name},\n\nWe hebben je betaling van ${fmtEur(input.amountEur)} ontvangen voor: ${input.service}.${input.invoiceNumber ? `\nFactuur: ${input.invoiceNumber}` : ''}\n\nReferentie: ${input.reference}`;
  return { subject, html: shell(card), text };
}

export function requestReceivedHtml(input: {
  name: string;
  type: 'reparatie' | 'inspectie' | 'service' | 'wachtlijst';
  description?: string;
  preferredDate?: string | null;
  reference?: string;
}): { subject: string; html: string; text: string } {
  const labels: Record<typeof input.type, string> = {
    reparatie: 'Reparatie-aanvraag ontvangen',
    inspectie: 'Inspectie-aanvraag ontvangen',
    service: 'Service-aanvraag ontvangen',
    wachtlijst: 'Op de wachtlijst geplaatst',
  };
  const subject = labels[input.type];
  const dateRow = input.preferredDate
    ? `<div class="row"><span class="muted">Voorkeursdatum</span><strong>${fmtDate(input.preferredDate)}</strong></div>`
    : '';
  const descRow = input.description
    ? `<div class="row"><span class="muted">Omschrijving</span><span>${escapeHtml(input.description).slice(0, 200)}</span></div>`
    : '';
  const refBlock = input.reference
    ? `<p class="ref">Referentie: ${escapeHtml(input.reference)}</p>`
    : '';

  const intros: Record<typeof input.type, string> = {
    reparatie: 'We hebben je reparatie-aanvraag ontvangen. Onze werkplaats neemt binnen één werkdag contact op.',
    inspectie: 'We hebben je inspectie-aanvraag ontvangen. We sturen je een datumvoorstel zodra we de planning hebben bekeken.',
    service: 'We hebben je service-aanvraag ontvangen.',
    wachtlijst: 'Je staat op de wachtlijst voor de gevraagde periode. Zodra er een plek vrijkomt, mailen we je direct.',
  };

  const card = `
    <div class="card">
      <h1>${labels[input.type]}</h1>
      <p>Bedankt, ${escapeHtml(input.name)}. ${intros[input.type]}</p>
      ${descRow}
      ${dateRow}
      ${refBlock}
    </div>`;
  const text = `${labels[input.type]}\n\nBedankt ${input.name}, ${intros[input.type]}${input.reference ? `\n\nReferentie: ${input.reference}` : ''}`;
  return { subject, html: shell(card), text };
}

// Stalling-aanvraag is goedgekeurd: klant mag de caravan brengen.
export function stallingApprovedHtml(input: {
  name: string;
  address: string;
  startDate: string;
  reference?: string;
}): { subject: string; html: string; text: string } {
  const subject = 'Stalling bevestigd — je kunt langskomen';
  const refBlock = input.reference
    ? `<p class="ref">Referentie: ${escapeHtml(input.reference)}</p>`
    : '';
  const card = `
    <div class="card">
      <h1>Goed nieuws, ${escapeHtml(input.name)}</h1>
      <p>Je stalling-aanvraag is bevestigd. Vanaf <strong>${fmtDate(input.startDate)}</strong> kun je je caravan brengen.</p>
      <div class="row"><span class="muted">Adres</span><strong>${escapeHtml(input.address)}</strong></div>
      <div class="row"><span class="muted">Vanaf</span><strong>${fmtDate(input.startDate)}</strong></div>
      <p style="margin-top:24px;">Heb je vragen of wil je een ander moment afspreken? Stuur ons gerust een bericht.</p>
      ${refBlock}
    </div>`;
  const text = `Hi ${input.name},\n\nJe stalling-aanvraag is bevestigd. Vanaf ${fmtDate(input.startDate)} kun je je caravan brengen naar:\n\n${input.address}\n\nHeb je vragen? Stuur ons een bericht.${input.reference ? `\n\nReferentie: ${input.reference}` : ''}`;
  return { subject, html: shell(card), text };
}

// Stalling-aanvraag afgewezen: helaas geen plek.
export function stallingRejectedHtml(input: {
  name: string;
  reference?: string;
}): { subject: string; html: string; text: string } {
  const subject = 'Stalling-aanvraag — helaas geen plek';
  const refBlock = input.reference
    ? `<p class="ref">Referentie: ${escapeHtml(input.reference)}</p>`
    : '';
  const card = `
    <div class="card">
      <h1>Helaas, ${escapeHtml(input.name)}</h1>
      <p>Bedankt voor je stalling-aanvraag. Op dit moment hebben we geen plek meer beschikbaar.</p>
      <p>Wil je toch graag bij ons stallen? Stuur ons een bericht — we houden je op de hoogte zodra er een plek vrijkomt.</p>
      ${refBlock}
    </div>`;
  const text = `Hi ${input.name},\n\nHelaas hebben we op dit moment geen plek meer beschikbaar voor stalling. Stuur ons een bericht als je toch op de wachtlijst wilt.${input.reference ? `\n\nReferentie: ${input.reference}` : ''}`;
  return { subject, html: shell(card), text };
}

// Bevestiging aan klant dat het contact-bericht is ontvangen.
export function contactReceivedHtml(input: {
  name: string;
  message: string;
  reference?: string;
}): { subject: string; html: string; text: string } {
  const subject = 'We hebben je bericht ontvangen';
  const refBlock = input.reference
    ? `<p class="ref">Referentie: ${escapeHtml(input.reference)}</p>`
    : '';
  const card = `
    <div class="card">
      <h1>Bedankt, ${escapeHtml(input.name)}</h1>
      <p>We hebben je bericht ontvangen en sturen je snel een persoonlijke reactie.</p>
      <div class="row"><span class="muted">Jouw bericht</span><span>${escapeHtml(input.message).slice(0, 500)}</span></div>
      ${refBlock}
    </div>`;
  const text = `Bedankt ${input.name},\n\nWe hebben je bericht ontvangen:\n"${input.message.slice(0, 500)}"\n\nWe sturen je snel een persoonlijke reactie.${input.reference ? `\n\nReferentie: ${input.reference}` : ''}`;
  return { subject, html: shell(card), text };
}

// Interne notificatie naar info@-mailbox bij een nieuw contact-bericht.
export function contactNotifyHtml(input: {
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
  reference: string;
}): { subject: string; html: string; text: string } {
  const subject = `Nieuw contact-bericht: ${input.subject || input.name}`;
  const phoneRow = input.phone
    ? `<div class="row"><span class="muted">Telefoon</span><strong>${escapeHtml(input.phone)}</strong></div>`
    : '';
  const subjectRow = input.subject
    ? `<div class="row"><span class="muted">Onderwerp</span><strong>${escapeHtml(input.subject)}</strong></div>`
    : '';
  const card = `
    <div class="card">
      <h1>Nieuw bericht via /contact</h1>
      <div class="row"><span class="muted">Naam</span><strong>${escapeHtml(input.name)}</strong></div>
      <div class="row"><span class="muted">E-mail</span><strong>${escapeHtml(input.email)}</strong></div>
      ${phoneRow}
      ${subjectRow}
      <div class="row"><span class="muted">Bericht</span><span>${escapeHtml(input.message)}</span></div>
      <p class="ref">Referentie: ${escapeHtml(input.reference)}</p>
    </div>`;
  const text = `Nieuw contact-bericht (${input.reference})\n\nNaam: ${input.name}\nE-mail: ${input.email}${input.phone ? `\nTelefoon: ${input.phone}` : ''}${input.subject ? `\nOnderwerp: ${input.subject}` : ''}\n\n${input.message}`;
  return { subject, html: shell(card), text };
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
