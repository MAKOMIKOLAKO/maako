const COOKIE_NAME = "mkv_id";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export function readVisitorId(request: Request): string | null {
  const header = request.headers.get("Cookie");
  if (!header) return null;
  const match = header
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${COOKIE_NAME}=`));
  return match ? match.slice(COOKIE_NAME.length + 1) : null;
}

export function setVisitorIdCookie(visitorId: string): string {
  return `${COOKIE_NAME}=${visitorId}; Max-Age=${ONE_YEAR_SECONDS}; Path=/; HttpOnly; Secure; SameSite=Lax`;
}
