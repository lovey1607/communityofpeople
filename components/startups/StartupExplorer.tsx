'use client';
// components/startups/StartupExplorer.tsx — the startup capital & communities map.
// Static dataset compiled from public sources; filtering is client-side.
import { useEffect, useMemo, useState } from 'react';
import data from '@/data/startup-map.json';
import { NearbyBar } from '@/components/communities/NearbyBar';
import { kmFrom, useNearby } from '@/lib/communities/nearby';

type Entry = {
  n: string; t: string; st: string[]; q: string; qn: string;
  sc: string[]; c: string; co: string; d: string; u: string;
};
type Kind = { key: string; label: string; emoji: string; blurb: string; n: number };
type Stage = { key: string; label: string; n: number };
type Sector = { key: string; label: string; n: number };

const ENTRIES = data.entries as Entry[];
const TYPES = data.types as Kind[];
const STAGES = data.stages as Stage[];
const SECTORS = data.sectors as Sector[];
const CITIES = data.cities as string[];

const T = Object.fromEntries(TYPES.map((t) => [t.key, t]));
const SEC = Object.fromEntries(SECTORS.map((s) => [s.key, s.label]));
const STG = Object.fromEntries(STAGES.map((s) => [s.key, s.label]));
const PAGE = 60;

export function StartupExplorer() {
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [stage, setStage] = useState('');
  const [sector, setSector] = useState('');
  const [city, setCity] = useState('');
  const [sourced, setSourced] = useState(false);
  const [scope, setScope] = useState<'' | 'india' | 'global'>('');
  const [country, setCountry] = useState('');
  const [shown, setShown] = useState(PAGE);
  const [ready, setReady] = useState(false);
  const nb = useNearby();
  const [nearOn, setNearOn] = useState(true);

  // Filters live in the URL (?city=Bengaluru&type=angel…) so a filtered view can be shared.
  useEffect(() => {
    const p = new URLSearchParams(location.search);
    setQ(p.get('q') ?? ''); setType(p.get('type') ?? ''); setStage(p.get('stage') ?? ''); setSector(p.get('sector') ?? '');
    setCity(p.get('city') ?? ''); setCountry(p.get('country') ?? ''); setSourced(p.get('cheque') === '1');
    const sc = p.get('scope'); setScope(sc === 'india' || sc === 'global' ? sc : '');
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    const p = new URLSearchParams();
    const put = (k: string, v: string) => { if (v) p.set(k, v); };
    put('q', q); put('type', type); put('stage', stage); put('sector', sector); put('scope', scope); put('country', country); put('city', city); if (sourced) p.set('cheque', '1');
    const qs = p.toString();
    history.replaceState(history.state, '', `${location.pathname}${qs ? `?${qs}` : ''}`);
  }, [ready, q, type, stage, sector, scope, country, city, sourced]);

  const inScope = (e: Entry) => (scope === 'india' ? e.co === 'India' : scope === 'global' ? e.co !== 'India' : true);
  const countries = useMemo(() => {
    const m = new Map<string, number>();
    for (const e of ENTRIES) if (inScope(e) && e.co) m.set(e.co, (m.get(e.co) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [scope]); // eslint-disable-line react-hooks/exhaustive-deps
  const cityCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const e of ENTRIES) if (inScope(e) && (!country || e.co === country) && e.c) m.set(e.c, (m.get(e.c) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [scope, country]); // eslint-disable-line react-hooks/exhaustive-deps

  const list = useMemo(() => {
    const terms = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const out = ENTRIES.filter((e) => {
      if (type && e.t !== type) return false;
      if (stage && !e.st.includes(stage)) return false;
      if (sector && !e.sc.includes(sector)) return false;
      if (!inScope(e)) return false;
      if (country && e.co !== country) return false;
      if (city && e.c !== city) return false;
      if (sourced && !e.q) return false;
      if (terms.length) {
        const hay = `${e.n} ${e.d} ${e.c} ${e.co} ${e.sc.join(' ')} ${e.q}`.toLowerCase();
        if (!terms.every((w) => hay.includes(w))) return false;
      }
      return true;
    });
    if (!nearOn || !nb.city) return out;
    return out.map((e) => [e, kmFrom(nb.city, e.c)] as const).sort((a, b) => a[1] - b[1]).map(([e]) => e);
  }, [q, type, stage, sector, city, sourced, scope, country, nb.city, nearOn]); // eslint-disable-line react-hooks/exhaustive-deps
  const nearCount = useMemo(() => (nb.city ? ENTRIES.filter((e) => kmFrom(nb.city, e.c) <= 80).length : 0), [nb.city]);

  const anyFilter = Boolean(q || type || stage || sector || city || sourced || scope || country);
  const reset = () => {
    setQ(''); setType(''); setStage(''); setSector(''); setCity(''); setSourced(false); setScope(''); setCountry(''); setShown(PAGE);
  };
  const active = type ? T[type] : null;

  return (
    <>
      <section className="filters">
        <div className="wrap">
          <NearbyBar nb={nb} on={nearOn} setOn={setNearOn} nearCount={nearCount} />
          <div className="rowlab"><b>What kind of backer?</b></div>
          <div className="chips">
            {TYPES.map((t) => (
              <button
                key={t.key}
                type="button"
                className="r-chip r-chip-use"
                aria-pressed={type === t.key}
                title={t.blurb}
                onClick={() => { setType((c) => (c === t.key ? '' : t.key)); setShown(PAGE); }}
              >
                <span className="e">{t.emoji}</span>{t.label}<span className="n">{t.n}</span>
              </button>
            ))}
          </div>

          <div className="rowlab">Where</div>
          <div className="chips">
            {([['', '🌏 Everywhere'], ['india', '🇮🇳 India'], ['global', '🌍 Outside India']] as const).map(([k, l]) => (
              <button key={k || 'all'} type="button" className="r-chip" aria-pressed={scope === k}
                onClick={() => { setScope(k); setCountry(''); setCity(''); setShown(PAGE); }}>{l}</button>
            ))}
            {cityCounts.slice(0, 10).map(([c, n]) => (
              <button key={c} type="button" className="r-chip" aria-pressed={city === c} onClick={() => { setCity((x) => (x === c ? '' : c)); setShown(PAGE); }}>
                📍 {c}<span className="n">{n}</span>
              </button>
            ))}
          </div>

          <div className="rowlab">At what stage</div>
          <div className="chips">
            {STAGES.map((s) => (
              <button
                key={s.key}
                type="button"
                className="r-chip"
                aria-pressed={stage === s.key}
                onClick={() => { setStage((c) => (c === s.key ? '' : s.key)); setShown(PAGE); }}
              >
                {s.label}<span className="n">{s.n}</span>
              </button>
            ))}
          </div>

          <div className="tools">
            <select aria-label="Sector" value={sector} onChange={(e) => { setSector(e.target.value); setShown(PAGE); }}>
              <option value="">Any sector</option>
              {SECTORS.map((s) => <option key={s.key} value={s.key}>{s.label} ({s.n})</option>)}
            </select>
            <select aria-label="Country" value={country} onChange={(e) => { setCountry(e.target.value); setCity(''); setShown(PAGE); }}>
              <option value="">Any country</option>
              {countries.map(([c, n]) => <option key={c} value={c}>{c} ({n})</option>)}
            </select>
            <select aria-label="City" value={city} onChange={(e) => { setCity(e.target.value); setShown(PAGE); }}>
              <option value="">Any city</option>
              {(cityCounts.length ? cityCounts.map(([c]) => c) : CITIES).map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <label className="tog">
              <input type="checkbox" checked={sourced} onChange={(e) => { setSourced(e.target.checked); setShown(PAGE); }} />{' '}
              Only with a cheque size
            </label>
            <span className="spacer" />
            <span className="cnt">
              {list.length ? `${list.length} ${list.length === 1 ? 'entry' : 'entries'}` : 'Nothing matches'}
            </span>
            {anyFilter && <button type="button" id="reset" onClick={reset}>Reset</button>}
          </div>
        </div>
      </section>

      <main className="repos-main">
        <div className="wrap">
          <p className="note">
            <b>On the numbers.</b> Cheque sizes appear only where we could source them.{' '}
            <span className="prov prov-published">published by them</span> means the organisation states it itself;{' '}
            <span className="prov prov-reported">reported</span> means it is compiled from press and directories and is
            indicative only. {data.total - data.sourced} of {data.total} entries disclose nothing and are marked as such
            rather than guessed. Confirm with the firm before you pitch.
          </p>

          <p id="blurb">
            {active ? active.blurb : 'Who funds Indian startups, what they write, and where founders actually gather.'}
          </p>

          <div className="grid">
            {list.slice(0, shown).map((e) => (
              <Card
                key={e.n}
                e={e}
                km={nearOn && nb.city ? kmFrom(nb.city, e.c) : Infinity}
                onStage={(s) => { setStage(s); setShown(PAGE); }}
                onSector={(s) => { setSector(s); setShown(PAGE); }}
              />
            ))}
          </div>

          {!list.length && <div id="empty">Nothing matches those filters. Try widening them or hitting Reset.</div>}

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

function Card({
  e, onStage, onSector, km = Infinity,
}: { e: Entry; onStage: (s: string) => void; onSector: (s: string) => void; km?: number }) {
  const t = T[e.t] ?? { emoji: '•', label: e.t };
  return (
    <article className="r-card s-card">
      <div className="r-top">
        <span className="r-cat">{t.emoji} {t.label}</span>
        <span className="s-city">{e.c}{e.co !== 'India' ? ` · ${e.co}` : ''}{km < 15 ? ' · in your city' : km < 400 ? ` · ${Math.round(km)} km` : ''}</span>
      </div>
      <h3>{e.n}</h3>

      {e.q ? (
        <div className="s-cheque">
          <b>{e.q}</b>
          <span className={`prov prov-${e.qn}`}>{e.qn === 'published' ? 'published by them' : 'reported'}</span>
        </div>
      ) : (
        <div className="s-cheque s-none">Cheque size not disclosed</div>
      )}

      <p>{e.d}</p>

      {e.st.length > 0 && (
        <div className="s-stages">
          {e.st.map((s) => (
            <button key={s} type="button" className="s-stage" onClick={() => onStage(s)}>
              {STG[s] ?? s}
            </button>
          ))}
        </div>
      )}

      <div className="r-uses">
        {e.sc.slice(0, 4).map((s) => (
          <button key={s} type="button" className="r-use" onClick={() => onSector(s)}>
            {SEC[s] ?? s}
          </button>
        ))}
      </div>

      <div className="r-links">
        <a className="r-btn" href={e.u} target="_blank" rel="noopener noreferrer">
          Visit <span aria-hidden="true">↗</span>
        </a>
      </div>
    </article>
  );
}
