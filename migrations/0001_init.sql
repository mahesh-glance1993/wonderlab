-- WonderLab initial schema (Cloudflare D1 / SQLite)

CREATE TABLE accounts (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE COLLATE NOCASE,
  email TEXT UNIQUE COLLATE NOCASE,
  email_verified INTEGER NOT NULL DEFAULT 0,
  pass_hash TEXT NOT NULL,
  sec_question INTEGER NOT NULL,
  sec_answer_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'parent' CHECK (role IN ('parent','educator','admin')),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE recovery_codes (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  code_hash TEXT NOT NULL,
  used_at INTEGER,
  created_at INTEGER NOT NULL
);
CREATE INDEX idx_recovery_account ON recovery_codes(account_id);

CREATE TABLE sessions (
  id TEXT PRIMARY KEY,               -- SHA-256 of the cookie token (raw token never stored)
  account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  persistent INTEGER NOT NULL,       -- 1 = "keep me signed in on this device"
  created_at INTEGER NOT NULL,
  last_seen INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,       -- absolute limit
  idle_limit_sec INTEGER NOT NULL,   -- inactivity limit
  verified_until INTEGER NOT NULL DEFAULT 0, -- parent re-verification window
  device_label TEXT,
  rotated_to TEXT,                   -- id of the session this one rotated into
  rotated_at INTEGER,
  revoked_at INTEGER
);
CREATE INDEX idx_sessions_account ON sessions(account_id);

CREATE TABLE auth_tokens (
  id TEXT PRIMARY KEY,               -- SHA-256 of token
  account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('reset','verify-email')),
  expires_at INTEGER NOT NULL,
  used_at INTEGER,
  created_at INTEGER NOT NULL
);

CREATE TABLE outbox (                -- local/dev email sink; production sends via provider
  id TEXT PRIMARY KEY,
  to_addr TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE rate_limits (
  key TEXT PRIMARY KEY,
  window_start INTEGER NOT NULL,
  count INTEGER NOT NULL
);

CREATE TABLE profiles (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  avatar TEXT NOT NULL,
  class_level INTEGER NOT NULL CHECK (class_level BETWEEN 0 AND 12),
  age_band TEXT NOT NULL,
  prefs TEXT NOT NULL DEFAULT '{}',  -- JSON: language, theme, textSize, reduceMotion, mute, volume, breaks...
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX idx_profiles_account ON profiles(account_id);

-- Content with version history (published content is served to learners)
CREATE TABLE content_items (
  id TEXT PRIMARY KEY,               -- stable id (unit / objective / question / template / translation)
  kind TEXT NOT NULL,
  published_version INTEGER,
  latest_version INTEGER NOT NULL
);
CREATE TABLE content_versions (
  item_id TEXT NOT NULL REFERENCES content_items(id),
  version INTEGER NOT NULL,
  data TEXT NOT NULL,                -- JSON
  status TEXT NOT NULL CHECK (status IN ('draft','validated','published','archived')),
  validation TEXT,                   -- JSON result of last validation
  author_id TEXT,
  created_at INTEGER NOT NULL,
  published_by TEXT,
  published_at INTEGER,
  PRIMARY KEY (item_id, version)
);

-- Learning records (client-generated ids make retries idempotent)
CREATE TABLE attempts (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  question_version INTEGER NOT NULL,
  objective_id TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('learn','practice','test','game','diagnostic')),
  correct INTEGER NOT NULL,
  response TEXT,
  hints_used INTEGER NOT NULL DEFAULT 0,
  duration_ms INTEGER,
  created_at INTEGER NOT NULL
);
CREATE INDEX idx_attempts_profile ON attempts(profile_id, objective_id);

CREATE TABLE mastery (
  profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  objective_id TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  correct INTEGER NOT NULL DEFAULT 0,
  distinct_correct TEXT NOT NULL DEFAULT '[]', -- question ids answered correctly
  streak INTEGER NOT NULL DEFAULT 0,
  level REAL NOT NULL DEFAULT 1,   -- adaptive difficulty 1..3
  mastered_at INTEGER,
  next_review_at INTEGER,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (profile_id, objective_id)
);

CREATE TABLE lesson_state (
  profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  state TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (profile_id, lesson_id)
);

CREATE TABLE rewards (
  profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reward_id TEXT NOT NULL,
  earned_at INTEGER NOT NULL,
  PRIMARY KEY (profile_id, reward_id)
);

CREATE TABLE activity_state (       -- games, labs, daily puzzles
  profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  activity_id TEXT NOT NULL,
  state TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (profile_id, activity_id)
);

CREATE TABLE artworks (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  data TEXT NOT NULL,                -- JSON project: layers, strokes, fills, history
  thumb TEXT,                        -- small PNG data URL
  version INTEGER NOT NULL,
  conflict_of TEXT,                  -- set when this copy was preserved from a sync conflict
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  deleted_at INTEGER
);
CREATE INDEX idx_artworks_profile ON artworks(profile_id);

CREATE TABLE downloads (
  profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  pack_id TEXT NOT NULL,
  pack_version TEXT NOT NULL,
  downloaded_at INTEGER NOT NULL,
  PRIMARY KEY (profile_id, pack_id)
);

CREATE TABLE reports (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  profile_id TEXT,
  class_level INTEGER,
  lesson_id TEXT,
  question_id TEXT,
  content_version INTEGER,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  created_at INTEGER NOT NULL
);

CREATE TABLE audit_log (
  id TEXT PRIMARY KEY,
  account_id TEXT,
  action TEXT NOT NULL,
  detail TEXT,
  created_at INTEGER NOT NULL
);
