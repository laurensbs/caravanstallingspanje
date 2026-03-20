'use client';
import { Upload, FileText, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

const DOC_TYPES = [
  { label: 'Verzekeringsbewijs', color: 'from-ocean/15 to-ocean/5', iconColor: 'text-ocean' },
  { label: 'APK-keuring', color: 'from-accent/15 to-accent/5', iconColor: 'text-accent' },
  { label: 'Kentekenbewijs', color: 'from-primary/15 to-primary/5', iconColor: 'text-primary' },
  { label: 'Anders', color: 'from-warning/15 to-warning/5', iconColor: 'text-warning' },
];

export default function DocumentenTab() {
  const [uploaded, setUploaded] = useState<Set<string>>(new Set());

  return (
    <div className="card-premium p-6 sm:p-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="font-black text-surface-dark text-lg mb-1">Documenten</h2>
        <p className="text-sm text-warm-gray/70 mb-8">Upload verzekeringspapieren, APK-rapporten en andere documenten voor uw caravan(s).</p>
      </motion.div>

      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        {DOC_TYPES.map((docType, i) => (
          <motion.label key={docType.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + i * 0.06 }}
            className={`flex items-center gap-4 p-5 border-2 border-dashed rounded-2xl transition-all cursor-pointer group ${uploaded.has(docType.label) ? 'border-accent/40 bg-accent/[0.04]' : 'border-sand-dark/20 hover:border-primary/30 hover:bg-primary/[0.02]'}`}>
            <div className={`w-12 h-12 bg-gradient-to-br ${docType.color} rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}>
              {uploaded.has(docType.label) ? <CheckCircle size={20} className="text-accent" /> : <Upload size={18} className={docType.iconColor} />}
            </div>
            <div>
              <p className="text-sm font-bold text-surface-dark">{docType.label}</p>
              <p className="text-xs text-warm-gray/70">{uploaded.has(docType.label) ? 'Geüpload ✓' : 'PDF, JPG of PNG (max 10MB)'}</p>
            </div>
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const formData = new FormData();
              formData.append('file', file);
              formData.append('type', docType.label);
              try {
                const res = await fetch('/api/customer/documents', { method: 'POST', body: formData, credentials: 'include' });
                if (res.ok) { setUploaded(prev => new Set(prev).add(docType.label)); } else { alert('Upload mislukt'); }
              } catch { alert('Er ging iets mis'); }
            }} />
          </motion.label>
        ))}
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="border-t border-sand-dark/15 pt-6">
        <h3 className="text-xs font-bold text-warm-gray/60 uppercase tracking-wider mb-4">Geüploade documenten</h3>
        <div className="text-center py-8">
          <div className="w-14 h-14 bg-gradient-to-br from-sand/60 to-sand/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <FileText size={22} className="text-warm-gray/40" />
          </div>
          <p className="text-sm text-warm-gray/70 font-medium">Nog geen documenten geüpload</p>
        </div>
      </motion.div>
    </div>
  );
}
