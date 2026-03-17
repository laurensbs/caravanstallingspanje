'use client';

import { useState, useEffect } from 'react';
import { MapPin, ChevronDown, ChevronUp } from 'lucide-react';

interface Location { id: number; name: string; address: string; total_spots: number; occupied_spots: number; }
interface Spot { id: number; label: string; zone: string; spot_type: string; status: string; caravan_brand: string; caravan_model: string; caravan_license_plate: string; customer_name: string; }

const SPOT_COLORS: Record<string,string> = { vrij: 'bg-green-100 border-green-300 text-green-700', bezet: 'bg-blue-100 border-blue-300 text-blue-700', gereserveerd: 'bg-amber-100 border-amber-300 text-amber-700', onderhoud: 'bg-red-100 border-red-300 text-red-700' };

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

  if (loading) return <div className="flex items-center justify-center py-12"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Terreinoverzicht</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-green-200 border border-green-400" /><span className="text-sm">Vrij</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-blue-200 border border-blue-400" /><span className="text-sm">Bezet</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-amber-200 border border-amber-400" /><span className="text-sm">Gereserveerd</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-red-200 border border-red-400" /><span className="text-sm">Onderhoud</span></div>
      </div>

      <div className="space-y-4">
        {locations.map(loc => {
          const occupancy = loc.total_spots > 0 ? Math.round((loc.occupied_spots / loc.total_spots) * 100) : 0;
          const expanded = expandedId === loc.id;
          return (
            <div key={loc.id} className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              <button onClick={() => toggleLocation(loc.id)} className="w-full p-5 flex items-center justify-between text-left">
                <div className="flex items-center gap-3">
                  <MapPin size={20} className="text-primary" />
                  <div><h3 className="font-semibold">{loc.name}</h3><p className="text-xs text-muted">{loc.address}</p></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right"><div className="text-sm font-medium">{loc.occupied_spots}/{loc.total_spots}</div><div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full" style={{width:`${occupancy}%`}} /></div></div>
                  {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </button>

              {expanded && (
                <div className="border-t px-5 pb-5">
                  {spotsLoading ? <div className="py-6 text-center text-sm text-muted">Laden...</div> :
                  zones.length === 0 ? <div className="py-6 text-center text-sm text-muted">Geen plekken geconfigureerd</div> :
                  zones.map(zone => {
                    const zoneSpots = spots.filter(s => s.zone === zone);
                    return (
                      <div key={zone} className="mt-4">
                        <h4 className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Zone {zone}</h4>
                        <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-1.5">
                          {zoneSpots.map(spot => (
                            <div key={spot.id} className={`border rounded-lg p-1.5 text-center text-xs cursor-default group relative ${SPOT_COLORS[spot.status] || 'bg-gray-100'}`} title={spot.status === 'bezet' ? `${spot.caravan_brand} ${spot.caravan_model}\n${spot.caravan_license_plate}\n${spot.customer_name}` : spot.status}>
                              <div className="font-medium">{spot.label}</div>
                              <div className="text-[10px] opacity-60">{spot.spot_type === 'binnen' ? 'B' : 'U'}</div>
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
