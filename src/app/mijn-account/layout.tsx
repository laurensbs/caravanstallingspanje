import type { Metadata } from 'next';
import AccountLayoutClient from './_components/AccountLayoutClient';

export const metadata: Metadata = {
  title: 'Mijn Account - Caravan Storage Spain',
  description: 'Bekijk uw caravans, contracten en facturen.',
};

export default function MijnAccountLayout({ children }: { children: React.ReactNode }) {
  return <AccountLayoutClient>{children}</AccountLayoutClient>;
}
