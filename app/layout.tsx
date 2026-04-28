import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import Providers from '@/lib/providers';
import { Toaster } from 'sonner';

const geist = Geist({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CRM App',
  description: 'Sistema CRM simplificado',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={geist.className}>
        <Providers>{children}</Providers>
        <Toaster richColors position="bottom-right"/>
      </body>
    </html>
  );
}