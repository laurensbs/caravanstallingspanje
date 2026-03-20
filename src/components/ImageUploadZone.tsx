'use client';

import { useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Upload, X, Star, GripVertical, Loader2 } from 'lucide-react';

type GuideImage = { id: number; url: string; alt_text: string | null; is_cover: boolean; sort_order: number };

export default function ImageUploadZone({
  entityType,
  entityId,
  images,
  onImagesChange,
}: {
  entityType: string;
  entityId: number | null;
  images: GuideImage[];
  onImagesChange: (imgs: GuideImage[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const upload = useCallback(async (files: FileList) => {
    if (!entityId) return;
    setUploading(true);
    const newImages = [...images];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;
      if (file.size > 5 * 1024 * 1024) continue;
      const fd = new FormData();
      fd.append('file', file);
      fd.append('entity_type', entityType);
      fd.append('entity_id', String(entityId));
      fd.append('is_cover', newImages.length === 0 ? 'true' : 'false');
      fd.append('alt_text', file.name.replace(/\.[^.]+$/, ''));
      try {
        const res = await fetch('/api/admin/guide/images', { method: 'POST', body: fd, credentials: 'include' });
        if (res.ok) {
          const { image } = await res.json();
          newImages.push(image);
        }
      } catch { /* skip failed uploads */ }
    }
    onImagesChange(newImages);
    setUploading(false);
  }, [entityId, entityType, images, onImagesChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) upload(e.dataTransfer.files);
  }, [upload]);

  const handleDelete = async (id: number) => {
    try {
      await fetch(`/api/admin/guide/images?id=${id}`, { method: 'DELETE', credentials: 'include' });
      onImagesChange(images.filter(img => img.id !== id));
    } catch { /* ignore */ }
  };

  const handleSetCover = async (id: number) => {
    if (!entityId) return;
    try {
      await fetch('/api/admin/guide/images', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, entity_type: entityType, entity_id: entityId }),
        credentials: 'include',
      });
      onImagesChange(images.map(img => ({ ...img, is_cover: img.id === id })));
    } catch { /* ignore */ }
  };

  if (!entityId) {
    return (
      <div className="border-2 border-dashed border-sand-dark/30 rounded-xl p-8 text-center text-warm-gray/60 text-sm">
        Sla het item eerst op voordat je afbeeldingen kunt uploaden
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Upload zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          dragOver ? 'border-primary bg-primary/5' : 'border-sand-dark/30 hover:border-primary/50 hover:bg-sand/30'
        }`}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          className="hidden"
          onChange={e => e.target.files && upload(e.target.files)}
        />
        {uploading ? (
          <div className="flex items-center justify-center gap-2 text-primary">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm font-medium">Uploaden...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload size={24} className="text-warm-gray/40" />
            <p className="text-sm text-warm-gray/70">Sleep afbeeldingen of klik om te uploaden</p>
            <p className="text-[11px] text-warm-gray/40">JPEG, PNG, WebP, AVIF — max 5MB</p>
          </div>
        )}
      </div>

      {/* Image grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map(img => (
            <div key={img.id} className={`relative group rounded-xl overflow-hidden border-2 ${img.is_cover ? 'border-primary' : 'border-transparent'}`}>
              <div className="aspect-[4/3] relative">
                <Image src={img.url} alt={img.alt_text || ''} fill sizes="200px" className="object-cover" />
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <button
                  onClick={() => handleSetCover(img.id)}
                  className={`p-1.5 rounded-lg ${img.is_cover ? 'bg-primary text-white' : 'bg-white/90 text-warm-gray hover:bg-primary hover:text-white'} transition-colors`}
                  title="Stel in als cover"
                >
                  <Star size={14} />
                </button>
                <button
                  onClick={() => handleDelete(img.id)}
                  className="p-1.5 rounded-lg bg-white/90 text-danger hover:bg-danger hover:text-white transition-colors"
                  title="Verwijderen"
                >
                  <X size={14} />
                </button>
              </div>
              {img.is_cover && (
                <div className="absolute top-1.5 left-1.5 bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                  COVER
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
