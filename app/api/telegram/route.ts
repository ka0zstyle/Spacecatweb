import { NextRequest, NextResponse } from "next/server"
import sql from "@/lib/db"

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID

async function sendTelegramMessage(chatId: string, text: string) {
  if (!TELEGRAM_BOT_TOKEN) return

  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "MarkdownV2",
      disable_web_page_preview: true,
    }),
  }).catch(() => {})
}

function escapeMarkdown(text: string): string {
  return text.replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, "\\$&")
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const message = body?.message
    if (!message?.text) return NextResponse.json({ ok: true })

    const fromChatId = String(message.chat?.id ?? "")
    if (TELEGRAM_CHAT_ID && fromChatId !== TELEGRAM_CHAT_ID) {
      return NextResponse.json({ ok: true })
    }

    const text: string = message.text.trim()

    // ── /chats — listar sesiones abiertas ──────────────────────────────────
    if (text === "/chats") {
      const sessions = await sql`
        SELECT cs.id, cs.visitor_name, cs.visitor_email,
          (SELECT content FROM chat_messages WHERE session_id = cs.id ORDER BY created_at DESC LIMIT 1) as last_content
        FROM chat_sessions cs
        WHERE cs.status = 'OPEN'
        ORDER BY cs.updated_at DESC
        LIMIT 10
      `

      if (sessions.length === 0) {
        await sendTelegramMessage(fromChatId, "📭 No hay chats abiertos en este momento\\.")
        return NextResponse.json({ ok: true })
      }

      const rows = sessions as Array<Record<string, unknown>>
      const lines = rows.map((s: Record<string, unknown>, i: number) => {
        const shortId = String(s.id).slice(0, 8)
        const name = s.visitor_name ? escapeMarkdown(String(s.visitor_name)) : "Anónimo"
        const lastMsg = s.last_content
          ? escapeMarkdown(String(s.last_content).substring(0, 60))
          : "\\(sin texto\\)"
        return `${i + 1}\\. *${name}* \\— \`/r\\_${shortId}\`\n   _${lastMsg}_`
      })

      await sendTelegramMessage(
        fromChatId,
        `💬 *Chats abiertos \\(${sessions.length}\\):*\n\n${lines.join("\n\n")}\n\n_Usa \\/r\\_ABC mensaje para responder a un chat específico_\n_O simplemente escribe tu mensaje para responder al último chat_`
      )
      return NextResponse.json({ ok: true })
    }

    // ── /r o /r_ABC o mensaje directo ───────────────────────────────────────
    const replyMatch = text.match(/^\/r(?:_([a-zA-Z0-9]+))?\s+([\s\S]+)$/i)
    let shortId: string | null = null
    let replyContent: string

    if (replyMatch) {
      shortId = replyMatch[1] ?? null
      replyContent = replyMatch[2].trim()
    } else if (!text.startsWith("/")) {
      shortId = null
      replyContent = text
    } else {
      await sendTelegramMessage(
        fromChatId,
        "ℹ️ *Comandos:*\n\n" +
          "Escribe directo para responder al último chat\n" +
          "`/r <mensaje>` — responde al último chat abierto\n" +
          "`/r\\_ABC <mensaje>` — responde a un chat específico\n" +
          "`/chats` — lista los chats abiertos"
      )
      return NextResponse.json({ ok: true })
    }

    // Buscar la sesión
    let session
    if (shortId) {
      const rows = await sql`
        SELECT id, visitor_name, status FROM chat_sessions
        WHERE id::text LIKE ${shortId + '%'} AND status = 'OPEN'
        ORDER BY updated_at DESC
        LIMIT 1
      `
      session = rows[0] ?? null
    } else {
      const rows = await sql`
        SELECT id, visitor_name, status FROM chat_sessions
        WHERE status = 'OPEN'
        ORDER BY updated_at DESC
        LIMIT 1
      `
      session = rows[0] ?? null
    }

    if (!session) {
      const msg = shortId
        ? `❌ No se encontró ningún chat con ID \`${escapeMarkdown(shortId)}\`\\.`
        : "❌ No hay chats abiertos en este momento\\."
      await sendTelegramMessage(fromChatId, msg)
      return NextResponse.json({ ok: true })
    }

    if (session.status === "CLOSED") {
      await sendTelegramMessage(
        fromChatId,
        `⚠️ El chat de *${escapeMarkdown(session.visitor_name ?? "Visitante")}* está cerrado\\.`
      )
      return NextResponse.json({ ok: true })
    }

    // Crear el mensaje como ADMIN en la BD
    await sql`
      INSERT INTO chat_messages (session_id, role, content)
      VALUES (${session.id}, 'ADMIN', ${replyContent})
    `

    await sql`
      UPDATE chat_sessions SET updated_at = NOW() WHERE id = ${session.id}
    `

    const visitorName = session.visitor_name ?? "Visitante"
    const shortSessionId = session.id.slice(0, 8)
    await sendTelegramMessage(
      fromChatId,
      `✅ Respuesta enviada a *${escapeMarkdown(visitorName)}* \\(\`${shortSessionId}\`\\)\\.`
    )

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[Telegram webhook] Error:", error)
    return NextResponse.json({ ok: true })
  }
}

export async function GET() {
  if (!TELEGRAM_BOT_TOKEN) {
    return NextResponse.json({ error: "Telegram bot not configured" }, { status: 500 })
  }

  const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`)
  const data = await res.json()
  return NextResponse.json(data)
}
