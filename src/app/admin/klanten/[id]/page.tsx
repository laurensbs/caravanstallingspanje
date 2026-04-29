import { notFound } from 'next/navigation';
import { getCustomerWithRelated } from '@/lib/db';
import CustomerDetail, { type Customer } from '@/components/customers/CustomerDetail';

export const dynamic = 'force-dynamic';

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const idNum = Number(id);
  if (!Number.isFinite(idNum) || idNum <= 0) notFound();

  const data = await getCustomerWithRelated(idNum);
  if (!data) notFound();

  return (
    <CustomerDetail
      initialCustomer={data.customer as unknown as Customer}
      initialFridges={data.fridges}
      initialStalling={data.stalling}
      initialTransports={data.transports}
    />
  );
}
