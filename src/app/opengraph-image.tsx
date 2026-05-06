import { ImageResponse } from 'next/og';

// Globale OG-image — wordt gebruikt voor sociale shares zonder eigen
// pagina-specifieke override. Per route mag een eigen `opengraph-image.tsx`
// staan om de standaard te overrulen.
//
// Geen externe fonts (zou een fetch in build-time vereisen) — de system-stack
// rendert prima en houdt de build snel.

export const runtime = 'edge';
export const alt = 'Caravanstalling Spanje — Stalling, transport, reparatie & service';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 80,
          background:
            'radial-gradient(120% 80% at 50% 0%, #142F4D 0%, #0A1929 60%, #050D18 100%)',
          color: '#F1F5F9',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* warme glow */}
        <div
          style={{
            position: 'absolute',
            top: -120,
            right: -160,
            width: 520,
            height: 520,
            borderRadius: '50%',
            background:
              'radial-gradient(50% 50% at 50% 50%, rgba(255,180,80,0.22) 0%, transparent 70%)',
            display: 'flex',
          }}
        />

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '6px 14px',
              borderRadius: 999,
              background: 'rgba(255,180,80,0.12)',
              border: '1px solid rgba(255,180,80,0.25)',
              color: 'rgba(255,210,140,0.95)',
              fontSize: 18,
              fontWeight: 500,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              alignSelf: 'flex-start',
            }}
          >
            Costa Brava · Sant Climent de Peralta
          </div>
          <div
            style={{
              fontSize: 80,
              fontWeight: 600,
              lineHeight: 1.05,
              marginTop: 28,
              letterSpacing: '-0.02em',
              maxWidth: 940,
            }}
          >
            Stalling, transport, reparatie & service voor je caravan.
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            color: 'rgba(241,245,249,0.7)',
            fontSize: 22,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ color: '#F1F5F9', fontWeight: 600, fontSize: 26 }}>
              Caravanstalling Spanje
            </div>
            <div style={{ marginTop: 4 }}>caravanstalling-spanje.com</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: '#F1F5F9' }}>
            <span>Stalling</span>
            <span style={{ opacity: 0.4 }}>·</span>
            <span>Reparatie</span>
            <span style={{ opacity: 0.4 }}>·</span>
            <span>Verhuur</span>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
