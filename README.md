# maako.github.io
Personal Website

## Visitor logging

The static site (deployed to GitHub Pages) is fronted by Cloudflare, which also
routes `maako.dev/api/*` and `maako.dev/admin/*` to a Cloudflare Worker in
`worker/` backed by a D1 (`maako-visits`) database. A small script in
`app/layout.tsx` POSTs each page view to `/api/visit`.

- **View logs**: `https://maako.dev/admin/visits` (HTTP Basic Auth — any
  username, password is the `ADMIN_PASSWORD` secret). Query params:
  `show_bots=1`, `identified_only=1`, `grouped=1`, `from=YYYY-MM-DD`, `to=YYYY-MM-DD`.
- **Rotate the admin password**: from `worker/`, run
  `npx wrangler secret put ADMIN_PASSWORD` and enter a new value.
- **Company/ASN identification**: uses Cloudflare's built-in
  `request.cf.asOrganization` / `request.cf.asn` — free, no external API or
  token. To swap in a paid provider later (e.g. ipinfo.io Core, for cleaner
  company domains), replace `getCompanyInfo()` in `worker/src/visit.ts`.
- **Repeat-visitor tracking**: a first-party `mkv_id` cookie (1yr, HttpOnly)
  identifies the same *browser*, not the same person — clearing cookies,
  private browsing, or a different device resets it. No fingerprinting.
- **Deploy changes to the worker**: from `worker/`, run `npx wrangler deploy`.
  Schema changes go in `worker/migrations/`, applied with
  `npx wrangler d1 migrations apply maako-visits --remote`.
- Privacy disclosure lives at `/privacy`.
