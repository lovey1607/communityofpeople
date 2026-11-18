// data/directory-types.ts — shape shared by data/creators.ts and data/causes.ts.
export type DirItem = {
  id: string;
  name: string;
  /** creators: the person running it */
  by?: string;
  byUrl?: string;
  platform: 'whatsapp' | 'telegram' | 'discord' | 'instagram' | 'x' | 'reddit' | 'facebook' | 'youtube' | 'website' | 'luma' | 'strava' | 'app';
  joinUrl: string;
  /** the filter chip this row belongs to */
  facet: string;
  topic?: string;
  /** city, country or "Online · India" */
  where: string;
  description: string;
  members?: string;
  price?: string;
  /** causes: who leads it, if public */
  ledBy?: string;
  sourceUrl: string;
  /** date we last opened the join link / source page */
  checkedOn?: string;
  /** true only if that page loaded and showed the community */
  linkOk?: boolean;
  evidence?: string;
};
