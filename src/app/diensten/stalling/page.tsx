'use client';

import { Warehouse } from 'lucide-react';
import ServiceInfoPage from '@/components/ServiceInfoPage';

export default function StallingPage() {
  return (
    <ServiceInfoPage
      titleKey="services.storage-title"
      introKey="services.storage-desc"
      eyebrowKey="storage-info.eyebrow"
      bullets={[
        'storage-info.bullet-1',
        'storage-info.bullet-2',
        'storage-info.bullet-3',
        'storage-info.bullet-4',
      ]}
      subjectKey="storage-info.subject"
      icon={Warehouse}
      accent="amber"
    />
  );
}
