// app/creators/page.tsx — communities run by creators, authors and public figures,
// on whichever app they chose (Telegram, WhatsApp channels, Discord, X…).
import type { Metadata } from 'next';
import { DirectoryExplorer, type Facet } from '@/components/directory/DirectoryExplorer';
import { CREATORS, CREATORS_CHECKED } from '@/data/creators';
import '@/components/directory/directory.css';

export const metadata: Metadata = {
  title: 'Creator communities — join the groups your favourite creators run · Community of People',
  description: 'Telegram channels, WhatsApp communities, Discord servers and more run by creators, authors and public figures — each with a link we opened and checked.',
};

const FACETS: Facet[] = [
  { key: 'fitness', label: 'Fitness & running', emoji: '🏃' }, { key: 'money', label: 'Money (learning)', emoji: '💸' },
  { key: 'career', label: 'Careers & tech', emoji: '💼' }, { key: 'startup', label: 'Founders', emoji: '🚀' },
  { key: 'books', label: 'Books & writing', emoji: '📚' }, { key: 'women', label: 'Women', emoji: '👩' },
  { key: 'men', label: "Men's issues", emoji: '🧔' }, { key: 'parents', label: 'Parenting', emoji: '🍼' },
  { key: 'wellbeing', label: 'Mental health', emoji: '🌿' }, { key: 'travel', label: 'Travel', emoji: '🧳' },
  { key: 'food', label: 'Food', emoji: '🍜' }, { key: 'creative', label: 'Design, photo & art', emoji: '🎨' },
  { key: 'comedy', label: 'Comedy & culture', emoji: '🎭' }, { key: 'gaming', label: 'Gaming', emoji: '🎮' },
  { key: 'education', label: 'Exams & learning', emoji: '🎓' }, { key: 'cause', label: 'Social causes', emoji: '🤝' },
  { key: 'other', label: 'Other', emoji: '✨' },
];

export default function CreatorsPage() {
  const platforms = new Set(CREATORS.map((c) => c.platform)).size;
  return (
    <>
      <header className="dir-hero">
        <div className="wrap">
          <div className="kick">Creator communities · checked {CREATORS_CHECKED}</div>
          <h1>Join the people <em>behind the posts.</em></h1>
          <p>Many creators run a real community off-feed — a Telegram channel, a WhatsApp community, a Discord server. Here they are in one place, with the creator’s own link. We opened every link; the ✔ seal means it worked within the last 60 days.</p>
          <div className="stats"><div><b>{CREATORS.length}</b><span>communities</span></div><div><b>{platforms}</b><span>platforms</span></div><div><b>{CREATORS.filter((c) => c.linkOk).length}</b><span>links verified</span></div></div>
          <div className="cta"><a className="cop-btn cop-btn-primary" href="/communities/submit">Run one? Get listed →</a></div>
        </div>
      </header>
      <DirectoryExplorer items={CREATORS} facets={FACETS} facetLabel="Topic" placeholder="Search a creator, topic or app…" showPrice />
      <div className="wrap"><p className="dir-note">Listings are public communities that creators link from their own profiles. We don’t list stock/crypto tip channels, betting, adult content or political-party channels. Is a link wrong or is this your community? Use “Run one? Get listed” to update or remove it.</p></div>
    </>
  );
}
