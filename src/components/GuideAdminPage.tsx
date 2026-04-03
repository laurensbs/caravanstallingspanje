'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, ChevronDown, ChevronUp, Pencil, Trash2, Star, ExternalLink, X, Globe } from 'lucide-react';
import ImageUploadZone from '@/components/ImageUploadZone';

type GuideImage = { id: number; url: string; alt_text: string | null; is_cover: boolean; sort_order: number };

type FieldDef = {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'tags' | 'boolean' | 'url';
  options?: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
  colSpan?: 2;
};

type GuideAdminConfig = {
  type: string;          // API type key (e.g. 'campings')
  imageType: string;     // image entity_type (e.g. 'camping')
  title: string;
  fields: FieldDef[];
  tableColumns: { key: string; label: string; render?: (item: Record<string, any>) => React.ReactNode }[];
  filterOptions?: { key: string; label: string; options: { value: string; label: string }[] }[];
};

function slugify(s: string) {
  return s.toLowerCase().replace(/[àáâãäå]/g, 'a').replace(/[èéêë]/g, 'e').replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o').replace(/[ùúûü]/g, 'u').replace(/[ñ]/g, 'n').replace(/[ç]/g, 'c')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function GuideAdminPage({ config }: { config: GuideAdminConfig }) {
  const [items, setItems] = useState<Record<string, any>[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editMode, setEditMode] = useState<'create' | 'edit' | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [images, setImages] = useState<GuideImage[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), search });
      Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
      const res = await fetch(`/api/admin/guide/${config.type}?${params}`, { credentials: 'include' });
      const data = await res.json();
      setItems(data.items || []);
      setTotal(data.total || 0);
    } catch { setItems([]); }
    setLoading(false);
  }, [config.type, page, search, filters]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const fetchDetail = async (slug: string) => {
    try {
      const res = await fetch(`/api/admin/guide/${config.type}/${slug}`, { credentials: 'include' });
      const data = await res.json();
      setFormData(data.item || {});
      setImages(data.images || []);
    } catch { /* ignore */ }
  };

  const handleCreate = () => {
    const defaults: Record<string, any> = {};
    config.fields.forEach(f => {
      if (f.type === 'tags') defaults[f.key] = [];
      else if (f.type === 'boolean') defaults[f.key] = false;
      else if (f.type === 'number') defaults[f.key] = null;
      else defaults[f.key] = '';
    });
    setFormData(defaults);
    setImages([]);
    setEditMode('create');
    setExpandedId(null);
    setError('');
  };

  const handleEdit = async (item: Record<string, any>) => {
    setExpandedId(item.id as number);
    setEditMode('edit');
    setError('');
    await fetchDetail(item.slug as string);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      // Auto-generate slug from name if empty
      if (!formData.slug && formData.name) {
        formData.slug = slugify(formData.name as string);
      }
      const url = editMode === 'create'
        ? `/api/admin/guide/${config.type}`
        : `/api/admin/guide/${config.type}/${formData.slug}`;
      const method = editMode === 'create' ? 'POST' : 'PUT';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Opslaan mislukt'); setSaving(false); return; }
      if (editMode === 'create' && data.item) {
        setFormData(data.item);
        setEditMode('edit');
        setExpandedId(data.item.id);
      }
      await fetchItems();
    } catch {
      setError('Er is een fout opgetreden');
    }
    setSaving(false);
  };

  const handleDelete = async (slug: string) => {
    if (!confirm('Weet je zeker dat je dit item wilt verwijderen?')) return;
    try {
      await fetch(`/api/admin/guide/${config.type}/${slug}`, { method: 'DELETE', credentials: 'include' });
      setEditMode(null);
      setExpandedId(null);
      await fetchItems();
    } catch { /* ignore */ }
  };

  const handleCancel = () => {
    setEditMode(null);
    setExpandedId(null);
    setFormData({});
    setImages([]);
    setError('');
  };

  const updateField = (key: string, value: unknown) => {
    setFormData(prev => {
      const next = { ...prev, [key]: value };
      if (key === 'name' && editMode === 'create' && !prev._slugManual) {
        next.slug = slugify(value as string);
      }
      return next;
    });
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{config.title}</h1>
          <p className="text-sm text-gray-500 mt-1">{total} items</p>
        </div>
        <button onClick={handleCreate} className="inline-flex items-center gap-2 bg-primary hover:bg-primary-light text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors">
          <Plus size={16} /> Toevoegen
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500/40" />
          <input
            type="text"
            placeholder="Zoeken..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2.5 bg-surface border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        {config.filterOptions?.map(f => (
          <select
            key={f.key}
            value={filters[f.key] || ''}
            onChange={e => { setFilters(prev => ({ ...prev, [f.key]: e.target.value })); setPage(1); }}
            className="px-3 py-2.5 bg-surface border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">{f.label}</option>
            {f.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        ))}
      </div>

      {/* Create form */}
      {editMode === 'create' && expandedId === null && (
        <div className="bg-surface border border-gray-200 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg text-gray-900">Nieuw item toevoegen</h2>
            <button onClick={handleCancel} className="text-gray-500/50 hover:text-gray-500"><X size={20} /></button>
          </div>
          <FormFields fields={config.fields} data={formData} onChange={updateField} />
          {error && <p className="text-danger text-sm">{error}</p>}
          <div className="flex gap-3">
            <button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary-light text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50">
              {saving ? 'Opslaan...' : 'Opslaan'}
            </button>
            <button onClick={handleCancel} className="text-gray-500 hover:text-gray-900 text-sm font-medium px-4 py-2.5">Annuleren</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-surface border border-gray-200 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500/50 text-sm">Laden...</div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-gray-500/50 text-sm">Geen items gevonden</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  {config.tableColumns.map(col => (
                    <th key={col.key} className="text-left text-xs font-bold text-gray-500/50 uppercase tracking-wider px-4 py-3">{col.label}</th>
                  ))}
                  <th className="w-24 px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <ItemRow
                    key={item.id as number}
                    item={item}
                    config={config}
                    expanded={expandedId === item.id}
                    editMode={editMode}
                    formData={formData}
                    images={images}
                    saving={saving}
                    error={error}
                    onToggle={() => {
                      if (expandedId === item.id) handleCancel();
                      else handleEdit(item);
                    }}
                    onSave={handleSave}
                    onDelete={() => handleDelete(item.slug as string)}
                    onCancel={handleCancel}
                    onChange={updateField}
                    onImagesChange={setImages}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                p === page ? 'bg-primary text-white' : 'bg-surface border border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ItemRow({
  item, config, expanded, editMode, formData, images, saving, error,
  onToggle, onSave, onDelete, onCancel, onChange, onImagesChange,
}: {
  item: Record<string, any>;
  config: GuideAdminConfig;
  expanded: boolean;
  editMode: 'create' | 'edit' | null;
  formData: Record<string, any>;
  images: GuideImage[];
  saving: boolean;
  error: string;
  onToggle: () => void;
  onSave: () => void;
  onDelete: () => void;
  onCancel: () => void;
  onChange: (key: string, value: unknown) => void;
  onImagesChange: (imgs: GuideImage[]) => void;
}) {
  return (
    <>
      <tr className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${expanded ? 'bg-gray-50' : ''}`} onClick={onToggle}>
        {config.tableColumns.map(col => (
          <td key={col.key} className="px-4 py-3 text-sm text-gray-900">
            {col.render ? col.render(item) : String(item[col.key] ?? '')}
          </td>
        ))}
        <td className="px-4 py-3">
          <div className="flex items-center gap-1 justify-end">
            {item.is_featured && <Star size={13} className="text-amber-500 fill-amber-500" />}
            {expanded ? <ChevronUp size={16} className="text-gray-500/50" /> : <ChevronDown size={16} className="text-gray-500/50" />}
          </div>
        </td>
      </tr>
      {expanded && editMode === 'edit' && (
        <tr>
          <td colSpan={config.tableColumns.length + 1} className="px-4 py-5 bg-gray-50 border-b border-gray-200">
            <div className="space-y-5 max-w-4xl">
              <FormFields fields={config.fields} data={formData} onChange={onChange} />
              <div>
                <label className="block text-xs font-bold text-gray-500/50 uppercase tracking-wider mb-2">Afbeeldingen</label>
                <ImageUploadZone entityType={config.imageType} entityId={item.id as number} images={images} onImagesChange={onImagesChange} />
              </div>
              {error && <p className="text-danger text-sm">{error}</p>}
              <div className="flex gap-3">
                <button onClick={onSave} disabled={saving} className="bg-primary hover:bg-primary-light text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50">
                  {saving ? 'Opslaan...' : 'Opslaan'}
                </button>
                <button onClick={onCancel} className="text-gray-500 hover:text-gray-900 text-sm font-medium px-4 py-2.5">Annuleren</button>
                <button onClick={onDelete} className="ml-auto text-danger/70 hover:text-danger text-sm font-medium px-4 py-2.5 flex items-center gap-1.5">
                  <Trash2 size={14} /> Verwijderen
                </button>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function FormFields({ fields, data, onChange }: { fields: FieldDef[]; data: Record<string, any>; onChange: (key: string, value: unknown) => void }) {
  const [lang, setLang] = useState<'nl' | 'en' | 'es'>('nl');
  const TRANSLATABLE = ['name', 'description', 'title', 'excerpt', 'content'];
  const translatableFields = fields.filter(f => TRANSLATABLE.includes(f.key));
  const nonTranslatableFields = fields.filter(f => !TRANSLATABLE.includes(f.key));
  const langLabel = { nl: '🇳🇱 Nederlands', en: '🇬🇧 English', es: '🇪🇸 Español' };

  return (
    <div className="space-y-4">
      {/* Non-translatable fields always visible */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {nonTranslatableFields.map(f => (
          <FieldInput key={f.key} field={f} data={data} onChange={onChange} />
        ))}
      </div>

      {/* Language tabs for translatable fields */}
      {translatableFields.length > 0 && (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="flex items-center gap-0.5 bg-gray-50 px-2 py-1.5 border-b border-gray-200">
            <Globe size={14} className="text-gray-400 mr-1.5" />
            {(['nl', 'en', 'es'] as const).map(l => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  lang === l ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                {langLabel[l]}
              </button>
            ))}
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {translatableFields.map(f => {
                const suffix = lang === 'nl' ? '' : `_${lang}`;
                const fieldKey = f.key + suffix;
                const label = lang === 'nl' ? f.label : `${f.label} (${lang.toUpperCase()})`;
                return (
                  <FieldInput key={fieldKey} field={{ ...f, key: fieldKey, label, required: lang === 'nl' ? f.required : false }} data={data} onChange={onChange} />
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FieldInput({ field: f, data, onChange }: { field: FieldDef; data: Record<string, any>; onChange: (key: string, value: unknown) => void }) {
  return (
    <div className={f.colSpan === 2 ? 'sm:col-span-2' : ''}>
      <label className="block text-xs font-bold text-gray-500/50 uppercase tracking-wider mb-1.5">{f.label}{f.required && ' *'}</label>
      {f.type === 'textarea' ? (
            <textarea
              value={(data[f.key] as string) || ''}
              onChange={e => onChange(f.key, e.target.value)}
              placeholder={f.placeholder}
              rows={4}
              className="w-full bg-surface border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-y"
            />
          ) : f.type === 'select' ? (
            <select
              value={(data[f.key] as string) || ''}
              onChange={e => onChange(f.key, e.target.value)}
              className="w-full bg-surface border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Selecteer...</option>
              {f.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          ) : f.type === 'boolean' ? (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={data[f.key] === true}
                onChange={e => onChange(f.key, e.target.checked)}
                className="w-4 h-4 rounded border-gray-200 text-primary focus:ring-primary/20"
              />
              <span className="text-sm text-gray-500">{f.placeholder || 'Ja'}</span>
            </label>
          ) : f.type === 'tags' ? (
            <TagInput
              value={(data[f.key] as string[]) || []}
              onChange={v => onChange(f.key, v)}
              placeholder={f.placeholder || 'Typ en druk Enter'}
            />
          ) : f.type === 'number' ? (
            <input
              type="number"
              value={data[f.key] != null ? String(data[f.key]) : ''}
              onChange={e => onChange(f.key, e.target.value ? Number(e.target.value) : null)}
              placeholder={f.placeholder}
              step={f.key.includes('lat') || f.key.includes('lng') ? '0.0000001' : '1'}
              className="w-full bg-surface border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
          ) : (
            <input
              type={f.type === 'url' ? 'url' : 'text'}
              value={(data[f.key] as string) || ''}
              onChange={e => onChange(f.key, e.target.value)}
              placeholder={f.placeholder}
              className="w-full bg-surface border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
          )}
        </div>
      );
}

function TagInput({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder: string }) {
  const [input, setInput] = useState('');
  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = input.trim();
      if (tag && !value.includes(tag)) onChange([...value, tag]);
      setInput('');
    }
  };
  return (
    <div className="bg-surface border border-gray-200 rounded-xl px-3 py-2 flex flex-wrap gap-1.5 min-h-[42px]">
      {value.map(tag => (
        <span key={tag} className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded-lg">
          {tag}
          <button type="button" onClick={() => onChange(value.filter(t => t !== tag))} className="hover:text-primary-light"><X size={12} /></button>
        </span>
      ))}
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKey}
        placeholder={value.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[100px] bg-transparent text-sm outline-none"
      />
    </div>
  );
}
