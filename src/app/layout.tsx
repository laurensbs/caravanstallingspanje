import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Toaster } from 'sonner';
import { LocaleProvider } from '@/components/LocaleProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Caravanstalling — Beheerportaal',
  description: 'Intern beheerportaal',
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: '#FAFAFA',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        <LocaleProvider>{children}</LocaleProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--color-surface)',
              color: 'var(--color-text)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-md)',
              fontFamily: 'var(--font-sans)',
            },
          }}
        />
      </body>
    </html>
  );
}
