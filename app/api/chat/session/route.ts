import { NextResponse } from "next/server"
import sql from "@/lib/db"
import { getOrCreateVisitorId } from "@/lib/visitor"

const MAX_NAME = 100
const MAX_EMAIL = 254
const MAX_WHATSAPP = 20

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^[0-9+\-\s()]{9,20}$/

function isValidString(v: unknown, max: number): v is string {
  return typeof v === "string" && v.trim().length > 0 && v.length <= max
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const visitorName = isValidString(body.visitorName, MAX_NAME) ? body.visitorName.trim() : null
    const visitorEmail =
      typeof body.visitorEmail === "string" &&
      body.visitorEmail.length <= MAX_EMAIL &&
      EMAIL_RE.test(body.visitorEmail)
        ? body.visitorEmail.trim()
        : null
    const visitorWhatsApp =
      typeof body.visitorWhatsApp === "string" && PHONE_RE.test(body.visitorWhatsApp.trim())
        ? body.visitorWhatsApp.trim()
        : null

    const visitorId = await getOrCreateVisitorId()

    const existing = await sql`
      SELECT id FROM chat_sessions
      WHERE visitor_id = ${visitorId} AND status = 'OPEN'
      ORDER BY created_at DESC
      LIMIT 1
    `

    if (existing.length > 0) {
      return NextResponse.json({ sessionId: existing[0].id, visitorId })
    }

    if (!visitorName || !visitorEmail || !visitorWhatsApp) {
      return NextResponse.json(
        { error: "Nombre, correo y WhatsApp son obligatorios para iniciar el chat" },
        { status: 400 },
      )
    }

    const created = await sql`
      INSERT INTO chat_sessions (visitor_id, visitor_name, visitor_email, visitor_whatsapp, status)
      VALUES (${visitorId}, ${visitorName}, ${visitorEmail}, ${visitorWhatsApp}, 'OPEN')
      RETURNING id
    `

    return NextResponse.json({ sessionId: created[0].id, visitorId })
  } catch (e) {
    console.error("Chat session create:", e)
    return NextResponse.json({ error: "Error al crear sesión" }, { status: 500 })
  }
}
