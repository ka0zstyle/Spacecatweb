import { NextResponse } from "next/server"
import sql from "@/lib/db"
import { getOrCreateVisitorId } from "@/lib/visitor"
import { sendTelegramChatNotification } from "@/lib/telegram-chat"

const MAX_CONTENT = 2000

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID

function escapeMarkdown(text: string): string {
  return text.replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, "\\$&")
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    const { sessionId } = await params
    const visitorId = await getOrCreateVisitorId()

    const session = await sql`
      SELECT visitor_id, status
      FROM chat_sessions WHERE id = ${sessionId}
    `

    if (session.length === 0) {
      return NextResponse.json({ error: "Sesión no encontrada" }, { status: 404 })
    }

    if (session[0].visitor_id !== visitorId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const messages = await sql`
      SELECT id, role, content, created_at
      FROM chat_messages
      WHERE session_id = ${sessionId}
      ORDER BY created_at ASC
    `

    return NextResponse.json({
      messages: (messages as Array<Record<string, unknown>>).map((m) => ({
        id: String(m.id),
        role: String(m.role),
        content: String(m.content),
        createdAt: String(m.created_at),
      })),
      status: session[0].status,
    })
  } catch (e) {
    console.error("Chat messages list:", e)
    return NextResponse.json({ error: "Error al listar mensajes" }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    const { sessionId } = await params
    const body = await request.json().catch(() => ({}))
    const content = typeof body.content === "string" ? body.content.trim() : ""
    const visitorId = await getOrCreateVisitorId()

    if (!content) {
      return NextResponse.json({ error: "Escribe un mensaje" }, { status: 400 })
    }
    if (content.length > MAX_CONTENT) {
      return NextResponse.json({ error: "Mensaje demasiado largo" }, { status: 400 })
    }

    const session = await sql`
      SELECT visitor_id, visitor_name, status FROM chat_sessions WHERE id = ${sessionId}
    `

    if (session.length === 0) {
      return NextResponse.json({ error: "Sesión no encontrada" }, { status: 404 })
    }

    if (session[0].visitor_id !== visitorId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    if (session[0].status === "CLOSED") {
      return NextResponse.json({ error: "Esta conversación está cerrada" }, { status: 400 })
    }

    const created = await sql`
      INSERT INTO chat_messages (session_id, role, content)
      VALUES (${sessionId}, 'VISITOR', ${content})
      RETURNING id, role, content, created_at
    `

    await sql`
      UPDATE chat_sessions SET updated_at = NOW() WHERE id = ${sessionId}
    `

    const msg = created[0]

    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
      sendTelegramChatNotification(
        sessionId,
        session[0].visitor_name,
        content,
        TELEGRAM_BOT_TOKEN,
        TELEGRAM_CHAT_ID,
      ).catch(() => {})
    }

    return NextResponse.json({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      createdAt: msg.created_at,
    })
  } catch (e) {
    console.error("Chat message send:", e)
    return NextResponse.json({ error: "Error al enviar mensaje" }, { status: 500 })
  }
}
