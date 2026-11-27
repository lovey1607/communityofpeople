'use client';
// components/communities/CitySearch.tsx — the one place you pick a city.
// A command-palette style search: type a city, country, region or an old
// name (Gurugram, Bangalore, Bombay…) and press Enter. With nothing typed it
// shows "use my location", recent cities, popular cities and a region browser.
import { useEffect, useMemo, useRef, useState } from 'react';
import { Clock, LocateFixed, MapPin, Search, TrendingUp, X } from 'lucide-react';
import { ALL_CITIES, CITY_COUNTRY, WORLD_REGIONS } from '@/lib/communities';

const RECENT_KEY = 'cop_recent_cities';
const ALIASES: Record<string, string[]> = {
  Gurgaon: ['gurugram', 'ggn', 'cyber city', 'ncr'], Bengaluru: ['bangalore', 'blr'], Mumbai: ['bombay'], Delhi: ['new delhi', 'ncr', 'dilli'],
  Chennai: ['madras'], Kolkata: ['calcutta'], Kochi: ['cochin'], Pune: ['poona'], 'New York': ['nyc'], 'San Francisco': ['sf', 'bay area'],
  'Ho Chi Minh City': ['saigon'], 'Washington DC': ['dc'], 'Hong Kong': ['hk'], Noida: ['ncr'],
};
const norm = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').trim();
const regionOf = (c: string) => Object.entries(WORLD_REGIONS).find(([, cs]) => cs.includes(c))?.[0] ?? 'India';
const countryOf = (c: string) => CITY_COUNTRY[c] ?? 'India';

function readRecent(): string[] {
  try { const v = JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]'); return Array.isArray(v) ? v.filter((x) => typeof x === 'string').slice(0, 4) : []; } catch { return []; }
}
function saveRecent(city: string) {
  try { localStorage.setItem(RECENT_KEY, JSON.stringify([city, ...readRecent().filter((c) => c !== city)].slice(0, 4))); } catch { /* private mode */ }
}

function Hi({ text, q }: { text: string; q: string }) {
  const i = q ? norm(text).indexOf(q) : -1;
  if (i < 0) return <>{text}</>;
  return <>{text.slice(0, i)}<mark>{text.slice(i, i + q.length)}</mark>{text.slice(i + q.length)}</>;
}

export function CitySearch({ current, counts, onPick, onLocate, geoBusy, geoMsg, children }: {
  current: string; counts: Map<string, number>; onPick: (city: string) => void;
  onLocate: () => void; geoBusy: boolean; geoMsg: string | null; children?: React.ReactNode;
}) {
  const [q, setQ] = useState('');
  const [hi, setHi] = useState(0);
  const [region, setRegion] = useState(() => regionOf(current));
  const [recent, setRecent] = useState<string[]>([]);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => { setRecent(readRecent().filter((c) => (counts.get(c) ?? 0) > 0)); }, [counts]);
  useEffect(() => { const t = setTimeout(() => input.current?.focus({ preventScroll: true }), 60); return () => clearTimeout(t); }, []);

  const pool = useMemo(() => ALL_CITIES.filter((c) => (counts.get(c) ?? 0) > 0), [counts]);
  const n = norm(q);
  const results = useMemo(() => {
    if (!n) return [];
    const score = (c: string) => {
      const name = norm(c);
      if (name.startsWith(n)) return 0;
      if ((ALIASES[c] ?? []).some((a) => a.startsWith(n))) return 1;
      if (name.includes(n)) return 2;
      if (norm(countryOf(c)).startsWith(n)) return 3;
      if (norm(regionOf(c)).includes(n) || norm(countryOf(c)).includes(n)) return 4;
      return 9;
    };
    return pool.map((c) => [c, score(c)] as const).filter(([, s]) => s < 9)
      .sort((a, b) => a[1] - b[1] || (counts.get(b[0]) ?? 0) - (counts.get(a[0]) ?? 0)).slice(0, 12).map(([c]) => c);
  }, [n, pool, counts]);
  useEffect(() => { setHi(0); }, [n]);

  const pick = (c: string) => { saveRecent(c); onPick(c); };
  const popular = useMemo(() => [...pool].sort((a, b) => (counts.get(b) ?? 0) - (counts.get(a) ?? 0)).slice(0, 10), [pool, counts]);
  const regions = useMemo(() => ['India', ...Object.keys(WORLD_REGIONS)].filter((r) => pool.some((c) => regionOf(c) === r)), [pool]);
  const inRegion = useMemo(() => pool.filter((c) => regionOf(c) === region).sort((a, b) => (counts.get(b) ?? 0) - (counts.get(a) ?? 0)), [pool, region, counts]);

  const Row = ({ c, i }: { c: string; i?: number }) => (
    <li role="option" aria-selected={i === hi}>
      <button type="button" className={`cs-row${i === hi ? ' on' : ''}${c === current ? ' cur' : ''}`} onMouseEnter={() => i !== undefined && setHi(i)} onClick={() => pick(c)}>
        <span className="pin" aria-hidden="true"><MapPin size={16} /></span>
        <span className="nm"><b><Hi text={c} q={n} /></b><small><Hi text={countryOf(c)} q={n} />{regionOf(c) !== 'India' && regionOf(c) !== countryOf(c) ? ` · ${regionOf(c)}` : ''}</small></span>
        {c === current && <span className="tag">Current</span>}
        <span className="ct">{counts.get(c) ?? 0}</span>
      </button>
    </li>
  );

  return (
    <div className="cop-citysearch cop-locpick">
      <label className="cs-input">
        <Search size={20} aria-hidden="true" />
        <span className="sr">Search a city, country or region</span>
        <input ref={input} type="search" value={q} placeholder="Search a city, country or region…" enterKeyHint="go" autoComplete="off"
          role="combobox" aria-expanded={!!n} aria-controls="cop-cs-results" aria-autocomplete="list"
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') { e.preventDefault(); setHi((h) => Math.min(h + 1, results.length - 1)); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); setHi((h) => Math.max(h - 1, 0)); }
            else if (e.key === 'Enter' && results[hi]) { e.preventDefault(); pick(results[hi]); }
          }} />
        {q && <button type="button" className="cs-clear" aria-label="Clear" onClick={() => { setQ(''); input.current?.focus(); }}><X size={15} /></button>}
      </label>

      {n ? (
        <ul id="cop-cs-results" className="cs-list" role="listbox" aria-label="Matching cities">
          {results.length ? results.map((c, i) => <Row key={c} c={c} i={i} />)
            : <li className="cs-none">No city matches “{q}” yet. Try a country (“Japan”) or a region (“Europe”).</li>}
        </ul>
      ) : (
        <>
          <button type="button" className="cs-geo" onClick={onLocate} disabled={geoBusy}>
            <span className="pin" aria-hidden="true">{geoBusy ? <span className="cop-spin" /> : <LocateFixed size={17} />}</span>
            <span className="nm"><b>{geoBusy ? 'Finding you…' : 'Use my current location'}</b><small>{geoMsg ?? 'Shows the nearest communities first. Nothing is stored online.'}</small></span>
          </button>


          {recent.length > 0 && (
            <section className="cs-sec">
              <h4><Clock size={13} aria-hidden="true" /> Recent</h4>
              <div className="cities">{recent.map((c) => <button key={c} type="button" className="cop-pill" aria-pressed={c === current} onClick={() => pick(c)}>{c}</button>)}</div>
            </section>
          )}

          <section className="cs-sec">
            <h4><TrendingUp size={13} aria-hidden="true" /> Popular</h4>
            <div className="cities">
              {popular.map((c) => <button key={c} type="button" className="cop-pill" aria-pressed={c === current} onClick={() => pick(c)}>{c} <span className="n">{counts.get(c) ?? 0}</span></button>)}
            </div>
          </section>

          {children}

          <section className="cs-sec">
            <h4>Browse by region</h4>
            <div className="cs-tabs" role="tablist" aria-label="Regions">
              {regions.map((r) => (
                <button key={r} type="button" role="tab" aria-selected={region === r} onClick={() => setRegion(r)}>{r === 'India' ? '🇮🇳 India' : r}</button>
              ))}
            </div>
            <ul className="cs-list cs-grid" aria-label={`Cities in ${region}`}>
              {inRegion.map((c) => <Row key={c} c={c} />)}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
