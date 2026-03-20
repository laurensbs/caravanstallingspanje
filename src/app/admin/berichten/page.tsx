'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { MessageSquare, Send, Plus, X, Clock, User, Archive, MailOpen, Inbox } from 'lucide-react';
import Modal from '@/components/ui/Modal';

interface Conversation { id: number; customer_id: number; subject: string; status: string; customer_name: string; customer_email: string; unread_count: number; last_message: string; last_message_at: string; created_at: string; }
interface ConvMessage { id: number; conversation_id: number; sender_type: string; sender_id: number; sender_name: string; message: string; is_read: boolean; created_at: string; }

export default function BerichtenPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ConvMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState<'all' | 'open' | 'gesloten'>('all');
  const [showNew, setShowNew] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newCustomerId, setNewCustomerId] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/conversations', { credentials: 'include' });
    const data = await res.json();
    setConversations(data.conversations || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  const openConversation = async (conv: Conversation) => {
    setSelectedConv(conv);
    setMsgLoading(true);
    const res = await fetch(`/api/admin/conversations/${conv.id}`, { credentials: 'include' });
    const data = await res.json();
    setMessages(data.messages || []);
    setMsgLoading(false);
    // Update unread count locally
    setConversations(prev => prev.map(c => c.id === conv.id ? { ...c, unread_count: 0 } : c));
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const sendReply = async () => {
    if (!reply.trim() || !selectedConv) return;
    setSending(true);
    await fetch(`/api/admin/conversations/${selectedConv.id}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: reply, sender_type: 'admin', sender_name: 'Beheerder' }),
    });
    setReply('');
    setSending(false);
    openConversation(selectedConv);
    fetchConversations();
  };

  const createConversation = async () => {
    if (!newSubject.trim() || !newMessage.trim()) return;
    setSending(true);
    await fetch('/api/admin/conversations', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_id: newCustomerId ? Number(newCustomerId) : null,
        subject: newSubject,
        message: newMessage,
        sender_type: 'admin',
        sender_name: 'Beheerder',
      }),
    });
    setSending(false);
    setShowNew(false);
    setNewSubject('');
    setNewMessage('');
    setNewCustomerId('');
    fetchConversations();
  };

  const toggleStatus = async (conv: Conversation) => {
    const newStatus = conv.status === 'open' ? 'gesloten' : 'open';
    await fetch(`/api/admin/conversations/${conv.id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchConversations();
    if (selectedConv?.id === conv.id) {
      setSelectedConv({ ...conv, status: newStatus });
    }
  };

  const fmtDate = (d: string) => {
    const date = new Date(d);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}u`;
    return date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' });
  };

  const filtered = conversations.filter(c => filter === 'all' ? true : c.status === filter);
  const totalUnread = conversations.reduce((sum, c) => sum + Number(c.unread_count || 0), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Berichten</h1>
          <p className="text-sm text-gray-500/70 mt-1">{totalUnread} ongelezen • {conversations.length} gesprekken</p>
        </div>
        <button onClick={() => setShowNew(true)} className="bg-primary hover:bg-primary-light text-white font-semibold px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-primary/20 transition-all">
          <Plus size={16} /> Nieuw gesprek
        </button>
      </div>

      {/* New conversation modal */}
      <Modal open={showNew} onClose={() => setShowNew(false)} title="Nieuw gesprek">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-900 block mb-1">Klant ID (optioneel)</label>
                <input value={newCustomerId} onChange={e => setNewCustomerId(e.target.value)} placeholder="bijv. 42" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-900 block mb-1">Onderwerp</label>
                <input value={newSubject} onChange={e => setNewSubject(e.target.value)} placeholder="Onderwerp van het gesprek" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-900 block mb-1">Bericht</label>
                <textarea value={newMessage} onChange={e => setNewMessage(e.target.value)} rows={4} placeholder="Typ uw bericht..." className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setShowNew(false)} className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50">Annuleren</button>
                <button onClick={createConversation} disabled={sending || !newSubject.trim() || !newMessage.trim()} className="bg-primary text-white font-semibold px-6 py-2.5 rounded-xl text-sm disabled:opacity-50 flex items-center gap-2">
                  <Send size={14} /> Versturen
                </button>
              </div>
            </div>
      </Modal>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversation list */}
        <div className="lg:col-span-1">
          <div className="bg-surface rounded-2xl border border-gray-200 overflow-hidden">
            <div className="p-3 border-b border-gray-200 flex gap-2">
              {([['all', 'Alle', Inbox], ['open', 'Open', MailOpen], ['gesloten', 'Archief', Archive]] as const).map(([key, label, Icon]) => (
                <button key={key} onClick={() => setFilter(key as typeof filter)} className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex-1 transition-all flex items-center justify-center gap-1.5 ${filter === key ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-gray-50 hover:bg-gray-300/20 text-gray-500'}`}>
                  <Icon size={12} /> {label}
                </button>
              ))}
            </div>
            <div className="divide-y max-h-[600px] overflow-y-auto">
              {loading ? <div className="p-8 text-center text-sm text-gray-500/70">Laden...</div> :
              filtered.length === 0 ? <div className="p-8 text-center text-sm text-gray-500/70">Geen gesprekken</div> :
              filtered.map(c => (
                <button key={c.id} onClick={() => openConversation(c)} className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${selectedConv?.id === c.id ? 'bg-warning/10 border-l-2 border-warning' : ''} ${Number(c.unread_count) > 0 ? 'bg-warning/10/30' : ''}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        {Number(c.unread_count) > 0 && <span className="w-5 h-5 bg-warning/100 text-white rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0">{c.unread_count}</span>}
                        <span className={`text-sm truncate ${Number(c.unread_count) > 0 ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>{c.customer_name || 'Onbekend'}</span>
                      </div>
                      <p className="text-xs font-medium text-gray-900 mt-0.5 truncate">{c.subject}</p>
                      <p className="text-xs text-gray-500/70 mt-0.5 truncate">{c.last_message?.substring(0, 60)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="text-xs text-gray-500/70">{fmtDate(c.last_message_at)}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${c.status === 'open' ? 'bg-accent/15 text-primary-dark' : 'bg-gray-100 text-gray-500'}`}>{c.status}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Conversation thread */}
        <div className="lg:col-span-2">
          {selectedConv ? (
            <div className="bg-surface rounded-2xl border border-gray-200 flex flex-col h-[680px]">
              {/* Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-gray-900">{selectedConv.subject}</h2>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500/70">
                    <span className="flex items-center gap-1"><User size={10} /> {selectedConv.customer_name || 'Admin'}</span>
                    <span className="flex items-center gap-1"><Clock size={10} /> {new Date(selectedConv.created_at).toLocaleDateString('nl-NL')}</span>
                  </div>
                </div>
                <button onClick={() => toggleStatus(selectedConv)} className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${selectedConv.status === 'open' ? 'bg-gray-100 hover:bg-gray-200 text-gray-500' : 'bg-accent/15 hover:bg-accent/20 text-primary-dark'}`}>
                  {selectedConv.status === 'open' ? 'Archiveren' : 'Heropenen'}
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {msgLoading ? (
                  <div className="text-center text-sm text-gray-500/70 py-8">Laden...</div>
                ) : messages.map(m => (
                  <div key={m.id} className={`flex ${m.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${m.sender_type === 'admin' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-900'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-semibold ${m.sender_type === 'admin' ? 'text-white/80' : 'text-gray-500'}`}>{m.sender_name}</span>
                        <span className={`text-xs ${m.sender_type === 'admin' ? 'text-white/60' : 'text-gray-500/70'}`}>
                          {new Date(m.created_at).toLocaleString('nl-NL', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{m.message}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex gap-2">
                  <textarea
                    value={reply}
                    onChange={e => setReply(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
                    placeholder="Typ een antwoord... (Enter om te versturen)"
                    rows={2}
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
                  />
                  <button onClick={sendReply} disabled={sending || !reply.trim()} className="bg-primary hover:bg-primary-light text-white p-3 rounded-xl self-end disabled:opacity-50 transition-all" aria-label="Antwoord versturen">
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-surface rounded-2xl border border-gray-200 p-12 text-center h-[680px] flex flex-col items-center justify-center">
              <MessageSquare size={48} className="text-gray-500/40 mb-4" />
              <p className="text-gray-500/70 text-sm">Selecteer een gesprek of start een nieuw gesprek</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
