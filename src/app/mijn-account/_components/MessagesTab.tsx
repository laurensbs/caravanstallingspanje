'use client';
import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Plus, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const msgsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/customer/conversations', { credentials: 'include' }).then(r => r.json()).then(d => setConvs(d.conversations || [])).catch(() => {});
  }, []);

  useEffect(() => { msgsEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

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

  const inputClass = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all';

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-gray-900 text-xl">Berichten</h2>
          <p className="text-sm text-gray-500/60 mt-0.5">Communiceer direct met ons team</p>
        </div>
        <button onClick={() => setShowNew(true)} className="bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary text-white font-bold px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 transition-all shadow-lg shadow-primary/20 hover:-translate-y-0.5">
          <Plus size={15} /> Nieuw bericht
        </button>
      </div>

      <AnimatePresence>
        {showNew && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="card-premium p-6 space-y-4">
            <h3 className="font-bold text-gray-900">Nieuw gesprek starten</h3>
            <input value={newSubject} onChange={e => setNewSubject(e.target.value)} placeholder="Onderwerp" className={inputClass} />
            <textarea value={newMessage} onChange={e => setNewMessage(e.target.value)} rows={4} placeholder="Typ uw bericht..." className={`${inputClass} resize-none`} />
            <div className="flex gap-3">
              <button onClick={() => setShowNew(false)} className="text-sm text-gray-500/70 px-5 py-2.5 hover:text-gray-500 transition-colors font-medium">Annuleren</button>
              <button onClick={createConv} disabled={sending} className="bg-gradient-to-r from-primary to-primary-light text-white font-bold px-6 py-2.5 rounded-xl text-sm disabled:opacity-50 shadow-lg shadow-primary/20 transition-all">Versturen</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="space-y-2">
          {convs.length === 0 ? (
            <div className="card-premium p-10 text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-primary/10 to-ocean/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <MessageSquare size={24} className="text-gray-500/40" />
              </div>
              <p className="text-sm text-gray-500/70 font-bold">Nog geen gesprekken</p>
              <p className="text-xs text-gray-500/50 mt-1">Start een nieuw bericht hierboven</p>
            </div>
          ) : convs.map((c, i) => (
            <motion.button key={c.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              onClick={() => openConv(c)}
              className={`w-full text-left rounded-xl border p-4 transition-all hover:shadow-md ${selected?.id === c.id ? 'bg-primary/[0.06] border-primary/30 shadow-md shadow-primary/10' : 'bg-surface border-gray-200 hover:border-primary/20'}`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-900 truncate">{c.subject}</span>
                {Number(c.unread_count) > 0 && <span className="w-5 h-5 bg-gradient-to-br from-primary to-primary-dark text-white rounded-full text-xs font-bold flex items-center justify-center shadow-sm shadow-primary/30">{c.unread_count}</span>}
              </div>
              <p className="text-xs text-gray-500/60 mt-1.5 truncate">{c.last_message?.substring(0, 60)}</p>
              {c.last_message_at && <p className="text-xs text-gray-500/40 mt-1">{new Date(c.last_message_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}</p>}
            </motion.button>
          ))}
        </div>

        <div className="lg:col-span-2">
          {selected ? (
            <div className="card-premium flex flex-col h-[500px] overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex items-center gap-3 bg-gradient-to-r from-gray-50 to-transparent">
                <button onClick={() => setSelected(null)} className="lg:hidden text-gray-500/60 hover:text-gray-500"><ArrowLeft size={18} /></button>
                <div className="w-8 h-8 bg-gradient-to-br from-primary/15 to-accent/10 rounded-lg flex items-center justify-center">
                  <MessageSquare size={14} className="text-primary" />
                </div>
                <h3 className="font-bold text-gray-900 text-sm">{selected.subject}</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {msgs.map((m, i) => (
                  <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    className={`flex ${m.sender_type === 'customer' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${m.sender_type === 'customer' ? 'bg-gradient-to-br from-primary to-primary-dark text-white rounded-br-md' : 'bg-white text-gray-900 border border-gray-200 rounded-bl-md'}`}>
                      <p className={`text-xs font-bold mb-1 ${m.sender_type === 'customer' ? 'text-white/60' : 'text-primary'}`}>{m.sender_name}</p>
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{m.message}</p>
                      <p className={`text-xs mt-1.5 ${m.sender_type === 'customer' ? 'text-white/50' : 'text-gray-500/50'}`}>
                        {new Date(m.created_at).toLocaleString('nl-NL', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  </motion.div>
                ))}
                <div ref={msgsEndRef} />
              </div>
              <div className="p-4 border-t border-gray-200 flex gap-2 bg-surface">
                <input value={reply} onChange={e => setReply(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(); }}} placeholder="Typ een reactie..." className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-gray-50 focus:bg-white transition-all" />
                <button onClick={sendReply} disabled={sending || !reply.trim()} className="bg-gradient-to-r from-primary to-primary-light text-white p-2.5 rounded-xl disabled:opacity-40 shadow-md shadow-primary/20 hover:-translate-y-0.5 transition-all" aria-label="Bericht versturen"><Send size={16} /></button>
              </div>
            </div>
          ) : (
            <div className="card-premium p-14 text-center h-[500px] flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-ocean/10 rounded-2xl flex items-center justify-center mb-4">
                <MessageSquare size={28} className="text-gray-500/30" />
              </div>
              <p className="text-gray-500/60 font-bold">Selecteer een gesprek</p>
              <p className="text-gray-500/40 text-sm mt-1">Of start een nieuw bericht</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
