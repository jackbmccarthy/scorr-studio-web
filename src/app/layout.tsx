// Root Layout

import type { Metadata } from 'next';
import { Space_Grotesk, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import ConvexClientProvider from './ConvexClientProvider';
import { AuthKitProvider } from '@workos-inc/authkit-nextjs/components';

// Display font - technical, modern
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

// Body font - clean, readable
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Scorr Studio',
  description: 'Professional-grade, real-time scoreboard and live streaming platform for sports broadcasters, tournament organizers, and content creators.',
  manifest: '/manifest.json',
  themeColor: '#3b82f6',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Scorr Studio',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'Scorr Studio',
    title: 'Scorr Studio - Professional Scoreboard Platform',
    description: 'Real-time scoreboard and live streaming for sports events',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Scorr Studio',
    description: 'Professional scoreboard platform',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${plusJakarta.variable}`}>
      <body className="font-body antialiased">

        <ConvexClientProvider>
          <AuthKitProvider>
            {children}
          </AuthKitProvider>

        </ConvexClientProvider>
      </body>
    </html>
  );
}
