import { NextResponse } from "next/server"
import sql from "@/lib/db"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params
    const body = await request.json().catch(() => ({}))
    const visitorId = (body.visitorId as string)?.trim()

    if (!visitorId) {
      return NextResponse.json({ error: "Falta visitorId" }, { status: 400 })
    }

    const session = await sql`
      SELECT visitor_id FROM chat_sessions WHERE id = ${sessionId}
    `

    if (session.length === 0) {
      return NextResponse.json({ error: "Sesión no encontrada" }, { status: 404 })
    }

    if (session[0].visitor_id !== visitorId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    await sql`
      UPDATE chat_sessions SET status = 'CLOSED', updated_at = NOW()
      WHERE id = ${sessionId}
    `

    return NextResponse.json({ ok: true, status: "CLOSED" })
  } catch (e) {
    console.error("Chat session close:", e)
    return NextResponse.json({ error: "Error al cerrar la sesión" }, { status: 500 })
  }
}
