-- School / tuition-centre enquiries from the public /schools page (POST /api/leads).
-- ADULT staff contact details only; the form never asks for child data.
-- Retention: leads older than 2 years (730 days) may be deleted — see docs/OPERATIONS.md
-- ("School enquiries") or call POST /api/leads/purge as an admin.

CREATE TABLE leads (
  id TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('school','tuition','other')),
  contact_name TEXT NOT NULL,
  contact_role TEXT NOT NULL,
  org_name TEXT NOT NULL,
  town TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  students INTEGER,
  classes TEXT NOT NULL DEFAULT '',   -- comma-separated: pre,1,2,…,10
  message TEXT NOT NULL DEFAULT '',
  lang TEXT NOT NULL DEFAULT 'en',    -- language the form was filled in
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','pilot','closed'))
);
CREATE INDEX idx_leads_created ON leads(created_at);
