'use client';
import { fmtDate } from '@/lib/format';
import { Caravan, MapPin, Calendar, CheckCircle2, Clock } from 'lucide-react';
import type { CaravanItem } from './types';

interface Props { caravans: CaravanItem[]; }

export default function CaravansTab({ caravans }: Props) {
  return (
    <div className="space-y-4">
      {caravans.length === 0 ? (
        <div className="bg-surface rounded-2xl border border-sand-dark/20 p-12 text-center">
          <div className="w-14 h-14 bg-sand/40 rounded-2xl flex items-center justify-center mx-auto mb-4"><Caravan className="text-warm-gray/50" size={24}/></div>
          <p className="text-warm-gray/70 font-medium">Geen caravans gevonden</p>
        </div>
      ) : caravans.map(c => (
        <div key={c.id} className="bg-surface rounded-2xl border border-sand-dark/20 p-6 hover:shadow-lg hover:shadow-sand-dark/20 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 bg-ocean/10 rounded-xl flex items-center justify-center"><Caravan size={18} className="text-ocean" /></div>
              <div><h3 className="font-bold text-surface-dark">{c.brand} {c.model}</h3><p className="text-sm text-warm-gray/70">{c.license_plate}</p></div>
            </div>
            <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${c.status === 'gestald' ? 'bg-accent/10 text-primary-dark border-accent/30' : 'bg-ocean/10 text-ocean-dark border-ocean/30'}`}>{c.status}</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {[
              { icon: MapPin, label: 'Locatie', value: c.location_name || '-' },
              { icon: MapPin, label: 'Plek', value: c.spot_label || '-' },
              { icon: Calendar, label: 'Verzekering verloopt', value: fmtDate(c.insurance_expiry), warn: c.insurance_expiry && new Date(c.insurance_expiry) < new Date() },
              { icon: Calendar, label: 'APK verloopt', value: fmtDate(c.apk_expiry), warn: c.apk_expiry && new Date(c.apk_expiry) < new Date() },
            ].map(f => (
              <div key={f.label} className="bg-sand/60 rounded-xl p-3">
                <span className="text-warm-gray/70 text-xs font-medium block mb-0.5">{f.label}</span>
                <span className={`font-medium ${f.warn ? 'text-danger' : 'text-surface-dark'}`}>{f.value}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
