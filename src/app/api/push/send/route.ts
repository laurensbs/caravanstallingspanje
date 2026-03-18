import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import crypto from 'crypto';

// Send push notification to specific users
// Uses raw Web Push protocol (no external dependencies)

interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}

async function sendWebPush(endpoint: string, p256dh: string, auth: string, payload: PushPayload) {
  const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
  const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:info@caravanstalling-spanje.com';

  if (!vapidPublicKey || !vapidPrivateKey) {
    console.warn('VAPID keys not configured');
    return false;
  }

  try {
    // Create JWT for VAPID
    const url = new URL(endpoint);
    const audience = `${url.protocol}//${url.host}`;
    const expiration = Math.floor(Date.now() / 1000) + 12 * 3600;

    const header = Buffer.from(JSON.stringify({ typ: 'JWT', alg: 'ES256' })).toString('base64url');
    const payload64 = Buffer.from(JSON.stringify({ aud: audience, exp: expiration, sub: vapidSubject })).toString('base64url');
    
    const signingInput = `${header}.${payload64}`;
    const key = crypto.createPrivateKey({
      key: Buffer.from(vapidPrivateKey, 'base64url'),
      format: 'der',
      type: 'pkcs8',
    });
    
    const sign = crypto.createSign('SHA256');
    sign.update(signingInput);
    const signature = sign.sign(key, 'base64url');
    
    const jwt = `${signingInput}.${signature}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `vapid t=${jwt}, k=${vapidPublicKey}`,
        'TTL': '86400',
      },
      body: JSON.stringify(payload),
    });

    return response.ok || response.status === 201;
  } catch (error) {
    console.error('Web push send error:', error);
    return false;
  }
}

// POST: Send push notification to users
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_type, user_id, title, message, url, tag } = body;

    if (!title || !message) {
      return NextResponse.json({ error: 'title and message required' }, { status: 400 });
    }

    let subs;
    if (user_id) {
      subs = await sql`SELECT * FROM push_subscriptions WHERE user_type = ${user_type} AND user_id = ${Number(user_id)}`;
    } else if (user_type) {
      subs = await sql`SELECT * FROM push_subscriptions WHERE user_type = ${user_type}`;
    } else {
      subs = await sql`SELECT * FROM push_subscriptions`;
    }

    const payload: PushPayload = { title, body: message, url, tag };
    let sent = 0;
    let failed = 0;

    for (const sub of subs) {
      const success = await sendWebPush(sub.endpoint, sub.p256dh, sub.auth, payload);
      if (success) sent++;
      else {
        failed++;
        // Remove invalid subscriptions
        if (!success) {
          await sql`DELETE FROM push_subscriptions WHERE id = ${sub.id}`;
        }
      }
    }

    return NextResponse.json({ sent, failed, total: subs.length });
  } catch (error) {
    console.error('Push send error:', error);
    return NextResponse.json({ error: 'Failed to send push' }, { status: 500 });
  }
}
