import { NextRequest, NextResponse } from "next/server"
import sql from "@/lib/db"

const MAX_SCORE_PER_SECOND = 50

export async function GET() {
  try {
    const scores = await sql`
      SELECT name, score, max_combo, created_at
      FROM cat_game_scores
      ORDER BY score DESC, created_at ASC
      LIMIT 10
    `
    return NextResponse.json(scores)
  } catch {
    return NextResponse.json([], { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const name = String(body.name || "").replace(/[<>"'&]/g, "").slice(0, 20).trim()
    const score = Math.max(0, Math.floor(Number(body.score) || 0))
    const maxCombo = Math.max(0, Math.floor(Number(body.maxCombo) || 0))
    const elapsed = Math.max(1, Number(body.elapsed) || 1)

    if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 })
    if (score > elapsed * MAX_SCORE_PER_SECOND) {
      return NextResponse.json({ error: "Invalid score" }, { status: 400 })
    }

    await sql`
      INSERT INTO cat_game_scores (name, score, max_combo)
      VALUES (${name}, ${score}, ${maxCombo})
    `

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
