import { Resend } from 'resend';
import { log } from '@/lib/log';

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

/** Extract domain for logging zonder PII te lekken. "foo@bar.com" → "bar.com". */
function domainOf(email: string): string {
  const at = email.lastIndexOf('@');
  return at === -1 ? 'unknown' : email.slice(at + 1).toLowerCase();
}

export async function sendMail(params: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<{ ok: boolean; id?: string; error?: string }> {
  const r = client();
  if (!r) {
    log.warn('email_skip_no_provider', { recipient_domain: domainOf(params.to), subject: params.subject });
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
      log.error('email_send_failed', new Error(res.error.message), { recipient_domain: domainOf(params.to), subject: params.subject });
      return { ok: false, error: res.error.message };
    }
    log.info('email_sent', { recipient_domain: domainOf(params.to), subject: params.subject, message_id: res.data?.id });
    return { ok: true, id: res.data?.id };
  } catch (err) {
    log.error('email_send_threw', err, { recipient_domain: domainOf(params.to), subject: params.subject });
    const msg = err instanceof Error ? err.message : 'send failed';
    return { ok: false, error: msg };
  }
}

// ─── Shared layout ────────────────────────────────────────

// E-mail-clients (Outlook, Gmail) hebben beperkte CSS-support; we
// houden styles inline en simpel. Navy hero matcht de homepage zodat
// klanten de stijl direct herkennen.
const STYLES = `
body{margin:0;background:#F4F6FA;color:#0A1929;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;-webkit-font-smoothing:antialiased}
.wrap{max-width:560px;margin:0 auto;padding:0}
.hero{background:linear-gradient(160deg,#142F4D 0%,#0A1929 100%);padding:32px 24px 28px;text-align:center;color:#F1F5F9}
.hero-eyebrow{font-size:10px;letter-spacing:.25em;text-transform:uppercase;color:rgba(241,245,249,.55);margin-bottom:8px}
.hero h1{font-size:22px;line-height:1.25;margin:0;font-weight:600;letter-spacing:-.014em;color:#FFFFFF}
.hero p{font-size:14px;line-height:1.55;margin:10px 0 0;color:rgba(241,245,249,.7)}
.body{padding:28px 24px 8px;background:#FFFFFF;border-left:1px solid #EAEAEA;border-right:1px solid #EAEAEA}
.body p{font-size:14px;line-height:1.6;margin:0 0 14px;color:#0A1929}
h1{font-size:20px;line-height:1.3;margin:0 0 12px;font-weight:600;letter-spacing:-.012em;color:#0A1929}
.muted{color:#6B7280}
.summary{background:#F4F6FA;border-radius:12px;padding:14px 16px;margin:8px 0 18px}
.row{display:flex;justify-content:space-between;font-size:13px;padding:7px 0;border-bottom:1px solid #E5E7EB}
.row:last-child{border-bottom:0}
.btn{display:inline-block;background:#142F4D;color:#FFFFFF !important;text-decoration:none;padding:11px 18px;border-radius:10px;font-size:13px;font-weight:500;margin-top:6px}
.next{background:#FEF7E5;border-left:3px solid #F4B942;padding:14px 16px;border-radius:8px;margin:14px 0 4px;font-size:13px;line-height:1.55;color:#0A1929}
.next strong{color:#0A1929}
.footer{padding:20px 24px 28px;background:#FFFFFF;border:1px solid #EAEAEA;border-top:0;border-radius:0 0 16px 16px;font-size:11px;color:#9CA3AF;text-align:center;line-height:1.6}
.footer a{color:#142F4D;text-decoration:none}
.body-top{border-top-left-radius:0;border-top-right-radius:0}
.ref{font-family:ui-monospace,monospace;font-size:11px;color:#6B7280;margin-top:14px;letter-spacing:.04em}
`;

// Absolute URL voor het logo in mails — Outlook/Gmail kunnen geen relatieve
// paden laden. Default is productie-domein; APP_URL kan 'm overriden voor
// staging.
function logoUrl(): string {
  const base = (process.env.APP_URL || 'https://caravanstalling-spanje.com').replace(/\/$/, '');
  return `${base}/images/logo.png`;
}

function shell(content: string, opts?: { eyebrow?: string; heading?: string; subline?: string }): string {
  const eyebrow = opts?.eyebrow || 'Caravanstalling Spanje';
  const heading = opts?.heading || 'Bedankt voor je bestelling';
  const subline = opts?.subline || 'We gaan voor je aan de slag.';
  const logo = `<img src="${logoUrl()}" alt="Caravanstalling Spanje" width="180" style="display:block;margin:0 auto 14px;max-width:180px;height:auto" />`;
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${STYLES}</style></head><body><div class="wrap"><div class="hero" style="border-radius:16px 16px 0 0">${logo}<div class="hero-eyebrow">${escapeHtml(eyebrow)}</div><h1>${escapeHtml(heading)}</h1><p>${escapeHtml(subline)}</p></div><div class="body body-top">${content}</div><div class="footer">Caravanstalling Spanje · Costa Brava<br/>Vragen? <a href="https://caravanstalling-spanje.com/contact">Stuur ons een bericht →</a></div></div></body></html>`;
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
  // invoiceNumber/publicUrl worden door de webhook nog meegegeven (voor admin
  // logging) maar bewust NIET in de klantmail getoond. Pro forma's zijn
  // intern voor onze boekhouding.
  invoiceNumber?: string | null;
  publicUrl?: string | null;
}): { subject: string; html: string; text: string } {
  void input.invoiceNumber; void input.publicUrl;
  const subject = `Bedankt voor je bestelling — ${input.service}`;

  // Vriendelijke kind-specifieke vervolgtekst, automatisch gekozen op
  // basis van wat er in de service-omschrijving staat.
  const lower = input.service.toLowerCase();
  let nextStep = 'We sturen je binnen 1 werkdag een bevestiging met de planning.';
  if (lower.includes('airco')) {
    nextStep = 'Onze monteur bezorgt en installeert je airco op de afgesproken datum. Je hoort van ons als hij klaar staat.';
  } else if (lower.includes('koelkast')) {
    nextStep = 'Onze monteur bezorgt je koelkast op je staanplaats. Je hoort van ons als hij klaar staat.';
  } else if (lower.includes('transport')) {
    nextStep = 'We zorgen dat je caravan op de bestemming staat. Je hoort van ons zodra het is gepland of uitgevoerd.';
  } else if (lower.includes('stalling')) {
    nextStep = 'We bevestigen je plek en sturen je de aanvullende info zodat je kunt langskomen.';
  }

  const card = `
    <p>Hi ${escapeHtml(input.name)}, fijn dat je bij ons hebt geboekt!</p>
    <p>We hebben je betaling ontvangen en zijn al voor je aan de slag.</p>
    <div class="summary">
      <div class="row"><span class="muted">Dienst</span><strong>${escapeHtml(input.service)}</strong></div>
      <div class="row"><span class="muted">Bedrag</span><strong>${fmtEur(input.amountEur)}</strong></div>
    </div>
    <div class="next"><strong>Wat gebeurt er nu?</strong><br/>${escapeHtml(nextStep)}</div>
    <p class="ref">Referentie: ${escapeHtml(input.reference)}</p>
  `;
  const html = shell(card, {
    eyebrow: 'Caravanstalling Spanje',
    heading: 'Bedankt voor je bestelling!',
    subline: 'We hebben je betaling ontvangen — we gaan voor je aan de slag.',
  });
  const text = `Bedankt ${input.name},\n\nWe hebben je betaling van ${fmtEur(input.amountEur)} ontvangen voor: ${input.service}.\n\n${nextStep}\n\nReferentie: ${input.reference}\n\nVragen? https://caravanstalling-spanje.com/contact`;
  return { subject, html, text };
}

// Welkomst-mail met eenmalig wachtwoord — verstuurd na de eerste
// succesvolle Stripe-betaling. Klant logt in op /account, wordt direct
// gedwongen het wachtwoord te wijzigen, en kan daarna z'n facturen
// bekijken en gegevens beheren.
export function welcomePortalHtml(input: {
  name: string;
  email: string;
  tempPassword: string;
  loginUrl: string;
}): { subject: string; html: string; text: string } {
  const subject = 'Je klantportaal staat voor je klaar';
  const card = `
    <p>Hi ${escapeHtml(input.name)},</p>
    <p>Je hebt nu een persoonlijk klantportaal bij Caravanstalling Spanje. Daar zie je al je facturen en kun je je gegevens bijwerken of een nieuwe boeking starten zonder opnieuw alles in te vullen.</p>
    <div class="summary">
      <div class="row"><span class="muted">E-mail</span><strong>${escapeHtml(input.email)}</strong></div>
      <div class="row"><span class="muted">Eenmalig wachtwoord</span><strong style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.04em">${escapeHtml(input.tempPassword)}</strong></div>
    </div>
    <p style="text-align:center;margin:18px 0 8px"><a class="btn" href="${input.loginUrl}">Inloggen op je portaal</a></p>
    <div class="next"><strong>Wat moet je doen?</strong><br/>Je wordt bij eerste login direct gevraagd om een eigen wachtwoord te kiezen. Bewaar dit eenmalige wachtwoord daarna niet meer.</div>
    <p class="muted" style="font-size:12px">Geen toegang nodig? Dan kun je deze mail negeren — je bestelling is gewoon ontvangen en wordt verwerkt.</p>
  `;
  const html = shell(card, {
    eyebrow: 'Caravanstalling Spanje',
    heading: 'Welkom in je klantportaal',
    subline: 'Eenmalig wachtwoord — wijzig die bij eerste login.',
  });
  const text = `Hi ${input.name},\n\nJe klantportaal staat voor je klaar. Inloggen:\n${input.loginUrl}\n\nE-mail: ${input.email}\nEenmalig wachtwoord: ${input.tempPassword}\n\nJe wordt bij eerste login gevraagd een eigen wachtwoord te kiezen.`;
  return { subject, html, text };
}

// Welkomstmail met set-password-link (geen temp-password). Klant volgt de
// link, kiest zelf een wachtwoord — token verloopt na 14 dagen.
export function welcomeSetupHtml(input: {
  name: string;
  email: string;
  setupUrl: string;
  expiresInDays: number;
}): { subject: string; html: string; text: string } {
  const subject = 'Stel je klantportaal-wachtwoord in';
  const card = `
    <p>Hi ${escapeHtml(input.name)},</p>
    <p>We hebben een persoonlijk klantportaal voor je klaargezet bij Caravanstalling Spanje. Daar zie je je caravan, plek, foto's van onze monteurs, service-historie en facturen — en kun je makkelijk een aanvraag indienen.</p>
    <div class="summary">
      <div class="row"><span class="muted">Inloggen met</span><strong>${escapeHtml(input.email)}</strong></div>
    </div>
    <p style="text-align:center;margin:18px 0 8px"><a class="btn" href="${input.setupUrl}">Kies je wachtwoord</a></p>
    <div class="next"><strong>Wat doe je nu?</strong><br/>Klik op de knop om zelf een wachtwoord te kiezen. De link werkt ${input.expiresInDays} dagen — daarna stuur je ons een berichtje en sturen we 'm opnieuw.</div>
    <p class="muted" style="font-size:12px">Geen interesse? Dan kun je deze mail negeren — je gegevens blijven gewoon bij ons.</p>
  `;
  const html = shell(card, {
    eyebrow: 'Caravanstalling Spanje',
    heading: 'Welkom — kies je wachtwoord',
    subline: 'Eenmalige link, persoonlijk voor jou.',
  });
  const text = `Hi ${input.name},\n\nWe hebben een klantportaal voor je klaargezet. Volg deze link om zelf je wachtwoord in te stellen (geldig ${input.expiresInDays} dagen):\n${input.setupUrl}\n\nInloggen doe je daarna met: ${input.email}`;
  return { subject, html, text };
}

// Mail die admin handmatig verstuurt vanuit /admin/koelkasten naar klanten
// die we eerder zelf in het systeem zetten — voorheen kregen die nooit
// een betaal-uitnodiging. Bevat een grote "Nu betalen" knop met de
// Stripe Checkout URL en samenvattende details.
export function paymentLinkHtml(input: {
  name: string;
  description: string;
  amountEur: number;
  checkoutUrl: string;
  invoiceNumber?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  camping?: string | null;
}): { subject: string; html: string; text: string } {
  const subject = `Je betaallink — ${input.description}`;
  const periodLine = input.startDate && input.endDate
    ? `${fmtDate(input.startDate)} → ${fmtDate(input.endDate)}`
    : (input.startDate ? `vanaf ${fmtDate(input.startDate)}` : null);

  const detailRows = [
    `<div class="row"><span class="muted">Wat</span><strong>${escapeHtml(input.description)}</strong></div>`,
    input.camping ? `<div class="row"><span class="muted">Locatie</span><strong>${escapeHtml(input.camping)}</strong></div>` : '',
    periodLine ? `<div class="row"><span class="muted">Periode</span><strong>${escapeHtml(periodLine)}</strong></div>` : '',
    `<div class="row"><span class="muted">Bedrag</span><strong>${fmtEur(input.amountEur)}</strong></div>`,
  ].filter(Boolean).join('');

  const card = `
    <p>Hi ${escapeHtml(input.name)},</p>
    <p>We hebben je in ons systeem staan voor onderstaande dienst, maar je hebt nog geen betaallink van ons gehad. Bij deze — je kunt direct online afrekenen via de knop hieronder. Het kost je maar een minuutje.</p>
    <div class="summary">${detailRows}</div>
    <p style="text-align:center;margin:18px 0 6px">
      <a class="btn" href="${input.checkoutUrl}" style="font-size:15px;padding:14px 26px">Nu veilig betalen →</a>
    </p>
    <p style="font-size:12px;color:#6B7280;text-align:center;margin:0 0 14px">
      Werkt de knop niet? Plak deze link in je browser:<br/>
      <a href="${input.checkoutUrl}" style="color:#142F4D;word-break:break-all">${input.checkoutUrl}</a>
    </p>
    <div class="next"><strong>Veilig betalen via iDEAL, kaart of Bancontact.</strong><br/>Na de betaling sturen we je automatisch een bevestiging. Heb je in de tussentijd een vraag? Mail ons gewoon op <a href="mailto:info@caravanstalling-spanje.com" style="color:#142F4D">info@caravanstalling-spanje.com</a>.</div>
    ${input.invoiceNumber ? `<p class="ref">Referentie: ${escapeHtml(input.invoiceNumber)}</p>` : ''}
  `;
  const html = shell(card, {
    eyebrow: 'Caravanstalling Spanje',
    heading: 'Je betaallink staat klaar',
    subline: `${fmtEur(input.amountEur)} · ${input.description}`,
  });
  const text = `Hi ${input.name},\n\nHier is je betaallink voor: ${input.description}\nBedrag: ${fmtEur(input.amountEur)}\n${periodLine ? `Periode: ${periodLine}\n` : ''}${input.camping ? `Locatie: ${input.camping}\n` : ''}\nBetaal hier: ${input.checkoutUrl}\n\nVragen? info@caravanstalling-spanje.com`;
  return { subject, html, text };
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

// Wachtwoord-vergeten mail. Hergebruikt dezelfde token-flow als welkomst:
// klant landt op /account/welkom?token=… en kiest een nieuw wachtwoord.
export function passwordResetHtml(input: {
  name: string;
  email: string;
  setupUrl: string;
  expiresInDays: number;
}): { subject: string; html: string; text: string } {
  const subject = 'Stel een nieuw wachtwoord in voor je portaal';
  const card = `
    <p>Hi ${escapeHtml(input.name)},</p>
    <p>Je hebt een nieuw wachtwoord aangevraagd voor je klantportaal bij Caravanstalling Spanje. Klik op de knop hieronder om er een te kiezen.</p>
    <div class="summary">
      <div class="row"><span class="muted">Voor account</span><strong>${escapeHtml(input.email)}</strong></div>
    </div>
    <p style="text-align:center;margin:18px 0 8px"><a class="btn" href="${input.setupUrl}">Kies een nieuw wachtwoord</a></p>
    <div class="next"><strong>Niet aangevraagd?</strong><br/>Negeer deze mail dan — je huidige wachtwoord blijft werken. De link werkt ${input.expiresInDays} dagen.</div>
  `;
  const html = shell(card, {
    eyebrow: 'Caravanstalling Spanje',
    heading: 'Wachtwoord opnieuw instellen',
    subline: 'Eenmalige link, persoonlijk voor jou.',
  });
  const text = `Hi ${input.name},\n\nJe hebt een nieuw wachtwoord aangevraagd. Volg deze link (geldig ${input.expiresInDays} dagen):\n${input.setupUrl}\n\nNiet aangevraagd? Negeer deze mail.`;
  return { subject, html, text };
}

// Admin-notify mail bij nieuwe klant-service-aanvraag uit het portaal.
// Klant heeft al een referentie + status, dit is voor jou (Laurens) zodat
// je de aanvraag direct in het admin-paneel kunt oppakken.
export function serviceRequestNotifyHtml(input: {
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  kind: string;
  title: string;
  description: string | null;
  preferredDate: string | null;
  adminUrl: string;
}): { subject: string; html: string; text: string } {
  const kindLabels: Record<string, string> = {
    cleaning: 'Schoonmaak',
    service: 'Onderhoud',
    inspection: 'Inspectie',
    repair: 'Reparatie',
    transport: 'Transport',
    other: 'Overig',
  };
  const kindLabel = kindLabels[input.kind] || input.kind;
  const subject = `🔧 Service-aanvraag van ${input.customerName}: ${input.title}`;
  const phoneRow = input.customerPhone
    ? `<div class="row"><span class="muted">Telefoon</span><strong>${escapeHtml(input.customerPhone)}</strong></div>` : '';
  const emailRow = input.customerEmail
    ? `<div class="row"><span class="muted">E-mail</span><strong>${escapeHtml(input.customerEmail)}</strong></div>` : '';
  const dateRow = input.preferredDate
    ? `<div class="row"><span class="muted">Voorkeursdatum</span><strong>${escapeHtml(input.preferredDate)}</strong></div>` : '';
  const descBlock = input.description
    ? `<div class="row" style="display:block"><span class="muted" style="display:block;margin-bottom:6px">Toelichting</span><span style="white-space:pre-wrap">${escapeHtml(input.description)}</span></div>` : '';
  const card = `
    <p>Een klant heeft via het portaal een service-aanvraag ingediend.</p>
    <div class="summary">
      <div class="row"><span class="muted">Klant</span><strong>${escapeHtml(input.customerName)}</strong></div>
      ${emailRow}
      ${phoneRow}
      <div class="row"><span class="muted">Type</span><strong>${escapeHtml(kindLabel)}</strong></div>
      <div class="row"><span class="muted">Titel</span><strong>${escapeHtml(input.title)}</strong></div>
      ${dateRow}
      ${descBlock}
    </div>
    <p style="text-align:center;margin:18px 0 8px"><a class="btn" href="${input.adminUrl}">Open in admin</a></p>
  `;
  const html = shell(card, { eyebrow: 'Caravanstalling Spanje', heading: 'Nieuwe service-aanvraag', subline: 'Vanuit het klantportaal.' });
  const text = `Nieuwe service-aanvraag\n\nKlant: ${input.customerName}${input.customerEmail ? ` (${input.customerEmail})` : ''}${input.customerPhone ? `\nTelefoon: ${input.customerPhone}` : ''}\nType: ${kindLabel}\nTitel: ${input.title}${input.preferredDate ? `\nVoorkeursdatum: ${input.preferredDate}` : ''}${input.description ? `\n\n${input.description}` : ''}\n\nOpen: ${input.adminUrl}`;
  return { subject, html, text };
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
