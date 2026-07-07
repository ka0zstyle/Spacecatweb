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
