'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Lightbulb, Mail, Trash2, Check, RotateCcw, Star, ThumbsUp, ThumbsDown,
} from 'lucide-react';
import { Button, Badge, Skeleton, Select } from '@/components/ui';
import PageHeader from '@/components/admin/PageHeader';

type Idea = {
  id: number;
  name: string | null;
  email: string | null;
  category: string | null;
  title: string;
  message: string;
  status: string;
  votes_up: number;
  votes_down: number;
  featured: boolean;
  created_at: string;
};

const STATUS_OPTIONS = [
  { value: 'new',         label: 'New',         tone: 'warning' as const },
  { value: 'shortlist',   label: 'Shortlist',   tone: 'accent'  as const },
  { value: 'in_progress', label: 'In progress', tone: 'accent'  as const },
  { value: 'done',        label: 'Completed',   tone: 'success' as const },
  { value: 'archived',    label: 'Archived',    tone: 'neutral' as const },
];

function fmtDate(s: string): string {
  return new Date(s).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function IdeasInboxPage() {
  const [ideas, setIdeas] = useState<Idea[] | null>(null);
  const [filter, setFilter] = useState('new');

  const load = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filter) params.set('status', filter);
      const r = await fetch(`/api/admin/ideas?${params}`, { credentials: 'include' });
      const d = await r.json();
      setIdeas(d.ideas || []);
    } catch {
      setIdeas([]);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const setStatus = async (id: number, status: string) => {
    const res = await fetch(`/api/admin/ideas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
      credentials: 'include',
    });
    if (!res.ok) { toast.error('Status change failed'); return; }
    toast.success('Updated');
    load();
  };

  const toggleFeatured = async (id: number, featured: boolean) => {
    const res = await fetch(`/api/admin/ideas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ featured }),
      credentials: 'include',
    });
    if (!res.ok) { toast.error('Update failed'); return; }
    toast.success(featured ? 'Idea is now public on /ideeen' : 'Idea hidden from public');
    load();
  };

  const remove = async (id: number) => {
    if (!confirm('Delete idea?')) return;
    const res = await fetch(`/api/admin/ideas/${id}`, {
      method: 'DELETE', credentials: 'include',
    });
    if (!res.ok) { toast.error('Delete failed'); return; }
    toast.success('Deleted');
    load();
  };

  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="Ideas inbox"
        description="Ideas submitted by customers on /ideeen."
        actions={
          <Select value={filter} onChange={(e) => setFilter(e.target.value)} className="min-w-[160px]">
            <option value="">All</option>
            {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </Select>
        }
      />

      {ideas === null ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-24" delayMs={i * 40} />)}
        </div>
      ) : ideas.length === 0 ? (
        <div className="card-surface p-12 text-center">
          <div className="w-12 h-12 rounded-[var(--radius-2xl)] bg-surface-2 border border-border flex items-center justify-center mx-auto mb-4">
            <Lightbulb size={18} className="text-text-subtle" />
          </div>
          <p className="text-sm text-text">
            {filter ? `No ideas with status "${filter}"` : 'No ideas yet'}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          <AnimatePresence initial={false}>
            {ideas.map((m) => {
              const tone = STATUS_OPTIONS.find((s) => s.value === m.status)?.tone || 'neutral';
              const label = STATUS_OPTIONS.find((s) => s.value === m.status)?.label || m.status;
              return (
                <motion.li
                  key={m.id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  className="card-surface p-5"
                >
                  <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-semibold text-text">{m.title}</h3>
                        <Badge tone={tone}>{label}</Badge>
                        {m.category && <Badge tone="neutral">{m.category}</Badge>}
                        {m.featured && <Badge tone="warning"><Star size={10} /> Featured</Badge>}
                      </div>
                      <p className="text-[11px] text-text-muted">
                        {fmtDate(m.created_at)} · from {m.name || 'anonymous'}
                        {m.email ? ` · ${m.email}` : ''}
                      </p>
                      {((m.votes_up || 0) + (m.votes_down || 0)) > 0 && (
                        <p className="text-[12px] mt-1 inline-flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 text-success">
                            <ThumbsUp size={11} /> {m.votes_up || 0}
                          </span>
                          <span className="inline-flex items-center gap-1 text-danger">
                            <ThumbsDown size={11} /> {m.votes_down || 0}
                          </span>
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1 shrink-0 items-center">
                      <Button
                        size="sm"
                        variant={m.featured ? 'secondary' : 'ghost'}
                        onClick={() => toggleFeatured(m.id, !m.featured)}
                      >
                        <Star size={12} /> {m.featured ? 'Hide from public' : 'Show publicly'}
                      </Button>
                      <Select value={m.status} onChange={(e) => setStatus(m.id, e.target.value)} className="min-w-[140px]">
                        {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </Select>
                      {m.email && (
                        <a href={`mailto:${m.email}?subject=${encodeURIComponent('Re: ' + m.title)}`}>
                          <Button size="sm" variant="ghost"><Mail size={12} /> Reply</Button>
                        </a>
                      )}
                      <button
                        onClick={() => remove(m.id)}
                        className="w-8 h-8 inline-flex items-center justify-center rounded-[var(--radius-md)] text-text-muted hover:text-danger hover:bg-danger-soft transition-colors"
                        aria-label="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  <p className="text-[13px] text-text-muted leading-relaxed whitespace-pre-wrap">
                    {m.message}
                  </p>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}

      {/* Suppress unused warnings on icons that we might use later */}
      <div className="hidden">
        <Check /><RotateCcw /><Star />
      </div>
    </>
  );
}
