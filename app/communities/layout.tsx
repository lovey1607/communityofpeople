// app/communities/layout.tsx — Community of People surface.
import type { Metadata } from 'next';
import { CopNav, CopFooter } from '@/components/communities/CopNav';
import './communities.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL || 'https://communityofpeople.com'),
  title: 'Community of People — find run clubs, book clubs, creators & causes near you',
  description: 'A directory of real, active communities in 98 cities across India and the world — WhatsApp, Telegram, Discord, Instagram, Reddit and Meetup — with a checked link to join each one.',
  openGraph: { title: 'Community of People — find your people', description: 'Run clubs, book clubs, founders, creators and causes in 98 cities. Real communities, one tap to join.', type: 'website', images: [{ url: '/brand/cop-og.png', width: 1200, height: 630, alt: 'Community of People' }] },
  twitter: { card: 'summary_large_image', images: ['/brand/cop-og.png'] },
};

export default function CommunitiesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="cop">
      {/* Editorial serif for hero accents (React 19 hoists this into <head>). */}
      <link rel="preconnect" href="https://images.unsplash.com" />
      <link rel="dns-prefetch" href="https://images.unsplash.com" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap" precedence="default" />
      <CopNav />
      {children}
      <CopFooter />
    </div>
  );
}
