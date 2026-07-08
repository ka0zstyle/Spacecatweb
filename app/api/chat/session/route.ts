import { NextResponse } from "next/server"
import sql from "@/lib/db"

function getVisitorIp(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0].trim()
  const realIp = request.headers.get("x-real-ip")
  if (realIp) return realIp.trim()
  const vercelForwarded = request.headers.get("x-vercel-forwarded-for")
  if (vercelForwarded) return vercelForwarded.split(",")[0].trim()
  return null
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const visitorId = (body.visitorId as string)?.trim()
    const visitorName = (body.visitorName as string)?.trim() || null
    const visitorEmail = (body.visitorEmail as string)?.trim() || null
    const visitorWhatsApp = (body.visitorWhatsApp as string)?.trim() || null
    const visitorIp = getVisitorIp(request)

    if (!visitorId) {
      return NextResponse.json({ error: "Falta visitorId" }, { status: 400 })
    }

    const existing = await sql`
      SELECT id FROM chat_sessions
      WHERE visitor_id = ${visitorId} AND status = 'OPEN'
      ORDER BY created_at DESC
      LIMIT 1
    `

    if (existing.length > 0) {
      return NextResponse.json({
        sessionId: existing[0].id,
        visitorId,
      })
    }

    if (!visitorName || !visitorEmail || !visitorWhatsApp) {
      return NextResponse.json(
        { error: "Nombre, correo y WhatsApp son obligatorios para iniciar el chat" },
        { status: 400 }
      )
    }

    const created = await sql`
      INSERT INTO chat_sessions (visitor_id, visitor_name, visitor_email, visitor_whatsapp, status, visitor_ip)
      VALUES (${visitorId}, ${visitorName}, ${visitorEmail}, ${visitorWhatsApp}, 'OPEN', ${visitorIp})
      RETURNING id
    `

    return NextResponse.json({
      sessionId: created[0].id,
      visitorId,
    })
  } catch (e) {
    console.error("Chat session create:", e)
    return NextResponse.json({ error: "Error al crear sesión" }, { status: 500 })
  }
}
