import { neon } from "@neondatabase/serverless"
import { readFileSync } from "fs"

const sql = neon(process.env.DATABASE_URL)
const raw = readFileSync("supabase/neon-schema.sql", "utf-8")

// Extract only the chat-related SQL
const chatSql = raw.split("-- Chat Sessions Table")[1]

if (!chatSql) {
  console.error("Could not find chat SQL in schema file")
  process.exit(1)
}

try {
  // Split by semicolons and execute each statement
  const statements = chatSql
    .split(";")
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith("--"))

  for (const stmt of statements) {
    await sql.query(stmt)
    console.log("✅ Executed:", stmt.substring(0, 60) + "...")
  }
  console.log("✅ Chat tables created successfully")
} catch (e) {
  console.error("❌ Error:", e.message)
  process.exit(1)
}
