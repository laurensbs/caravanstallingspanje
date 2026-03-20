'use client';
import { useState, useEffect } from 'react';
import { Star, Eye, EyeOff, MessageSquare } from 'lucide-react';
import { fmtDate } from '@/lib/format';
import { toast } from 'sonner';

interface Review {
  id: number; customer_name: string; customer_email: string; rating: number;
  title: string; comment: string; is_published: boolean; admin_reply: string; created_at: string;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState<string>('');
  const [replyId, setReplyId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');

  const fetchReviews = async () => {
    const params = new URLSearchParams();
    if (filter) params.set('published', filter);
    const res = await fetch(`/api/admin/reviews?${params}`, { credentials: 'include' });
    const data = await res.json();
    setReviews(data.reviews || []);
    setTotal(data.total || 0);
  };

  useEffect(() => { fetchReviews(); }, [filter]);

  const togglePublish = async (id: number, publish: boolean) => {
    await fetch(`/api/admin/reviews/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_published: publish }), credentials: 'include',
    });
    fetchReviews();
    toast.success(publish ? 'Review gepubliceerd' : 'Review verborgen');
  };

  const submitReply = async (id: number) => {
    await fetch(`/api/admin/reviews/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ admin_reply: replyText, is_published: true }), credentials: 'include',
    });
    setReplyId(null); setReplyText('');
    fetchReviews();
    toast.success('Reactie geplaatst');
  };

  const avg = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '–';

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-2xl font-black text-surface-dark">Reviews</h1><p className="text-sm text-warm-gray/70 mt-1">{total} reviews · Gemiddeld: {avg} ★</p></div>
      </div>

      <div className="flex gap-2 mb-6">
        {[{ v: '', l: 'Alle' }, { v: 'true', l: 'Gepubliceerd' }, { v: 'false', l: 'Ongepubliceerd' }].map(s => (
          <button key={s.v} onClick={() => setFilter(s.v)} className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${filter === s.v ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-sand/40 hover:bg-sand-dark/20 text-warm-gray'}`}>{s.l}</button>
        ))}
      </div>

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="bg-surface rounded-2xl border border-sand-dark/20 p-8 text-center text-warm-gray/70">Geen reviews gevonden</div>
        ) : reviews.map(r => (
          <div key={r.id} className={`bg-surface rounded-2xl border p-5 transition-all ${r.is_published ? 'border-sand-dark/20' : 'border-warning/30 bg-warning/[0.02]'}`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex">{[1,2,3,4,5].map(s => <Star key={s} size={14} className={s <= r.rating ? 'text-warning fill-warning' : 'text-sand-dark/40'} />)}</div>
                  {r.title && <span className="font-bold text-sm text-surface-dark">{r.title}</span>}
                </div>
                <p className="text-xs text-warm-gray/70">{r.customer_name} · {r.customer_email} · {fmtDate(r.created_at)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => togglePublish(r.id, !r.is_published)} className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${r.is_published ? 'bg-accent/10 text-accent hover:bg-accent/20' : 'bg-sand/40 text-warm-gray hover:bg-sand-dark/20'}`}>
                  {r.is_published ? <><Eye size={12} /> Gepubliceerd</> : <><EyeOff size={12} /> Verborgen</>}
                </button>
              </div>
            </div>
            {r.comment && <p className="text-sm text-warm-gray leading-relaxed mb-3">{r.comment}</p>}
            {r.admin_reply && (
              <div className="bg-primary/[0.04] border border-primary/20 rounded-xl p-3 mb-3">
                <p className="text-xs font-semibold text-primary mb-1">Uw reactie:</p>
                <p className="text-sm text-warm-gray">{r.admin_reply}</p>
              </div>
            )}
            {replyId === r.id ? (
              <div className="flex gap-2">
                <input value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Schrijf een reactie..." className="flex-1 border border-sand-dark/30 rounded-lg px-3 py-2 text-sm bg-sand/40 focus:ring-2 focus:ring-primary/20 outline-none" />
                <button onClick={() => submitReply(r.id)} disabled={!replyText.trim()} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50">Plaatsen</button>
                <button onClick={() => setReplyId(null)} className="text-sm text-warm-gray/70 px-3">Annuleren</button>
              </div>
            ) : (
              <button onClick={() => { setReplyId(r.id); setReplyText(r.admin_reply || ''); }} className="text-xs text-ocean font-medium flex items-center gap-1 hover:text-ocean-dark transition-colors">
                <MessageSquare size={12} /> {r.admin_reply ? 'Reactie bewerken' : 'Reageren'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
