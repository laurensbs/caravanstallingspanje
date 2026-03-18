'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Plus, X, CheckCircle, Camera, AlertTriangle, Trash2, RotateCcw, ChevronRight, SwitchCamera } from 'lucide-react';

interface Inspection {
  id: number; caravan_brand: string; caravan_model: string; caravan_license_plate: string;
  spot_label: string; location_name: string; inspection_type: string; status: string;
  checklist: Record<string, boolean>; notes: string; photos: string[]; inspected_at: string; created_at: string;
}

interface CapturedPhoto { data: string; caption: string; }

const CHECKLIST_ITEMS = [
  { key: 'exterior_condition', label: 'Exterieur conditie', emoji: '🏠' },
  { key: 'tires_condition', label: 'Banden conditie', emoji: '🔧' },
  { key: 'roof_seals', label: 'Dakranden/afdichting', emoji: '🛡️' },
  { key: 'windows_doors', label: 'Ramen en deuren', emoji: '🪟' },
  { key: 'mover_system', label: 'Moversysteem', emoji: '⚡' },
  { key: 'battery_check', label: 'Accu controle', emoji: '🔋' },
  { key: 'gas_system', label: 'Gassysteem', emoji: '🔥' },
  { key: 'water_system', label: 'Watersysteem', emoji: '💧' },
  { key: 'general_cleanliness', label: 'Algemene netheid', emoji: '✨' },
  { key: 'security_check', label: 'Beveiliging', emoji: '🔒' },
];

export default function StaffInspectiesPage() {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [caravans, setCaravans] = useState<{id:number;brand:string;model:string;license_plate:string}[]>([]);
  const [checklist, setChecklist] = useState<Record<string,boolean>>(Object.fromEntries(CHECKLIST_ITEMS.map(i => [i.key, false])));
  const [form, setForm] = useState({ caravan_id: '', inspection_type: 'tweewekelijks', notes: '' });
  const [filter, setFilter] = useState('');
  const [photos, setPhotos] = useState<CapturedPhoto[]>([]);
  const [formStep, setFormStep] = useState(0); // 0=caravan, 1=checklist, 2=photos, 3=notes
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [expandedInspection, setExpandedInspection] = useState<number | null>(null);

  // Camera refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter) params.set('status', filter);
    const res = await fetch(`/api/staff/inspections?${params}`, { credentials: 'include' });
    const data = await res.json();
    setInspections(data.inspections || []);
    setLoading(false);
  }, [filter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Camera management
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 960 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
      setShowCamera(true);
    } catch {
      alert('Camera niet beschikbaar op dit apparaat');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const switchCamera = async () => {
    stopCamera();
    const newMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newMode);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: newMode, width: { ideal: 1280 }, height: { ideal: 960 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
      setShowCamera(true);
    } catch { /* ignore */ }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    // Compress to JPEG at 0.7 quality
    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
    setPhotos(prev => [...prev, { data: dataUrl, caption: '' }]);
    // Flash effect
    canvas.style.opacity = '1';
    setTimeout(() => { canvas.style.opacity = '0'; }, 100);
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const startInspection = async () => {
    const res = await fetch('/api/staff/caravans', { credentials: 'include' });
    const data = await res.json();
    setCaravans(data.caravans || []);
    setChecklist(Object.fromEntries(CHECKLIST_ITEMS.map(i => [i.key, false])));
    setForm({ caravan_id: '', inspection_type: 'tweewekelijks', notes: '' });
    setPhotos([]);
    setFormStep(0);
    setShowForm(true);
  };

  const handleSubmit = async () => {
    // Create inspection
    const res = await fetch('/api/staff/inspections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, checklist, status: 'afgerond' }),
      credentials: 'include',
    });
    const result = await res.json();

    // Upload photos if any
    if (result.inspection?.id && photos.length > 0) {
      for (const photo of photos) {
        await fetch('/api/staff/inspections/photos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            inspection_id: result.inspection.id,
            photo_data: photo.data,
            caption: photo.caption,
          }),
          credentials: 'include',
        });
      }
    }

    setShowForm(false);
    stopCamera();
    fetchData();
  };

  const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' }) : '-';
  const passedCount = (c: Record<string,boolean>) => Object.values(c).filter(Boolean).length;
  const passedPct = (c: Record<string,boolean>) => Math.round((passedCount(c) / CHECKLIST_ITEMS.length) * 100);

  const STEPS = ['Caravan', 'Checklist', 'Foto\'s', 'Notities'];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl md:text-2xl font-black text-surface-dark">Inspecties</h1>
        <button onClick={startInspection} className="bg-accent hover:bg-accent-dark text-white font-bold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-accent/20 transition-all">
          <Plus size={16} /> <span className="hidden sm:inline">Nieuwe inspectie</span><span className="sm:hidden">Nieuw</span>
        </button>
      </div>

      {/* Filters - horizontal scroll on mobile */}
      <div className="bg-surface rounded-2xl border border-sand-dark/20 mb-5 p-3">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {['', 'gepland', 'afgerond'].map(s => (
            <button key={s} onClick={() => setFilter(s)} className={`px-3.5 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${filter === s ? 'bg-accent text-white shadow-md shadow-accent/20' : 'bg-sand/40 hover:bg-sand-dark/20 text-warm-gray'}`}>
              {s || 'Alle'}
            </button>
          ))}
        </div>
      </div>

      {/* Inspection list - card based for mobile */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-surface rounded-2xl border border-sand-dark/20 p-8 text-center">
            <div className="animate-spin w-6 h-6 border-2 border-accent border-t-transparent rounded-full mx-auto" />
          </div>
        ) : inspections.length === 0 ? (
          <div className="bg-surface rounded-2xl border border-sand-dark/20 p-10 text-center">
            <Search size={28} className="text-warm-gray/40 mx-auto mb-3" />
            <p className="text-sm text-warm-gray/70 font-medium">Geen inspecties gevonden</p>
          </div>
        ) : inspections.map(insp => {
          const cl = insp.checklist || {};
          const pct = passedPct(cl);
          const expanded = expandedInspection === insp.id;
          return (
            <div key={insp.id} className="bg-surface rounded-2xl border border-sand-dark/20 overflow-hidden hover:shadow-lg hover:shadow-sand-dark/20 transition-all">
              <button onClick={() => setExpandedInspection(expanded ? null : insp.id)} className="w-full p-4 flex items-center gap-3 text-left">
                {/* Score circle */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${pct === 100 ? 'bg-accent/15' : pct >= 70 ? 'bg-warning/15' : 'bg-danger/15'}`}>
                  <span className={`text-sm font-black ${pct === 100 ? 'text-primary-dark' : pct >= 70 ? 'text-warning' : 'text-danger'}`}>{pct}%</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-surface-dark truncate">{insp.caravan_brand} {insp.caravan_model}</h3>
                  <p className="text-xs text-warm-gray/70 truncate">{insp.caravan_license_plate} · {insp.location_name}</p>
                  <p className="text-[11px] text-warm-gray/50 mt-0.5">{fmtDate(insp.inspected_at || insp.created_at)}</p>
                </div>
                <ChevronRight size={16} className={`text-warm-gray/50 transition-transform ${expanded ? 'rotate-90' : ''}`} />
              </button>
              
              {expanded && (
                <div className="px-4 pb-4 border-t border-sand-dark/10">
                  {/* Checklist badges */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {CHECKLIST_ITEMS.map(item => (
                      <span key={item.key} className={`text-xs px-2 py-0.5 rounded-full ${cl[item.key] ? 'bg-accent/15 text-primary-dark' : 'bg-danger/15 text-danger'}`}>
                        {item.emoji} {item.label}
                      </span>
                    ))}
                  </div>
                  {insp.notes && <p className="text-sm text-warm-gray/70 mt-3 italic">{insp.notes}</p>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Full-screen inspection wizard (mobile-first) */}
      {showForm && (
        <div className="fixed inset-0 bg-surface z-50 flex flex-col md:bg-black/60 md:backdrop-blur-sm md:items-center md:justify-center md:p-4">
          <div className="flex-1 flex flex-col md:bg-surface md:rounded-2xl md:w-full md:max-w-lg md:max-h-[90vh] md:flex-initial md:shadow-2xl">
            {/* Wizard header */}
            <div className="flex items-center justify-between p-4 border-b border-sand-dark/20 shrink-0">
              <div>
                <h2 className="text-lg font-bold text-surface-dark">Nieuwe inspectie</h2>
                <p className="text-xs text-warm-gray/70">Stap {formStep + 1} van {STEPS.length}: {STEPS[formStep]}</p>
              </div>
              <button onClick={() => { setShowForm(false); stopCamera(); }} className="text-warm-gray/70 hover:text-warm-gray p-1"><X size={20}/></button>
            </div>

            {/* Progress bar */}
            <div className="flex gap-1 px-4 pt-3 shrink-0">
              {STEPS.map((_, i) => (
                <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= formStep ? 'bg-accent/100' : 'bg-sand'}`} />
              ))}
            </div>

            {/* Step content */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* Step 0: Select caravan & type */}
              {formStep === 0 && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-warm-gray uppercase tracking-wider block mb-2">Caravan *</label>
                    <select required value={form.caravan_id} onChange={e=>setForm({...form,caravan_id:e.target.value})} className="w-full border border-sand-dark/30 rounded-xl px-4 py-3 text-sm bg-sand/40 focus:ring-2 focus:ring-accent/20 outline-none">
                      <option value="">Selecteer caravan</option>
                      {caravans.map(c => <option key={c.id} value={c.id}>{c.brand} {c.model} — {c.license_plate}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-warm-gray uppercase tracking-wider block mb-2">Type inspectie</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: 'tweewekelijks', label: '2-wekelijks' },
                        { value: 'jaarlijks', label: 'Jaarlijks' },
                        { value: 'ad_hoc', label: 'Ad hoc' },
                      ].map(t => (
                        <button key={t.value} type="button" onClick={() => setForm({...form, inspection_type: t.value})} className={`py-3 rounded-xl text-sm font-semibold transition-all ${form.inspection_type === t.value ? 'bg-accent/100 text-white shadow-md' : 'bg-sand/40 text-warm-gray hover:bg-sand-dark/20'}`}>
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 1: Checklist - big tap targets */}
              {formStep === 1 && (
                <div className="space-y-2">
                  <p className="text-sm text-warm-gray/70 mb-3">Tik op elk item dat in orde is</p>
                  {CHECKLIST_ITEMS.map(item => (
                    <button key={item.key} type="button" onClick={() => setChecklist({...checklist, [item.key]: !checklist[item.key]})} className={`w-full flex items-center gap-3 p-4 rounded-xl text-left transition-all ${checklist[item.key] ? 'bg-accent/10 border-2 border-accent-light' : 'bg-sand/40 border-2 border-transparent'}`}>
                      <span className="text-xl">{item.emoji}</span>
                      <span className={`text-sm font-medium flex-1 ${checklist[item.key] ? 'text-accent-dark' : 'text-warm-gray'}`}>{item.label}</span>
                      {checklist[item.key] ? (
                        <CheckCircle size={20} className="text-accent shrink-0" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-sand-dark/30 shrink-0" />
                      )}
                    </button>
                  ))}
                  <div className="mt-4 p-3 bg-sand/40 rounded-xl text-center">
                    <span className="text-sm font-bold text-warm-gray">{passedCount(checklist)} / {CHECKLIST_ITEMS.length} items goedgekeurd</span>
                  </div>
                </div>
              )}

              {/* Step 2: Camera & Photos */}
              {formStep === 2 && (
                <div className="space-y-4">
                  <p className="text-sm text-warm-gray/70">Maak foto&apos;s van eventuele schade of bijzonderheden</p>
                  
                  {/* Camera viewfinder */}
                  {showCamera ? (
                    <div className="relative rounded-2xl overflow-hidden bg-black aspect-[4/3]">
                      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-0 transition-opacity" />
                      {/* Camera controls */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-10">
                        <div className="flex items-center justify-center gap-6">
                          <button onClick={switchCamera} className="w-10 h-10 rounded-full bg-surface/20 backdrop-blur flex items-center justify-center text-white"><SwitchCamera size={18}/></button>
                          <button onClick={capturePhoto} className="w-16 h-16 rounded-full bg-surface border-4 border-white/50 shadow-lg active:scale-90 transition-transform" />
                          <button onClick={stopCamera} className="w-10 h-10 rounded-full bg-surface/20 backdrop-blur flex items-center justify-center text-white"><X size={18}/></button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button onClick={startCamera} className="w-full aspect-[4/3] rounded-2xl border-2 border-dashed border-sand-dark/30 flex flex-col items-center justify-center gap-3 bg-sand/40 hover:bg-sand-dark/20 transition-colors">
                      <Camera size={32} className="text-warm-gray/50" />
                      <span className="text-sm font-semibold text-warm-gray/70">Camera openen</span>
                    </button>
                  )}

                  {/* Photo grid */}
                  {photos.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {photos.map((photo, i) => (
                        <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                          <img src={photo.data} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                          <button onClick={() => removePhoto(i)} className="absolute top-1 right-1 w-6 h-6 bg-danger/100 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 md:opacity-0 md:group-hover:opacity-100 active:opacity-100 transition-opacity">
                            <Trash2 size={12}/>
                          </button>
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                            <input type="text" placeholder="Notitie..." value={photo.caption} onChange={e => { const newPhotos = [...photos]; newPhotos[i].caption = e.target.value; setPhotos(newPhotos); }} className="w-full text-[10px] text-white bg-transparent outline-none placeholder:text-white/60" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <p className="text-xs text-warm-gray/50 text-center">{photos.length} foto{photos.length !== 1 ? '\'s' : ''} toegevoegd</p>
                </div>
              )}

              {/* Step 3: Notes & Summary */}
              {formStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-warm-gray uppercase tracking-wider block mb-2">Opmerkingen</label>
                    <textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} className="w-full border border-sand-dark/30 rounded-xl px-4 py-3 text-sm bg-sand/40 focus:ring-2 focus:ring-accent/20 outline-none" rows={4} placeholder="Eventuele bijzonderheden, schade, etc." />
                  </div>

                  {/* Summary */}
                  <div className="bg-sand/40 rounded-xl p-4 space-y-3">
                    <h3 className="font-bold text-sm text-surface-dark">Samenvatting</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-warm-gray/70">Caravan</div>
                      <div className="font-medium text-surface-dark">{caravans.find(c => String(c.id) === form.caravan_id)?.brand || '-'} {caravans.find(c => String(c.id) === form.caravan_id)?.model || ''}</div>
                      <div className="text-warm-gray/70">Type</div>
                      <div className="font-medium text-surface-dark capitalize">{form.inspection_type}</div>
                      <div className="text-warm-gray/70">Score</div>
                      <div className={`font-bold ${passedPct(checklist) === 100 ? 'text-accent' : passedPct(checklist) >= 70 ? 'text-warning' : 'text-danger'}`}>
                        {passedCount(checklist)}/{CHECKLIST_ITEMS.length} ({passedPct(checklist)}%)
                      </div>
                      <div className="text-warm-gray/70">Foto&apos;s</div>
                      <div className="font-medium text-surface-dark">{photos.length}</div>
                    </div>
                    
                    {/* Failed items */}
                    {CHECKLIST_ITEMS.filter(item => !checklist[item.key]).length > 0 && (
                      <div className="mt-2 pt-2 border-t border-sand-dark/30">
                        <p className="text-xs font-bold text-danger mb-1.5">Niet goedgekeurd:</p>
                        <div className="flex flex-wrap gap-1">
                          {CHECKLIST_ITEMS.filter(item => !checklist[item.key]).map(item => (
                            <span key={item.key} className="text-xs bg-danger/15 text-danger px-2 py-0.5 rounded-full">{item.emoji} {item.label}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Navigation buttons */}
            <div className="p-4 border-t border-sand-dark/20 flex gap-3 shrink-0 safe-bottom">
              {formStep > 0 && (
                <button type="button" onClick={() => { setFormStep(formStep - 1); if (formStep === 2) stopCamera(); }} className="flex-1 py-3.5 rounded-xl text-sm font-semibold text-warm-gray bg-sand hover:bg-sand-dark/30 transition-colors flex items-center justify-center gap-2">
                  <RotateCcw size={14}/> Vorige
                </button>
              )}
              {formStep < STEPS.length - 1 ? (
                <button type="button" onClick={() => { if (formStep === 0 && !form.caravan_id) { alert('Selecteer eerst een caravan'); return; } setFormStep(formStep + 1); if (formStep === 1) stopCamera(); }} className="flex-1 bg-accent hover:bg-accent-dark text-white font-bold py-3.5 rounded-xl text-sm shadow-lg shadow-accent/20 transition-all flex items-center justify-center gap-2">
                  Volgende <ChevronRight size={14}/>
                </button>
              ) : (
                <button type="button" onClick={handleSubmit} className="flex-1 bg-accent hover:bg-accent-dark text-white font-bold py-3.5 rounded-xl text-sm shadow-lg shadow-accent/20 transition-all flex items-center justify-center gap-2">
                  <CheckCircle size={14}/> Inspectie afronden
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hidden: no-scrollbar style */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .safe-bottom { padding-bottom: max(env(safe-area-inset-bottom), 1rem); }
      `}</style>
    </div>
  );
}
