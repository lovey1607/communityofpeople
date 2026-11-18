'use client';
// components/communities/CopNav.tsx — nav + footer for the Community of
// People surface. Deliberately separate from COE's role navs.
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BRAND } from '@/lib/communities';
import { CopLogo } from './CopLogo';

export function CopNav() {
  const [scrolled, setScrolled] = useState(false);
  const path = usePathname();
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    addEventListener('scroll', on, { passive: true });
    return () => removeEventListener('scroll', on);
  }, []);
  const cur = (p: string) => (path === p ? 'page' : undefined);
  return (
    <header className={`cop-nav${scrolled ? ' scrolled' : ''}`}>
      <div className="wrap">
        <Link href="/" className="cop-logo" aria-label={`${BRAND.name} home`}>
          <CopLogo size={32} title="" />
          <span>{BRAND.name}<small>{BRAND.tagline}</small></span>
        </Link>
        <nav className="cop-nav-links" aria-label="Communities">
          <Link href="/" aria-current={cur('/')}>Explore</Link>
          <Link href="/communities/gurgaon/running">Run clubs</Link>
          <Link href="/creators" aria-current={cur('/creators')}>Creators</Link>
          <Link href="/causes" aria-current={cur('/causes')}>Causes</Link>
          <Link href="/repos" aria-current={cur('/repos')}>Git 50k Repos</Link>
          <Link href="/startups" aria-current={cur('/startups')}>Startup map</Link>
          <Link href="/communities/corporate-events" aria-current={cur('/communities/corporate-events')} className="teams">Corporate events <span className="new">new</span></Link>
        </nav>
        <Link href="/communities/submit" className="cop-btn cop-btn-primary cop-btn-sm">List a community</Link>
      </div>
    </header>
  );
}

export function CopFooter() {
  return (
    <footer className="cop-foot">
      <div className="wrap">
        <span>© 2026 {BRAND.name} · a sibling of <Link href="/teams">Community of Employees</Link></span>
        <span>
          <Link href="/communities/submit">List a community</Link> · <a href="mailto:contact@communityofemployees.com">Report a listing</a> · <Link href="/legal">Privacy</Link>
        </span>
      </div>
    </footer>
  );
}
