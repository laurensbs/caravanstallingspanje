import Link from 'next/link';
import { MapPin, Phone, Mail, Clock, Facebook, Star } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-primary-dark text-white/70">
      <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-4 gap-10">
        {/* Brand */}
        <div>
          <div className="text-white font-bold text-xl mb-4">CARAVANSTALLING<span className="text-accent"> SPANJE</span></div>
          <p className="text-sm leading-relaxed">Dé specialist in het veilig en betrouwbaar stallen van uw caravan aan de Costa Brava. Al meer dan 10 jaar een begrip in de regio.</p>
          <div className="flex items-center gap-1 mt-4 text-accent">
            {[1,2,3,4,5].map(i => <Star key={i} size={14} fill="currentColor" />)}
            <span className="text-white/70 text-sm ml-1">4.9 / 5</span>
          </div>
        </div>

        {/* Links */}
        <div>
          <h4 className="text-white font-semibold mb-4">Diensten</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/stalling" className="hover:text-white transition-colors">Stalling</Link></li>
            <li><Link href="/diensten" className="hover:text-white transition-colors">Onderhoud & Reparatie</Link></li>
            <li><Link href="/diensten#schoonmaak" className="hover:text-white transition-colors">Schoonmaak</Link></li>
            <li><Link href="/diensten#transport" className="hover:text-white transition-colors">Transport</Link></li>
            <li><Link href="/tarieven" className="hover:text-white transition-colors">Tarieven</Link></li>
          </ul>
        </div>

        {/* Quick links */}
        <div>
          <h4 className="text-white font-semibold mb-4">Snelle links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/over-ons" className="hover:text-white transition-colors">Over ons</Link></li>
            <li><Link href="/locaties" className="hover:text-white transition-colors">Locaties</Link></li>
            <li><Link href="/faq" className="hover:text-white transition-colors">Veelgestelde vragen</Link></li>
            <li><Link href="/mijn-account" className="hover:text-white transition-colors">Mijn Account</Link></li>
            <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-white font-semibold mb-4">Contact</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2"><MapPin size={16} className="shrink-0 mt-0.5" /> Ctra de Palamos, 91<br />17110 Sant Climent de Peralta<br />Girona, Spanje</li>
            <li className="flex items-center gap-2"><Phone size={14} /> <a href="tel:+34972000000" className="hover:text-white">+34 972 00 00 00</a></li>
            <li className="flex items-center gap-2"><Mail size={14} /> <a href="mailto:info@caravanstalling-spanje.com" className="hover:text-white">info@caravanstalling-spanje.com</a></li>
            <li className="flex items-center gap-2"><Clock size={14} /> Ma-Vr 09:30 - 16:30</li>
          </ul>
          <div className="flex items-center gap-3 mt-4">
            <a href="https://www.facebook.com/caravanstallingspanjecostabrava" target="_blank" rel="noopener noreferrer" className="hover:text-white"><Facebook size={20} /></a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-6 text-center text-xs text-white/40">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} Caravan Storage Spain S.L. Alle rechten voorbehouden.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-white/60">Privacy</Link>
            <Link href="/voorwaarden" className="hover:text-white/60">Voorwaarden</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
