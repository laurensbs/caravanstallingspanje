'use client';

import { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Mail, Phone, Clock, CheckCircle, Trash2 } from 'lucide-react';

interface Message { id: number; name: string; email: string; phone: string; subject: string; message: string; is_read: boolean; replied_at: string; created_at: string; }

export default function BerichtenPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMsg, setSelectedMsg] = useState<Message | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/messages', { credentials: 'include' });
    const data = await res.json();
    setMessages(data.messages || []); setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const markRead = async (id: number) => {
    await fetch(`/api/admin/messages/${id}/read`, { method: 'PATCH', credentials: 'include' });
    fetchData();
  };

  const deleteMsg = async (id: number) => {
    if (!confirm('Weet je zeker dat je dit bericht wilt verwijderen?')) return;
    await fetch(`/api/admin/messages/${id}`, { method: 'DELETE', credentials: 'include' });
    if (selectedMsg?.id === id) setSelectedMsg(null);
    fetchData();
  };

  const fmtDate = (d: string) => {
    const date = new Date(d);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min geleden`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} uur geleden`;
    return date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' });
  };

  const filtered = messages.filter(m => filter === 'all' ? true : filter === 'unread' ? !m.is_read : m.is_read);
  const unreadCount = messages.filter(m => !m.is_read).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-2xl font-black text-slate-900">Berichten</h1><p className="text-sm text-slate-400 mt-1">{unreadCount} ongelezen van {messages.length} berichten</p></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="p-3 border-b border-slate-100 flex gap-2">
              {(['all', 'unread', 'read'] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex-1 transition-all ${filter === f ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/20' : 'bg-slate-50 hover:bg-slate-100 text-slate-500'}`}>{f === 'all' ? 'Alle' : f === 'unread' ? 'Ongelezen' : 'Gelezen'}</button>
              ))}
            </div>
            <div className="divide-y max-h-[600px] overflow-y-auto">
              {loading ? <div className="p-4 text-center text-sm text-slate-400">Laden...</div> :
              filtered.length === 0 ? <div className="p-4 text-center text-sm text-slate-400">Geen berichten</div> :
              filtered.map(m => (
                <button key={m.id} onClick={() => { setSelectedMsg(m); if (!m.is_read) markRead(m.id); }} className={`w-full text-left p-4 hover:bg-slate-50/50 transition-colors ${selectedMsg?.id === m.id ? 'bg-amber-50 border-l-2 border-amber-500' : ''} ${!m.is_read ? 'bg-amber-50/30' : ''}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        {!m.is_read && <div className="w-2 h-2 bg-amber-500 rounded-full flex-shrink-0" />}
                        <span className={`text-sm truncate ${!m.is_read ? 'font-semibold text-slate-800' : 'text-slate-600'}`}>{m.name}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 truncate">{m.subject || m.message.substring(0, 50)}</p>
                    </div>
                    <span className="text-xs text-slate-400 flex-shrink-0">{fmtDate(m.created_at)}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedMsg ? (
            <div className="bg-white rounded-2xl border border-slate-100">
              <div className="p-6 border-b border-slate-100">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{selectedMsg.subject || 'Geen onderwerp'}</h2>
                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                      <span className="font-medium text-slate-800">{selectedMsg.name}</span>
                      <span className="flex items-center gap-1"><Mail size={12}/> {selectedMsg.email}</span>
                      {selectedMsg.phone && <span className="flex items-center gap-1"><Phone size={12}/> {selectedMsg.phone}</span>}
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-xs text-slate-400"><Clock size={12}/> {new Date(selectedMsg.created_at).toLocaleString('nl-NL')}</div>
                  </div>
                  <button onClick={() => deleteMsg(selectedMsg.id)} className="text-red-400 hover:text-red-600 p-2"><Trash2 size={16}/></button>
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm whitespace-pre-wrap leading-relaxed text-slate-600">{selectedMsg.message}</p>
              </div>
              <div className="p-6 border-t border-slate-100">
                <a href={`mailto:${selectedMsg.email}?subject=Re: ${selectedMsg.subject || 'Uw bericht'}`} className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm inline-flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all"><Mail size={16}/> Beantwoorden via e-mail</a>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
              <MessageSquare size={48} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-400">Selecteer een bericht om te lezen</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
