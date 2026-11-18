'use client';
// components/directory/DirectoryExplorer.tsx — one searchable, filterable grid
// used by /creators (communities run by creators) and /causes (intent-based
// groups). Data is static and researched; every row carries a source and the
// date we last opened its join link.
import { useEffect, useMemo, useState } from 'react';
import { ExternalLink, Search, X } from 'lucide-react';
import { VerifiedSeal } from '@/components/communities/VerifiedBadge';
import { VERIFY_FRESH_DAYS } from '@/lib/communities';
import type { DirItem } from '@/data/directory-types';

const PLATFORM: Record<string, { label: string; dot: string }> = {
  whatsapp: { label: 'WhatsApp', dot: '#25D366' }, telegram: { label: 'Telegram', dot: '#2AABEE' }, discord: { label: 'Discord', dot: '#5865F2' },
  instagram: { label: 'Instagram', dot: '#E1306C' }, x: { label: 'X', dot: '#111' }, reddit: { label: 'Reddit', dot: '#FF4500' },
  facebook: { label: 'Facebook', dot: '#1877F2' }, youtube: { label: 'YouTube', dot: '#FF0033' }, website: { label: 'Website', dot: '#7A7066' },
  luma: { label: 'Luma', dot: '#7C3AED' }, strava: { label: 'Strava', dot: '#FC4C02' }, app: { label: 'App', dot: '#0EA5E9' },
};

export type Facet = { key: string; label: string; emoji: string };

const fresh = (on?: string) => !!on && on >= new Date(Date.now() - VERIFY_FRESH_DAYS * 86400000).toISOString().slice(0, 10);
const host = (u: string) => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return u; } };

export function DirectoryExplorer({ items, facets, facetLabel, placeholder, showPrice = false }: {
  items: DirItem[]; facets: Facet[]; facetLabel: string; placeholder: string; showPrice?: boolean;
}) {
  const [q, setQ] = useState('');
  const [facet, setFacet] = useState('');
  const [platform, setPlatform] = useState('');
  const [where, setWhere] = useState('');
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams(location.search);
    setQ(p.get('q') ?? ''); setFacet(p.get('topic') ?? ''); setPlatform(p.get('platform') ?? ''); setWhere(p.get('where') ?? ''); setOnlyVerified(p.get('verified') === '1');
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    const p = new URLSearchParams();
    if (q) p.set('q', q); if (facet) p.set('topic', facet); if (platform) p.set('platform', platform); if (where) p.set('where', where); if (onlyVerified) p.set('verified', '1');
    const qs = p.toString();
    history.replaceState(history.state, '', `${location.pathname}${qs ? `?${qs}` : ''}`);
  }, [ready, q, facet, platform, where, onlyVerified]);

  const count = (pred: (i: DirItem) => boolean) => items.filter(pred).length;
  const places = useMemo(() => {
    const m = new Map<string, number>();
    for (const i of items) m.set(i.where, (m.get(i.where) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [items]);
  const platforms = useMemo(() => [...new Set(items.map((i) => i.platform))].sort((a, b) => count((i) => i.platform === b) - count((i) => i.platform === a)), [items]); // eslint-disable-line react-hooks/exhaustive-deps

  const list = useMemo(() => {
    const terms = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return items.filter((i) => {
      if (facet && i.facet !== facet) return false;
      if (platform && i.platform !== platform) return false;
      if (where && i.where !== where) return false;
      if (onlyVerified && !(i.linkOk && fresh(i.checkedOn))) return false;
      if (terms.length) {
        const hay = `${i.name} ${i.by ?? ''} ${i.description} ${i.where} ${i.topic ?? ''}`.toLowerCase();
        if (!terms.every((w) => hay.includes(w))) return false;
      }
      return true;
    }).sort((a, b) => Number(!!(b.linkOk && fresh(b.checkedOn))) - Number(!!(a.linkOk && fresh(a.checkedOn))));
  }, [items, q, facet, platform, where, onlyVerified]);

  const any = q || facet || platform || where || onlyVerified;
  return (
    <section className="dir">
      <div className="wrap">
        <div className="dir-tools">
          <label className="dir-q">
            <Search size={17} aria-hidden="true" />
            <span className="sr">Search</span>
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder} />
            {q && <button type="button" aria-label="Clear search" onClick={() => setQ('')}><X size={14} /></button>}
          </label>
          <select aria-label="Where" value={where} onChange={(e) => setWhere(e.target.value)}>
            <option value="">Anywhere</option>
            {places.map(([p, n]) => <option key={p} value={p}>{p} ({n})</option>)}
          </select>
          <label className="dir-tog"><input type="checkbox" checked={onlyVerified} onChange={(e) => setOnlyVerified(e.target.checked)} /> Verified links only</label>
        </div>
        <div className="dir-row" role="group" aria-label={facetLabel}>
          <button type="button" className="dir-chip" aria-pressed={!facet} onClick={() => setFacet('')}>All <i>{items.length}</i></button>
          {facets.filter((f) => count((i) => i.facet === f.key)).map((f) => (
            <button key={f.key} type="button" className="dir-chip" aria-pressed={facet === f.key} onClick={() => setFacet((x) => (x === f.key ? '' : f.key))}>
              <span aria-hidden="true">{f.emoji}</span> {f.label} <i>{count((i) => i.facet === f.key)}</i>
            </button>
          ))}
        </div>
        <div className="dir-row" role="group" aria-label="Platform">
          {platforms.map((p) => (
            <button key={p} type="button" className="dir-chip plat" aria-pressed={platform === p} onClick={() => setPlatform((x) => (x === p ? '' : p))}>
              <b style={{ background: PLATFORM[p]?.dot ?? '#999' }} /> {PLATFORM[p]?.label ?? p} <i>{count((i) => i.platform === p)}</i>
            </button>
          ))}
          <span className="dir-count">{list.length} shown{any && <button type="button" onClick={() => { setQ(''); setFacet(''); setPlatform(''); setWhere(''); setOnlyVerified(false); }}>Reset</button>}</span>
        </div>

        <div className="dir-grid">
          {list.map((i) => {
            const ok = i.linkOk && fresh(i.checkedOn);
            const f = facets.find((x) => x.key === i.facet);
            return (
              <article key={i.id} className="dir-card">
                <header>
                  <span className="plat-pill"><b style={{ background: PLATFORM[i.platform]?.dot ?? '#999' }} />{PLATFORM[i.platform]?.label ?? i.platform}</span>
                  {f && <span className="topic">{f.emoji} {f.label}</span>}
                </header>
                <h3>{i.name} {ok && <VerifiedSeal size={17} title={`Verified by Community of People on ${i.checkedOn} · ${PLATFORM[i.platform]?.label ?? 'Join'} link opened and working${i.members ? ` · ${i.members}` : ''}`} />}</h3>
                {i.by && <p className="by">by {i.byUrl ? <a href={i.byUrl} target="_blank" rel="noopener noreferrer nofollow">{i.by}</a> : i.by}</p>}
                <p className="desc">{i.description}</p>
                <ul className="facts">
                  <li>📍 {i.where}</li>
                  {i.members && <li>👥 {i.members}</li>}
                  {showPrice && i.price && <li>{i.price === 'free' ? '🆓 Free' : `💳 ${i.price}`}</li>}
                  {i.ledBy && <li>🧭 Led by {i.ledBy}</li>}
                </ul>
                <footer>
                  <a className="cop-btn cop-btn-primary cop-btn-sm" href={i.joinUrl} target="_blank" rel="noopener noreferrer nofollow">{i.platform === 'website' ? 'Visit' : `Join on ${PLATFORM[i.platform]?.label ?? 'site'}`} <ExternalLink size={13} /></a>
                  <a className="src" href={i.sourceUrl} target="_blank" rel="noopener noreferrer nofollow" title={i.evidence ?? 'Where we found it'}>source: {host(i.sourceUrl)}{i.checkedOn ? ` · ${i.checkedOn}` : ''}</a>
                </footer>
              </article>
            );
          })}
          {!list.length && <p className="dir-empty">Nothing matches those filters yet.</p>}
        </div>
      </div>
    </section>
  );
}
