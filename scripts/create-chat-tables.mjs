import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL)

const statements = [
  `CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visitor_id TEXT NOT NULL,
    visitor_name TEXT,
    visitor_email TEXT,
    visitor_whatsapp TEXT,
    status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`,
  `CREATE INDEX IF NOT EXISTS idx_chat_sessions_visitor ON chat_sessions (visitor_id)`,
  `CREATE INDEX IF NOT EXISTS idx_chat_sessions_status ON chat_sessions (status)`,
  `CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('VISITOR', 'ADMIN')),
    content TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,
  `CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages (session_id, created_at)`,
]

for (const stmt of statements) {
  try {
    await sql.query(stmt)
    console.log("✅", stmt.substring(0, 60) + "...")
  } catch (e) {
    console.error("❌", e.message)
  }
}
