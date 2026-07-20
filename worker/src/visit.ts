import type { Env } from "./types";
import { readVisitorId, setVisitorIdCookie } from "./cookie";
import { parseUserAgent, isLikelyBot } from "./ua";

function getIp(request: Request): string {
  return request.headers.get("CF-Connecting-IP") ?? "unknown";
}

function wantsNoTracking(request: Request): boolean {
  return request.headers.get("DNT") === "1" || request.headers.get("Sec-GPC") === "1";
}

// Company/ASN come from Cloudflare's own network-level view of the request
// (request.cf), not a third-party lookup — free, synchronous, no API/token needed.
function getCompanyInfo(request: Request): { companyName: string | null; asn: string | null } {
  const cf = request.cf;
  const companyName = (cf?.asOrganization as string | undefined) ?? null;
  const asn = cf?.asn != null ? String(cf.asn) : null;
  return { companyName, asn };
}

export async function handleVisit(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  let body: { path?: string; referrer?: string; query?: string } = {};
  try {
    body = await request.json();
  } catch {
    // malformed body — still record what we can from headers.
  }

  const path = body.path ?? "/";
  const userAgent = request.headers.get("User-Agent") ?? "";
  const ip = getIp(request);
  const id = crypto.randomUUID();
  const isBot = isLikelyBot(userAgent, path) ? 1 : 0;
  const { browser, os, deviceType } = parseUserAgent(userAgent);
  const timestamp = new Date().toISOString();

  // Skip company/ASN attribution for Do Not Track / Global Privacy Control requests;
  // base visit logging still proceeds.
  const { companyName, asn } = wantsNoTracking(request) ? { companyName: null, asn: null } : getCompanyInfo(request);

  let visitorId = readVisitorId(request);
  const isNewVisitor = !visitorId;
  if (!visitorId) visitorId = crypto.randomUUID();

  // Fire-and-forget insert: never let a DB failure slow down or break the response.
  ctx.waitUntil(
    env.DB.prepare(
      `INSERT INTO visits (
        id, visitor_id, ip_address, company_name, company_domain, asn,
        user_agent, browser, os, device_type, referrer, path, query_params,
        timestamp, is_likely_bot
      ) VALUES (?, ?, ?, ?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        id,
        visitorId,
        ip,
        companyName,
        asn,
        userAgent,
        browser,
        os,
        deviceType,
        body.referrer ?? null,
        path,
        body.query ?? null,
        timestamp,
        isBot
      )
      .run()
      .catch((err) => console.error("visit logging failed", err))
  );

  const headers = new Headers({ "Content-Type": "application/json" });
  if (isNewVisitor) {
    headers.append("Set-Cookie", setVisitorIdCookie(visitorId));
  }
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
}
