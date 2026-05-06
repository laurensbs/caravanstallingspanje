import CampingsClient from './CampingsClient';
import { campings } from '@/lib/campings-data';

export const metadata = {
  title: 'Aangesloten campings — Costa Brava',
  description: 'Wij leveren koelkasten, airco-units en transport op meer dan 40 aangesloten campings aan de Costa Brava. Bekijk per regio of camping welke faciliteiten we daar bieden.',
};

export default function AangslotenCampingsPage() {
  return <CampingsClient campings={campings} />;
}
