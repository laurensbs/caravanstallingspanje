import { NextResponse } from 'next/server';

// Locatie-weer voor de topbar. Gebruikt Open-Meteo (gratis, geen API-key).
// Cache 30 min — temperatuur verandert niet snel genoeg om elke pageload te
// hammeren. Faalt deze fetch dan returnt de route null en verbergt de UI
// 'm gewoon — geen storingsrood scherm.

const LAT = 41.961;
const LNG = 3.105;
const WEATHER_URL =
  `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LNG}&current=temperature_2m,weather_code&timezone=Europe%2FMadrid`;

export const revalidate = 1800; // 30 min ISR

export async function GET() {
  try {
    const res = await fetch(WEATHER_URL, { next: { revalidate: 1800 } });
    if (!res.ok) return NextResponse.json({ ok: false }, { status: 502 });
    const data = await res.json() as {
      current?: { temperature_2m?: number; weather_code?: number };
    };
    const temp = data.current?.temperature_2m;
    const code = data.current?.weather_code;
    if (typeof temp !== 'number' || typeof code !== 'number') {
      return NextResponse.json({ ok: false }, { status: 502 });
    }
    return NextResponse.json({
      ok: true,
      temp: Math.round(temp),
      code,
    });
  } catch (err) {
    console.warn('[weather] fetch failed:', err);
    return NextResponse.json({ ok: false }, { status: 502 });
  }
}
