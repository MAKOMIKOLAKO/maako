import type { Env, VisitRow } from "./types";

function esc(s: string | null | undefined): string {
  if (s == null) return "";
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function renderDashboard(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const showBots = url.searchParams.get("show_bots") === "1";
  const identifiedOnly = url.searchParams.get("identified_only") === "1";
  const grouped = url.searchParams.get("grouped") === "1";
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  const conditions: string[] = [];
  const params: unknown[] = [];
  if (!showBots) conditions.push("is_likely_bot = 0");
  if (identifiedOnly) conditions.push("company_name IS NOT NULL");
  if (from) {
    conditions.push("timestamp >= ?");
    params.push(from);
  }
  if (to) {
    conditions.push("timestamp <= ?");
    params.push(to);
  }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const { results } = await env.DB.prepare(
    `SELECT * FROM visits ${where} ORDER BY timestamp DESC LIMIT 500`
  )
    .bind(...params)
    .all<VisitRow>();

  const rows = results ?? [];

  const filterBar = `
    <form method="get" class="filters">
      <label><input type="checkbox" name="show_bots" value="1" ${showBots ? "checked" : ""}> Show bots</label>
      <label><input type="checkbox" name="identified_only" value="1" ${identifiedOnly ? "checked" : ""}> Identified companies only</label>
      <label><input type="checkbox" name="grouped" value="1" ${grouped ? "checked" : ""}> Group by visitor</label>
      <label>From <input type="date" name="from" value="${esc(from)}"></label>
      <label>To <input type="date" name="to" value="${esc(to)}"></label>
      <button type="submit">Apply</button>
    </form>`;

  const body = grouped ? renderGrouped(rows) : renderFlat(rows);

  const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>maako.dev — visits</title>
<style>
  body { font-family: -apple-system, sans-serif; margin: 2rem; color: #111; }
  table { border-collapse: collapse; width: 100%; font-size: 13px; }
  th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; vertical-align: top; }
  th { background: #f4f4f4; position: sticky; top: 0; }
  tr.bot { opacity: 0.5; }
  .filters { margin-bottom: 1rem; display: flex; gap: 1rem; align-items: center; flex-wrap: wrap; }
  .filters label { font-size: 13px; }
  code { font-size: 12px; }
</style>
</head>
<body>
  <h1>Visits (${rows.length})</h1>
  ${filterBar}
  ${body}
</body>
</html>`;

  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}

function renderFlat(rows: VisitRow[]): string {
  const trs = rows
    .map(
      (r) => `
    <tr class="${r.is_likely_bot ? "bot" : ""}">
      <td>${esc(r.timestamp)}</td>
      <td>${esc(r.company_name) || `<code>${esc(r.ip_address)}</code>`}</td>
      <td>${esc(r.browser)} / ${esc(r.os)}</td>
      <td>${esc(r.device_type)}</td>
      <td>${esc(r.path)}${r.query_params ? `?${esc(r.query_params)}` : ""}</td>
      <td>${esc(r.referrer)}</td>
    </tr>`
    )
    .join("");

  return `<table>
    <thead><tr><th>Timestamp</th><th>Company / IP</th><th>Browser / OS</th><th>Device</th><th>Path</th><th>Referrer</th></tr></thead>
    <tbody>${trs}</tbody>
  </table>`;
}

function renderGrouped(rows: VisitRow[]): string {
  const groups = new Map<string, VisitRow[]>();
  for (const r of rows) {
    const list = groups.get(r.visitor_id) ?? [];
    list.push(r);
    groups.set(r.visitor_id, list);
  }

  const trs = Array.from(groups.entries())
    .sort((a, b) => b[1].length - a[1].length)
    .map(([visitorId, visits]) => {
      const sorted = [...visits].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
      const first = sorted[0];
      const last = sorted[sorted.length - 1];
      const company = visits.find((v) => v.company_name)?.company_name;
      return `
      <tr>
        <td><code>${esc(visitorId.slice(0, 8))}…</code></td>
        <td>${esc(company) || "—"}</td>
        <td>${visits.length}</td>
        <td>${esc(first.timestamp)} → ${esc(last.timestamp)}</td>
        <td>${esc(Array.from(new Set(visits.map((v) => v.path))).join(", "))}</td>
      </tr>`;
    })
    .join("");

  return `<table>
    <thead><tr><th>Visitor</th><th>Company</th><th>Visit count</th><th>Date range</th><th>Paths seen</th></tr></thead>
    <tbody>${trs}</tbody>
  </table>`;
}
