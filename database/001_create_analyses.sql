CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(120) NOT NULL,
  email VARCHAR(254) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions (user_id);
CREATE INDEX IF NOT EXISTS sessions_expiry_idx ON sessions (expires_at);

CREATE TABLE IF NOT EXISTS analyses (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(160) NOT NULL,
  company VARCHAR(160) NOT NULL DEFAULT '',
  description TEXT NOT NULL,
  salary VARCHAR(160) NOT NULL DEFAULT '',
  location VARCHAR(160) NOT NULL DEFAULT '',
  work_mode VARCHAR(32) NOT NULL,
  application_url VARCHAR(500) NOT NULL DEFAULT '',
  contact VARCHAR(240) NOT NULL DEFAULT '',
  score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
  category VARCHAR(16) NOT NULL CHECK (category IN ('Low', 'Moderate', 'High')),
  indicators JSONB NOT NULL DEFAULT '[]',
  extracted JSONB NOT NULL DEFAULT '{}',
  recommendations JSONB NOT NULL DEFAULT '[]',
  ai_reasoning TEXT NOT NULL,
  ai_available BOOLEAN NOT NULL DEFAULT FALSE,
  checklist JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS analyses_created_at_idx ON analyses (created_at DESC);
CREATE INDEX IF NOT EXISTS analyses_category_idx ON analyses (category);
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS checklist JSONB NOT NULL DEFAULT '[]';
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS user_id TEXT;
CREATE INDEX IF NOT EXISTS analyses_user_id_idx ON analyses (user_id);
