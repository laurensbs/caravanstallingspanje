'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import SuccessScreen from '@/components/SuccessScreen';
import { useLocale } from '@/components/LocaleProvider';

export default function ThankYouPage() {
  return (
    <Suspense fallback={null}>
      <ThankYouContent />
    </Suspense>
  );
}

function ThankYouContent() {
  const { t } = useLocale();
  const params = useSearchParams();
  const sessionId = params.get('session_id');
  const reference = sessionId ? `${sessionId.slice(0, 16)}…` : null;

  return (
    <SuccessScreen
      title={t('thanks.payment-title')}
      body={t('thanks.payment-services')}
      reference={reference}
    />
  );
}
