# Visitor logging — operations notes (not committed to git)

- **Admin dashboard**: `https://maako.dev/admin/visits` (HTTP Basic Auth, any
  username, password is the `ADMIN_PASSWORD` Worker secret). Query params:
  `show_bots=1`, `identified_only=1`, `grouped=1`, `from=YYYY-MM-DD`, `to=YYYY-MM-DD`.
- **Rotate the admin password**: from `worker/`, run
  `npx wrangler secret put ADMIN_PASSWORD` and enter a new value.
- **Company/ASN identification**: uses Cloudflare's built-in
  `request.cf.asOrganization` / `request.cf.asn` — free, no external API or
  token. To swap in a paid provider later (e.g. ipinfo.io Core, for cleaner
  company domains), replace `getCompanyInfo()` in `worker/src/visit.ts`.
- **Repeat-visitor tracking**: a first-party `mkv_id` cookie (1yr, HttpOnly)
  identifies the same browser, not the same person.
- **Deploy changes**: from `worker/`, run `npx wrangler deploy`. Schema
  changes go in `worker/migrations/`, applied with
  `npx wrangler d1 migrations apply maako-visits --remote`.
