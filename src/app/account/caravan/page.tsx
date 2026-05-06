'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Loader2, Caravan as CaravanIcon, ShieldCheck, Calendar, FileText, Camera,
  Wrench, ClipboardCheck, Sparkles, X, MessageSquare, Plus, CheckCircle2, Clock, AlertCircle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import AccountLayout from '@/components/account/AccountLayout';
import { useLocale } from '@/components/LocaleProvider';
import type { StringKey } from '@/lib/i18n';

type Customer = {
  id: number;
  name: string;
  email: string;
  mustChangePassword: boolean;
};

type Caravan = {
  id: number;
  kind: string;
  brand: string | null;
  model: string | null;
  year: number | null;
  registration: string | null;
  lengthM: number | null;
  spotCode: string | null;
  storageType: string | null;
  contractStart: string | null;
  contractRenew: string | null;
  insuranceProvider: string | null;
  notes: string | null;
};

type CaravanPhoto = {
  id: number;
  url: string;
  webUrl: string | null;
  fileName: string | null;
  sizeKb: number | null;
  caption: string | null;
  uploadedBy: string;
  createdAt: string;
};

type ServiceHistoryItem = {
  id: number;
  kind: string;
  title: string;
  description: string | null;
  happenedOn: string | null;
  createdAt: string;
};

type Tab = 'overview' | 'history' | 'docs' | 'photos' | 'requests';

type ServiceRequest = {
  id: number;
  kind: string;
  title: string;
  description: string | null;
  preferredDate: string | null;
  status: 'new' | 'in_progress' | 'done' | 'cancelled';
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
};
type T = (k: StringKey, ...a: (string | number)[]) => string;

export default function MijnCaravanPage() {
  const router = useRouter();
  const { t } = useLocale();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [caravan, setCaravan] = useState<Caravan | null>(null);
  const [history, setHistory] = useState<ServiceHistoryItem[]>([]);
  const [photos, setPhotos] = useState<CaravanPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('overview');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch('/api/account/me', { credentials: 'include' });
        if (res.status === 401) { router.push('/account/login'); return; }
        const data = await res.json();
        if (!alive) return;
        setCustomer(data.customer);
        if (data.customer.mustChangePassword) {
          router.push('/account/wachtwoord-wijzigen?first=1');
          return;
        }
        const cvRes = await fetch('/api/account/caravan', { credentials: 'include' });
        if (cvRes.ok) {
          const cv = await cvRes.json();
          if (!alive) return;
          setCaravan(cv.caravan);
          setHistory(cv.history || []);
          setPhotos(cv.photos || []);
        }
      } catch {
        if (alive) router.push('/account/login');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [router]);

  if (loading || !customer) {
    return (
      <AccountLayout>
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin" style={{ color: 'var(--muted)' }} />
        </div>
      </AccountLayout>
    );
  }

  const tabs: Array<{ id: Tab; label: string }> = [
    { id: 'overview', label: t('pt1.cv-tab-overview') },
    { id: 'history', label: t('pt1.cv-tab-history') },
    { id: 'requests', label: 'Aanvragen' },
    { id: 'docs', label: t('pt1.cv-tab-docs') },
    { id: 'photos', label: t('pt1.cv-tab-photos') },
  ];

  return (
    <AccountLayout customerName={customer.name} customerEmail={customer.email}>
      <motion.header
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <span className="eyebrow-mk">{t('pt1.brand')}</span>
        <h1 className="h2-mk" style={{ marginTop: 4, fontSize: 'clamp(1.6rem, 3.2vw, 2.2rem)' }}>
          {t('pt1.cv-h1')}
        </h1>
      </motion.header>

      {!caravan ? (
        <NoCaravanState t={t} />
      ) : (
        <>
          {/* Header-card */}
          <div className="card-mk card-lift" style={{ padding: 24, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
            <span
              aria-hidden
              style={{
                width: 76, height: 76, borderRadius: 14,
                background: 'linear-gradient(135deg, var(--sky) 0%, #BFE7FD 100%)',
                color: 'var(--navy)',
                display: 'grid', placeItems: 'center', flexShrink: 0,
              }}
            >
              <CaravanIcon size={38} aria-hidden />
            </span>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 19, color: 'var(--navy)' }}>
                {[caravan.brand, caravan.model].filter(Boolean).join(' ') || 'Caravan'}
              </div>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>
                {[
                  caravan.year ? `Bouwjaar ${caravan.year}` : null,
                  caravan.lengthM !== null ? `Lengte ${caravan.lengthM.toString().replace('.', ',')} m` : null,
                  caravan.registration ? `Kenteken ${caravan.registration}` : null,
                ].filter(Boolean).join(' · ') || 'Geen specs ingesteld'}
              </div>
            </div>
            {caravan.insuranceProvider && (
              <span className="tag-mk green">
                <ShieldCheck size={11} /> Verzekerd
              </span>
            )}
          </div>

          {/* Tabs */}
          <div style={{ borderBottom: '1px solid var(--line)', marginBottom: 22, overflowX: 'auto' }}>
            <ul style={{ display: 'flex', gap: 4, listStyle: 'none', margin: 0, padding: 0 }}>
              {tabs.map((tb) => {
                const active = tab === tb.id;
                return (
                  <li key={tb.id} style={{ flex: '0 0 auto' }}>
                    <button
                      type="button"
                      onClick={() => setTab(tb.id)}
                      style={{
                        fontFamily: 'var(--sora)', fontWeight: active ? 600 : 500, fontSize: 13.5,
                        color: active ? 'var(--navy)' : 'var(--muted)',
                        padding: '12px 18px', background: 'none', border: 'none', cursor: 'pointer',
                        borderBottom: active ? '2px solid var(--orange)' : '2px solid transparent',
                        marginBottom: -1,
                        whiteSpace: 'nowrap',
                      }}
                      aria-pressed={active}
                    >
                      {tb.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {tab === 'overview' && <OverviewTab t={t} caravan={caravan} />}
          {tab === 'history' && <HistoryTab t={t} history={history} />}
          {tab === 'requests' && <RequestsTab />}
          {tab === 'docs' && <DocsTab t={t} />}
          {tab === 'photos' && <PhotosTab t={t} caravanId={caravan.id} initialPhotos={photos} />}
        </>
      )}
    </AccountLayout>
  );
}

function NoCaravanState({ t }: { t: T }) {
  void t;
  return (
    <div className="card-mk text-center" style={{ padding: 48 }}>
      <CaravanIcon size={40} aria-hidden style={{ margin: '0 auto 14px', color: 'var(--muted)', opacity: 0.5 }} />
      <h2 style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 18, color: 'var(--navy)', margin: '0 0 8px' }}>
        Nog geen caravan gekoppeld
      </h2>
      <p style={{ fontSize: 14, color: 'var(--ink-2)', margin: '0 0 18px', lineHeight: 1.6, maxWidth: 460, marginLeft: 'auto', marginRight: 'auto' }}>
        We koppelen je caravan zodra je eerste betaling binnen is. Mocht hij ontbreken — stuur ons een bericht met je gegevens, dan regelen we het.
      </p>
      <a href="/contact?topic=storage" className="btn btn-primary">
        Stuur een bericht
      </a>
    </div>
  );
}

function OverviewTab({ t, caravan }: { t: T; caravan: Caravan }) {
  const storageLabel = caravan.storageType === 'binnen' ? 'Binnenstalling'
    : caravan.storageType === 'overdekt' ? 'Overdekt'
    : caravan.storageType === 'buiten' ? 'Buitenstalling' : '—';
  const sectionLetter = caravan.spotCode?.match(/^([A-Z]+)/)?.[1] || '';
  const fmtDate = (iso: string | null) => {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleDateString('nl-NL', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch { return iso; }
  };
  const sinceYear = caravan.contractStart ? new Date(caravan.contractStart).getFullYear() : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
      <div className="space-y-6">
        {/* Specs */}
        <div className="card-mk" style={{ padding: 24 }}>
          <h2 style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 16, color: 'var(--navy)', margin: '0 0 16px' }}>
            Specificaties
          </h2>
          <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '14px 24px', fontSize: 13.5 }}>
            <SpecRow k={t('pt1.cv-spec-brand')} v={caravan.brand || '—'} />
            <SpecRow k={t('pt1.cv-spec-model')} v={caravan.model || '—'} />
            <SpecRow k={t('pt1.cv-spec-year')} v={caravan.year ? String(caravan.year) : '—'} />
            <SpecRow k={t('pt1.cv-spec-length')} v={caravan.lengthM !== null ? `${caravan.lengthM.toString().replace('.', ',')} m` : '—'} />
            <SpecRow k={t('pt1.cv-spec-reg')} v={caravan.registration || '—'} />
          </dl>
        </div>

        {/* Stallingplek */}
        {caravan.spotCode && (
          <div className="card-mk" style={{ padding: 24 }}>
            <h2 style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 16, color: 'var(--navy)', margin: '0 0 16px' }}>
              {t('pt1.cv-spot-h3')}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
              <span
                aria-hidden
                style={{
                  width: 86, height: 86, borderRadius: 12,
                  background: 'var(--sky-soft)',
                  display: 'grid', placeItems: 'center',
                  fontFamily: 'var(--sora)', fontWeight: 800, fontSize: 28,
                  color: 'var(--navy)',
                  border: '2px solid var(--sky)',
                }}
              >
                {caravan.spotCode}
              </span>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 15, color: 'var(--navy)', marginBottom: 4 }}>
                  {storageLabel}{sectionLetter ? ` — Sectie ${sectionLetter}` : ''}
                </div>
                {caravan.notes && (
                  <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                    {caravan.notes}
                  </div>
                )}
              </div>
              <SpotMapSvg />
            </div>
          </div>
        )}
      </div>

      <aside className="space-y-6">
        {/* Contract */}
        <div className="card-mk" style={{ padding: 22 }}>
          <h3 style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 11, letterSpacing: 2.4, textTransform: 'uppercase', color: 'var(--muted)', margin: '0 0 12px' }}>
            {t('pt1.cv-contract-h3')}
          </h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '6px 0' }}>
            <span style={{ color: 'var(--muted)' }}>{t('pt1.cv-contract-since')}</span>
            <span style={{ color: 'var(--ink)', fontFamily: 'var(--sora)', fontWeight: 600 }}>{sinceYear || '—'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '6px 0' }}>
            <span style={{ color: 'var(--muted)' }}>{t('pt1.cv-contract-renew')}</span>
            <span style={{ color: 'var(--ink)', fontFamily: 'var(--sora)', fontWeight: 600 }}>{fmtDate(caravan.contractRenew)}</span>
          </div>
        </div>

        {/* Insurance */}
        {caravan.insuranceProvider && (
          <div className="card-mk" style={{ padding: 22 }}>
            <h3 style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 11, letterSpacing: 2.4, textTransform: 'uppercase', color: 'var(--muted)', margin: '0 0 12px' }}>
              {t('pt1.cv-insurance-h3')}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0' }}>
              <ShieldCheck size={18} style={{ color: 'var(--green)' }} aria-hidden />
              <div>
                <div style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 13.5, color: 'var(--navy)' }}>{caravan.insuranceProvider}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{t('pt1.cv-insurance-cover')}</div>
              </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}

function HistoryTab({ t, history }: { t: T; history: ServiceHistoryItem[] }) {
  if (history.length === 0) {
    return <div className="card-mk text-center" style={{ padding: 40, color: 'var(--muted)', fontSize: 14 }}>{t('pt1.cv-history-empty')}</div>;
  }
  const iconForKind = (kind: string): LucideIcon => {
    switch (kind) {
      case 'cleaning':
      case 'service':
        return Sparkles;
      case 'inspection':
        return ClipboardCheck;
      case 'repair':
        return Wrench;
      default:
        return Calendar;
    }
  };
  const fmtDate = (h: ServiceHistoryItem) => {
    const d = h.happenedOn || h.createdAt;
    try {
      return new Date(d).toLocaleDateString('nl-NL', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch { return d; }
  };
  return (
    <div className="card-mk" style={{ padding: 24 }}>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none', position: 'relative' }}>
        {history.map((h, i) => {
          const Icon = iconForKind(h.kind);
          return (
            <li key={h.id} style={{ display: 'flex', gap: 14, paddingBottom: 22, position: 'relative' }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <span
                  aria-hidden
                  style={{
                    width: 36, height: 36, borderRadius: 999,
                    background: 'var(--green-soft)', color: 'var(--green)',
                    display: 'grid', placeItems: 'center',
                  }}
                >
                  <Icon size={16} />
                </span>
                {i < history.length - 1 && (
                  <span aria-hidden style={{ position: 'absolute', top: 38, bottom: -22, left: '50%', width: 2, background: 'var(--line)' }} />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--sora)', fontWeight: 600, letterSpacing: 0.4 }}>{fmtDate(h)}</div>
                <div style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 15, color: 'var(--navy)', margin: '2px 0 4px' }}>{h.title}</div>
                {h.description && <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.55 }}>{h.description}</div>}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function DocsTab({ t }: { t: T }) {
  return (
    <div className="card-mk text-center" style={{ padding: 40 }}>
      <FileText size={32} style={{ margin: '0 auto 10px', color: 'var(--muted)', opacity: 0.5 }} aria-hidden />
      <p style={{ color: 'var(--muted)', fontSize: 14, margin: 0 }}>{t('pt1.cv-docs-empty')}</p>
    </div>
  );
}

function PhotosTab({
  t, caravanId, initialPhotos,
}: {
  t: T;
  caravanId: number;
  initialPhotos: CaravanPhoto[];
}) {
  const [photos, setPhotos] = useState<CaravanPhoto[]>(initialPhotos);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const uploadRef = `caravan-${caravanId}`;

  const handleFiles = async (files: FileList) => {
    setError('');
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (file.size > 10 * 1024 * 1024) {
          setError(`${file.name}: te groot (>10 MB)`);
          continue;
        }
        // Upload naar OneDrive
        const fd = new FormData();
        fd.append('file', file);
        fd.append('kind', 'contact'); // Geen aparte kind voor klant-foto's, hergebruiken
        fd.append('ref', uploadRef);
        const upRes = await fetch('/api/uploads', { method: 'POST', body: fd });
        const up = await upRes.json();
        if (!upRes.ok) {
          setError(up?.error || `Upload mislukt: ${file.name}`);
          continue;
        }
        // Koppel aan caravan
        const linkRes = await fetch('/api/account/caravan/photos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: up.url,
            webUrl: up.webUrl,
            fileName: up.fileName,
            sizeKb: up.sizeKb,
          }),
          credentials: 'include',
        });
        const link = await linkRes.json();
        if (!linkRes.ok) {
          setError(link?.error || 'Foto koppelen mislukt');
          continue;
        }
        setPhotos((p) => [link.photo, ...p]);
      }
    } finally {
      setUploading(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm('Foto verwijderen?')) return;
    const res = await fetch(`/api/account/caravan/photos/${id}`, {
      method: 'DELETE', credentials: 'include',
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d?.error || 'Verwijderen mislukt');
      return;
    }
    setPhotos((p) => p.filter((x) => x.id !== id));
  };

  return (
    <div className="space-y-5">
      <div className="card-mk" style={{ padding: 24 }}>
        <h3 style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 16, color: 'var(--navy)', margin: '0 0 6px' }}>
          Eigen foto&apos;s toevoegen
        </h3>
        <p style={{ fontSize: 13.5, color: 'var(--ink-2)', margin: '0 0 14px', lineHeight: 1.55 }}>
          Upload foto&apos;s van je caravan voor je eigen archief — bijvoorbeeld vóór de stalling of na een reparatie.
          Wij kunnen ze ook als referentie gebruiken bij vragen.
        </p>

        <label
          htmlFor="caravan-photo-upload"
          style={{
            display: 'block',
            padding: '24px 18px',
            border: '2px dashed var(--line-2)',
            borderRadius: 12,
            background: 'var(--bg)',
            cursor: uploading ? 'wait' : 'pointer',
            opacity: uploading ? 0.6 : 1,
            textAlign: 'center',
          }}
        >
          {uploading ? (
            <Loader2 size={22} className="animate-spin" style={{ margin: '0 auto 6px', color: 'var(--muted)' }} aria-hidden />
          ) : (
            <Camera size={22} style={{ margin: '0 auto 6px', color: 'var(--orange)' }} aria-hidden />
          )}
          <div style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 14, color: 'var(--navy)', marginBottom: 4 }}>
            {uploading ? 'Bezig met uploaden…' : 'Klik om foto\'s te kiezen'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>
            JPG, PNG of HEIC · max 10 MB per foto
          </div>
          <input
            id="caravan-photo-upload"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
            multiple
            hidden
            disabled={uploading}
            onChange={(e) => {
              if (e.target.files) handleFiles(e.target.files);
              e.target.value = '';
            }}
          />
        </label>

        {error && (
          <div role="alert" style={{ marginTop: 10, padding: 10, background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', borderRadius: 8, fontSize: 12.5 }}>
            {error}
          </div>
        )}
      </div>

      {photos.length === 0 ? (
        <div className="card-mk text-center" style={{ padding: 32 }}>
          <p style={{ color: 'var(--muted)', fontSize: 14, margin: 0 }}>
            {t('pt1.cv-photos-empty')}
          </p>
        </div>
      ) : (
        <div className="card-mk" style={{ padding: 24 }}>
          <h3 style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 16, color: 'var(--navy)', margin: '0 0 16px' }}>
            {photos.length} foto{photos.length === 1 ? '' : '\'s'}
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
              gap: 10,
            }}
          >
            {photos.map((p) => (
              <div
                key={p.id}
                style={{
                  position: 'relative',
                  aspectRatio: '1 / 1',
                  borderRadius: 10,
                  overflow: 'hidden',
                  border: '1px solid var(--line)',
                  background: 'var(--bg)',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.url}
                  alt={p.fileName || 'Caravan-foto'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                {p.uploadedBy === 'customer' && (
                  <button
                    type="button"
                    onClick={() => remove(p.id)}
                    aria-label="Verwijder foto"
                    style={{
                      position: 'absolute',
                      top: 6, right: 6,
                      width: 24, height: 24,
                      borderRadius: 999,
                      background: 'rgba(31,42,54,0.85)',
                      color: '#fff',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'grid',
                      placeItems: 'center',
                    }}
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SpotMapSvg() {
  return (
    <svg viewBox="0 0 220 130" width="180" height="106" role="img" aria-label="Plattegrond stalling-terrein">
      <rect x="2" y="2" width="216" height="126" rx="6" fill="#F8FBFD" stroke="#2F4254" strokeWidth="1.5" />
      {/* gates */}
      <rect x="6" y="56" width="2" height="20" fill="#F9AD36" />
      {/* sections */}
      <text x="40" y="20" fontFamily="var(--sora)" fontSize="9" fontWeight="600" fill="#2F4254">A</text>
      <text x="100" y="20" fontFamily="var(--sora)" fontSize="9" fontWeight="600" fill="#2F4254">B</text>
      <text x="160" y="20" fontFamily="var(--sora)" fontSize="9" fontWeight="600" fill="#2F4254">C</text>
      {/* B section grid */}
      <g>
        {Array.from({ length: 16 }).map((_, i) => {
          const col = i % 4;
          const row = Math.floor(i / 4);
          const isOurs = i === 11; // B-12 (0-indexed 11)
          return (
            <rect
              key={i}
              x={70 + col * 18}
              y={30 + row * 18}
              width={14}
              height={14}
              rx={2}
              fill={isOurs ? '#F9AD36' : '#E5F3FB'}
              stroke="#2F4254"
              strokeWidth="0.8"
            />
          );
        })}
      </g>
      {/* path */}
      <path d="M40 110 H180" stroke="#2F4254" strokeWidth="1" strokeDasharray="3 3" />
      <text x="135" y="124" fontFamily="var(--sora)" fontSize="8" fill="#2F4254" opacity="0.6">jouw plek</text>
    </svg>
  );
}

function SpecRow({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt style={{ color: 'var(--muted)', textTransform: 'uppercase', fontSize: 11, letterSpacing: 1.2, fontFamily: 'var(--sora)', fontWeight: 600, marginBottom: 4 }}>{k}</dt>
      <dd style={{ color: 'var(--ink)', margin: 0, fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 14 }}>{v}</dd>
    </div>
  );
}

// ─── Klant-aanvragen ─────────────────────────────────
const REQUEST_KINDS: Array<{ value: string; label: string }> = [
  { value: 'cleaning', label: 'Schoonmaak' },
  { value: 'service', label: 'Onderhoud / service' },
  { value: 'inspection', label: 'Inspectie' },
  { value: 'repair', label: 'Reparatie' },
  { value: 'transport', label: 'Transport' },
  { value: 'other', label: 'Anders' },
];

function statusMeta(s: ServiceRequest['status']): { label: string; color: string; Icon: LucideIcon } {
  switch (s) {
    case 'new': return { label: 'Ontvangen', color: 'var(--orange)', Icon: Clock };
    case 'in_progress': return { label: 'In behandeling', color: '#3B82F6', Icon: AlertCircle };
    case 'done': return { label: 'Afgerond', color: 'var(--green)', Icon: CheckCircle2 };
    case 'cancelled': return { label: 'Geannuleerd', color: 'var(--muted)', Icon: X };
  }
}

function RequestsTab() {
  const [items, setItems] = useState<ServiceRequest[] | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState({ kind: 'service', title: '', description: '', preferredDate: '' });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/account/service-requests', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => { if (!cancelled) setItems(d.items || []); })
      .catch(() => { if (!cancelled) setItems([]); });
    return () => { cancelled = true; };
  }, []);

  async function submit() {
    if (!draft.title.trim()) { setErr('Vul een korte omschrijving in.'); return; }
    setSaving(true);
    setErr(null);
    try {
      const res = await fetch('/api/account/service-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          kind: draft.kind,
          title: draft.title.trim(),
          description: draft.description.trim() || undefined,
          preferredDate: draft.preferredDate || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data?.error || 'Versturen mislukt.'); return; }
      setItems((prev) => [data.item, ...(prev || [])]);
      setCreating(false);
      setDraft({ kind: 'service', title: '', description: '', preferredDate: '' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="card-mk" style={{ padding: 24, marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <span aria-hidden style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--sky-soft)', color: 'var(--navy)', display: 'grid', placeItems: 'center' }}>
            <MessageSquare size={18} />
          </span>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 17, color: 'var(--navy)', margin: 0 }}>
              Service aanvragen
            </h3>
            <p style={{ fontSize: 13, color: 'var(--muted)', margin: '2px 0 0' }}>
              Schoonmaak, onderhoud, transport of een reparatie nodig? Stuur een bericht — wij plannen het in.
            </p>
          </div>
          {!creating && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setCreating(true)}
              style={{ flexShrink: 0 }}
            >
              <Plus size={14} aria-hidden /> Nieuwe aanvraag
            </button>
          )}
        </div>

        {creating && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--line)', display: 'grid', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
              <label>
                <span style={{ display: 'block', fontSize: 11, fontFamily: 'var(--sora)', textTransform: 'uppercase', letterSpacing: 1.2, color: 'var(--muted)', marginBottom: 4 }}>
                  Type
                </span>
                <select
                  value={draft.kind}
                  onChange={(e) => setDraft({ ...draft, kind: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--line)', fontSize: 14, background: '#fff' }}
                >
                  {REQUEST_KINDS.map((k) => (<option key={k.value} value={k.value}>{k.label}</option>))}
                </select>
              </label>
              <label>
                <span style={{ display: 'block', fontSize: 11, fontFamily: 'var(--sora)', textTransform: 'uppercase', letterSpacing: 1.2, color: 'var(--muted)', marginBottom: 4 }}>
                  Voorkeur datum
                </span>
                <input
                  type="date"
                  value={draft.preferredDate}
                  onChange={(e) => setDraft({ ...draft, preferredDate: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--line)', fontSize: 14, background: '#fff' }}
                />
              </label>
            </div>
            <label>
              <span style={{ display: 'block', fontSize: 11, fontFamily: 'var(--sora)', textTransform: 'uppercase', letterSpacing: 1.2, color: 'var(--muted)', marginBottom: 4 }}>
                Korte titel
              </span>
              <input
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                placeholder="Bv: jaarlijkse onderhoudsbeurt"
                style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--line)', fontSize: 14, background: '#fff' }}
              />
            </label>
            <label>
              <span style={{ display: 'block', fontSize: 11, fontFamily: 'var(--sora)', textTransform: 'uppercase', letterSpacing: 1.2, color: 'var(--muted)', marginBottom: 4 }}>
                Toelichting
              </span>
              <textarea
                rows={3}
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                placeholder="Wat moet er gebeuren? Eventueel aanvullende info."
                style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--line)', fontSize: 14, background: '#fff', resize: 'vertical' }}
              />
            </label>
            {err && <p style={{ fontSize: 13, color: 'var(--red)', margin: 0 }}>{err}</p>}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-ghost" onClick={() => { setCreating(false); setErr(null); }}>
                Annuleer
              </button>
              <button type="button" className="btn btn-primary" onClick={submit} disabled={saving}>
                {saving ? <Loader2 size={14} className="animate-spin" aria-hidden /> : <Plus size={14} aria-hidden />} Versturen
              </button>
            </div>
          </div>
        )}
      </div>

      {items === null ? (
        <div className="card-mk text-center" style={{ padding: 32 }}>
          <Loader2 className="animate-spin" style={{ color: 'var(--muted)' }} />
        </div>
      ) : items.length === 0 ? (
        <div className="card-mk text-center" style={{ padding: 32 }}>
          <p style={{ fontSize: 14, color: 'var(--muted)', margin: 0 }}>
            Nog geen aanvragen. Klik op &quot;Nieuwe aanvraag&quot; om er een te starten.
          </p>
        </div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10 }}>
          {items.map((r) => {
            const meta = statusMeta(r.status);
            const kindLabel = REQUEST_KINDS.find((k) => k.value === r.kind)?.label || r.kind;
            return (
              <li key={r.id} className="card-mk" style={{ padding: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ fontFamily: 'var(--sora)', fontWeight: 600, color: 'var(--navy)', fontSize: 15 }}>
                      {r.title}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                      {kindLabel}
                      {r.preferredDate ? ` · gewenst: ${new Date(r.preferredDate).toLocaleDateString('nl-NL')}` : ''}
                      {' · '}ingediend {new Date(r.createdAt).toLocaleDateString('nl-NL')}
                    </div>
                  </div>
                  <span
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '4px 10px', borderRadius: 999, fontSize: 12,
                      fontFamily: 'var(--sora)', fontWeight: 600,
                      background: 'rgba(0,0,0,0.04)', color: meta.color,
                    }}
                  >
                    <meta.Icon size={12} aria-hidden /> {meta.label}
                  </span>
                </div>
                {r.description && (
                  <p style={{ fontSize: 13, color: 'var(--ink-2)', margin: '10px 0 0', lineHeight: 1.55 }}>
                    {r.description}
                  </p>
                )}
                {r.adminNote && (
                  <div style={{ marginTop: 10, padding: 10, borderRadius: 8, background: 'var(--sky-soft)', fontSize: 13, color: 'var(--navy)' }}>
                    <strong style={{ fontFamily: 'var(--sora)', fontWeight: 600 }}>Reactie van team:</strong> {r.adminNote}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

