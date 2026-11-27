'use client';
// components/communities/NearbyBar.tsx — "nearest first" control used on
// Creators, Causes and the Startup map. Pick a city or tap Near me; the
// list re-sorts so things closest to you come first.
import { LocateFixed, MapPin } from 'lucide-react';
import { ALL_CITIES } from '@/lib/communities';
import type { useNearby } from '@/lib/communities/nearby';

export function NearbyBar({ nb, on, setOn, nearCount }: {
  nb: ReturnType<typeof useNearby>; on: boolean; setOn: (v: boolean) => void; nearCount?: number;
}) {
  return (
    <div className="nearby-bar" role="group" aria-label="Your location">
      <span className="ic" aria-hidden="true"><MapPin size={16} /></span>
      <span className="txt">
        {nb.city
          ? <>Near <b>{nb.city}</b>{typeof nearCount === 'number' && <small> · {nearCount} close by</small>}</>
          : <>Pick your city to see what’s <b>near you</b> first</>}
        {nb.msg && <small className="msg">{nb.msg}</small>}
      </span>
      <select aria-label="Your city" value={nb.city} onChange={(e) => { nb.choose(e.target.value); setOn(true); }}>
        <option value="">Choose city…</option>
        {ALL_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>
      <button type="button" className="locate" onClick={() => { nb.locate(); setOn(true); }} disabled={nb.busy}>
        <LocateFixed size={14} /> {nb.busy ? 'Finding…' : 'Near me'}
      </button>
      {nb.city && (
        <label className="sw"><input type="checkbox" checked={on} onChange={(e) => setOn(e.target.checked)} /> Nearest first</label>
      )}
    </div>
  );
}
