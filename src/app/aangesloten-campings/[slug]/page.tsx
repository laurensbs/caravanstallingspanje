import { notFound } from 'next/navigation';
import { campings } from '@/lib/campings-data';
import CampingDetailClient from './CampingDetailClient';

export async function generateStaticParams() {
  return campings.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const camping = campings.find((c) => c.slug === slug);
  if (!camping) return { title: 'Camping niet gevonden' };
  return {
    title: `${camping.name} — Aangesloten camping`,
    description: camping.description,
  };
}

export default async function CampingDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const camping = campings.find((c) => c.slug === slug);
  if (!camping) notFound();
  return <CampingDetailClient camping={camping} />;
}
