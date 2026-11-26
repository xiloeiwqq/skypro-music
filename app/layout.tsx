import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import { Suspense } from 'react';
import ReduxProviderBoundary from './ReduxProviderBoundary';
import './globals.css';

const montserrat = Montserrat({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-montserrat',
});

export const metadata: Metadata = {
  title: 'Музыка — музыкальный сервис',
  description: 'Слушайте любимую музыку и собирайте плейлисты.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={montserrat.variable}>
      <body>
        <Suspense fallback={null}>
          <ReduxProviderBoundary>{children}</ReduxProviderBoundary>
        </Suspense>
      </body>
    </html>
  );
}
