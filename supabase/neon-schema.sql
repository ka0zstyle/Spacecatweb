-- Neon PostgreSQL Schema for SpaceCatWeb

-- Contact Messages Table
CREATE TABLE IF NOT EXISTS contact_messages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  country VARCHAR(50) NOT NULL,
  whatsapp VARCHAR(50),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cat Game Scores Table
CREATE TABLE IF NOT EXISTS cat_game_scores (
  id SERIAL PRIMARY KEY,
  name VARCHAR(20) NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0),
  max_combo INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for top 10 queries
CREATE INDEX IF NOT EXISTS idx_scores_score ON cat_game_scores (score DESC, created_at DESC);

-- Index for contact messages
CREATE INDEX IF NOT EXISTS idx_messages_created ON contact_messages (created_at DESC);

-- Chat Sessions Table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id TEXT NOT NULL,
  visitor_name TEXT,
  visitor_email TEXT,
  visitor_whatsapp TEXT,
  status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('VISITOR', 'ADMIN')),
  content TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for chat
CREATE INDEX IF NOT EXISTS idx_chat_sessions_visitor ON chat_sessions (visitor_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_status ON chat_sessions (status);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages (session_id, created_at);

-- ── Telegram reply flow: persists inline-keyboard "reply:" state across
-- serverless cold starts. chat_id is the Telegram chat that pressed the button.
CREATE TABLE IF NOT EXISTS pending_replies (
  chat_id    TEXT PRIMARY KEY,
  short_id   TEXT NOT NULL,
  name       TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
