'use client';
import { useState, useEffect } from 'react';
import { MessageSquare, Send } from 'lucide-react';

interface ConvItem { id: number; subject: string; status: string; unread_count: number; last_message: string; last_sender: string; last_message_at: string; }
interface ConvMsg { id: number; sender_type: string; sender_name: string; message: string; created_at: string; }

export default function CustomerMessagesTab() {
  const [convs, setConvs] = useState<ConvItem[]>([]);
  const [selected, setSelected] = useState<ConvItem | null>(null);
  const [msgs, setMsgs] = useState<ConvMsg[]>([]);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    fetch('/api/customer/conversations', { credentials: 'include' }).then(r => r.json()).then(d => setConvs(d.conversations || [])).catch(() => {});
  }, []);

  const openConv = async (c: ConvItem) => {
    setSelected(c);
    const res = await fetch(`/api/customer/conversations/${c.id}`, { credentials: 'include' });
    const data = await res.json();
    setMsgs(data.messages || []);
    setConvs(prev => prev.map(x => x.id === c.id ? { ...x, unread_count: 0 } : x));
  };

  const sendReply = async () => {
    if (!reply.trim() || !selected) return;
    setSending(true);
    await fetch(`/api/customer/conversations/${selected.id}`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: reply }) });
    setReply('');
    setSending(false);
    openConv(selected);
  };

  const createConv = async () => {
    if (!newSubject.trim() || !newMessage.trim()) return;
    setSending(true);
    await fetch('/api/customer/conversations', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subject: newSubject, message: newMessage }) });
    setSending(false);
    setShowNew(false);
    setNewSubject('');
    setNewMessage('');
    const res = await fetch('/api/customer/conversations', { credentials: 'include' });
    const data = await res.json();
    setConvs(data.conversations || []);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-surface-dark text-lg">Berichten</h2>
        <button onClick={() => setShowNew(true)} className="bg-primary hover:bg-primary-light text-white font-semibold px-4 py-2 rounded-xl text-sm flex items-center gap-2 transition-all"><Send size={14} /> Nieuw bericht</button>
      </div>

      {showNew && (
        <div className="bg-surface rounded-2xl border border-sand-dark/20 p-6 space-y-4">
          <input value={newSubject} onChange={e => setNewSubject(e.target.value)} placeholder="Onderwerp" className="w-full px-4 py-3 border border-sand-dark/30 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
          <textarea value={newMessage} onChange={e => setNewMessage(e.target.value)} rows={4} placeholder="Typ uw bericht..." className="w-full px-4 py-3 border border-sand-dark/30 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none" />
          <div className="flex gap-3">
            <button onClick={() => setShowNew(false)} className="text-sm text-warm-gray/70 px-4 py-2">Annuleren</button>
            <button onClick={createConv} disabled={sending} className="bg-primary text-white font-semibold px-5 py-2 rounded-xl text-sm disabled:opacity-50">Versturen</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="space-y-2">
          {convs.length === 0 ? (
            <div className="bg-surface rounded-2xl border border-sand-dark/20 p-8 text-center">
              <MessageSquare size={32} className="text-warm-gray/40 mx-auto mb-3" />
              <p className="text-sm text-warm-gray/70">Nog geen gesprekken</p>
            </div>
          ) : convs.map(c => (
            <button key={c.id} onClick={() => openConv(c)} className={`w-full text-left bg-surface rounded-xl border p-4 transition-all hover:shadow-md ${selected?.id === c.id ? 'border-primary shadow-md' : 'border-sand-dark/20'}`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-surface-dark truncate">{c.subject}</span>
                {Number(c.unread_count) > 0 && <span className="w-5 h-5 bg-primary text-white rounded-full text-xs font-bold flex items-center justify-center">{c.unread_count}</span>}
              </div>
              <p className="text-xs text-warm-gray/70 mt-1 truncate">{c.last_message?.substring(0, 60)}</p>
            </button>
          ))}
        </div>

        <div className="lg:col-span-2">
          {selected ? (
            <div className="bg-surface rounded-2xl border border-sand-dark/20 flex flex-col h-[500px]">
              <div className="p-4 border-b border-sand-dark/20">
                <h3 className="font-bold text-surface-dark text-sm">{selected.subject}</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {msgs.map(m => (
                  <div key={m.id} className={`flex ${m.sender_type === 'customer' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${m.sender_type === 'customer' ? 'bg-primary text-white' : 'bg-sand text-surface-dark'}`}>
                      <p className={`text-xs font-semibold mb-1 ${m.sender_type === 'customer' ? 'text-white/70' : 'text-warm-gray'}`}>{m.sender_name}</p>
                      <p className="text-sm whitespace-pre-wrap">{m.message}</p>
                      <p className={`text-xs mt-1 ${m.sender_type === 'customer' ? 'text-white/70' : 'text-warm-gray/70'}`}>
                        {new Date(m.created_at).toLocaleString('nl-NL', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-sand-dark/20 flex gap-2">
                <input value={reply} onChange={e => setReply(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') sendReply(); }} placeholder="Typ een reactie..." className="flex-1 px-4 py-2.5 border border-sand-dark/30 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                <button onClick={sendReply} disabled={sending || !reply.trim()} className="bg-primary text-white p-2.5 rounded-xl disabled:opacity-50" aria-label="Bericht versturen"><Send size={16} /></button>
              </div>
            </div>
          ) : (
            <div className="bg-surface rounded-2xl border border-sand-dark/20 p-12 text-center h-[500px] flex flex-col items-center justify-center">
              <MessageSquare size={40} className="text-warm-gray/40 mb-3" />
              <p className="text-sm text-warm-gray/70">Selecteer een gesprek</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
