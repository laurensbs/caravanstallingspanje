'use client';
import { fmtDate } from '@/lib/format';
import { Caravan, MapPin, Calendar, CheckCircle2, Clock, Shield, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import type { CaravanItem } from './types';

interface Props { caravans: CaravanItem[]; }

export default function CaravansTab({ caravans }: Props) {
  return (
    <div className="space-y-4">
      {caravans.length === 0 ? (
        <div className="card-premium p-14 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Caravan className="text-warm-gray/40" size={28}/>
          </div>
          <p className="text-warm-gray/70 font-bold text-lg mb-1">Geen caravans gevonden</p>
          <p className="text-warm-gray/50 text-sm">Neem contact op om uw caravan te registreren</p>
        </div>
      ) : caravans.map((c, i) => {
        const insuranceExpired = c.insurance_expiry && new Date(c.insurance_expiry) < new Date();
        const apkExpired = c.apk_expiry && new Date(c.apk_expiry) < new Date();
        const hasWarning = insuranceExpired || apkExpired;

        return (
          <motion.div key={c.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.08 }}
            className="card-premium p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-ocean/15 to-ocean/5 rounded-xl flex items-center justify-center shadow-sm">
                  <Caravan size={20} className="text-ocean" />
                </div>
                <div>
                  <h3 className="font-black text-surface-dark text-lg">{c.brand} {c.model}</h3>
                  <p className="text-sm text-warm-gray/60 font-medium">{c.license_plate}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {hasWarning && (
                  <span className="text-xs font-bold px-2.5 py-1.5 rounded-full bg-danger/10 text-danger border border-danger/20 flex items-center gap-1">
                    <AlertTriangle size={11} /> Actie vereist
                  </span>
                )}
                <span className={`text-xs font-bold px-3 py-1.5 rounded-full border flex items-center gap-1.5 ${c.status === 'gestald' ? 'bg-accent/10 text-accent border-accent/25' : 'bg-ocean/10 text-ocean border-ocean/25'}`}>
                  {c.status === 'gestald' ? <CheckCircle2 size={11} /> : <Clock size={11} />} {c.status}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { icon: MapPin, label: 'Locatie', value: c.location_name || '-', color: 'text-accent' },
                { icon: Shield, label: 'Plek', value: c.spot_label || '-', color: 'text-ocean' },
                { icon: Calendar, label: 'Verzekering', value: fmtDate(c.insurance_expiry), warn: insuranceExpired, color: 'text-primary' },
                { icon: Calendar, label: 'APK', value: fmtDate(c.apk_expiry), warn: apkExpired, color: 'text-warning' },
              ].map(f => (
                <div key={f.label} className={`rounded-xl p-3.5 border transition-all ${f.warn ? 'bg-danger/[0.04] border-danger/20' : 'bg-sand/40 border-sand-dark/15'}`}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <f.icon size={12} className={f.warn ? 'text-danger' : f.color} />
                    <span className="text-warm-gray/60 text-xs font-bold uppercase tracking-wider">{f.label}</span>
                  </div>
                  <span className={`font-bold text-sm ${f.warn ? 'text-danger' : 'text-surface-dark'}`}>{f.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
