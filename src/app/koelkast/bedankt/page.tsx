'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import SuccessScreen from '@/components/SuccessScreen';

export default function ThankYouPage() {
  return (
    <Suspense fallback={null}>
      <ThankYouContent />
    </Suspense>
  );
}

function ThankYouContent() {
  const params = useSearchParams();
  const sessionId = params.get('session_id');
  const reference = sessionId ? `${sessionId.slice(0, 16)}…` : null;

  return (
    <SuccessScreen
      title="Betaling ontvangen"
      body="Bedankt! Je koelkasthuur staat klaar. Je krijgt zo een bevestiging per e-mail."
      reference={reference}
    />
  );
}
