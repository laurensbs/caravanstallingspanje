'use client';

import { useAccount } from '../_components/AccountContext';
import ProfielTab from '../_components/ProfielTab';
import DoorverwijzenTab from '../_components/DoorverwijzenTab';

export default function ProfielPage() {
  const { customer } = useAccount();
  if (!customer) return null;

  return (
    <div className="space-y-8">
      <ProfielTab customer={customer} />
      <DoorverwijzenTab customer={customer} />
    </div>
  );
}
