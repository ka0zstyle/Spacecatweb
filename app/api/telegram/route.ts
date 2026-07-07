import { NextResponse } from "next/server"

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID

async function sendTelegramMessage(chatId: number, text: string) {
  if (!TELEGRAM_BOT_TOKEN) return

  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "Markdown",
    }),
  }).catch(() => {})
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body.message) {
      return NextResponse.json({ ok: true })
    }

    const { message } = body
    const chatId = message.chat.id
    const text = message.text || ""
    const from = message.from

    if (String(chatId) !== TELEGRAM_CHAT_ID) {
      return NextResponse.json({ ok: true })
    }

    if (text.startsWith("/start")) {
      await sendTelegramMessage(chatId, `Hola ${from.first_name}! 👋\n\nSoy el bot de SpaceCatWeb. Recibirás aquí los mensajes del formulario de contacto de tu página web.\n\nUsa /ayuda para ver los comandos disponibles.`)
    } else if (text.startsWith("/ayuda") || text.startsWith("/help")) {
      await sendTelegramMessage(chatId, `📋 *Comandos disponibles:*

/start - Iniciar el bot
/ayuda - Ver esta ayuda
/responder <mensaje> - Responder al último contacto
/contactos - Ver mensajes recientes`)
    } else if (text.startsWith("/responder")) {
      const reply = text.replace("/responder", "").trim()
      if (reply) {
        await sendTelegramMessage(chatId, `✅ Mensaje enviado: ${reply}`)
      } else {
        await sendTelegramMessage(chatId, "⚠️ Usa: /responder <tu mensaje>")
      }
    } else {
      await sendTelegramMessage(chatId, `📩 Mensaje recibido: ${text}`)
    }

    return NextResponse.json({ ok: true })
  } catch {
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
