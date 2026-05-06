'use client';

import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Calendar, ChevronLeft, ChevronRight, Refrigerator, Wind, MapPin, Tag,
  Phone, AlertTriangle, CheckCircle2, Mail,
} from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import { Skeleton } from '@/components/ui';

type PlanningBooking = {
  id: number;
  fridge_id: number;
  customer_name: string;
  email: string | null;
  phone: string | null;
  device_type: string;
  camping: string | null;
  spot_number: string | null;
  start_date: string;
  end_date: string;
  status: string;
  holded_invoice_status: string | null;
  paid_at: string | null;
};

type Stock = {
  'Grote koelkast': number;
  'Tafelmodel koelkast': number;
  'Airco': number;
};

type DeviceFilter = 'all' | 'fridges' | 'ac';

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfWeek(d: Date): Date {
  // Maandag-start (ISO).
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(d.getTime() + diff * DAY_MS);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function fmtIso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function fmtDayLabel(d: Date): string {
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

function fmtWeekLabel(start: Date): string {
  const end = new Date(start.getTime() + 6 * DAY_MS);
  const startStr = start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const endStr = end.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  return `${startStr} – ${endStr}`;
}

function isAirco(deviceType: string | null | undefined): boolean {
  return (deviceType || '').toLowerCase().includes('airco');
}

// Berekent welke kolom-index (0..6) een datum heeft in de huidige week,
// geclampt naar de zichtbare range.
function dayIndexInWeek(date: string, weekStart: Date): number {
  const t = new Date(date).getTime();
  const diff = Math.floor((t - weekStart.getTime()) / DAY_MS);
  return Math.max(0, Math.min(6, diff));
}

// Aantal dagen overlap tussen booking en zichtbare week.
function spanInWeek(b: PlanningBooking, weekStart: Date): { start: number; end: number } {
  const startIdx = dayIndexInWeek(b.start_date, weekStart);
  const endIdx = dayIndexInWeek(b.end_date, weekStart);
  return { start: startIdx, end: endIdx };
}

export default function PlanningPage() {
  const [weekStart, setWeekStart] = useState<Date>(() => startOfWeek(new Date()));
  const [bookings, setBookings] = useState<PlanningBooking[] | null>(null);
  const [stock, setStock] = useState<Stock>({ 'Grote koelkast': 110, 'Tafelmodel koelkast': 20, 'Airco': 10 });
  const [deviceFilter, setDeviceFilter] = useState<DeviceFilter>('all');
  const gridRef = useRef<HTMLDivElement>(null);

  const weekEnd = useMemo(() => new Date(weekStart.getTime() + 6 * DAY_MS), [weekStart]);
  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => new Date(weekStart.getTime() + i * DAY_MS)),
    [weekStart],
  );

  const load = useCallback(async () => {
    setBookings(null);
    try {
      const params = new URLSearchParams({ from: fmtIso(weekStart), to: fmtIso(weekEnd) });
      const res = await fetch(`/api/admin/planning?${params}`, { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'load failed');
      setBookings(data.bookings || []);
      if (data.stock) setStock(data.stock);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not load planning');
      setBookings([]);
    }
  }, [weekStart, weekEnd]);

  useEffect(() => { load(); }, [load]);

  const fridges = useMemo(
    () => (bookings || []).filter((b) => !isAirco(b.device_type)),
    [bookings],
  );
  const acs = useMemo(
    () => (bookings || []).filter((b) => isAirco(b.device_type)),
    [bookings],
  );

  // Capaciteit per dag per type — count bookings die op die dag actief zijn.
  const fridgeCapPerDay = useMemo(
    () => days.map((d) => {
      const iso = fmtIso(d);
      return fridges.filter((b) => b.start_date <= iso && b.end_date >= iso).length;
    }),
    [days, fridges],
  );
  const acCapPerDay = useMemo(
    () => days.map((d) => {
      const iso = fmtIso(d);
      return acs.filter((b) => b.start_date <= iso && b.end_date >= iso).length;
    }),
    [days, acs],
  );

  const fridgeCapacity = (stock['Grote koelkast'] || 0) + (stock['Tafelmodel koelkast'] || 0);
  const acCapacity = stock['Airco'] || 0;

  const showFridges = deviceFilter === 'all' || deviceFilter === 'fridges';
  const showACs = deviceFilter === 'all' || deviceFilter === 'ac';

  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="Planning"
        description={`Week ${fmtWeekLabel(weekStart)} — drag a booking to reschedule.`}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setWeekStart((d) => new Date(d.getTime() - 7 * DAY_MS))}
              className="w-9 h-9 inline-flex items-center justify-center rounded-[var(--radius-md)] border border-border bg-surface hover:border-border-strong transition-colors"
              aria-label="Previous week"
            >
              <ChevronLeft size={15} />
            </button>
            <button
              type="button"
              onClick={() => setWeekStart(startOfWeek(new Date()))}
              className="px-3 h-9 text-[13px] font-medium rounded-[var(--radius-md)] border border-border bg-surface hover:border-border-strong transition-colors"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setWeekStart((d) => new Date(d.getTime() + 7 * DAY_MS))}
              className="w-9 h-9 inline-flex items-center justify-center rounded-[var(--radius-md)] border border-border bg-surface hover:border-border-strong transition-colors"
              aria-label="Next week"
            >
              <ChevronRight size={15} />
            </button>
            <a
              href="/admin/planning/agenda"
              className="px-3 h-9 inline-flex items-center gap-1.5 text-[13px] font-medium rounded-[var(--radius-md)] border border-border bg-surface hover:border-border-strong transition-colors"
            >
              <Calendar size={13} /> Google-agenda
            </a>
          </div>
        }
      />

      {/* Filter pills */}
      <div className="flex items-center gap-2 mb-5">
        {([
          { value: 'all', label: 'All', icon: Calendar },
          { value: 'fridges', label: 'Fridges', icon: Refrigerator },
          { value: 'ac', label: 'AC units', icon: Wind },
        ] as const).map((opt) => {
          const Icon = opt.icon;
          const active = deviceFilter === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setDeviceFilter(opt.value)}
              className={`inline-flex items-center gap-1.5 h-9 px-3 text-[13px] font-medium rounded-[var(--radius-md)] border transition-colors ${
                active
                  ? 'bg-accent text-accent-fg border-accent'
                  : 'bg-surface border-border text-text-muted hover:text-text'
              }`}
            >
              <Icon size={13} /> {opt.label}
            </button>
          );
        })}
      </div>

      {bookings === null ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <div ref={gridRef} className="space-y-8">
          {/* Day-header row */}
          <div className="grid grid-cols-[180px_repeat(7,minmax(0,1fr))] gap-px bg-border rounded-[var(--radius-lg)] overflow-hidden border border-border">
            <div className="bg-surface p-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
              Device
            </div>
            {days.map((d) => {
              const isToday = fmtIso(d) === fmtIso(new Date());
              return (
                <div
                  key={fmtIso(d)}
                  className={`bg-surface p-3 text-[11px] font-semibold uppercase tracking-[0.14em] ${
                    isToday ? 'text-accent' : 'text-text-muted'
                  }`}
                >
                  {fmtDayLabel(d)}
                </div>
              );
            })}
          </div>

          {/* Fridges section */}
          {showFridges && (
            <DeviceSection
              title="Fridges"
              icon={Refrigerator}
              accent="cyan"
              days={days}
              weekStart={weekStart}
              capPerDay={fridgeCapPerDay}
              capacity={fridgeCapacity}
              bookings={fridges}
              onChange={load}
            />
          )}

          {/* AC units section */}
          {showACs && (
            <DeviceSection
              title="AC units"
              icon={Wind}
              accent="violet"
              days={days}
              weekStart={weekStart}
              capPerDay={acCapPerDay}
              capacity={acCapacity}
              bookings={acs}
              onChange={load}
            />
          )}

          {(fridges.length === 0 && acs.length === 0) && (
            <div className="card-surface p-12 text-center text-text-muted text-sm">
              No bookings this week.
            </div>
          )}
        </div>
      )}
    </>
  );
}

function DeviceSection({
  title, icon: Icon, accent, days, weekStart, capPerDay, capacity, bookings, onChange,
}: {
  title: string;
  icon: typeof Refrigerator;
  accent: 'cyan' | 'violet';
  days: Date[];
  weekStart: Date;
  capPerDay: number[];
  capacity: number;
  bookings: PlanningBooking[];
  onChange: () => void;
}) {
  if (bookings.length === 0) return null;

  const overflow = capPerDay.some((c) => c > capacity);

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[12px] font-semibold uppercase tracking-[0.18em] text-text flex items-center gap-2">
          <Icon size={14} /> {title}
          <span className="text-text-muted">· {bookings.length} active this week</span>
        </h2>
        {overflow && (
          <span className="inline-flex items-center gap-1.5 text-[11px] text-danger font-medium">
            <AlertTriangle size={12} /> Overcapacity detected
          </span>
        )}
      </div>

      {/* Capacity bar */}
      <div className="grid grid-cols-[180px_repeat(7,minmax(0,1fr))] gap-px mb-1.5">
        <div className="text-[11px] text-text-muted px-2 self-center">
          Capacity {capacity}
        </div>
        {capPerDay.map((c, i) => {
          const pct = capacity > 0 ? c / capacity : 0;
          const over = c > capacity;
          const fill =
            over ? 'var(--color-danger)' :
            pct >= 0.7 ? 'var(--color-warning)' :
            accent === 'violet' ? 'rgba(139,92,246,0.6)' : 'rgba(96,165,250,0.6)';
          return (
            <div
              key={i}
              className="h-2 rounded-full overflow-hidden"
              style={{ background: 'var(--color-surface-2)' }}
              title={`${c} / ${capacity} active on ${fmtDayLabel(days[i])}`}
            >
              <div style={{ width: `${Math.min(100, pct * 100)}%`, height: '100%', background: fill }} />
            </div>
          );
        })}
      </div>

      {/* Booking rows */}
      <div className="grid grid-cols-[180px_repeat(7,minmax(0,1fr))] gap-px bg-border rounded-[var(--radius-lg)] overflow-hidden border border-border">
        {bookings.map((b) => (
          <BookingRow
            key={b.id}
            booking={b}
            days={days}
            weekStart={weekStart}
            capPerDay={capPerDay}
            capacity={capacity}
            onChange={onChange}
          />
        ))}
      </div>
    </section>
  );
}

function BookingRow({
  booking, days, weekStart, capPerDay, capacity, onChange,
}: {
  booking: PlanningBooking;
  days: Date[];
  weekStart: Date;
  capPerDay: number[];
  capacity: number;
  onChange: () => void;
}) {
  const [optimistic, setOptimistic] = useState<{ start: string; end: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const dragOffsetRef = useRef(0);

  const eff = optimistic
    ? { ...booking, start_date: optimistic.start, end_date: optimistic.end }
    : booking;
  const span = spanInWeek(eff, weekStart);
  const colSpan = span.end - span.start + 1;
  const paid = booking.holded_invoice_status === 'paid';
  const isReview = booking.status === 'controleren';

  // Conflict-detectie: zit minstens één van mijn dagen op een over-cap-dag?
  const hasConflict = (() => {
    if (capacity <= 0) return false;
    for (let i = span.start; i <= span.end; i++) {
      if (capPerDay[i] > capacity) return true;
    }
    return false;
  })();

  // Bar-styling op basis van status.
  const bg =
    paid ? 'var(--color-success-soft)' :
    isReview ? 'var(--color-warning-soft)' :
    'var(--color-surface-2)';
  const fg =
    paid ? 'var(--color-success)' :
    isReview ? 'var(--color-warning)' :
    'var(--color-text)';
  const border =
    hasConflict ? '2px solid var(--color-danger)' :
    paid ? '1px solid rgba(16,185,129,0.3)' :
    isReview ? '1px solid rgba(244,185,66,0.3)' :
    '1px solid var(--color-border)';

  const handleClick = () => {
    // Klik = open de drawer in /admin/koelkasten met focus op deze fridge.
    if (saving) return;
    window.location.href = `/admin/koelkasten?focus=${booking.fridge_id}`;
  };

  const handleDragEnd = async (_e: unknown, info: { offset: { x: number } }) => {
    // Bereken naar hoeveel dagen we zijn versleept op basis van kolombreedte.
    // Lees de breedte live van de cellen — net door één van de header-cellen
    // te laten meten via getBoundingClientRect zou cleaner zijn, maar voor
    // pragmatische resultaten gebruiken we een element-ref op de grid-row zelf.
    const cellWidth = dragOffsetRef.current || 100;
    const dayDelta = Math.round(info.offset.x / cellWidth);
    if (dayDelta === 0) return;
    const start = new Date(booking.start_date);
    const end = new Date(booking.end_date);
    const newStart = new Date(start.getTime() + dayDelta * DAY_MS);
    const newEnd = new Date(end.getTime() + dayDelta * DAY_MS);
    const newStartIso = fmtIso(newStart);
    const newEndIso = fmtIso(newEnd);

    // Optimistic: update lokaal direct.
    setOptimistic({ start: newStartIso, end: newEndIso });
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/fridges/bookings/${booking.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start_date: newStartIso, end_date: newEndIso }),
        credentials: 'include',
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || 'Save failed');
      }
      toast.success(`Moved ${dayDelta > 0 ? '+' : ''}${dayDelta} day${Math.abs(dayDelta) === 1 ? '' : 's'}`);
      onChange();
      setOptimistic(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not move');
      setOptimistic(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Sticky label-cell met device + customer */}
      <button
        type="button"
        onClick={handleClick}
        className="bg-surface px-3 py-2.5 text-left hover:bg-surface-2 transition-colors min-w-0"
        title={`${booking.device_type} · ${booking.customer_name}`}
      >
        <div className="flex items-center gap-1.5 text-[12px] font-medium text-text truncate">
          {isAirco(booking.device_type) ? <Wind size={11} className="shrink-0 text-text-muted" /> : <Refrigerator size={11} className="shrink-0 text-text-muted" />}
          <span className="truncate">{booking.customer_name}</span>
        </div>
        <div className="text-[10px] text-text-muted truncate mt-0.5">
          {booking.device_type}
        </div>
      </button>

      {/* Spacer-cellen vóór de balk */}
      {Array.from({ length: span.start }).map((_, i) => (
        <div key={`pre-${i}`} className="bg-surface" />
      ))}

      {/* De booking-balk over X kolommen heen */}
      <div
        className="bg-surface relative"
        style={{ gridColumn: `span ${colSpan}` }}
        ref={(el) => {
          if (el) dragOffsetRef.current = el.offsetWidth / colSpan;
        }}
      >
        <motion.button
          type="button"
          drag="x"
          dragMomentum={false}
          dragConstraints={{ left: -2000, right: 2000 }}
          onDragEnd={handleDragEnd}
          onClick={handleClick}
          whileDrag={{ scale: 1.02, zIndex: 10 }}
          className="absolute inset-1 rounded-[var(--radius-md)] px-2 py-1.5 text-left overflow-hidden cursor-grab active:cursor-grabbing"
          style={{ background: bg, color: fg, border }}
          title={[
            booking.customer_name,
            booking.camping ? `${booking.camping}${booking.spot_number ? ` · spot ${booking.spot_number}` : ''}` : null,
            booking.phone ? `Tel: ${booking.phone}` : null,
            booking.email ? `Email: ${booking.email}` : null,
            paid ? 'Paid' : isReview ? 'Review' : 'Active',
          ].filter(Boolean).join('\n')}
        >
          <div className="flex items-center gap-1.5 text-[11px] font-semibold truncate">
            {paid && <CheckCircle2 size={10} />}
            {isReview && !paid && <AlertTriangle size={10} />}
            <span className="truncate">{booking.camping || 'No campsite'}</span>
            {booking.spot_number && (
              <span className="opacity-75 inline-flex items-center gap-0.5">
                <Tag size={9} /> {booking.spot_number}
              </span>
            )}
          </div>
          {booking.phone && (
            <div className="text-[10px] opacity-75 truncate flex items-center gap-1 mt-0.5">
              <Phone size={9} /> {booking.phone}
            </div>
          )}
        </motion.button>
      </div>

      {/* Spacer-cellen na de balk */}
      {Array.from({ length: 6 - span.end }).map((_, i) => (
        <div key={`post-${i}`} className="bg-surface" />
      ))}
    </>
  );
}

// Side-effect: stille imports zodat lucide-tree-shaking 'm meeneemt.
void MapPin; void Mail;
