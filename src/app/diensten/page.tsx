import { redirect } from 'next/navigation';

// Tijdelijk verborgen — alleen koelkast / airco / transport zijn publiek
// zichtbaar via de homepage. Bezoekers van /diensten sturen we terug
// naar de homepage zodat we niet de andere (nog niet klant-klare)
// diensten ongewild blootstellen.
export default function DienstenIndexRedirect(): never {
  redirect('/');
}
