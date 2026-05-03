import type { Metadata } from 'next';
import { alternatesFor } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Cookiebeleid',
  description: 'Welke cookies we plaatsen en hoe je je toestemming kunt aanpassen.',
  alternates: alternatesFor('/cookies'),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
