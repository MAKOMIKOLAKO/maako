export interface Env {
  DB: D1Database;
  ADMIN_PASSWORD: string;
}

export interface VisitRow {
  id: string;
  visitor_id: string;
  ip_address: string;
  company_name: string | null;
  company_domain: string | null;
  asn: string | null;
  user_agent: string;
  browser: string | null;
  os: string | null;
  device_type: string | null;
  referrer: string | null;
  path: string;
  query_params: string | null;
  timestamp: string;
  is_likely_bot: number;
}
