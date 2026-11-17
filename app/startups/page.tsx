// app/startups/page.tsx — "Startup map": who funds Indian startups, at what stage
// and what size, plus incubators worldwide and the communities founders sit in.
// Data lives in data/startup-map.json, compiled from public sources.
import type { Metadata } from 'next';
import { StartupExplorer } from '@/components/startups/StartupExplorer';
import data from '@/data/startup-map.json';
import '../repos/repos.css';
import './startups.css';

export const metadata: Metadata = {
  title: 'Startup map — who funds Indian startups, and where founders gather',
  description:
    'VC firms, micro-VCs, angel networks, named angels, accelerators, incubators worldwide, Indian government schemes and founder communities — filterable by stage, cheque size, sector and city.',
  openGraph: {
    title: 'Startup map — who actually writes the cheque?',
    description: 'Every kind of startup capital in one place, plus the communities founders sit in.',
    type: 'website',
  },
};

export default function StartupsPage() {
  return (
    <>
      <header className="repos-hero">
        <div className="wrap">
          <div className="cop-kicker repos-kicker"><i />Updated {data.generated}</div>
          <h1>Who actually <em>writes the cheque?</em></h1>
          <p>
            Every kind of startup capital in one place — funds, angels, accelerators, government
            schemes — plus the communities founders actually sit in. India-focused for the money,
            worldwide for the programmes.
          </p>
          <div className="repos-stats">
            <div><b>{data.total}</b><span>entries</span></div>
            <div><b>{data.types.length}</b><span>kinds of backer</span></div>
            <div><b>{data.sourced}</b><span>with a sourced cheque</span></div>
          </div>
        </div>
      </header>
      <StartupExplorer />
    </>
  );
}
