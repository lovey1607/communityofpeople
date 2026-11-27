// ============================================================
// app/layout.tsx — Global root layout
// Global Toast container and theme injection without hardcoded global nav.
// Navigation is strictly isolated per role layout.
// ============================================================

import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ToastContainer } from '@/components/ui/ToastNotification';
import { AuthModal } from '@/components/auth/AuthModal';
import { SessionProvider } from '@/components/SessionProvider';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL || 'https://communityofpeople.com'),
  title: 'Community of People — find your people near you',
  description:
    'Real, active communities on WhatsApp, Telegram, Discord, Instagram, Reddit and Meetup — in 98 cities, plus creator-run groups and causes. One tap to join.',
  keywords: 'communities, run clubs, whatsapp groups, telegram groups, discord servers, creator communities, meetups, Gurgaon, Delhi NCR, Mumbai, Bengaluru, Jaipur',
  openGraph: {
    title: 'Community of People — find your people',
    description: 'Run clubs, creators’ communities, causes and city groups on WhatsApp, Telegram, Discord and more. Real communities, one tap to join.',
    type: 'website',
    images: ['/brand/cop-og.png'],
  },
  twitter: { card: 'summary_large_image', images: ['/brand/cop-og.png'] },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#FFF7EC" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeProvider>
          <SessionProvider />
          {children}
          <ToastContainer />
          <AuthModal />
        </ThemeProvider>
      </body>
    </html>
  );
}
