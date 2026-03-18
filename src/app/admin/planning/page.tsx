"use client";

import { useState, useEffect, useMemo } from "react";
import { Calendar, ChevronLeft, ChevronRight, MapPin, AlertCircle, Truck, CheckCircle, Clock, Filter } from "lucide-react";
import { motion } from "framer-motion";

interface ContractEvent {
  id: number;
  contractNumber: string;
  customerName: string;
  caravanBrand: string;
  caravanModel: string;
  spotLabel: string;
  startDate: string;
  endDate: string;
  type: string;
  status: string;
}

interface TransportEvent {
  id: number;
  customerName: string;
  caravanBrand: string;
  pickupDate: string;
  deliveryDate: string;
  status: string;
}

const MONTHS_NL = ['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'];
const DAYS_NL = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // Monday = 0
}

const TYPE_COLORS: Record<string, string> = {
  contract_start: 'bg-accent/100',
  contract_end: 'bg-danger/100',
  transport_pickup: 'bg-ocean/100',
  transport_delivery: 'bg-primary/100',
  task: 'bg-warning/100',
};

const TYPE_LABELS: Record<string, string> = {
  contract_start: 'Contract start',
  contract_end: 'Contract einde',
  transport_pickup: 'Ophalen',
  transport_delivery: 'Afleveren',
  task: 'Taak',
};

interface CalendarEvent {
  id: string;
  date: string;
  type: string;
  title: string;
  subtitle: string;
}

export default function PlanningPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const [contractsRes, transportRes] = await Promise.all([
          fetch("/api/admin/contracts?limit=500", { credentials: "include" }),
          fetch("/api/admin/transport?limit=200", { credentials: "include" }),
        ]);
        const contractsData = await contractsRes.json();
        const transportData = await transportRes.json();

        const calEvents: CalendarEvent[] = [];

        (contractsData.contracts || []).forEach((c: ContractEvent) => {
          if (c.startDate) calEvents.push({ id: `cs-${c.id}`, date: c.startDate.slice(0, 10), type: 'contract_start', title: `${c.customerName}`, subtitle: `${c.caravanBrand} · ${c.spotLabel}` });
          if (c.endDate) calEvents.push({ id: `ce-${c.id}`, date: c.endDate.slice(0, 10), type: 'contract_end', title: `${c.customerName}`, subtitle: `Contract ${c.contractNumber} eindigt` });
        });

        (transportData.orders || []).forEach((t: TransportEvent) => {
          if (t.pickupDate) calEvents.push({ id: `tp-${t.id}`, date: t.pickupDate.slice(0, 10), type: 'transport_pickup', title: `${t.customerName}`, subtitle: `${t.caravanBrand} ophalen` });
          if (t.deliveryDate) calEvents.push({ id: `td-${t.id}`, date: t.deliveryDate.slice(0, 10), type: 'transport_delivery', title: `${t.customerName}`, subtitle: `${t.caravanBrand} afleveren` });
        });

        setEvents(calEvents);
      } catch {
        // Silently fail
      }
      setLoading(false);
    };
    fetchEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    return filter === "all" ? events : events.filter(e => e.type === filter);
  }, [events, filter]);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const today = new Date().toISOString().slice(0, 10);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => setCurrentDate(new Date());

  const getEventsForDate = (dateStr: string) => filteredEvents.filter(e => e.date === dateStr);

  const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-surface-dark">Planning</h1>
          <p className="text-sm text-warm-gray/70 mt-1">Overzicht van contracten, transport en taken</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Filter */}
          <div className="relative">
            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="appearance-none bg-surface border border-sand-dark/30 rounded-xl pl-9 pr-8 py-2 text-sm font-medium text-warm-gray focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">Alles</option>
              <option value="contract_start">Contract start</option>
              <option value="contract_end">Contract einde</option>
              <option value="transport_pickup">Ophalen</option>
              <option value="transport_delivery">Afleveren</option>
            </select>
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-gray/70" />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-6">
        {/* Calendar Grid */}
        <div className="bg-surface rounded-2xl border border-sand-dark/20 overflow-hidden">
          {/* Month Navigation */}
          <div className="flex items-center justify-between p-4 border-b border-sand-dark/20">
            <button onClick={prevMonth} className="p-2 hover:bg-sand/40 rounded-xl transition-colors"><ChevronLeft size={18} /></button>
            <div className="text-center">
              <h2 className="text-lg font-black text-surface-dark">{MONTHS_NL[month]} {year}</h2>
              <button onClick={goToday} className="text-xs text-accent font-semibold hover:underline">Vandaag</button>
            </div>
            <button onClick={nextMonth} className="p-2 hover:bg-sand/40 rounded-xl transition-colors"><ChevronRight size={18} /></button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 border-b border-sand-dark/20">
            {DAYS_NL.map(d => (
              <div key={d} className="text-center text-[11px] font-semibold text-warm-gray/70 py-2">{d}</div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7">
            {/* Empty cells before first day */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[80px] border-b border-r border-sand-dark/10 bg-sand/40/30" />
            ))}

            {/* Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayEvents = getEventsForDate(dateStr);
              const isToday = dateStr === today;
              const isSelected = dateStr === selectedDate;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(dateStr === selectedDate ? null : dateStr)}
                  className={`min-h-[80px] border-b border-r border-sand-dark/10 p-1.5 text-left transition-all hover:bg-accent/[0.03] ${isSelected ? 'bg-accent/[0.06] ring-1 ring-inset ring-primary/20' : ''}`}
                >
                  <span className={`inline-flex items-center justify-center w-7 h-7 text-xs font-bold rounded-full ${isToday ? 'bg-accent text-white' : 'text-warm-gray'}`}>{day}</span>
                  <div className="mt-1 space-y-0.5">
                    {dayEvents.slice(0, 3).map(e => (
                      <div key={e.id} className="flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${TYPE_COLORS[e.type] || 'bg-warm-gray'}`} />
                        <span className="text-[10px] text-warm-gray truncate">{e.title}</span>
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <span className="text-[10px] text-accent font-semibold">+{dayEvents.length - 3} meer</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sidebar - Selected Day Events */}
        <div className="space-y-4">
          {/* Legend */}
          <div className="bg-surface rounded-2xl border border-sand-dark/20 p-4">
            <h3 className="text-xs font-bold text-warm-gray/70 uppercase tracking-wider mb-3">Legenda</h3>
            <div className="space-y-2">
              {Object.entries(TYPE_LABELS).map(([key, label]) => (
                <div key={key} className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${TYPE_COLORS[key]}`} />
                  <span className="text-xs text-warm-gray">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Events */}
          <div className="bg-surface rounded-2xl border border-sand-dark/20 p-4">
            <h3 className="text-xs font-bold text-warm-gray/70 uppercase tracking-wider mb-3">
              {selectedDate ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Selecteer een datum'}
            </h3>
            {selectedDate ? (
              selectedEvents.length > 0 ? (
                <div className="space-y-2">
                  {selectedEvents.map(e => (
                    <div key={e.id} className="flex items-start gap-3 p-3 bg-sand/40 rounded-xl">
                      <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${TYPE_COLORS[e.type]}`} />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-surface-dark truncate">{e.title}</p>
                        <p className="text-xs text-warm-gray/70">{e.subtitle}</p>
                        <span className="text-[10px] font-semibold text-warm-gray/50 mt-1 block">{TYPE_LABELS[e.type]}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Calendar size={24} className="text-warm-gray/40 mx-auto mb-2" />
                  <p className="text-xs text-warm-gray/70">Geen items op deze datum</p>
                </div>
              )
            ) : (
              <div className="text-center py-6">
                <Calendar size={24} className="text-warm-gray/40 mx-auto mb-2" />
                <p className="text-xs text-warm-gray/70">Klik op een datum voor details</p>
              </div>
            )}
          </div>

          {/* Upcoming Events */}
          <div className="bg-surface rounded-2xl border border-sand-dark/20 p-4">
            <h3 className="text-xs font-bold text-warm-gray/70 uppercase tracking-wider mb-3">Komende items</h3>
            <div className="space-y-2">
              {filteredEvents
                .filter(e => e.date >= today)
                .sort((a, b) => a.date.localeCompare(b.date))
                .slice(0, 8)
                .map(e => (
                  <button
                    key={e.id}
                    onClick={() => { setSelectedDate(e.date); setCurrentDate(new Date(e.date + 'T00:00:00')); }}
                    className="w-full flex items-start gap-3 p-2.5 hover:bg-sand/40 rounded-xl transition-colors text-left"
                  >
                    <div className="text-center shrink-0">
                      <div className="text-[10px] text-warm-gray/70 font-semibold">{new Date(e.date + 'T00:00:00').toLocaleDateString('nl-NL', { month: 'short' })}</div>
                      <div className="text-lg font-black text-surface-dark">{new Date(e.date + 'T00:00:00').getDate()}</div>
                    </div>
                    <div className="min-w-0 pt-0.5">
                      <p className="text-xs font-semibold text-surface-dark truncate">{e.title}</p>
                      <p className="text-[10px] text-warm-gray/70 truncate">{e.subtitle}</p>
                    </div>
                    <span className={`w-2 h-2 rounded-full mt-2 shrink-0 ${TYPE_COLORS[e.type]}`} />
                  </button>
                ))}
              {filteredEvents.filter(e => e.date >= today).length === 0 && (
                <p className="text-xs text-warm-gray/70 text-center py-4">Geen komende items</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
