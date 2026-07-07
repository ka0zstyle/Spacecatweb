import { NextResponse } from "next/server"
import sql from "@/lib/db"

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID

function escapeMarkdown(text: string): string {
  return text.replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, "\\$&")
}

async function notifyTelegram(
  sessionId: string,
  visitorName: string | null,
  content: string
) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return

  const shortId = sessionId.slice(0, 8)
  const name = escapeMarkdown(visitorName?.trim() || "Visitante")
  const preview = escapeMarkdown(content.length > 300 ? content.substring(0, 300) + "…" : content)

  const text = [
    `💬 *${name}*: ${preview}`,
    `_${new Date().toLocaleString("es-VE", { timeZone: "America/Caracas", hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" })}_`,
    `Responder: /r\\_${shortId} <mensaje>`,
  ].join("\n")

  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text,
      parse_mode: "MarkdownV2",
      disable_web_page_preview: true,
    }),
  }).catch(() => {})
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params
    const url = new URL(request.url)
    const visitorId = url.searchParams.get("visitorId") ?? undefined

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
      messages: (messages as Array<Record<string, unknown>>).map((m: Record<string, unknown>) => ({
        id: m.id as string,
        role: m.role as string,
        content: m.content as string,
        createdAt: m.created_at as string,
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
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params
    const body = await request.json().catch(() => ({}))
    const content = (body.content as string)?.trim() ?? ""
    const visitorId = (body.visitorId as string)?.trim()

    if (!visitorId) {
      return NextResponse.json({ error: "Falta visitorId" }, { status: 400 })
    }

    if (!content) {
      return NextResponse.json({ error: "Escribe un mensaje" }, { status: 400 })
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
      return NextResponse.json(
        { error: "Esta conversación está cerrada" },
        { status: 400 }
      )
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

    notifyTelegram(sessionId, session[0].visitor_name, content)

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
