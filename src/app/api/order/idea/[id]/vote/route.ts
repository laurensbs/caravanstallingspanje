import { NextRequest, NextResponse } from 'next/server';
import { voteOnIdea, logActivity } from '@/lib/db';

// Anonieme stem op een idee. Geen authenticatie — bewust laagdrempelig.
// Eén stem per cookie, om botte spam tegen te gaan zetten we een
// HttpOnly-cookie zodat dezelfde browser niet eindeloos kan klikken.
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const direction = body.direction === 'down' ? 'down' : 'up';
  const idNum = Number(id);
  if (!Number.isFinite(idNum) || idNum <= 0) {
    return NextResponse.json({ error: 'invalid id' }, { status: 400 });
  }

  const cookieKey = `idea_voted_${idNum}`;
  if (req.cookies.get(cookieKey)) {
    return NextResponse.json({ error: 'al gestemd', alreadyVoted: true }, { status: 409 });
  }

  await voteOnIdea(idNum, direction);
  await logActivity({
    action: `Idee stem: ${direction === 'up' ? '👍' : '👎'}`,
    entityType: 'idea',
    entityId: id,
  }).catch(() => {});

  const res = NextResponse.json({ success: true, direction });
  // 90 dagen, zelfde browser-sessie kan niet opnieuw stemmen.
  res.cookies.set(cookieKey, direction, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 90,
    path: '/',
  });
  return res;
}
