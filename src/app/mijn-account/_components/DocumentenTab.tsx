'use client';
import { Upload, FileText } from 'lucide-react';

export default function DocumentenTab() {
  return (
    <div className="bg-surface rounded-2xl border border-sand-dark/20 p-8">
      <h2 className="font-bold text-surface-dark text-lg mb-2">Documenten</h2>
      <p className="text-sm text-warm-gray/70 mb-8">Upload verzekeringspapieren, APK-rapporten en andere documenten voor uw caravan(s).</p>

      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        {['Verzekeringsbewijs', 'APK-keuring', 'Kentekenbewijs', 'Anders'].map(docType => (
          <label key={docType} className="flex items-center gap-4 p-5 border-2 border-dashed border-sand-dark/30 rounded-2xl hover:border-primary/30 hover:bg-primary/[0.02] transition-all cursor-pointer group">
            <div className="w-11 h-11 bg-sand/40 rounded-xl flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <Upload size={18} className="text-warm-gray/70 group-hover:text-primary transition-colors" />
            </div>
            <div>
              <p className="text-sm font-semibold text-surface-dark">{docType}</p>
              <p className="text-xs text-warm-gray/70">PDF, JPG of PNG (max 10MB)</p>
            </div>
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const formData = new FormData();
              formData.append('file', file);
              formData.append('type', docType);
              try {
                const res = await fetch('/api/customer/documents', { method: 'POST', body: formData, credentials: 'include' });
                if (res.ok) { alert('Document geüpload!'); } else { alert('Upload mislukt'); }
              } catch { alert('Er ging iets mis'); }
            }} />
          </label>
        ))}
      </div>

      <div className="border-t border-sand-dark/20 pt-6">
        <h3 className="text-sm font-semibold text-warm-gray mb-4">Geüploade documenten</h3>
        <div className="text-center py-8">
          <FileText size={32} className="text-warm-gray/40 mx-auto mb-3" />
          <p className="text-sm text-warm-gray/70">Nog geen documenten geüpload</p>
        </div>
      </div>
    </div>
  );
}
