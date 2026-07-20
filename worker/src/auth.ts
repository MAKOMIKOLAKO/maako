import type { Env } from "./types";

// Simple HTTP Basic Auth gate — good enough for a single-owner admin page,
// no session/user infrastructure needed. Username is ignored; only the
// password (env var ADMIN_PASSWORD, set via `wrangler secret put ADMIN_PASSWORD`) matters.
export function requireAdmin(request: Request, env: Env): Response | null {
  const header = request.headers.get("Authorization");
  if (header?.startsWith("Basic ")) {
    const decoded = atob(header.slice(6));
    const password = decoded.split(":").slice(1).join(":");
    if (password === env.ADMIN_PASSWORD) return null;
  }
  return new Response("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="maako-visits admin"' },
  });
}
