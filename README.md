# maako.github.io
Personal Website

## Visitor logging

The static site (deployed to GitHub Pages) is fronted by Cloudflare, which
also routes a small backend Worker (`worker/`) backed by a D1 database. A
script in `app/layout.tsx` logs each page view (see `/privacy` for what's
collected and why). Operational details (admin access, credential rotation,
deploy commands) are kept out of this public repo — see local notes.
