'use client';
// components/communities/CopNav.tsx — nav + footer for the Community of
// People surface. Deliberately separate from COE's role navs.
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BRAND } from '@/lib/communities';
import { Menu, X } from 'lucide-react';
import { CopLogo } from './CopLogo';

export function CopNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const path = usePathname();
  useEffect(() => { setOpen(false); }, [path]);
  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    addEventListener('keydown', esc);
    return () => removeEventListener('keydown', esc);
  }, [open]);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    addEventListener('scroll', on, { passive: true });
    return () => removeEventListener('scroll', on);
  }, []);
  const cur = (p: string) => (path === p ? 'page' : undefined);
  return (
    <header className={`cop-nav${scrolled ? ' scrolled' : ''}${open ? ' open' : ''}`}>
      <div className="wrap">
        <Link href="/" className="cop-logo" aria-label={`${BRAND.name} home`}>
          <CopLogo size={32} title="" />
          <span>{BRAND.name}<small>{BRAND.tagline}</small></span>
        </Link>
        <nav id="cop-nav-links" className="cop-nav-links" aria-label="Communities" onClick={(e) => { if ((e.target as HTMLElement).closest('a')) setOpen(false); }}>
          <Link href="/" aria-current={cur('/')}>Explore</Link>
          <Link href="/communities/gurgaon/running">Run clubs</Link>
          <Link href="/creators" aria-current={cur('/creators')}>Creators</Link>
          <Link href="/causes" aria-current={cur('/causes')}>Causes</Link>
          <Link href="/repos" aria-current={cur('/repos')}>Git 50k Repos</Link>
          <Link href="/startups" aria-current={cur('/startups')}>Startup map</Link>
          <Link href="/communities/corporate-events" aria-current={cur('/communities/corporate-events')} className="teams">Corporate events <span className="new">new</span></Link>
        </nav>
        <div className="cop-nav-end">
          <Link href="/communities/submit" className="cop-btn cop-btn-primary cop-btn-sm">List a community</Link>
          <button type="button" className="cop-burger" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="cop-nav-links" onClick={() => setOpen((o) => !o)}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
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
