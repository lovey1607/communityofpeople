# Security review — v12 (18 Nov 2026)

End-to-end pass over the Community of People app before the v12 release.

## Fixed in this release
| Area | Finding | Fix |
|---|---|---|
| Dependencies | `npm audit` flagged Next 16.3.1 and transitive packages | Next → 16.4.6, `npm audit fix`; **0 vulnerabilities** |
| XSS | Community detail page wrote JSON-LD with `JSON.stringify` straight into a `<script>` — a listing name containing `</script>` could break out | `<` escaped as `<` in `DetailView.tsx` |
| Headers | No explicit hardening headers from the app | `next.config.ts` sets `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, HSTS (2y, preload), `Permissions-Policy`, `Cross-Origin-Opener-Policy`; `X-Powered-By` removed |
| Quota abuse | `/api/places/autocomplete` and `/api/places/details` proxied Google Maps with no limit — anyone could burn the key | Per-IP limit, 120 requests / 5 min (Postgres-backed, fails open) |
| Trust badge | Old badge could show on unchecked rows | Seal only when status is approved, the join link was opened by us, and that check is ≤ 60 days old. Instagram rows only when we opened the profile ourselves |

## Checked and OK
- **Admin APIs**: every `/api/admin/*` route calls `requireAdmin`. 35 of 43 API routes are guarded; the other 8 are read-only GETs (public listings, session "who am I", places search, masked maps-key status, the user's own bids).
- **CSRF**: all mutating routes call `assertSameOrigin` (the cron `maintenance` route instead needs an admin session or `CRON_SECRET`).
- **Sessions**: cookie is `httpOnly`, `sameSite=lax`, `secure` in production; signed with `AUTH_SECRET`.
- **Submissions**: rate-limited (6/hour/IP), honeypot field, zod validation, URLs must be `http(s)://` (blocks `javascript:` links), every new listing goes to admin review.
- **Outbound links**: external links use `rel="noopener noreferrer nofollow"`.
- **Secrets**: `.env*` is git-ignored; no keys or DB URLs in the repo. The old env-file-overwrite endpoint stays removed.
- **SQL**: Drizzle parameterised queries only; no string-built SQL.

## Still open (recommended next)
1. **Content-Security-Policy** — not set yet (Unsplash, Google Maps and inline JSON-LD need a nonce-based policy). Do it as its own change and test in Preview.
2. **Change the admin password** — the seed password appeared in a screenshot.
3. **Set `CRON_SECRET`** in Vercel if you schedule `/api/maintenance`.
4. Vercel's proxy sends `X-Frame-Options: DENY`, and the app sends `SAMEORIGIN`. Both are harmless; DENY wins.
