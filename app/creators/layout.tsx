// app/creators/layout.tsx — inside the Community of People chrome (nav, footer, tokens).
import CommunitiesLayout from '../communities/layout';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <CommunitiesLayout>{children}</CommunitiesLayout>;
}
