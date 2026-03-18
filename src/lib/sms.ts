import { sql } from './db';

// Twilio SMS/WhatsApp Service
// Requires: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER env vars

const TWILIO_API_URL = 'https://api.twilio.com/2010-04-01/Accounts';

interface SMSOptions {
  to: string;
  message: string;
  channel?: 'sms' | 'whatsapp';
}

async function sendTwilioMessage({ to, message, channel = 'sms' }: SMSOptions): Promise<{ success: boolean; sid?: string; error?: string }> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    console.warn('Twilio credentials not configured, skipping SMS');
    return { success: false, error: 'Twilio not configured' };
  }

  const fromAddr = channel === 'whatsapp' ? `whatsapp:${fromNumber}` : fromNumber;
  const toAddr = channel === 'whatsapp' ? `whatsapp:${to}` : to;

  try {
    const response = await fetch(
      `${TWILIO_API_URL}/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: toAddr,
          From: fromAddr,
          Body: message,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Twilio error:', data);
      return { success: false, error: data.message || 'Twilio API error' };
    }

    return { success: true, sid: data.sid };
  } catch (error) {
    console.error('SMS send error:', error);
    return { success: false, error: 'Failed to send message' };
  }
}

// Format phone number to E.164 (assumes European numbers if no country code)
function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  if (cleaned.startsWith('+')) return cleaned;
  if (cleaned.startsWith('00')) return '+' + cleaned.slice(2);
  if (cleaned.startsWith('06')) return '+31' + cleaned.slice(1); // Dutch mobile
  if (cleaned.startsWith('6')) return '+31' + cleaned; // Spanish mobile
  return '+' + cleaned;
}

// ── Pre-built notification templates ──

export async function sendBookingSMS(phone: string, customerName: string, contractId: string) {
  const formattedPhone = formatPhoneNumber(phone);
  return sendTwilioMessage({
    to: formattedPhone,
    message: `Hallo ${customerName}, uw reservering ${contractId} is bevestigd! U ontvangt een e-mail met alle details. - Caravan Stalling Spanje`,
  });
}

export async function sendCaravanReadySMS(phone: string, customerName: string, location: string) {
  const formattedPhone = formatPhoneNumber(phone);
  return sendTwilioMessage({
    to: formattedPhone,
    message: `Hallo ${customerName}, uw caravan staat klaar op ${location}! Neem uw ID en contractnummer mee. - Caravan Stalling Spanje`,
  });
}

export async function sendInvoiceReminderSMS(phone: string, customerName: string, invoiceId: string, amount: string, dueDate: string) {
  const formattedPhone = formatPhoneNumber(phone);
  return sendTwilioMessage({
    to: formattedPhone,
    message: `Hallo ${customerName}, factuur ${invoiceId} (€${amount}) vervalt op ${dueDate}. Betaal via uw account op caravanstalling-spanje.com - Caravan Stalling Spanje`,
  });
}

export async function sendDocumentExpirySMS(phone: string, customerName: string, documentType: string, expiryDate: string) {
  const formattedPhone = formatPhoneNumber(phone);
  return sendTwilioMessage({
    to: formattedPhone,
    message: `Hallo ${customerName}, uw ${documentType} verloopt op ${expiryDate}. Upload een nieuw document via uw account. - Caravan Stalling Spanje`,
  });
}

export async function sendTransportUpdateSMS(phone: string, customerName: string, status: string) {
  const formattedPhone = formatPhoneNumber(phone);
  const statusMessages: Record<string, string> = {
    picked_up: 'Uw caravan is opgehaald en onderweg.',
    in_transit: 'Uw caravan is onderweg naar de bestemming.',
    delivered: 'Uw caravan is afgeleverd!',
  };
  const statusText = statusMessages[status] || `Status update: ${status}`;
  return sendTwilioMessage({
    to: formattedPhone,
    message: `Hallo ${customerName}, ${statusText} - Caravan Stalling Spanje`,
  });
}

export async function sendWhatsAppMessage(phone: string, message: string) {
  const formattedPhone = formatPhoneNumber(phone);
  return sendTwilioMessage({
    to: formattedPhone,
    message,
    channel: 'whatsapp',
  });
}

// ── Bulk SMS for admin ──

export async function sendBulkSMS(phones: string[], message: string): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;
  
  for (const phone of phones) {
    const result = await sendTwilioMessage({
      to: formatPhoneNumber(phone),
      message,
    });
    if (result.success) sent++;
    else failed++;
    // Rate limit: 1 message per 100ms
    await new Promise(r => setTimeout(r, 100));
  }
  
  return { sent, failed };
}

// ── Auto-check for expiring documents and send reminders ──

export async function checkAndNotifyExpiringDocuments() {
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  const dateStr = thirtyDaysFromNow.toISOString().split('T')[0];

  // Check APK expiry
  const expiringAPK = await sql`
    SELECT c.id as caravan_id, c.apk_expiry, cu.name, cu.phone, cu.id as customer_id
    FROM caravans c
    JOIN customers cu ON c.customer_id = cu.id
    WHERE c.apk_expiry IS NOT NULL 
    AND c.apk_expiry <= ${dateStr}
    AND c.apk_expiry > CURRENT_DATE
  `;

  for (const row of expiringAPK) {
    if (row.phone) {
      await sendDocumentExpirySMS(row.phone, row.name, 'APK keuring', row.apk_expiry);
    }
    // Also create in-app notification
    await sql`
      INSERT INTO notifications (user_type, user_id, title, message)
      VALUES ('customer', ${row.customer_id}, 'APK verloopt binnenkort', 
              ${'Uw APK keuring verloopt op ' + row.apk_expiry + '. Upload een nieuw APK rapport.'})
    `;
  }

  // Check insurance expiry
  const expiringInsurance = await sql`
    SELECT c.id as caravan_id, c.insurance_expiry, cu.name, cu.phone, cu.id as customer_id
    FROM caravans c
    JOIN customers cu ON c.customer_id = cu.id
    WHERE c.insurance_expiry IS NOT NULL 
    AND c.insurance_expiry <= ${dateStr}
    AND c.insurance_expiry > CURRENT_DATE
  `;

  for (const row of expiringInsurance) {
    if (row.phone) {
      await sendDocumentExpirySMS(row.phone, row.name, 'verzekering', row.insurance_expiry);
    }
    await sql`
      INSERT INTO notifications (user_type, user_id, title, message)
      VALUES ('customer', ${row.customer_id}, 'Verzekering verloopt binnenkort',
              ${'Uw verzekering verloopt op ' + row.insurance_expiry + '. Upload een nieuw verzekeringsbewijs.'})
    `;
  }

  return {
    apkReminders: expiringAPK.length,
    insuranceReminders: expiringInsurance.length,
  };
}
