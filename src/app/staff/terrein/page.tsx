'use client';

import { useState, useEffect } from 'react';
import { MapPin, ChevronDown, ChevronUp } from 'lucide-react';

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
      <h1 className="text-2xl font-black text-surface-dark mb-6">Terreinoverzicht</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-accent/20 border border-green-400" /><span className="text-sm">Vrij</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-ocean/20 border border-blue-400" /><span className="text-sm">Bezet</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-warning/20 border border-warning" /><span className="text-sm">Gereserveerd</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-danger/20 border border-red-400" /><span className="text-sm">Onderhoud</span></div>
      </div>

      <div className="space-y-4">
        {locations.map(loc => {
          const occupancy = loc.total_spots > 0 ? Math.round((loc.occupied_spots / loc.total_spots) * 100) : 0;
          const expanded = expandedId === loc.id;
          return (
            <div key={loc.id} className="bg-surface rounded-2xl border border-sand-dark/20 overflow-hidden hover:shadow-lg hover:shadow-sand-dark/20 transition-all">
              <button onClick={() => toggleLocation(loc.id)} className="w-full p-5 flex items-center justify-between text-left">
                <div className="flex items-center gap-3">
                  <MapPin size={20} className="text-accent" />
                  <div><h3 className="font-semibold text-surface-dark">{loc.name}</h3><p className="text-xs text-warm-gray/70">{loc.address}</p></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right"><div className="text-sm font-medium text-surface-dark">{loc.occupied_spots}/{loc.total_spots}</div><div className="w-24 h-2 bg-sand rounded-full overflow-hidden"><div className="h-full bg-accent/100 rounded-full" style={{width:`${occupancy}%`}} /></div></div>
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
                        <h4 className="text-xs font-semibold text-warm-gray/70 uppercase tracking-wide mb-2">Zone {zone}</h4>
                        <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-1.5">
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
            </div>
          );
        })}
      </div>
    </div>
  );
}
