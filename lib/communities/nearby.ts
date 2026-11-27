'use client';
// lib/communities/nearby.ts — "where is the visitor?" shared by every page
// that lists things (Creators, Causes, Startup map). Reads the city the home
// page remembered (cop_city cookie); "Near me" asks the browser once and
// snaps to the nearest city we cover. Nothing leaves the browser.
import { useCallback, useEffect, useState } from 'react';
import { CITY_CENTRES, CITY_COUNTRY, distanceKm, nearestCity } from './index';

const COOKIE = 'cop_city';
const ALIAS: Record<string, string> = { gurugram: 'Gurgaon', bangalore: 'Bengaluru', bombay: 'Mumbai', 'new delhi': 'Delhi', 'delhi ncr': 'Delhi', madras: 'Chennai', calcutta: 'Kolkata' };

export const countryOfCity = (city: string) => CITY_COUNTRY[city] ?? (CITY_CENTRES[city] ? 'India' : '');
export const canonicalCity = (raw: string) => {
  const s = raw.split(/[,(·]/)[0].trim();
  return ALIAS[s.toLowerCase()] ?? (CITY_CENTRES[s] ? s : '');
};

function remember(city: string) {
  try { document.cookie = `${COOKIE}=${encodeURIComponent(city)}; path=/; max-age=31536000; samesite=lax`; } catch { /* ignore */ }
}

export function useNearby() {
  const [city, setCity] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => {
    const m = document.cookie.match(/(?:^|; )cop_city=([^;]+)/);
    const c = m ? decodeURIComponent(m[1]) : '';
    if (CITY_CENTRES[c]) setCity(c);
  }, []);
  const choose = useCallback((c: string) => { setCity(c); if (c) remember(c); setMsg(null); }, []);
  const locate = useCallback(() => {
    if (!('geolocation' in navigator)) { setMsg('Location isn’t available in this browser — pick a city instead.'); return; }
    setBusy(true); setMsg(null);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const near = nearestCity(p.coords.latitude, p.coords.longitude);
        setBusy(false); choose(near.city);
        if (near.km > 80) setMsg(`Nearest city we cover: ${near.city} (${Math.round(near.km)} km).`);
      },
      () => { setBusy(false); setMsg('Location not shared — pick a city instead.'); },
      { timeout: 9000, maximumAge: 300000 },
    );
  }, [choose]);
  return { city, country: city ? countryOfCity(city) : '', choose, locate, busy, msg };
}

/**
 * How close a listing's place is to the visitor: 4 same city, 3 within
 * 80 km (NCR counts as one), 2 same country, 1 online / anywhere, 0 elsewhere.
 */
export function placeRank(where: string, city: string, country: string): number {
  if (!city) return 0;
  const w = where.toLowerCase();
  const wc = canonicalCity(where);
  if (wc === city) return 4;
  const a = CITY_CENTRES[wc], b = CITY_CENTRES[city];
  if (a && b && distanceKm(a.lat, a.lng, b.lat, b.lng) <= 80) return 3;
  const wCountry = wc ? countryOfCity(wc) : '';
  if (country && (wCountry === country || w.split(/[\s·,/]+/).includes(country.toLowerCase()))) return 2;
  if (/online|global|anywhere|worldwide/.test(w)) return 1;
  return 0;
}

/** Distance in km from the visitor's city to a listing's city, or Infinity. */
export function kmFrom(city: string, where: string): number {
  const a = CITY_CENTRES[city], b = CITY_CENTRES[canonicalCity(where)];
  return a && b ? distanceKm(a.lat, a.lng, b.lat, b.lng) : Infinity;
}
