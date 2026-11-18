// app/causes/page.tsx — intent-based groups: people coming together to act on
// one shared problem (a product's customer service, a civic issue, a housing
// project…), often led by a group admin or a creator.
import type { Metadata } from 'next';
import { DirectoryExplorer, type Facet } from '@/components/directory/DirectoryExplorer';
import { CAUSES, CAUSES_CHECKED } from '@/data/causes';
import '@/components/directory/directory.css';

export const metadata: Metadata = {
  title: 'Causes — groups that come together to get something fixed · Community of People',
  description: 'Customer and owner groups, resident and civic groups, homebuyer and patient support groups — intent-based communities you can join, or start your own.',
};

const FACETS: Facet[] = [
  { key: 'consumer-rights', label: 'Customers & owners', emoji: '🧾' }, { key: 'civic', label: 'Civic & neighbourhood', emoji: '🏙️' },
  { key: 'housing', label: 'Homebuyers & tenants', emoji: '🏠' }, { key: 'health-support', label: 'Patients & carers', emoji: '🩺' },
  { key: 'workers', label: 'Workers & riders', emoji: '🛵' }, { key: 'environment', label: 'Environment', emoji: '🌳' },
  { key: 'campaign', label: 'Campaigns & petitions', emoji: '📣' }, { key: 'other', label: 'Other', emoji: '✨' },
];

const START = `https://wa.me/918287773077?text=${encodeURIComponent("Hi! I want to start an intent group on Community of People.\nWhat it's about (product / issue):\nCity or online:\nWho will lead it (me / a creator):\nLink to the group (if it exists):")}`;

export default function CausesPage() {
  return (
    <>
      <header className="dir-hero">
        <div className="wrap">
          <div className="kick">Intent groups · checked {CAUSES_CHECKED}</div>
          <h1>Alone it’s a complaint. <em>Together it’s a fix.</em></h1>
          <p>Groups that form around one shared intent — owners of the same scooter chasing service, residents fixing one road, homebuyers waiting on one project, patients swapping notes. Find yours, or start one and lead it.</p>
          <div className="stats"><div><b>{CAUSES.length}</b><span>groups</span></div><div><b>{new Set(CAUSES.map((c) => c.where)).size}</b><span>places</span></div><div><b>{CAUSES.filter((c) => c.linkOk).length}</b><span>links verified</span></div></div>
          <div className="cta">
            <a className="cop-btn cop-btn-primary" href={START} target="_blank" rel="noopener noreferrer">Start an intent group →</a>
            <a className="cop-btn" href="#how">How it works</a>
          </div>
        </div>
      </header>
      <DirectoryExplorer items={CAUSES} facets={FACETS} facetLabel="Intent" placeholder="Search a product, issue or city…" />
      <div className="wrap" id="how">
        <div className="dir-how">
          <div><b>1 · Name the intent</b>One product or one problem — “Brand X scooter service in Pune”, “Sector 56 road repair”.</div>
          <div><b>2 · Pick a lead</b>A group admin or a creator who will keep it civil, collect facts and talk to the company or authority.</div>
          <div><b>3 · Act with evidence</b>Shared ticket numbers, dates and photos; official channels first — the company’s grievance officer, the consumer helpline, the municipal app.</div>
          <div><b>4 · Close the loop</b>Post what got fixed. Groups that resolve things get the ✔ seal refreshed.</div>
        </div>
        <p className="dir-note">We describe each group neutrally and don’t repeat allegations against any company. Groups that harass individuals, share personal data or run political-party campaigns are not listed. For formal complaints in India, the National Consumer Helpline is 1915 (consumerhelpline.gov.in).</p>
      </div>
    </>
  );
}
