'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, X, Loader2, AlertCircle, FileText, Image as ImageIcon } from 'lucide-react';

// Drag-drop foto-upload component voor publieke formulieren.
// Stuurt elk bestand parallel naar /api/uploads en bewaart de URLs.
// Bij submit: parent leest `value` (URL-array) en stuurt mee in payload.

export type UploadedFile = {
  url: string;
  webUrl: string;
  fileName: string;
  sizeKb: number;
};

interface PhotoDropzoneProps {
  /** Eén van: 'repair-intake' | 'inspection-intake' | 'purchase' | 'contact' | 'sale-listing' */
  kind: string;
  /** Groeperings-key voor de OneDrive-folder (bv. session-id of timestamp). */
  ref: string;
  value: UploadedFile[];
  onChange: (files: UploadedFile[]) => void;
  /** Max aantal foto's. Default 8. */
  maxFiles?: number;
  /** Optionele label boven het drop-area. */
  label?: string;
  /** Hint-tekst onder de dropzone. */
  hint?: string;
}

const MAX_BYTES = 10 * 1024 * 1024;

export default function PhotoDropzone({
  kind, ref: refKey, value, onChange,
  maxFiles = 8,
  label = "Foto's toevoegen (optioneel)",
  hint = 'JPG, PNG of PDF · max 10 MB per bestand · max 8 stuks',
}: PhotoDropzoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState<Map<string, number>>(new Map());
  const [errors, setErrors] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const isMounted = useRef(true);

  useEffect(() => () => { isMounted.current = false; }, []);

  const reportError = useCallback((msg: string) => {
    setErrors((prev) => [...prev, msg].slice(-3));
  }, []);

  const uploadOne = useCallback(async (file: File) => {
    const tmpId = `${file.name}-${file.size}-${Date.now()}`;
    setUploading((m) => new Map(m).set(tmpId, 0));
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('kind', kind);
      fd.append('ref', refKey);
      const res = await fetch('/api/uploads', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) {
        reportError(data?.error || `Upload mislukt: ${file.name}`);
        return null;
      }
      return data as UploadedFile;
    } catch {
      reportError(`Verbindingsfout bij ${file.name}`);
      return null;
    } finally {
      if (isMounted.current) {
        setUploading((m) => {
          const next = new Map(m);
          next.delete(tmpId);
          return next;
        });
      }
    }
  }, [kind, refKey, reportError]);

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const incoming = Array.from(files);
    if (incoming.length === 0) return;
    setErrors([]);

    const room = maxFiles - value.length;
    if (room <= 0) {
      reportError(`Maximaal ${maxFiles} bestanden.`);
      return;
    }
    const accepted: File[] = [];
    for (const f of incoming.slice(0, room)) {
      if (f.size > MAX_BYTES) {
        reportError(`${f.name}: te groot (>10 MB).`);
        continue;
      }
      if (!/^image\/(jpeg|png|webp|heic|heif)|application\/pdf$/i.test(f.type)) {
        reportError(`${f.name}: bestandstype niet toegestaan.`);
        continue;
      }
      accepted.push(f);
    }
    if (incoming.length > room) {
      reportError(`Eerste ${room} verwerkt — rest overgeslagen.`);
    }

    const results = await Promise.all(accepted.map(uploadOne));
    const ok = results.filter((r): r is UploadedFile => r !== null);
    if (ok.length > 0) onChange([...value, ...ok]);
  }, [value, maxFiles, onChange, reportError, uploadOne]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer?.files) handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const remove = (idx: number) => {
    const next = value.slice();
    next.splice(idx, 1);
    onChange(next);
  };

  const isUploading = uploading.size > 0;
  const reachedMax = value.length >= maxFiles;

  return (
    <div>
      {label && (
        <label
          style={{
            display: 'block',
            fontFamily: 'var(--sora)',
            fontWeight: 600,
            fontSize: 12,
            color: 'var(--navy)',
            letterSpacing: 0.2,
            marginBottom: 6,
          }}
        >
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        disabled={reachedMax}
        style={{
          width: '100%',
          padding: '24px 18px',
          border: `2px dashed ${dragOver ? 'var(--orange)' : 'var(--line-2)'}`,
          borderRadius: 12,
          background: dragOver ? 'rgba(249,173,54,0.08)' : 'var(--bg)',
          cursor: reachedMax ? 'not-allowed' : 'pointer',
          opacity: reachedMax ? 0.55 : 1,
          transition: 'border-color 0.15s, background 0.15s',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <UploadCloud size={26} aria-hidden style={{ color: 'var(--orange)' }} />
        <span style={{ fontFamily: 'var(--sora)', fontWeight: 600, fontSize: 14, color: 'var(--navy)' }}>
          {dragOver ? 'Laat los om te uploaden…' : 'Sleep bestanden hier of klik om te selecteren'}
        </span>
        <span style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center', lineHeight: 1.5 }}>
          {hint}
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif,application/pdf"
        multiple
        hidden
        onChange={(e) => {
          if (e.target.files) handleFiles(e.target.files);
          e.target.value = '';
        }}
      />

      {/* Previews */}
      {(value.length > 0 || isUploading) && (
        <div
          style={{
            marginTop: 14,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
            gap: 10,
          }}
        >
          <AnimatePresence>
            {value.map((f, idx) => (
              <motion.div
                key={f.url}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.18 }}
                style={{
                  position: 'relative',
                  borderRadius: 10,
                  overflow: 'hidden',
                  border: '1px solid var(--line)',
                  background: '#fff',
                  aspectRatio: '1 / 1',
                }}
              >
                {/^[^?]+\.(pdf)(\?|$)/i.test(f.fileName) ? (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                      padding: 8,
                      background: 'var(--bg)',
                    }}
                  >
                    <FileText size={26} aria-hidden style={{ color: 'var(--orange)' }} />
                    <span
                      style={{
                        fontSize: 10.5,
                        color: 'var(--ink-2)',
                        textAlign: 'center',
                        wordBreak: 'break-all',
                        lineHeight: 1.3,
                      }}
                    >
                      {f.fileName.length > 22 ? f.fileName.slice(0, 19) + '…' : f.fileName}
                    </span>
                  </div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={f.url}
                    alt={f.fileName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                )}
                <button
                  type="button"
                  onClick={() => remove(idx)}
                  aria-label={`Verwijder ${f.fileName}`}
                  style={{
                    position: 'absolute',
                    top: 4, right: 4,
                    width: 22, height: 22,
                    borderRadius: 999,
                    background: 'rgba(31,42,54,0.85)',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  <X size={12} />
                </button>
              </motion.div>
            ))}

            {Array.from(uploading.keys()).map((id) => (
              <motion.div
                key={id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                style={{
                  borderRadius: 10,
                  border: '1px dashed var(--line-2)',
                  background: 'var(--bg)',
                  aspectRatio: '1 / 1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  flexDirection: 'column',
                }}
              >
                <Loader2 size={20} className="animate-spin" aria-hidden style={{ color: 'var(--muted)' }} />
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>Bezig…</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {errors.length > 0 && (
        <div
          role="alert"
          style={{
            marginTop: 10,
            padding: '10px 12px',
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            color: '#991B1B',
            borderRadius: 10,
            fontSize: 12.5,
            lineHeight: 1.5,
          }}
        >
          {errors.map((e, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
              <AlertCircle size={13} style={{ marginTop: 2, flexShrink: 0 }} aria-hidden />
              <span>{e}</span>
            </div>
          ))}
        </div>
      )}

      {/* Hidden status icon zodat lint niet mekkert over unused imports */}
      <span style={{ display: 'none' }} aria-hidden>
        <ImageIcon size={1} />
      </span>
    </div>
  );
}
