'use client';

import { useState, useEffect } from 'react';
import { MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface Location { id: number; name: string; address: string; total_spots: number; occupied_spots: number; }
interface Spot { id: number; label: string; zone: string; spot_type: string; status: string; caravan_brand: string; caravan_model: string; caravan_license_plate: string; customer_name: string; }

const SPOT_COLORS: Record<string,string> = { vrij: 'bg-accent/15 border-accent/40 text-accent-dark', bezet: 'bg-ocean/15 border-ocean/40 text-ocean-dark', gereserveerd: 'bg-warning/15 border-warning/40 text-warning', onderhoud: 'bg-danger/15 border-danger/40 text-danger' };

export default function StaffTerreinPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [spots, setSpots] = useState<Spot[]>([]);
  const [spotsLoading, setSpotsLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/staff/locations', { credentials: 'include' })
      .then(r => r.json())
      .then(data => setLocations(data.locations || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleLocation = async (id: number) => {
    if (expandedId === id) { setExpandedId(null); return; }
    setExpandedId(id); setSpotsLoading(true); setSpots([]);
    const res = await fetch(`/api/staff/locations/${id}/spots`, { credentials: 'include' });
    const data = await res.json();
    setSpots(data.spots || []); setSpotsLoading(false);
  };

  const zones = [...new Set(spots.map(s => s.zone))].sort();

  if (loading) return <div className="flex items-center justify-center py-12"><div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-black text-surface-dark mb-6">Terreinoverzicht</motion.h1>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card-premium p-4 mb-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-2.5"><div className="w-5 h-5 rounded-lg bg-accent/20 border-2 border-accent/60" /><span className="text-sm font-medium">Vrij</span></div>
          <div className="flex items-center gap-2.5"><div className="w-5 h-5 rounded-lg bg-ocean/20 border-2 border-ocean/60" /><span className="text-sm font-medium">Bezet</span></div>
          <div className="flex items-center gap-2.5"><div className="w-5 h-5 rounded-lg bg-warning/20 border-2 border-warning/60" /><span className="text-sm font-medium">Gereserveerd</span></div>
          <div className="flex items-center gap-2.5"><div className="w-5 h-5 rounded-lg bg-danger/20 border-2 border-danger/60" /><span className="text-sm font-medium">Onderhoud</span></div>
        </div>
      </motion.div>

      <div className="space-y-4">
        {locations.map((loc, i) => {
          const occupancy = loc.total_spots > 0 ? Math.round((loc.occupied_spots / loc.total_spots) * 100) : 0;
          const expanded = expandedId === loc.id;
          return (
            <motion.div key={loc.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.06 }}
              className="card-premium overflow-hidden">
              <button onClick={() => toggleLocation(loc.id)} className="w-full p-5 flex items-center justify-between text-left">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-accent/15 to-accent/5 rounded-xl flex items-center justify-center shadow-sm">
                    <MapPin size={18} className="text-accent" />
                  </div>
                  <div><h3 className="font-bold text-surface-dark">{loc.name}</h3><p className="text-xs text-warm-gray/70">{loc.address}</p></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right"><div className="stat-number text-sm">{loc.occupied_spots}/{loc.total_spots}</div><div className="w-24 h-2.5 bg-sand rounded-full overflow-hidden mt-1"><motion.div initial={{ width: 0 }} animate={{ width: `${occupancy}%` }} transition={{ duration: 0.6, delay: 0.2 }} className="h-full bg-gradient-to-r from-accent to-accent-light rounded-full" /></div></div>
                  {expanded ? <ChevronUp size={16} className="text-warm-gray/70" /> : <ChevronDown size={16} className="text-warm-gray/70" />}
                </div>
              </button>

              {expanded && (
                <div className="border-t border-sand-dark/20 px-5 pb-5">
                  {spotsLoading ? <div className="py-6 text-center text-sm text-warm-gray/70">Laden...</div> :
                  zones.length === 0 ? <div className="py-6 text-center text-sm text-warm-gray/70">Geen plekken geconfigureerd</div> :
                  zones.map(zone => {
                    const zoneSpots = spots.filter(s => s.zone === zone);
                    return (
                      <div key={zone} className="mt-4">
                        <h4 className="text-xs font-bold text-warm-gray/60 uppercase tracking-wider mb-2">Zone {zone}</h4>
                        <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
                          {zoneSpots.map(spot => (
                            <div key={spot.id} className={`border rounded-lg p-1.5 text-center text-xs cursor-default group relative ${SPOT_COLORS[spot.status] || 'bg-sand'}`} title={spot.status === 'bezet' ? `${spot.caravan_brand} ${spot.caravan_model}\n${spot.caravan_license_plate}\n${spot.customer_name}` : spot.status}>
                              <div className="font-medium">{spot.label}</div>
                              <div className="text-xs opacity-60">{spot.spot_type === 'binnen' ? 'B' : 'U'}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
