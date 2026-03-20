'use client';

import { useState, useCallback } from 'react';
import { Bell, X, Check, MessageSquare, FileText, Truck, Wrench, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVisibleInterval } from '@/hooks/useVisibleInterval';

interface Notification {
  id: number;
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

const ICON_MAP: Record<string, React.ElementType> = {
  factuur: FileText,
  transport: Truck,
  bericht: MessageSquare,
  service: Wrench,
  waarschuwing: AlertTriangle,
};

function getIcon(title: string) {
  for (const [key, Icon] of Object.entries(ICON_MAP)) {
    if (title.toLowerCase().includes(key)) return Icon;
  }
  return Bell;
}

export default function NotificationCenter({ userType }: { userType: string; userId?: number }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const fetchNotifications = useCallback(async () => {
    try {
      const endpoint = userType === 'admin' ? '/api/admin/notifications' : userType === 'staff' ? '/api/staff/notifications' : '/api/customer/notifications';
      const res = await fetch(endpoint, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch {
      // Silently fail — notifications are non-critical
    }
  }, [userType]);

  useVisibleInterval(fetchNotifications, 30_000);

  const markAsRead = async (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors"
      >
        <Bell size={20} className="text-gray-500" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-danger text-white text-xs font-bold rounded-full flex items-center justify-center"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="font-bold text-sm">Notificaties</h3>
                <button onClick={() => setOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                  <X size={16} className="text-gray-500" />
                </button>
              </div>

              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="text-center py-12 px-4">
                    <Bell size={32} className="text-gray-500/20 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">Geen notificaties</p>
                  </div>
                ) : (
                  notifications.slice(0, 20).map(n => {
                    const Icon = getIcon(n.title);
                    return (
                      <div
                        key={n.id}
                        onClick={() => markAsRead(n.id)}
                        className={`flex items-start gap-3 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${!n.is_read ? 'bg-primary/[0.02]' : ''}`}
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${!n.is_read ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-500'}`}>
                          <Icon size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold truncate">{n.title}</p>
                            {!n.is_read && <span className="w-2 h-2 bg-primary rounded-full shrink-0" />}
                          </div>
                          {n.message && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>}
                          <p className="text-xs text-gray-500/60 mt-1">{new Date(n.created_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        {!n.is_read && (
                          <button onClick={(e) => { e.stopPropagation(); markAsRead(n.id); }} className="p-1 hover:bg-gray-100 rounded-lg transition-colors shrink-0">
                            <Check size={14} className="text-gray-500" />
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
