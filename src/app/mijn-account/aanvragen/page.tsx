'use client';

import { useState, useEffect } from 'react';
import type { CaravanItem } from '../_components/types';
import DienstenTab from '../_components/DienstenTab';

export default function AanvragenPage() {
  const [caravans, setCaravans] = useState<CaravanItem[]>([]);

  useEffect(() => {
    fetch('/api/customer/caravans', { credentials: 'include' })
      .then(r => r.json())
      .then(d => setCaravans(d.caravans || []))
      .catch(() => {});
  }, []);

  return <DienstenTab caravans={caravans} />;
}
