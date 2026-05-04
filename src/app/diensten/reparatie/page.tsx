'use client';

import { Wrench } from 'lucide-react';
import ServiceInfoPage from '@/components/ServiceInfoPage';

// Tijdelijk niet online te boeken — toont info + CTA naar contact + telefoon.
// Wanneer de Stripe-flow weer aangezet wordt, vervang door de oude
// reparatie-form-component.

export default function ReparatiePage() {
  return (
    <ServiceInfoPage
      titleKey="services.repair-title"
      introKey="services.repair-desc"
      eyebrowKey="repair-info.eyebrow"
      bullets={[
        'repair-info.bullet-1',
        'repair-info.bullet-2',
        'repair-info.bullet-3',
        'repair-info.bullet-4',
      ]}
      subjectKey="repair-info.subject"
      icon={Wrench}
      accent="violet"
    />
  );
}
