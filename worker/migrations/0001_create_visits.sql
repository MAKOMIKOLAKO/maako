CREATE TABLE visits (
  id TEXT PRIMARY KEY,
  visitor_id TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  company_name TEXT,
  company_domain TEXT,
  asn TEXT,
  user_agent TEXT NOT NULL,
  browser TEXT,
  os TEXT,
  device_type TEXT,
  referrer TEXT,
  path TEXT NOT NULL,
  query_params TEXT,
  timestamp TEXT NOT NULL,
  is_likely_bot INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_visits_visitor_id ON visits (visitor_id);
CREATE INDEX idx_visits_ip_address ON visits (ip_address);
CREATE INDEX idx_visits_timestamp ON visits (timestamp);
