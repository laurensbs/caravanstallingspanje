'use client';
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { CustomerData } from './types';

interface AccountContextType {
  auth: boolean;
  loading: boolean;
  customer: CustomerData | null;
  logout: () => Promise<void>;
  setAuth: (v: boolean) => void;
  setCustomer: (c: CustomerData | null) => void;
}

const AccountContext = createContext<AccountContextType | null>(null);

export function AccountProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<CustomerData | null>(null);

  useEffect(() => {
    fetch('/api/customer/auth/me', { credentials: 'include' })
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(d => { setAuth(true); setCustomer(d); })
      .catch(() => setAuth(false))
      .finally(() => setLoading(false));
  }, []);

  const logout = useCallback(async () => {
    await fetch('/api/customer/auth/logout', { method: 'POST', credentials: 'include' });
    setAuth(false);
    setCustomer(null);
  }, []);

  return (
    <AccountContext.Provider value={{ auth, loading, customer, logout, setAuth, setCustomer }}>
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount() {
  const ctx = useContext(AccountContext);
  if (!ctx) throw new Error('useAccount must be used within AccountProvider');
  return ctx;
}
