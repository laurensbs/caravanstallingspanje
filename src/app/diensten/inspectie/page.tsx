'use client';

import { ClipboardCheck } from 'lucide-react';
import ServiceInfoPage from '@/components/ServiceInfoPage';

export default function InspectiePage() {
  return (
    <ServiceInfoPage
      titleKey="services.inspection-title"
      introKey="services.inspection-desc"
      eyebrowKey="inspection-info.eyebrow"
      bullets={[
        'inspection-info.bullet-1',
        'inspection-info.bullet-2',
        'inspection-info.bullet-3',
        'inspection-info.bullet-4',
      ]}
      subjectKey="inspection-info.subject"
      icon={ClipboardCheck}
      accent="cyan"
    />
  );
}
