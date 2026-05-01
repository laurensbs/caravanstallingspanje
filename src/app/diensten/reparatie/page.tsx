import { redirect } from 'next/navigation';

// Tijdelijk verborgen tijdens de zomer-campagne — komt later terug.
export default function Hidden(): never {
  redirect('/');
}
