"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CheckCircle, XCircle, Camera, Search, ArrowRight, Truck, Shield, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

interface ScanResult {
  success: boolean;
  contract?: {
    contractNumber: string;
    customerName: string;
    caravanBrand: string;
    caravanModel: string;
    licensePlate: string;
    spotLabel: string;
    status: string;
    startDate: string;
  };
  error?: string;
}

export default function StaffScanPage() {
  const [mode, setMode] = useState<"scan" | "manual">("manual");
  const [contractNumber, setContractNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(false);

  // Start camera for QR scanning
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
        setMode("scan");
      }
    } catch {
      toast.error("Camera niet beschikbaar. Gebruik handmatige invoer.");
      setMode("manual");
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  // Look up contract by number
  const lookupContract = async (number: string) => {
    if (!number) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`/api/staff/inspections?contractNumber=${encodeURIComponent(number)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.contract) {
          setResult({ success: true, contract: data.contract });
          toast.success("Contract gevonden!");
        } else {
          setResult({ success: false, error: "Contract niet gevonden" });
          toast.error("Contract niet gevonden");
        }
      } else {
        setResult({ success: false, error: "Fout bij ophalen contract" });
      }
    } catch {
      setResult({ success: false, error: "Verbindingsfout" });
      toast.error("Kon geen verbinding maken met de server");
    }
    setLoading(false);
  };

  // Register check-in
  const registerCheckIn = async (type: "in" | "out") => {
    if (!result?.contract) return;
    setLoading(true);
    try {
      const res = await fetch("/api/staff/inspections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractNumber: result.contract.contractNumber,
          type,
          timestamp: new Date().toISOString(),
        }),
      });
      if (res.ok) {
        toast.success(type === "in" ? "Check-in geregistreerd!" : "Check-out geregistreerd!");
      }
    } catch {
      toast.error("Fout bij registreren");
    }
    setLoading(false);
  };

  return (
    <>
      <Header />

      <section className="bg-primary-dark pt-28 pb-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-accent text-xs font-bold tracking-[0.2em] uppercase mb-3">Staff Tools</p>
            <h1 className="text-3xl font-bold text-white mb-3">QR Check-in / Check-out</h1>
            <p className="text-white/60 text-sm">Scan een QR-code of voer een contractnummer in.</p>
          </motion.div>
        </div>
      </section>

      <section className="py-12 bg-surface min-h-[60vh]">
        <div className="max-w-lg mx-auto px-4">

          {/* Mode Toggle */}
          <div className="grid grid-cols-2 gap-2 bg-surface rounded-xl p-1.5 border border-black/[0.04] mb-8">
            <button onClick={() => { setMode("manual"); stopCamera(); }} className={`py-3 rounded-lg text-sm font-bold transition-all ${mode === "manual" ? "bg-primary-dark text-white" : "text-muted hover:text-primary-light"}`}>
              <Search size={15} className="inline mr-2" /> Handmatig
            </button>
            <button onClick={startCamera} className={`py-3 rounded-lg text-sm font-bold transition-all ${mode === "scan" ? "bg-primary-dark text-white" : "text-muted hover:text-primary-light"}`}>
              <Camera size={15} className="inline mr-2" /> QR Scannen
            </button>
          </div>

          {/* QR Camera */}
          <AnimatePresence>
            {mode === "scan" && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-8 overflow-hidden">
                <div className="relative aspect-square bg-black rounded-2xl overflow-hidden">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  {/* Scan overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-48 border-2 border-accent rounded-2xl relative">
                      <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-accent rounded-tl-lg" />
                      <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-accent rounded-tr-lg" />
                      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-accent rounded-bl-lg" />
                      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-accent rounded-br-lg" />
                      {/* Scan line animation */}
                      <motion.div
                        className="absolute left-0 right-0 h-0.5 bg-accent/60"
                        animate={{ top: ["0%", "100%", "0%"] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      />
                    </div>
                  </div>
                  {!cameraActive && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                      <p className="text-white/60 text-sm">Camera wordt gestart...</p>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted text-center mt-3">Richt de camera op de QR-code van het contract.</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Manual Input */}
          {mode === "manual" && (
            <div className="mb-8">
              <div className="bg-surface rounded-2xl p-6 border border-black/[0.04]">
                <label className="text-xs font-semibold text-muted block mb-2 uppercase tracking-wider">Contractnummer</label>
                <div className="flex gap-3">
                  <input
                    value={contractNumber}
                    onChange={e => setContractNumber(e.target.value)}
                    placeholder="CON-2025-00001"
                    className="flex-1 px-4 py-3 bg-surface border border-transparent rounded-xl text-sm font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none"
                    onKeyDown={e => e.key === "Enter" && lookupContract(contractNumber)}
                  />
                  <button
                    onClick={() => lookupContract(contractNumber)}
                    disabled={loading || !contractNumber}
                    className="bg-accent hover:bg-accent/90 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    ) : <Search size={16} />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Result */}
          <AnimatePresence mode="wait">
            {result && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
                {result.success && result.contract ? (
                  <div className="bg-surface rounded-2xl border border-black/[0.04] overflow-hidden">
                    <div className="bg-accent/10 p-4 flex items-center gap-3">
                      <CheckCircle size={20} className="text-accent" />
                      <div>
                        <p className="font-bold text-sm text-accent-dark">Contract gevonden</p>
                        <p className="text-xs text-accent font-mono">{result.contract.contractNumber}</p>
                      </div>
                    </div>

                    <div className="p-6 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted">Klant</span>
                        <span className="font-bold">{result.contract.customerName}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted">Caravan</span>
                        <span className="font-bold">{result.contract.caravanBrand} {result.contract.caravanModel}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted">Kenteken</span>
                        <span className="font-bold font-mono">{result.contract.licensePlate}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted">Plek</span>
                        <span className="font-bold">{result.contract.spotLabel}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted">Status</span>
                        <span className={`font-bold ${result.contract.status === "actief" ? "text-accent" : "text-warning"}`}>{result.contract.status}</span>
                      </div>
                    </div>

                    <div className="p-4 border-t border-black/[0.04] grid grid-cols-2 gap-3">
                      <button onClick={() => registerCheckIn("in")} disabled={loading} className="bg-accent hover:bg-accent/90 text-white font-bold py-3.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2">
                        <ArrowRight size={15} /> Check-in
                      </button>
                      <button onClick={() => registerCheckIn("out")} disabled={loading} className="bg-primary-dark hover:bg-primary text-white font-bold py-3.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2">
                        <Truck size={15} /> Check-out
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-danger/10 border border-danger/30 rounded-2xl p-6 text-center">
                    <XCircle size={32} className="text-danger mx-auto mb-3" />
                    <p className="font-bold text-danger">{result.error}</p>
                    <p className="text-xs text-danger mt-1">Controleer het contractnummer en probeer opnieuw.</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Stats */}
          {!result && (
            <div className="grid grid-cols-3 gap-3 mt-8">
              {[
                { icon: Shield, label: "Vandaag in", value: "—" },
                { icon: Truck, label: "Vandaag uit", value: "—" },
                { icon: Calendar, label: "Op terrein", value: "—" },
              ].map(s => (
                <div key={s.label} className="bg-surface rounded-xl p-4 border border-black/[0.04] text-center">
                  <s.icon size={18} className="text-muted mx-auto mb-2" />
                  <p className="text-lg font-bold">{s.value}</p>
                  <p className="text-xs text-muted">{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}
