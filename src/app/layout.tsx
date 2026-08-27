import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { LMSProvider } from '@/lib/store';

const fontSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans'
});

export const metadata: Metadata = {
  title: 'HappyLMS — Real Estate CRM & Lead Management',
  description: 'Centralized lead pipeline, 1-tap dialer & follow-up management for real estate sales teams.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'HappyLMS'
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#2563eb'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={fontSans.variable}>
      <body className="bg-slate-50 text-slate-900 font-sans min-h-screen antialiased">
        <LMSProvider>
          {children}
        </LMSProvider>
      </body>
    </html>
  );
}
