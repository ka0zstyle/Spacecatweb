import { NextRequest, NextResponse } from "next/server"
import sql from "@/lib/db"

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID

// Estado de respuestas pendientes persistido en Neon (sobrevive cold starts y
// se comparte entre instancias serverless). Ver `pending_replies` en supabase/neon-schema.sql.

async function sendTelegramMessage(chatId: string, text: string, extra: Record<string, unknown> = {}) {
  if (!TELEGRAM_BOT_TOKEN) return

  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "MarkdownV2",
      disable_web_page_preview: true,
      ...extra,
    }),
  }).catch(() => {})
}

async function answerCallbackQuery(id: string, text: string, showAlert = false) {
  if (!TELEGRAM_BOT_TOKEN) return
  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ callback_query_id: id, text, show_alert: showAlert }),
  }).catch(() => {})
}

function escapeMarkdown(text: string): string {
  return text.replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, "\\$&")
}

async function lookupCountry(ip: string | null): Promise<string | null> {
  if (!ip) return null
  if (ip === "127.0.0.1" || ip === "::1" || ip.startsWith("192.168.") || ip.startsWith("10.") || ip.startsWith("172.")) {
    return "🌐 LAN"
  }
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=country,countryCode&lang=es`, {
      signal: AbortSignal.timeout(3000),
    })
    if (res.ok) {
      const data = await res.json() as { country?: string; countryCode?: string }
      if (data.country) return `${data.country} ${data.countryCode ? `(${data.countryCode})` : ""}`
    }
  } catch {
    /* ignore */
  }
  return null
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const fromChatId = String(body?.message?.chat?.id ?? body?.callback_query?.message?.chat?.id ?? "")
    if (TELEGRAM_CHAT_ID && fromChatId !== TELEGRAM_CHAT_ID) {
      return NextResponse.json({ ok: true })
    }

    // ── Callback query (toque en botón inline) ────────────────────────────
    const callbackQuery = body?.callback_query
    if (callbackQuery) {
      const data = callbackQuery.data as string
      if (data.startsWith("reply:")) {
        const shortId = data.slice(6)
        const rows = await sql`
          SELECT id, visitor_name FROM chat_sessions
          WHERE id::text LIKE ${shortId + '%'} LIMIT 1
        `
        const session = rows[0] ?? null
        if (!session) {
          await answerCallbackQuery(callbackQuery.id, "❌ Chat no encontrado", true)
          return NextResponse.json({ ok: true })
        }
        const name = session.visitor_name ?? "Visitante"
        await sql`
          INSERT INTO pending_replies (chat_id, short_id, name)
          VALUES (${fromChatId}, ${shortId}, ${name})
          ON CONFLICT (chat_id) DO UPDATE SET short_id = EXCLUDED.short_id, name = EXCLUDED.name, created_at = NOW()
        `
        await answerCallbackQuery(callbackQuery.id, `✏️ Ahora escribe tu respuesta para ${name}`)
        await sendTelegramMessage(
          fromChatId,
          `✏️ *Respondiendo a ${escapeMarkdown(name)}* \\(\`${shortId}\`\\)\\.\n\nEscribe tu mensaje o usa \\/cancelar\\.`
        )
      }
      return NextResponse.json({ ok: true })
    }

    const message = body?.message
    if (!message?.text) return NextResponse.json({ ok: true })

    const text: string = message.text.trim()

    // ── /cancelar — cancela respuesta pendiente ────────────────────────────
    if (text === "/cancelar") {
      const cancelled = await sql`
        DELETE FROM pending_replies WHERE chat_id = ${fromChatId}
        RETURNING name
      `
      if (cancelled.length > 0) {
        const name = (cancelled[0] as { name: string }).name
        await sendTelegramMessage(fromChatId, `❌ Respuesta a *${escapeMarkdown(name)}* cancelada\\.`)
      } else {
        await sendTelegramMessage(fromChatId, "No hay ninguna respuesta pendiente\\.")
      }
      return NextResponse.json({ ok: true })
    }

    // ── /chats — listar sesiones abiertas con botones inline ──────────────
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
        const name = s.visitor_name ? escapeMarkdown(String(s.visitor_name)) : "Anónimo"
        const lastMsg = s.last_content
          ? escapeMarkdown(String(s.last_content).substring(0, 60))
          : "\\(sin texto\\)"
        return `${i + 1}\\. *${name}*\n   _${lastMsg}_`
      })

      const keyboard = rows.map((s: Record<string, unknown>) => {
        const shortId = String(s.id).slice(0, 8)
        const name = String(s.visitor_name ?? "Anónimo")
        return [{ text: `📩 ${name}`, callback_data: `reply:${shortId}` }]
      })

      await sendTelegramMessage(
        fromChatId,
        `💬 *Chats abiertos \\(${sessions.length}\\):*\n\n${lines.join("\n\n")}\n\n_Toca un botón para responder o usa \\/r\\_ABC mensaje_`,
        { reply_markup: { inline_keyboard: keyboard } }
      )
      return NextResponse.json({ ok: true })
    }

    // ── /data o /data_ABC — datos del visitante ─────────────────────────────
    const dataMatch = text.match(/^\/data(?:_([a-zA-Z0-9]+))?$/i)
    if (dataMatch) {
      const targetShortId = dataMatch[1] ?? null
      const rows = targetShortId
        ? await sql`
            SELECT id, visitor_name, visitor_email, visitor_whatsapp, visitor_ip, status, created_at, updated_at
            FROM chat_sessions WHERE id::text LIKE ${targetShortId + '%'}
            ORDER BY updated_at DESC LIMIT 1
          `
        : await sql`
            SELECT id, visitor_name, visitor_email, visitor_whatsapp, visitor_ip, status, created_at, updated_at
            FROM chat_sessions WHERE status = 'OPEN'
            ORDER BY updated_at DESC LIMIT 1
          `
      const session = rows[0] ?? null
      if (!session) {
        const msg = targetShortId
          ? `❌ No se encontró ningún chat con ID \`${escapeMarkdown(targetShortId)}\`\\.`
          : "❌ No hay chats abiertos en este momento\\."
        await sendTelegramMessage(fromChatId, msg)
        return NextResponse.json({ ok: true })
      }
      const shortId = String(session.id).slice(0, 8)
      const name = session.visitor_name ? escapeMarkdown(String(session.visitor_name)) : "Anónimo"
      const email = session.visitor_email ? escapeMarkdown(String(session.visitor_email)) : "—"
      const whatsapp = session.visitor_whatsapp ? escapeMarkdown(String(session.visitor_whatsapp)) : "—"
      const country = await lookupCountry(session.visitor_ip ?? null)
      const created = new Date(session.created_at).toLocaleString("es-VE", {
        timeZone: "America/Caracas", day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      })
      const updated = new Date(session.updated_at).toLocaleString("es-VE", {
        timeZone: "America/Caracas", day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      })
      const statusIcon = session.status === "OPEN" ? "🟢" : "🔴"
      await sendTelegramMessage(
        fromChatId,
        `*${name}* \\- \`${shortId}\` ${statusIcon}\n\n` +
          `📧 ${email}\n` +
          `📱 ${whatsapp}\n` +
          `${country ? `🌍 ${escapeMarkdown(country)}\n` : ""}` +
          `🕐 Iniciado: ${escapeMarkdown(created)}\n` +
          `🕐 Última actividad: ${escapeMarkdown(updated)}`
      )
      return NextResponse.json({ ok: true })
    }

    // ── /datalast o /datalast_ABC — datos del último chat (abierto o cerrado) ─
    const dataLastMatch = text.match(/^\/datalast(?:_([a-zA-Z0-9]+))?$/i)
    if (dataLastMatch) {
      const targetShortId = dataLastMatch[1] ?? null
      const rows = targetShortId
        ? await sql`
            SELECT id, visitor_name, visitor_email, visitor_whatsapp, visitor_ip, status, created_at, updated_at
            FROM chat_sessions WHERE id::text LIKE ${targetShortId + '%'}
            ORDER BY updated_at DESC LIMIT 1
          `
        : await sql`
            SELECT id, visitor_name, visitor_email, visitor_whatsapp, visitor_ip, status, created_at, updated_at
            FROM chat_sessions
            ORDER BY updated_at DESC LIMIT 1
          `
      const session = rows[0] ?? null
      if (!session) {
        const msg = targetShortId
          ? `❌ No se encontró ningún chat con ID \`${escapeMarkdown(targetShortId)}\`\\.`
          : "❌ No hay chats registrados\\."
        await sendTelegramMessage(fromChatId, msg)
        return NextResponse.json({ ok: true })
      }
      const shortId = String(session.id).slice(0, 8)
      const name = session.visitor_name ? escapeMarkdown(String(session.visitor_name)) : "Anónimo"
      const email = session.visitor_email ? escapeMarkdown(String(session.visitor_email)) : "—"
      const whatsapp = session.visitor_whatsapp ? escapeMarkdown(String(session.visitor_whatsapp)) : "—"
      const country = await lookupCountry(session.visitor_ip ?? null)
      const created = new Date(session.created_at).toLocaleString("es-VE", {
        timeZone: "America/Caracas", day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      })
      const updated = new Date(session.updated_at).toLocaleString("es-VE", {
        timeZone: "America/Caracas", day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      })
      const statusIcon = session.status === "OPEN" ? "🟢" : "🔴"
      await sendTelegramMessage(
        fromChatId,
        `*${name}* \\- \`${shortId}\` ${statusIcon}\n\n` +
          `📧 ${email}\n` +
          `📱 ${whatsapp}\n` +
          `${country ? `🌍 ${escapeMarkdown(country)}\n` : ""}` +
          `🕐 Iniciado: ${escapeMarkdown(created)}\n` +
          `🕐 Última actividad: ${escapeMarkdown(updated)}`
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
      // Revisar si hay una respuesta pendiente por botón inline
      const pendingRows = await sql`
        DELETE FROM pending_replies WHERE chat_id = ${fromChatId}
        RETURNING short_id
      `
      if (pendingRows.length > 0) {
        shortId = (pendingRows[0] as { short_id: string }).short_id
      }
      replyContent = text
    } else {
      await sendTelegramMessage(
        fromChatId,
        "ℹ️ *Comandos:*\n\n" +
          "Escribe directo para responder al último chat\n" +
          "`/r <mensaje>` — responde al último chat abierto\n" +
          "`/r\\_ABC <mensaje>` — responde a un chat específico\n" +
          "`/data` — datos del último chat abierto\n" +
          "`/data\\_ABC` — datos de un chat específico\n" +
          "`/datalast` — datos del último chat (abierto o cerrado)\n" +
          "`/datalast\\_ABC` — datos de un chat específico (cualquier estado)\n" +
          "`/chats` — lista los chats abiertos\n" +
          "`/cancelar` — cancela respuesta pendiente"
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
