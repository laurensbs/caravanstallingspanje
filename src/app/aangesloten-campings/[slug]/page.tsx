import { notFound } from 'next/navigation';
import { fetchAffiliateCampings } from '@/lib/campings-fetch';
import CampingDetailClient from './CampingDetailClient';

// 5-min ISR — admin updates verschijnen binnen 5 min
export const revalidate = 300;

export async function generateStaticParams() {
  const { campings } = await fetchAffiliateCampings();
  return campings.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { campings } = await fetchAffiliateCampings();
  const camping = campings.find((c) => c.slug === slug);
  if (!camping) return { title: 'Camping niet gevonden' };
  return {
    title: `${camping.name} — Aangesloten camping`,
    description: camping.description,
  };
}

export default async function CampingDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { campings } = await fetchAffiliateCampings();
  const camping = campings.find((c) => c.slug === slug);
  if (!camping) notFound();
  return <CampingDetailClient camping={camping} />;
}
