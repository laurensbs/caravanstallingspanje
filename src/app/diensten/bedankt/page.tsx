'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import OrderReceipt from '@/components/OrderReceipt';

export default function ThankYouPage() {
  return (
    <Suspense fallback={null}>
      <ThankYouContent />
    </Suspense>
  );
}

function ThankYouContent() {
  const params = useSearchParams();
  const ref = params.get('ref');
  return <OrderReceipt refCode={ref} />;
}
