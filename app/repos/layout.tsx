// app/repos/layout.tsx — the directory sits inside the Community of People
// chrome, so it reuses the marketplace layout (nav, footer, theme tokens).
import CommunitiesLayout from '../communities/layout';

export default function ReposLayout({ children }: { children: React.ReactNode }) {
  return <CommunitiesLayout>{children}</CommunitiesLayout>;
}
