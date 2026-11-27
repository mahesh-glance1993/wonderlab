-- Verifiable parental consent (DPDP Act 2023): when a parent/guardian (18+) agreed to the Privacy Policy and
-- Terms, and which version. NULL = not given yet (accounts created before this migration are asked on their
-- next parent-area visit; new accounts cannot be created without it).
ALTER TABLE accounts ADD COLUMN consent_at INTEGER;
ALTER TABLE accounts ADD COLUMN consent_version TEXT;
