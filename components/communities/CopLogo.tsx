// components/communities/CopLogo.tsx — the Community of People mark: three
// people huddled round one spark. Same artwork as public/brand/cop-mark.svg.
import { useId } from 'react';

export function CopLogo({ size = 32, title = 'Community of People' }: { size?: number; title?: string }) {
  const id = useId().replace(/:/g, '');
  const g = `cop-g-${id}`, p = `cop-p-${id}`;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label={title} className="cop-mark">
      <defs>
        <linearGradient id={g} x1="6" y1="4" x2="58" y2="62" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FF4D2E" /><stop offset=".55" stopColor="#FF7A2F" /><stop offset="1" stopColor="#FFB23D" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill={`url(#${g})`} />
      <g fill="#fff">
        <g id={p}>
          <circle cx="32" cy="14.5" r="5" />
          <path d="M24.2 28.2c0-4.6 3.5-7.9 7.8-7.9s7.8 3.3 7.8 7.9c0 1-.8 1.7-1.8 1.6a51 51 0 0 0-12 0c-1 .1-1.8-.6-1.8-1.6z" />
        </g>
        <use href={`#${p}`} transform="rotate(120 32 36.5)" />
        <use href={`#${p}`} transform="rotate(240 32 36.5)" />
      </g>
      <path d="M32 31.1l1.6 3.8 3.8 1.6-3.8 1.6-1.6 3.8-1.6-3.8-3.8-1.6 3.8-1.6z" fill="#1D1A17" />
    </svg>
  );
}
