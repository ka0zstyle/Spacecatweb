-- Cat Game Scores Table
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS cat_game_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(20) NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for top 10 queries
CREATE INDEX IF NOT EXISTS idx_scores_score ON cat_game_scores (score DESC, created_at DESC);

-- RLS: Allow anonymous read/write (public scoreboard)
ALTER TABLE cat_game_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read scores"
  ON cat_game_scores FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert scores"
  ON cat_game_scores FOR INSERT
  WITH CHECK (true);
