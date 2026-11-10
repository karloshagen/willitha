-- Will It HA catalogue and operations tables.
-- Safe to re-run: every statement uses IF NOT EXISTS.

CREATE TABLE IF NOT EXISTS entries (
  slug TEXT PRIMARY KEY,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  type TEXT NOT NULL,
  integrations JSONB NOT NULL DEFAULT '[]'::jsonb,
  local TEXT NOT NULL,
  control TEXT NOT NULL,
  energy_dashboard TEXT NOT NULL CHECK (energy_dashboard IN ('y', 'partial', 'n')),
  gotchas TEXT NOT NULL DEFAULT '',
  sources JSONB NOT NULL DEFAULT '[]'::jsonb,
  last_verified DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS entries_brand_idx ON entries (brand);
CREATE INDEX IF NOT EXISTS entries_type_idx ON entries (type);

CREATE TABLE IF NOT EXISTS submissions (
  id BIGSERIAL PRIMARY KEY,
  kind TEXT NOT NULL CHECK (kind IN ('new', 'correction')),
  slug TEXT,
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS submissions_status_idx ON submissions (status, created_at);

CREATE TABLE IF NOT EXISTS signups (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resend_contact_id TEXT
);

CREATE INDEX IF NOT EXISTS signups_created_idx ON signups (created_at);

CREATE TABLE IF NOT EXISTS zero_result_searches (
  id BIGSERIAL PRIMARY KEY,
  query TEXT NOT NULL,
  filters JSONB NOT NULL DEFAULT '{}'::jsonb,
  ts TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS zero_result_searches_query_idx ON zero_result_searches (query);
CREATE INDEX IF NOT EXISTS zero_result_searches_ts_idx ON zero_result_searches (ts);

CREATE TABLE IF NOT EXISTS pageviews (
  id BIGSERIAL PRIMARY KEY,
  path TEXT NOT NULL,
  ts TIMESTAMPTZ NOT NULL DEFAULT now(),
  referrer_host TEXT
);

CREATE INDEX IF NOT EXISTS pageviews_ts_idx ON pageviews (ts);
CREATE INDEX IF NOT EXISTS pageviews_path_idx ON pageviews (path);

CREATE TABLE IF NOT EXISTS links (
  slug TEXT PRIMARY KEY,
  url TEXT NOT NULL,
  sponsor_name TEXT NOT NULL
);

-- week_start is the first day of a 7-day slot, on the Australia/Sydney calendar.
CREATE TABLE IF NOT EXISTS sponsor_weeks (
  id BIGSERIAL PRIMARY KEY,
  week_start DATE NOT NULL UNIQUE,
  sponsor_name TEXT NOT NULL,
  url_slug TEXT NOT NULL,
  blurb TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS sponsor_clicks (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT NOT NULL,
  ts TIMESTAMPTZ NOT NULL DEFAULT now(),
  referrer TEXT,
  path TEXT
);

CREATE INDEX IF NOT EXISTS sponsor_clicks_ts_idx ON sponsor_clicks (ts);
CREATE INDEX IF NOT EXISTS sponsor_clicks_slug_idx ON sponsor_clicks (slug);

CREATE TABLE IF NOT EXISTS sponsor_inquiries (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  company TEXT,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sponsor_inquiries_created_idx ON sponsor_inquiries (created_at);

CREATE TABLE IF NOT EXISTS errors (
  id BIGSERIAL PRIMARY KEY,
  message TEXT NOT NULL,
  stack TEXT,
  path TEXT,
  ts TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS errors_ts_idx ON errors (ts);

-- Coarse request counter for form rate limits. The bucket is an action plus a hash, never a raw IP.
CREATE TABLE IF NOT EXISTS rate_limits (
  bucket TEXT PRIMARY KEY,
  hits INTEGER NOT NULL,
  window_start TIMESTAMPTZ NOT NULL
);
