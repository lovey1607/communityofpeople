// scripts/build-social-research.ts — turns the research harvests in
// research/social/*.json into three generated data files:
//   data/communities-social.ts  (city communities on Telegram/Discord/WhatsApp/Reddit/IG/X…)
//   data/creators.ts            (communities run by creators)
//   data/causes.ts              (intent-based groups)
//
//   npx tsx scripts/build-social-research.ts
//
// Rules (a row that breaks one is dropped and reported, never "fixed up"):
//  · join + source links must be https and parse;
//  · WhatsApp invite links only when the source page is not WhatsApp itself
//    (i.e. the organiser published it somewhere);
//  · excluded topics: trading/crypto/betting tips, astrology, adult/dating,
//    political-party and religious-preaching channels;
//  · city rows must map to a city we cover;
//  · duplicates of an existing listing (same join URL) are skipped;
//  · the ✔ seal (linkOk) only when the research agent actually opened the link.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { CITY_CENTRE, type CommunityCategory } from '../data/communities';
import { COMMUNITIES } from '../lib/communities/data';
import type { DirItem } from '../data/directory-types';

const clip = (t: string, n: number) => (t.length <= n ? t : `${t.slice(0, t.lastIndexOf(' ', n - 1) > 60 ? t.lastIndexOf(' ', n - 1) : n - 1).replace(/[,;:\s]+$/, '')}…`);
const CHECKED = process.env.CHECKED_ON ?? new Date().toISOString().slice(0, 10);
const DIR = 'research/social';
const BAN = /\b(crypto|bitcoin|forex|trading|stock tips?|signals?|intraday|option(s)? trading|bet(ting)?|casino|satta|astro(logy)?|tarot|escort|adult|18\+|onlyfans|dating|hookup|bjp|congress party|aap party|political party|prayer|church|temple|mosque|bhakti)\b/i;

type Raw = Record<string, unknown>;
const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');
const okUrl = (u: string) => { try { const x = new URL(u); return x.protocol === 'https:' ? x.toString() : ''; } catch { return ''; } };
const norm = (u: string) => u.toLowerCase().replace(/^https?:\/\/(www\.)?/, '').replace(/\?.*?(?=#|$)/, '').replace(/\/+(?=#|$)/, '');
const slug = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
const dropped: string[] = [];
const drop = (why: string, r: Raw) => { dropped.push(`${why}: ${str(r.name) || str(r.community_name)} — ${str(r.join_url)}`); };

const PLATFORMS = new Set(['whatsapp', 'telegram', 'discord', 'instagram', 'x', 'reddit', 'facebook', 'youtube', 'website', 'luma', 'strava']);
function platformOf(p: string, url: string): DirItem['platform'] {
  const h = (() => { try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return ''; } })();
  if (/t\.me$|telegram\.(me|dog)$/.test(h)) return 'telegram';
  if (/whatsapp\.com$|wa\.me$/.test(h)) return 'whatsapp';
  if (/discord\.(gg|com)$/.test(h)) return 'discord';
  if (/instagram\.com$/.test(h)) return 'instagram';
  if (/(^|\.)x\.com$|twitter\.com$/.test(h)) return 'x';
  if (/reddit\.com$/.test(h)) return 'reddit';
  if (/facebook\.com$|fb\.com$/.test(h)) return 'facebook';
  if (/youtube\.com$|youtu\.be$/.test(h)) return 'youtube';
  if (/lu\.ma$|luma\.com$/.test(h)) return 'luma';
  if (/strava\.com$/.test(h)) return 'strava';
  return PLATFORMS.has(p) ? (p as DirItem['platform']) : 'website';
}

const CITY_ALIAS: Record<string, string> = {
  bangalore: 'Bengaluru', bengaluru: 'Bengaluru', gurugram: 'Gurgaon', gurgaon: 'Gurgaon', 'new delhi': 'Delhi', delhi: 'Delhi', 'delhi ncr': 'Delhi',
  ncr: 'Delhi', bombay: 'Mumbai', mumbai: 'Mumbai', 'navi mumbai': 'Navi Mumbai', madras: 'Chennai', calcutta: 'Kolkata', cochin: 'Kochi', trivandrum: 'Thiruvananthapuram', vizag: 'Visakhapatnam', mysore: 'Mysuru', baroda: 'Vadodara',
  'new york city': 'New York', nyc: 'New York', 'san francisco bay area': 'San Francisco', 'bay area': 'San Francisco', sf: 'San Francisco',
  'hong kong sar': 'Hong Kong', 'kuala lumpur (kl)': 'Kuala Lumpur', kl: 'Kuala Lumpur',
};
function cityOf(raw: string): string {
  const s = raw.split(/[,/(]/)[0].trim();
  const k = s.toLowerCase();
  if (CITY_ALIAS[k]) return CITY_ALIAS[k];
  const hit = Object.keys(CITY_CENTRE).find((c) => c.toLowerCase() === k);
  return hit ?? '';
}

const CAT_RULES: [RegExp, CommunityCategory][] = [
  [/women|girls|ladies|she\b|her\b/i, 'women'], [/run|marathon|jog/i, 'running'], [/cycl|bike|biking/i, 'cycling'],
  [/trek|hik|outdoor|camp|climb|mountain/i, 'outdoors'], [/football|badminton|pickleball|cricket|tennis|volley|sport|frisbee|basketball/i, 'sports'],
  [/fitness|gym|yoga|workout/i, 'fitness'], [/board ?game|boardgam|chess|quiz|gaming|games?\b|d&d|dnd/i, 'games'],
  [/book|read|writ|poet|literat/i, 'books'], [/photo|art|design|music|theatre|theater|film|craft|creative|dance|comedy|improv/i, 'creative'],
  [/startup|founder|entrepreneur|vc\b|investor/i, 'startup'], [/dev|tech|python|ai\b|ml\b|data|code|coding|programm|web3|cloud|software/i, 'tech'],
  [/volunteer|ngo|cause|charity|clean|environment|climate/i, 'cause'], [/language|spanish|french|german|japanese|english/i, 'language'],
  [/food|cook|eat|vegan|coffee/i, 'food'], [/pet|dog|cat\b/i, 'pets'], [/parent|mom|mum|dad|kids/i, 'parents'],
  [/expat|newcomer|diaspora|social|friends|city|subreddit|community/i, 'social'], [/career|job|network|professional/i, 'professional'],
  [/mental|wellbeing|wellness|meditat|support/i, 'wellbeing'],
];
const catOf = (t: string): CommunityCategory => CAT_RULES.find(([re]) => re.test(t))?.[1] ?? 'social';

function load(prefix: string): Raw[] {
  const out: Raw[] = [];
  for (const f of readdirSync(DIR).filter((f) => f.startsWith(prefix) && f.endsWith('.json')).sort()) {
    const j = JSON.parse(readFileSync(`${DIR}/${f}`, 'utf8'));
    const rows = j.communities ?? j.groups ?? j;
    if (Array.isArray(rows)) out.push(...rows);
  }
  return out;
}

const existing = new Set(COMMUNITIES.filter((c) => !c.slug.startsWith('x-')).map((c) => norm(c.join.url)));
const seen = new Set<string>();

function common(r: Raw, nameKey = 'name') {
  const name = str(r[nameKey]);
  const join = okUrl(str(r.join_url));
  const source = okUrl(str(r.source_url));
  const text = `${name} ${str(r.description)} ${str(r.category)} ${str(r.topic)} ${str(r.about_product_or_issue)}`;
  if (!name || !join || !source) { drop('missing name/link/source', r); return null; }
  if (BAN.test(text)) { drop('excluded topic', r); return null; }
  const platform = platformOf(str(r.platform).toLowerCase(), join);
  if (platform === 'whatsapp' && /whatsapp\.com|wa\.me/.test(new URL(source).hostname)) { drop('WhatsApp link without organiser page', r); return null; }
  const key = norm(join);
  if (existing.has(key) || seen.has(key)) { drop('duplicate', r); return null; }
  seen.add(key);
  return { name, join, source, platform, linkOk: r.link_opened_ok === true };
}

// Pages that are not a community you can join: single events, search results,
// comment threads, single posts/reels, directories and conference sites.
const NOT_A_COMMUNITY = /\/search|\/comments\/|\/reel\/|\/p\/[A-Za-z0-9_-]+\/?$|\/posts\/|eventbrite\.[a-z.]+\/e\/|\/events\/details\/|luma\.com\/(?!calendar)[a-z0-9-]+$|aitinkerers\.org\/p\/|tokyorunclubs\.com|mydubaicommunities\.com|runningclubslondon\.co\.uk|iamsterdam\.com\/.*calendar|stationf\.co\/events|ea-global|hello-tomorrow\.org\/event|thethingsconference|berlin-con\.de|gamescapital\/events|facebook\.com\/InterNations/i;

const MEDIA_NOT_COMMUNITY = /\bnews\b|foodie|food talk|food guide|delhi\.food|chennai ?360|chennai city|namma bengaluru|kolkata events|chennai_events|goa\.events|whatsupgoa|soulofgoa|thingstodoin|ekaksh_properties|t\.me\/(chennai|kolkata|kolkatanews|delhincr|gurugram|noida)$|disboard\.org|discords\.com\/servers|discord\.me\/|linkedin\.com|kolkatacyclingclub|lucknowrun\.com|startupmission/i;
/** Instagram handles we opened ourselves on 2026-11-18 (followers seen). */
const IG_CHECKED: Record<string, string> = {
  'instagram.com/bengalururunners': '9,527 followers',
  'instagram.com/chandigarh_boardgamers': '4,763 followers',
};

// ─── city communities → Community rows ───
const social: string[] = [];
const socialSlugs = new Set<string>();
for (const r of [...load('india'), ...load('world')]) {
  if (r.link_opened_ok !== true) { drop('link not opened by researcher', r); continue; }
  if (NOT_A_COMMUNITY.test(str(r.join_url))) { drop('not a joinable community page', r); continue; }
  if (MEDIA_NOT_COMMUNITY.test(`${str(r.name)} ${str(r.join_url)}`)) { drop('media/news/listing page, not a community', r); continue; }
  const c = common(r); if (!c) continue;
  // Instagram can't be opened reliably by the research agent; only handles we
  // checked ourselves (follower count + bio seen) get the seal.
  if (c.platform === 'instagram' && !IG_CHECKED[norm(c.join)]) c.linkOk = false;
  // Rows we could not open ourselves (Reddit blocks our checker; directory-listed clubs) stay listed but unsealed.
  if (r.no_seal === true) c.linkOk = false;
  const city = cityOf(str(r.city));
  if (!city) { drop(`unknown city "${str(r.city)}"`, r); continue; }
  const sl = `x-${slug(city)}-${slug(c.name)}`.slice(0, 80).replace(/-$/, '');
  if (socialSlugs.has(sl)) { drop('duplicate (same name & city, second link)', r); continue; }
  socialSlugs.add(sl);
  const category = catOf(`${str(r.category)} ${c.name} ${str(r.description)}`);
  const plat = c.platform === 'youtube' ? 'website' : c.platform === 'luma' || c.platform === 'strava' ? c.platform : c.platform;
  const members = str(r.member_count) || (IG_CHECKED[norm(c.join)] ?? '');
  const evidence = str(r.activity_evidence);
  const activity = [evidence, members ? (/member|follower|subscriber/i.test(members) ? members : `${members} members`) : ''].filter(Boolean).join(' · ') || 'Public page found and opened';
  social.push(`  s(${JSON.stringify({
    slug: `x-${slug(city)}-${slug(c.name)}`.slice(0, 80).replace(/-$/, ''), name: c.name, city, category,
    tagline: clip(str(r.description), 118), desc: str(r.description).slice(0, 400), on: str(r.checked_on) || CHECKED, platform: plat, join: c.join, source: c.source, activity, members, linkOk: c.linkOk,
  })}),`);
}

// ─── creators / causes → DirItem rows ───
const dirRow = (o: DirItem) => `  ${JSON.stringify(o)},`;
const CREATOR_FACETS: [RegExp, string][] = [
  [/men'?s|men\b|father/i, 'men'], [/women|she|her\b|mom|mother/i, 'women'], [/run|fitness|gym|yoga|health|marathon/i, 'fitness'],
  [/financ|money|invest|saving|tax/i, 'money'], [/career|job|tech|coding|developer|product|ai\b/i, 'career'], [/startup|founder|entrepreneur|business/i, 'startup'],
  [/book|writ|poet|read/i, 'books'], [/parent|kid|child/i, 'parents'], [/mental|therapy|wellbeing|anxiety/i, 'wellbeing'], [/travel/i, 'travel'],
  [/food|cook|recipe/i, 'food'], [/design|photo|art|illustrat|music|film/i, 'creative'], [/comedy|culture|meme/i, 'comedy'], [/gam(e|ing)|esports/i, 'gaming'],
  [/upsc|exam|study|learn|education|course/i, 'education'], [/cause|social|ngo|rights|activis/i, 'cause'],
];
const creators: string[] = [];
seen.clear();
for (const r of load('creators')) {
  const c = common(r, 'community_name'); if (!c) continue;
  const topic = `${str(r.topic)} ${str(r.description)}`;
  creators.push(dirRow({
    id: `cr-${slug(str(r.creator_name))}-${slug(c.name)}`.slice(0, 80), name: c.name, by: str(r.creator_name) || undefined,
    byUrl: okUrl(str(r.creator_handle_url)) || undefined, platform: c.platform, joinUrl: c.join, facet: CREATOR_FACETS.find(([re]) => re.test(topic))?.[1] ?? 'other',
    topic: str(r.topic) || undefined, where: str(r.country) || 'Online', description: str(r.description).slice(0, 220), members: str(r.member_count) || undefined,
    price: /paid/i.test(str(r.free_or_paid)) ? 'Paid' : /free/i.test(str(r.free_or_paid)) ? 'free' : undefined,
    sourceUrl: c.source, checkedOn: CHECKED, linkOk: c.linkOk,
  }));
}
const causes: string[] = [];
seen.clear();
for (const r of load('causes')) {
  const c = common(r); if (!c) continue;
  const intent = str(r.intent);
  causes.push(dirRow({
    id: `ca-${slug(c.name)}`.slice(0, 80), name: c.name, platform: c.platform, joinUrl: c.join,
    facet: ['consumer-rights', 'civic', 'housing', 'health-support', 'workers', 'environment', 'campaign'].includes(intent) ? intent : 'other',
    topic: str(r.about_product_or_issue) || undefined, where: str(r.city_or_scope) || 'India', description: str(r.description).slice(0, 220),
    members: str(r.member_count) || undefined, ledBy: str(r.led_by) || undefined, sourceUrl: c.source, checkedOn: CHECKED, linkOk: c.linkOk,
    evidence: str(r.activity_evidence) || undefined,
  }));
}

const header = (what: string) => `// GENERATED by scripts/build-social-research.ts from research/social/*.json — do not edit by hand.\n// ${what}\n// Checked ${CHECKED}. linkOk = the research agent opened the join link and it worked.\n`;
writeFileSync('data/communities-social.ts', `${header(`${social.length} communities on Telegram, Discord, WhatsApp, Reddit, Instagram, X and more.`)}import { c, type Community, type CommunityCategory, type JoinPlatform } from './communities';

type Row = { slug: string; name: string; city: string; category: CommunityCategory; tagline: string; desc: string; on?: string; platform: string; join: string; source: string; activity: string; members: string; linkOk: boolean };
const D = ${JSON.stringify(CHECKED)};
const CTA: Record<string, string> = { telegram: 'Join on Telegram', discord: 'Join the Discord', whatsapp: 'Join WhatsApp group', instagram: 'Follow on Instagram', reddit: 'Open subreddit', facebook: 'Join Facebook group', x: 'Open on X', luma: 'See events on Luma', strava: 'Join on Strava club', website: 'Visit website' };
function s(r: Row): Community {
  const platform = (['telegram', 'discord', 'whatsapp', 'instagram', 'reddit', 'facebook', 'x', 'luma', 'strava'].includes(r.platform) ? r.platform : 'website') as JoinPlatform;
  return c({
    slug: r.slug, name: r.name, city: r.city, category: r.category, tagline: r.tagline || r.name,
    description: \`\${r.desc || r.tagline || r.name} Public community — details and rules are on its own page; join there.\`,
    tags: [platform], join: { url: r.join, platform, cta: CTA[platform] ?? 'Join' },
    links: {}, source: { url: r.source, verifiedOn: r.on ?? D, activitySignal: r.activity },
    linkCheck: { ok: r.linkOk, on: r.on ?? D, members: r.members || undefined },
    status: r.linkOk ? 'approved' : 'unverified', mode: r.city === 'Online' ? 'online' : 'offline', createdAt: r.on ?? D,
  });
}

export const COMMUNITIES_SOCIAL: Community[] = [
${social.join('\n')}
];
`);
writeFileSync('data/creators.ts', `${header(`${creators.length} communities run by creators.`)}import type { DirItem } from './directory-types';\n\nexport const CREATORS_CHECKED = ${JSON.stringify(CHECKED)};\nexport const CREATORS: DirItem[] = [\n${creators.join('\n')}\n];\n`);
writeFileSync('data/causes.ts', `${header(`${causes.length} intent-based groups.`)}import type { DirItem } from './directory-types';\n\nexport const CAUSES_CHECKED = ${JSON.stringify(CHECKED)};\nexport const CAUSES: DirItem[] = [\n${causes.join('\n')}\n];\n`);
writeFileSync(`${DIR}/dropped.txt`, dropped.join('\n') + '\n');
console.log(`social ${social.length} · creators ${creators.length} · causes ${causes.length} · dropped ${dropped.length} (see ${DIR}/dropped.txt)`);
