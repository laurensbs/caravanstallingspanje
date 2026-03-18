'use client';

import { useState, useEffect, useCallback } from 'react';

interface UseAdminDataOptions {
  endpoint: string;
  dataKey: string;
  limit?: number;
  params?: Record<string, string>;
}

interface UseAdminDataResult<T> {
  items: T[];
  total: number;
  page: number;
  setPage: (p: number) => void;
  loading: boolean;
  refetch: () => void;
}

export function useAdminData<T>({ endpoint, dataKey, limit = 50, params = {} }: UseAdminDataOptions): UseAdminDataResult<T> {
  const [items, setItems] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const paramKey = JSON.stringify(params);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const qs = new URLSearchParams({ page: String(page), limit: String(limit) });
    const extra = JSON.parse(paramKey) as Record<string, string>;
    Object.entries(extra).forEach(([k, v]) => { if (v) qs.set(k, v); });
    const res = await fetch(`${endpoint}?${qs}`, { credentials: 'include' });
    const data = await res.json();
    setItems(data[dataKey] || []);
    setTotal(data.total || 0);
    setLoading(false);
  }, [endpoint, dataKey, page, limit, paramKey]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return { items, total, page, setPage, loading, refetch: fetchData };
}
