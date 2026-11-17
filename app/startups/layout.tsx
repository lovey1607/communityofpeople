// app/startups/layout.tsx — inside the Community of People chrome.
import CommunitiesLayout from '../communities/layout';

export default function StartupsLayout({ children }: { children: React.ReactNode }) {
  return <CommunitiesLayout>{children}</CommunitiesLayout>;
}
