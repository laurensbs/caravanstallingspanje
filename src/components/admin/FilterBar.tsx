'use client';
import { useState } from 'react';
import { Search, X, SlidersHorizontal, ArrowUpDown, Calendar } from 'lucide-react';

export interface FilterConfig {
  search?: { placeholder: string };
  statuses?: { value: string; label: string }[];
  dateRange?: { label: string };
  sort?: { options: { value: string; label: string }[] };
}

interface Props {
  config: FilterConfig;
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onReset: () => void;
}

export default function FilterBar({ config, values, onChange, onReset }: Props) {
  const [expanded, setExpanded] = useState(false);
  const activeCount = Object.values(values).filter(v => v && v !== 'created_at' && v !== 'desc').length;

  return (
    <div className="bg-surface rounded-2xl border border-sand-dark/20 mb-6 p-4 space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        {config.search && (
          <div className="flex items-center gap-2 bg-sand/40 rounded-xl px-3.5 py-2.5 border border-sand-dark/20 flex-1 min-w-[200px]">
            <Search size={15} className="text-warm-gray/50" />
            <input
              placeholder={config.search.placeholder}
              value={values.search || ''}
              onChange={e => onChange('search', e.target.value)}
              className="bg-transparent text-sm outline-none flex-1 text-warm-gray placeholder:text-warm-gray/50"
            />
            {values.search && <button onClick={() => onChange('search', '')} aria-label="Wissen"><X size={14} className="text-warm-gray/70" /></button>}
          </div>
        )}

        {/* Status pills — always visible */}
        {config.statuses && (
          <div className="flex gap-1.5 flex-wrap">
            {config.statuses.map(s => (
              <button key={s.value} onClick={() => onChange('status', values.status === s.value ? '' : s.value)}
                className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all ${values.status === s.value ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-sand/40 hover:bg-sand-dark/20 text-warm-gray'}`}>
                {s.label}
              </button>
            ))}
          </div>
        )}

        {/* Toggle advanced */}
        {(config.dateRange || config.sort) && (
          <button onClick={() => setExpanded(!expanded)} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all border ${expanded ? 'bg-primary/10 text-primary border-primary/30' : 'bg-sand/40 text-warm-gray border-sand-dark/20 hover:bg-sand-dark/20'}`}>
            <SlidersHorizontal size={14} /> Filters
            {activeCount > 0 && <span className="bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{activeCount}</span>}
          </button>
        )}

        {activeCount > 0 && (
          <button onClick={onReset} className="text-xs text-warm-gray/70 hover:text-warm-gray underline">Wis filters</button>
        )}
      </div>

      {/* Advanced filters */}
      {expanded && (
        <div className="flex flex-wrap items-end gap-4 pt-2 border-t border-sand-dark/10">
          {config.dateRange && (
            <div className="flex items-end gap-2">
              <div>
                <label className="text-xs font-semibold text-warm-gray/70 block mb-1"><Calendar size={11} className="inline mr-1" />{config.dateRange.label} van</label>
                <input type="date" value={values.dateFrom || ''} onChange={e => onChange('dateFrom', e.target.value)} className="border border-sand-dark/30 rounded-xl px-3 py-2 text-sm bg-sand/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
              </div>
              <div>
                <label className="text-xs font-semibold text-warm-gray/70 block mb-1">t/m</label>
                <input type="date" value={values.dateTo || ''} onChange={e => onChange('dateTo', e.target.value)} className="border border-sand-dark/30 rounded-xl px-3 py-2 text-sm bg-sand/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
              </div>
            </div>
          )}
          {config.sort && (
            <div>
              <label className="text-xs font-semibold text-warm-gray/70 block mb-1"><ArrowUpDown size={11} className="inline mr-1" />Sorteren</label>
              <div className="flex gap-1">
                <select value={values.sort || 'created_at'} onChange={e => onChange('sort', e.target.value)} className="border border-sand-dark/30 rounded-xl px-3 py-2 text-sm bg-sand/40 focus:outline-none focus:ring-2 focus:ring-primary/20 outline-none transition-all">
                  {config.sort.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <button onClick={() => onChange('order', values.order === 'asc' ? 'desc' : 'asc')} className="px-2.5 py-2 border border-sand-dark/30 rounded-xl bg-sand/40 text-sm text-warm-gray hover:bg-sand-dark/20 transition-all" title={values.order === 'asc' ? 'Oplopend' : 'Aflopend'}>
                  {values.order === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
