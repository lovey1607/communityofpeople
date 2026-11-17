'use client';
// components/repos/ReposExplorer.tsx — the Git 50k Repos directory.
// Filtering is client-side over a static dataset generated from the GitHub
// API; the whole set ships in the bundle so there is no fetch waterfall.
import { useMemo, useState } from 'react';
import data from '@/data/git-50k-repos.json';

type Repo = {
  n: string; d: string; s: number; l: string; c: string;
  u: string[]; t: string[]; w: string; h: string;
  p: string; a: number; lic: string; f: number;
};
type UseCase = { key: string; label: string; emoji: string; blurb: string; n: number };
type Kind = { key: string; label: string; emoji: string; ai: boolean; n: number };

const REPOS = data.repos as Repo[];
const USECASES = data.usecases as UseCase[];
const KINDS = data.kinds as Kind[];
const LANGS = data.langs as string[];

const UC = Object.fromEntries(USECASES.map((u) => [u.key, u]));
const KIND = Object.fromEntries(KINDS.map((k) => [k.key, k]));

// "active" means pushed within roughly the last six months
const FRESH = '2026-05-17';
const PAGE = 60;

const kstars = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(n >= 100000 ? 0 : 1).replace(/\.0$/, '')}k` : String(n);

export function ReposExplorer() {
  const [q, setQ] = useState('');
  const [use, setUse] = useState('');
  const [kind, setKind] = useState('');
  const [lang, setLang] = useState('');
  const [sort, setSort] = useState<'stars' | 'recent'>('stars');
  const [live, setLive] = useState(false);
  const [shown, setShown] = useState(PAGE);
  const [showKinds, setShowKinds] = useState(false);

  const list = useMemo(() => {
    const terms = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const out = REPOS.filter((r) => {
      if (use && !r.u.includes(use)) return false;
      if (kind && r.c !== kind) return false;
      if (lang && r.l !== lang) return false;
      if (live && (r.p < FRESH || r.a)) return false;
      if (terms.length) {
        const hay = `${r.n} ${r.d} ${r.t.join(' ')} ${r.l}`.toLowerCase();
        if (!terms.every((w) => hay.includes(w))) return false;
      }
      return true;
    });
    out.sort(
      sort === 'stars'
        ? (a, b) => b.s - a.s
        : (a, b) => (a.p < b.p ? 1 : a.p > b.p ? -1 : b.s - a.s),
    );
    return out;
  }, [q, use, kind, lang, live, sort]);

  const reset = () => {
    setQ(''); setUse(''); setKind(''); setLang(''); setLive(false); setShown(PAGE);
  };
  const pick = (next: string) => {
    setUse((cur) => (cur === next ? '' : next));
    setShown(PAGE);
  };
  const active = (use && UC[use]) || (kind && KIND[kind]) || null;
  const anyFilter = Boolean(q || use || kind || lang || live);

  return (
    <>
      <section className="filters">
        <div className="wrap">
          <div className="rowlab"><b>I want to…</b></div>
          <div className="chips">
            {USECASES.map((u) => (
              <button
                key={u.key}
                type="button"
                className="r-chip r-chip-use"
                aria-pressed={use === u.key}
                title={u.blurb}
                onClick={() => pick(u.key)}
              >
                <span className="e">{u.emoji}</span>
                {u.label}
                <span className="n">{u.n}</span>
              </button>
            ))}
          </div>

          <button type="button" id="toggle-kind" onClick={() => setShowKinds((s) => !s)}>
            {showKinds ? 'Hide types ▴' : 'Browse by type instead ▾'}
          </button>

          {showKinds && (
            <div id="kindbox">
              <div className="rowlab">By type — AI categories first</div>
              <div className="chips">
                {KINDS.map((k) => (
                  <button
                    key={k.key}
                    type="button"
                    className={`r-chip${k.ai ? ' r-chip-ai' : ''}`}
                    aria-pressed={kind === k.key}
                    onClick={() => { setKind((c) => (c === k.key ? '' : k.key)); setShown(PAGE); }}
                  >
                    <span className="e">{k.emoji}</span>
                    {k.label}
                    <span className="n">{k.n}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="tools">
            <select
              aria-label="Filter by language"
              value={lang}
              onChange={(e) => { setLang(e.target.value); setShown(PAGE); }}
            >
              <option value="">Any language</option>
              {LANGS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
            <select
              aria-label="Sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as 'stars' | 'recent')}
            >
              <option value="stars">Most stars</option>
              <option value="recent">Recently updated</option>
            </select>
            <label className="tog">
              <input
                type="checkbox"
                checked={live}
                onChange={(e) => { setLive(e.target.checked); setShown(PAGE); }}
              />{' '}
              Actively maintained
            </label>
            <span className="spacer" />
            <span className="cnt">
              {list.length ? `${list.length} ${list.length === 1 ? 'repo' : 'repos'}` : 'Nothing matches'}
            </span>
            {anyFilter && <button type="button" id="reset" onClick={reset}>Reset</button>}
          </div>
        </div>
      </section>

      <main className="repos-main">
        <div className="wrap">
          <p id="blurb">
            {active && 'blurb' in active && active.blurb
              ? active.blurb
              : active
                ? active.label
                : 'Pick what you are trying to do. Every project here is open source and free to use.'}
          </p>

          <div className="grid">
            {list.slice(0, shown).map((r) => <Card key={r.n} r={r} onUse={pick} />)}
          </div>

          {!list.length && (
            <div id="empty">Nothing matches those filters. Try widening the search or hitting Reset.</div>
          )}

          {list.length > shown && (
            <button type="button" id="more" onClick={() => setShown((s) => s + PAGE)}>
              Show {Math.min(PAGE, list.length - shown)} more
            </button>
          )}
        </div>
      </main>
    </>
  );
}

function Card({ r, onUse }: { r: Repo; onUse: (k: string) => void }) {
  const [owner, name] = r.n.split('/');
  const k = KIND[r.c] ?? { emoji: '⭐', label: 'Use case pick' };
  const stale = r.p < FRESH || Boolean(r.a);
  const pills = r.u.slice(0, 3).map((u) => UC[u]).filter(Boolean);

  return (
    <article className="r-card">
      <div className="r-top">
        <span className="r-cat">{k.emoji} {k.label}</span>
        <span className="r-stars" title={`${r.s.toLocaleString()} stars`}>★ {kstars(r.s)}</span>
      </div>
      <h3><span className="o">{owner}/</span>{name}</h3>
      <p>{r.d || <em className="muted">No description provided.</em>}</p>

      {pills.length > 0 && (
        <div className="r-uses">
          {pills.map((u) => (
            <button key={u.key} type="button" className="r-use" onClick={() => onUse(u.key)}>
              {u.emoji} {u.label}
            </button>
          ))}
        </div>
      )}

      <div className="r-meta">
        {r.l && <span className="r-lang"><i />{r.l}</span>}
        {r.lic && <span>{r.lic}</span>}
        <span className={stale ? 'r-stale' : 'r-live'}>
          {r.a ? 'archived' : stale ? `quiet since ${r.p.slice(0, 7)}` : 'active'}
        </span>
      </div>

      <div className="r-links">
        <a className="r-btn" href={r.w} target="_blank" rel="noopener noreferrer">
          GitHub <span aria-hidden="true">↗</span>
        </a>
        {r.h && (
          <a className="r-btn ghost" href={r.h} target="_blank" rel="noopener noreferrer">
            Website <span aria-hidden="true">↗</span>
          </a>
        )}
      </div>
    </article>
  );
}
