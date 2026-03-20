'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, FileText, AlertTriangle, PenTool } from 'lucide-react';

interface ContractData {
  contract: {
    contract_number: string;
    start_date: string;
    end_date: string;
    monthly_rate: number;
    deposit: number;
    auto_renew: boolean;
    location_name: string;
    caravan: string;
    license_plate: string;
  };
  customer: {
    name: string;
    email: string;
    address: string;
    city: string;
    postal_code: string;
  };
  expires_at: string;
}

function SigningContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [contractData, setContractData] = useState<ContractData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [signed, setSigned] = useState(false);
  const [signing, setSigning] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    if (!token) { setError('Geen token opgegeven'); setLoading(false); return; }
    fetch(`/api/contract/signing?token=${token}`)
      .then(async res => {
        const data = await res.json();
        if (!res.ok) { setError(data.error || 'Ongeldige link'); return; }
        setContractData(data);
      })
      .catch(() => setError('Kon contract niet laden'))
      .finally(() => setLoading(false));
  }, [token]);

  // Canvas drawing logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1C2B3A';

    const getPos = (e: MouseEvent | TouchEvent) => {
      const r = canvas.getBoundingClientRect();
      if ('touches' in e) {
        return { x: e.touches[0].clientX - r.left, y: e.touches[0].clientY - r.top };
      }
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };

    const startDraw = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      setIsDrawing(true);
      const pos = getPos(e);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    };

    const draw = (e: MouseEvent | TouchEvent) => {
      if (!isDrawing) return;
      e.preventDefault();
      const pos = getPos(e);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      setHasSignature(true);
    };

    const stopDraw = () => setIsDrawing(false);

    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDraw);
    canvas.addEventListener('mouseleave', stopDraw);
    canvas.addEventListener('touchstart', startDraw, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stopDraw);

    return () => {
      canvas.removeEventListener('mousedown', startDraw);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDraw);
      canvas.removeEventListener('mouseleave', stopDraw);
      canvas.removeEventListener('touchstart', startDraw);
      canvas.removeEventListener('touchmove', draw);
      canvas.removeEventListener('touchend', stopDraw);
    };
  }, [isDrawing, contractData]);

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const signContract = async () => {
    if (!canvasRef.current || !token) return;
    setSigning(true);
    const signatureData = canvasRef.current.toDataURL('image/png');
    
    try {
      const res = await fetch('/api/contract/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, signature_data: signatureData, agreed_terms: true }),
      });
      const data = await res.json();
      if (res.ok) {
        setSigned(true);
      } else {
        setError(data.error || 'Ondertekening mislukt');
      }
    } catch {
      setError('Netwerkfout bij ondertekening');
    }
    setSigning(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="animate-pulse text-gray-500/70">Contract laden...</div>
      </div>
    );
  }

  if (error && !signed) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <div className="bg-surface rounded-2xl p-8 shadow-lg text-center max-w-md">
          <AlertTriangle size={48} className="mx-auto text-warning mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Ondertekening niet mogelijk</h1>
          <p className="text-gray-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (signed) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <div className="bg-surface rounded-2xl p-8 shadow-lg text-center max-w-md">
          <CheckCircle size={64} className="mx-auto text-accent mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Contract ondertekend!</h1>
          <p className="text-gray-500 text-sm mb-6">Uw contract is succesvol digitaal ondertekend. U ontvangt een bevestiging per e-mail.</p>
          <a href="/mijn-account" className="inline-block bg-primary text-white font-semibold px-8 py-3 rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-light transition-all">Naar mijn account</a>
        </div>
      </div>
    );
  }

  const c = contractData!.contract;
  const cust = contractData!.customer;

  return (
    <div className="min-h-screen bg-surface py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-warning/15 text-warning px-4 py-2 rounded-full text-sm font-medium mb-4">
            <FileText size={16} /> Digitale ondertekening
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Stallingscontract</h1>
          <p className="text-gray-500/70 text-sm mt-1">Contract {c.contract_number}</p>
        </div>

        {/* Contract details */}
        <div className="bg-surface rounded-2xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Contractgegevens</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-gray-500/70 block">Klant</span><span className="font-medium text-gray-900">{cust.name}</span></div>
            <div><span className="text-gray-500/70 block">E-mail</span><span className="font-medium text-gray-900">{cust.email}</span></div>
            <div><span className="text-gray-500/70 block">Locatie</span><span className="font-medium text-gray-900">{c.location_name}</span></div>
            <div><span className="text-gray-500/70 block">Caravan</span><span className="font-medium text-gray-900">{c.caravan}</span></div>
            <div><span className="text-gray-500/70 block">Kenteken</span><span className="font-medium text-gray-900">{c.license_plate}</span></div>
            <div><span className="text-gray-500/70 block">Periode</span><span className="font-medium text-gray-900">{new Date(c.start_date).toLocaleDateString('nl-NL')} - {new Date(c.end_date).toLocaleDateString('nl-NL')}</span></div>
            <div><span className="text-gray-500/70 block">Maandbedrag</span><span className="font-bold text-warning">€{Number(c.monthly_rate).toFixed(2)}</span></div>
            <div><span className="text-gray-500/70 block">Borg</span><span className="font-medium text-gray-900">€{Number(c.deposit).toFixed(2)}</span></div>
          </div>
        </div>

        {/* Terms */}
        <div className="bg-surface rounded-2xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Voorwaarden</h2>
          <div className="text-sm text-gray-500 space-y-2 mb-4 max-h-48 overflow-y-auto">
            <p>Door dit contract te ondertekenen gaat u akkoord met de algemene voorwaarden van Caravan Stalling Spanje:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>De stalling vindt plaats op eigen risico van de eigenaar.</li>
              <li>Betaling geschiedt maandelijks vooraf, uiterlijk op de 1e van elke maand.</li>
              <li>Bij niet-tijdige betaling wordt een herinnering gestuurd. Na 30 dagen wordt het contract opgeschort.</li>
              <li>Opzegging dient minimaal 1 maand van tevoren schriftelijk te gebeuren.</li>
              <li>De stallinghouder is niet aansprakelijk voor schade door weersomstandigheden of overmacht.</li>
              <li>U bent verplicht een geldige verzekering en APK te hebben voor uw caravan.</li>
              {c.auto_renew && <li>Dit contract wordt automatisch verlengd, tenzij tijdig opgezegd.</li>}
            </ul>
          </div>
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={agreedTerms} onChange={e => setAgreedTerms(e.target.checked)} className="mt-1 w-4 h-4 rounded border-gray-300/40 text-warning focus:ring-primary" />
            <span className="text-sm text-gray-900">Ik heb de voorwaarden gelezen en ga hiermee akkoord</span>
          </label>
        </div>

        {/* Signature pad */}
        <div className="bg-surface rounded-2xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><PenTool size={18} /> Uw handtekening</h2>
            <button onClick={clearSignature} className="text-xs text-gray-500/70 hover:text-gray-500 underline">Wissen</button>
          </div>
          <canvas
            ref={canvasRef}
            className="w-full h-40 border-2 border-dashed border-gray-200 rounded-xl cursor-crosshair bg-gray-50 touch-none"
          />
          <p className="text-xs text-gray-500/70 mt-2">Teken uw handtekening in het vak hierboven</p>
        </div>

        {/* Submit */}
        <button
          onClick={signContract}
          disabled={signing || !agreedTerms || !hasSignature}
          className="w-full bg-primary hover:bg-primary-light text-white font-bold py-4 rounded-2xl text-base shadow-xl shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {signing ? 'Ondertekenen...' : <><PenTool size={18} /> Contract ondertekenen</>}
        </button>
        
        <p className="text-xs text-center text-gray-500/70 mt-4">
          Door te ondertekenen bevestigt u dat u {cust.name} bent en akkoord gaat met bovenstaande voorwaarden.
        </p>
      </div>
    </div>
  );
}

export default function ContractSigningPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface flex items-center justify-center"><div className="animate-pulse text-gray-500/70">Laden...</div></div>}>
      <SigningContent />
    </Suspense>
  );
}
