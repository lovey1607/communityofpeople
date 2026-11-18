// components/communities/VerifiedBadge.tsx — the Community of People "verified"
// seal: a scalloped rosette with a check, in our own colours (it is our check,
// not a platform's). Hover/long-press shows exactly what was verified and when.
import { useId } from 'react';
import { isVerified, verifiedTitle, type Community } from '@/lib/communities';

export function VerifiedBadge({ c, size = 16, label = false }: { c: Pick<Community, 'status' | 'source' | 'linkCheck' | 'join'>; size?: number; label?: boolean }) {
  if (!isVerified(c)) return null;
  return <VerifiedSeal title={verifiedTitle(c)} size={size} label={label} />;
}

/** The seal itself, for any directory (creators, causes…) that decides its own rule. */
export function VerifiedSeal({ title: t, size = 16, label = false }: { title: string; size?: number; label?: boolean }) {
  const id = useId().replace(/:/g, '');
  return (
    <span className={`cop-verified${label ? ' with-label' : ''}`} title={t} aria-label={t} role="img">
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
        <defs>
          <linearGradient id={`vb-${id}`} x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#FF4D2E" /><stop offset="1" stopColor="#FF9F2F" />
          </linearGradient>
        </defs>
        <path fill={`url(#vb-${id})`} d="M12 1.6l2.4 1.8 3-.2.9 2.9 2.5 1.7-.9 2.9.9 2.9-2.5 1.7-.9 2.9-3-.2L12 20.4l-2.4-1.8-3 .2-.9-2.9-2.5-1.7.9-2.9-.9-2.9 2.5-1.7.9-2.9 3 .2z" transform="translate(0 1)" />
        <path d="M7.6 12.4l2.9 2.8 5.9-6.1" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {label && <span>Verified</span>}
    </span>
  );
}
