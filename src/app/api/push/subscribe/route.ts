import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

// Web Push subscription management
// Stores push subscriptions and sends notifications via Web Push API

async function ensurePushTable() {
  await sql`CREATE TABLE IF NOT EXISTS push_subscriptions (
    id SERIAL PRIMARY KEY,
    user_type TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    endpoint TEXT NOT NULL UNIQUE,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
  )`;
  await sql`CREATE INDEX IF NOT EXISTS idx_push_user ON push_subscriptions(user_type, user_id)`;
}

// POST: Subscribe to push notifications
export async function POST(request: NextRequest) {
  try {
    await ensurePushTable();
    const body = await request.json();
    const { subscription, user_type, user_id } = body;

    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 });
    }

    if (!user_type || !user_id) {
      return NextResponse.json({ error: 'user_type and user_id required' }, { status: 400 });
    }

    await sql`
      INSERT INTO push_subscriptions (user_type, user_id, endpoint, p256dh, auth)
      VALUES (${user_type}, ${Number(user_id)}, ${subscription.endpoint}, ${subscription.keys.p256dh}, ${subscription.keys.auth})
      ON CONFLICT (endpoint) DO UPDATE SET
        user_type = ${user_type},
        user_id = ${Number(user_id)},
        p256dh = ${subscription.keys.p256dh},
        auth = ${subscription.keys.auth}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Push subscribe error:', error);
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}

// DELETE: Unsubscribe from push notifications  
export async function DELETE(request: NextRequest) {
  try {
    await ensurePushTable();
    const body = await request.json();
    const { endpoint } = body;

    if (!endpoint) {
      return NextResponse.json({ error: 'Endpoint required' }, { status: 400 });
    }

    await sql`DELETE FROM push_subscriptions WHERE endpoint = ${endpoint}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Push unsubscribe error:', error);
    return NextResponse.json({ error: 'Failed to unsubscribe' }, { status: 500 });
  }
}
