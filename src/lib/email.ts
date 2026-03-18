// Email service using Resend-compatible API
// Set RESEND_API_KEY in environment variables

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'Caravanstalling Spanje <info@caravanstalling-spanje.com>';
const COMPANY_NAME = 'Caravanstalling Spanje';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set — email not sent:', options.subject);
    return false;
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [options.to],
      subject: options.subject,
      html: options.html,
      reply_to: options.replyTo,
    }),
  });

  return res.ok;
}

// ── Email Templates ──

function layout(content: string): string {
  return `
<!DOCTYPE html>
<html lang="nl">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#FAF9F7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#27272A;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <!-- Header -->
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-flex;align-items:center;gap:8px;">
        <div style="width:36px;height:36px;background:#1C2B3A;border-radius:10px;display:flex;align-items:center;justify-content:center;">
          <span style="color:white;font-weight:900;font-size:13px;">CS</span>
        </div>
        <span style="font-weight:800;font-size:16px;color:#1C2B3A;letter-spacing:-0.5px;">${COMPANY_NAME}</span>
      </div>
    </div>
    <!-- Content -->
    <div style="background:white;border-radius:16px;padding:32px;border:1px solid rgba(0,0,0,0.04);">
      ${content}
    </div>
    <!-- Footer -->
    <div style="text-align:center;margin-top:32px;color:#71717A;font-size:12px;line-height:1.6;">
      <p>Ctra de Palamós, 91, 17110 Sant Climent de Peralta, Girona, Spanje</p>
      <p>Tel: +34 650 036 755 | info@caravanstalling-spanje.com</p>
    </div>
  </div>
</body>
</html>`;
}

export async function sendBookingConfirmation(to: string, data: {
  name: string;
  storageType: string;
  startDate: string;
  location: string;
  monthlyRate: string;
}) {
  return sendEmail({
    to,
    subject: `Boeking bevestigd — ${data.storageType}`,
    html: layout(`
      <h2 style="margin:0 0 8px;font-size:20px;color:#1C2B3A;">Boeking bevestigd! ✓</h2>
      <p style="color:#71717A;margin:0 0 24px;">Beste ${data.name}, uw stallingsplek is gereserveerd.</p>
      <div style="background:#FAF9F7;border-radius:12px;padding:20px;margin-bottom:24px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:8px 0;color:#71717A;font-size:13px;">Stallingtype</td><td style="padding:8px 0;text-align:right;font-weight:600;color:#1C2B3A;font-size:13px;">${data.storageType}</td></tr>
          <tr><td style="padding:8px 0;color:#71717A;font-size:13px;">Startdatum</td><td style="padding:8px 0;text-align:right;font-weight:600;color:#1C2B3A;font-size:13px;">${data.startDate}</td></tr>
          <tr><td style="padding:8px 0;color:#71717A;font-size:13px;">Locatie</td><td style="padding:8px 0;text-align:right;font-weight:600;color:#1C2B3A;font-size:13px;">${data.location}</td></tr>
          <tr style="border-top:1px solid rgba(0,0,0,0.06);"><td style="padding:12px 0 0;color:#1C2B3A;font-weight:700;font-size:13px;">Maandtarief</td><td style="padding:12px 0 0;text-align:right;font-weight:800;color:#C17A3A;font-size:16px;">${data.monthlyRate}</td></tr>
        </table>
      </div>
      <p style="font-size:13px;color:#71717A;line-height:1.6;">U ontvangt binnenkort uw contract en eerste factuur. Bekijk alles in uw <a href="https://caravanstalling-spanje.com/mijn-account" style="color:#C17A3A;text-decoration:none;font-weight:600;">klantportaal</a>.</p>
    `),
  });
}

export async function sendInvoiceEmail(to: string, data: {
  name: string;
  invoiceNumber: string;
  amount: string;
  dueDate: string;
  description: string;
}) {
  return sendEmail({
    to,
    subject: `Factuur ${data.invoiceNumber} — ${data.amount}`,
    html: layout(`
      <h2 style="margin:0 0 8px;font-size:20px;color:#1C2B3A;">Nieuwe factuur</h2>
      <p style="color:#71717A;margin:0 0 24px;">Beste ${data.name}, u heeft een nieuwe factuur ontvangen.</p>
      <div style="background:#FAF9F7;border-radius:12px;padding:20px;margin-bottom:24px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:8px 0;color:#71717A;font-size:13px;">Factuurnummer</td><td style="padding:8px 0;text-align:right;font-weight:600;color:#1C2B3A;font-size:13px;">${data.invoiceNumber}</td></tr>
          <tr><td style="padding:8px 0;color:#71717A;font-size:13px;">Omschrijving</td><td style="padding:8px 0;text-align:right;font-weight:600;color:#1C2B3A;font-size:13px;">${data.description}</td></tr>
          <tr><td style="padding:8px 0;color:#71717A;font-size:13px;">Vervaldatum</td><td style="padding:8px 0;text-align:right;font-weight:600;color:#1C2B3A;font-size:13px;">${data.dueDate}</td></tr>
          <tr style="border-top:1px solid rgba(0,0,0,0.06);"><td style="padding:12px 0 0;color:#1C2B3A;font-weight:700;font-size:13px;">Totaalbedrag</td><td style="padding:12px 0 0;text-align:right;font-weight:800;color:#C17A3A;font-size:16px;">${data.amount}</td></tr>
        </table>
      </div>
      <a href="https://caravanstalling-spanje.com/mijn-account" style="display:block;text-align:center;background:#C17A3A;color:white;padding:14px 24px;border-radius:12px;text-decoration:none;font-weight:700;font-size:14px;">Factuur bekijken & betalen</a>
    `),
  });
}

export async function sendWelcomeEmail(to: string, data: { name: string }) {
  return sendEmail({
    to,
    subject: 'Welkom bij Caravanstalling Spanje!',
    html: layout(`
      <h2 style="margin:0 0 8px;font-size:20px;color:#1C2B3A;">Welkom, ${data.name}! 👋</h2>
      <p style="color:#71717A;margin:0 0 24px;line-height:1.6;">Uw account is aangemaakt. Via uw persoonlijke klantportaal kunt u:</p>
      <ul style="color:#27272A;font-size:13px;line-height:2;padding-left:20px;">
        <li>Uw caravans en plekken bekijken</li>
        <li>Contracten en facturen inzien</li>
        <li>Service aanvragen indienen</li>
        <li>Inspectierapportages ontvangen</li>
      </ul>
      <a href="https://caravanstalling-spanje.com/mijn-account" style="display:inline-block;margin-top:20px;background:#1C2B3A;color:white;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:700;font-size:14px;">Naar mijn account →</a>
    `),
  });
}

export async function sendCaravanReadyNotification(to: string, data: {
  name: string;
  caravanName: string;
  location: string;
}) {
  return sendEmail({
    to,
    subject: `Uw caravan staat klaar! — ${data.caravanName}`,
    html: layout(`
      <h2 style="margin:0 0 8px;font-size:20px;color:#1C2B3A;">Uw caravan staat klaar! 🎉</h2>
      <p style="color:#71717A;margin:0 0 24px;line-height:1.6;">Beste ${data.name}, uw ${data.caravanName} is klaargezet en klaar voor vertrek.</p>
      <div style="background:#FAF9F7;border-radius:12px;padding:20px;margin-bottom:24px;">
        <p style="margin:0 0 4px;font-size:13px;color:#71717A;">Locatie ophalen</p>
        <p style="margin:0;font-size:15px;font-weight:700;color:#1C2B3A;">${data.location}</p>
      </div>
      <p style="font-size:13px;color:#71717A;">Neem contact met ons op als u vragen heeft: +34 650 036 755</p>
    `),
  });
}

export async function sendInspectionReport(to: string, data: {
  name: string;
  caravanName: string;
  date: string;
  passRate: number;
  notes: string;
}) {
  const color = data.passRate === 100 ? '#16A34A' : data.passRate >= 70 ? '#D97706' : '#DC2626';
  return sendEmail({
    to,
    subject: `Inspectierapport — ${data.caravanName}`,
    html: layout(`
      <h2 style="margin:0 0 8px;font-size:20px;color:#1C2B3A;">Inspectie uitgevoerd</h2>
      <p style="color:#71717A;margin:0 0 24px;">Beste ${data.name}, hier is het rapport van de inspectie op ${data.date}.</p>
      <div style="background:#FAF9F7;border-radius:12px;padding:20px;margin-bottom:24px;text-align:center;">
        <p style="margin:0 0 8px;font-size:13px;color:#71717A;">${data.caravanName}</p>
        <p style="margin:0;font-size:36px;font-weight:900;color:${color};">${data.passRate}%</p>
        <p style="margin:4px 0 0;font-size:12px;color:#71717A;">Score</p>
      </div>
      ${data.notes ? `<p style="font-size:13px;color:#71717A;line-height:1.6;"><strong>Opmerkingen:</strong> ${data.notes}</p>` : ''}
    `),
  });
}

export async function sendContactConfirmation(to: string, data: { name: string; subject: string }) {
  return sendEmail({
    to,
    subject: 'Uw bericht is ontvangen — Caravanstalling Spanje',
    html: layout(`
      <h2 style="margin:0 0 8px;font-size:20px;color:#1C2B3A;">Bericht ontvangen ✓</h2>
      <p style="color:#71717A;margin:0 0 24px;line-height:1.6;">Beste ${data.name}, bedankt voor uw bericht${data.subject ? ` over "${data.subject}"` : ''}.</p>
      <p style="font-size:13px;color:#71717A;line-height:1.6;">Wij nemen zo spoedig mogelijk contact met u op, meestal <strong>binnen 1 werkdag</strong>.</p>
      <div style="background:#FAF9F7;border-radius:12px;padding:20px;margin:24px 0;">
        <p style="margin:0 0 4px;font-size:13px;color:#71717A;">Tussentijds bereikbaar?</p>
        <p style="margin:0;font-size:14px;color:#1C2B3A;">Bel ons op <a href="tel:+34650036755" style="color:#C17A3A;text-decoration:none;font-weight:600;">+34 650 036 755</a> (ma-vr 09:30-16:30)</p>
      </div>
      <p style="font-size:12px;color:#A1A1AA;">Dit is een automatische bevestiging. U hoeft niet te reageren op deze e-mail.</p>
    `),
  });
}

export async function sendContactNotificationToAdmin(data: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}) {
  const adminEmail = process.env.ADMIN_EMAIL || 'info@caravanstalling-spanje.com';
  return sendEmail({
    to: adminEmail,
    subject: `Nieuw contactbericht: ${data.subject || 'Algemeen'} — ${data.name}`,
    replyTo: data.email,
    html: layout(`
      <h2 style="margin:0 0 8px;font-size:20px;color:#1C2B3A;">Nieuw contactbericht</h2>
      <div style="background:#FAF9F7;border-radius:12px;padding:20px;margin-bottom:24px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:8px 0;color:#71717A;font-size:13px;">Naam</td><td style="padding:8px 0;text-align:right;font-weight:600;color:#1C2B3A;font-size:13px;">${data.name}</td></tr>
          <tr><td style="padding:8px 0;color:#71717A;font-size:13px;">E-mail</td><td style="padding:8px 0;text-align:right;font-weight:600;color:#1C2B3A;font-size:13px;"><a href="mailto:${data.email}" style="color:#C17A3A;">${data.email}</a></td></tr>
          ${data.phone ? `<tr><td style="padding:8px 0;color:#71717A;font-size:13px;">Telefoon</td><td style="padding:8px 0;text-align:right;font-weight:600;color:#1C2B3A;font-size:13px;"><a href="tel:${data.phone}" style="color:#C17A3A;">${data.phone}</a></td></tr>` : ''}
          <tr><td style="padding:8px 0;color:#71717A;font-size:13px;">Onderwerp</td><td style="padding:8px 0;text-align:right;font-weight:600;color:#1C2B3A;font-size:13px;">${data.subject || 'Algemeen'}</td></tr>
        </table>
      </div>
      <div style="background:#FAFAFA;border-radius:12px;padding:20px;border:1px solid rgba(0,0,0,0.04);">
        <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#71717A;text-transform:uppercase;letter-spacing:0.5px;">Bericht</p>
        <p style="margin:0;font-size:14px;color:#27272A;line-height:1.7;white-space:pre-wrap;">${data.message}</p>
      </div>
      <a href="https://caravanstalling-spanje.com/admin/berichten" style="display:block;text-align:center;background:#C17A3A;color:white;padding:14px 24px;border-radius:12px;text-decoration:none;font-weight:700;font-size:14px;margin-top:24px;">Beantwoorden in admin →</a>
    `),
  });
}
