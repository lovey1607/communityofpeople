// scripts/city-coverage.ts — prints listings per Indian city (for coverage planning).
import { COMMUNITIES } from '../lib/communities/data';
import { ALL_CITIES, CITY_COUNTRY } from '../lib/communities';
const ind = ALL_CITIES.filter((c) => !CITY_COUNTRY[c]).map((c) => [c, COMMUNITIES.filter((x) => x.city === c).length] as const).sort((a, b) => b[1] - a[1]);
console.log(ind.map(([c, n]) => `${c} ${n}`).join(' | '));
console.log('india cities', ind.length, 'world', ALL_CITIES.length - ind.length);
