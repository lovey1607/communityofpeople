// app/repos/page.tsx — "Git 50k Repos": an open-source directory sorted by the
// job you are trying to do. Data is generated from the GitHub API into
// data/git-50k-repos.json; regenerate it to refresh the star counts.
import type { Metadata } from 'next';
import { ReposExplorer } from '@/components/repos/ReposExplorer';
import data from '@/data/git-50k-repos.json';
import './repos.css';

export const metadata: Metadata = {
  title: 'Git 50k Repos — open source, by what you want to do',
  description:
    'A directory of open-source projects sorted by the job: AI video editing, voice cloning, social media and content, startup and business tooling, bots, scraping, trading and more.',
  openGraph: {
    title: 'Git 50k Repos — open source, by what you want to do',
    description: 'Free tools for the job you actually have. No licence, no vendor.',
    type: 'website',
  },
};

export default function ReposPage() {
  return (
    <>
      <header className="repos-hero">
        <div className="wrap">
          <div className="cop-kicker repos-kicker"><i />Updated {data.generated}</div>
          <h1>What do you want <em>to build?</em></h1>
          <p>
            Free, open-source tools for the job you actually have — editing video, cloning a
            voice, running social accounts, validating a startup, wiring up bots. No licence,
            no vendor.
          </p>
          <div className="repos-stats">
            <div><b>{data.total.toLocaleString()}</b><span>projects</span></div>
            <div><b>{data.usecases.length}</b><span>things to do</span></div>
            <div><b>{data.hof}</b><span>above 50k stars</span></div>
          </div>
          <p className="floor">
            Everything above 50,000 stars, plus the best projects above 1,200 stars for each job.
          </p>
        </div>
      </header>
      <ReposExplorer />
    </>
  );
}
