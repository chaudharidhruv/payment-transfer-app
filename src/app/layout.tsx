// src/app/layout.tsx
import './globals.css';
import { Providers } from './providers';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'i-Pay',
  description: 'A professional payments app',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <main className="min-h-screen flex flex-col">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}