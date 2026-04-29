'use client';

import { usePathname } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';

// Hint dat je in test-modus zit. Sluitend boven elke publieke pagina;
// admin-paneel laten we ongemoeid (gebruiker is daar zelf bewust).
export default function TestModeBanner() {
  const pathname = usePathname();
  if (process.env.NEXT_PUBLIC_TEST_MODE !== 'true') return null;
  if (pathname?.startsWith('/admin')) return null;

  return (
    <div
      role="alert"
      className="w-full text-[12px] sm:text-[13px] font-medium px-4 py-1.5 flex items-center justify-center gap-2"
      style={{
        background: 'var(--color-warning-soft)',
        color: 'var(--color-text)',
        borderBottom: '1px solid var(--color-warning)',
      }}
    >
      <AlertTriangle size={13} className="text-warning shrink-0" />
      <span>
        <strong>Testmodus actief</strong> — alle betalingen zijn €0,50, geen factuur in Holded.
      </span>
    </div>
  );
}
