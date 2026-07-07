import { NextResponse } from "next/server"
import { Resend } from "resend"
import sql from "@/lib/db"

const resend = new Resend(process.env.RESEND_API_KEY)

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID

async function sendToTelegram(name: string, email: string, country: string, phone: string, message: string) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return

  const text = `📨 *Nuevo mensaje de contacto*

👤 *Nombre:* ${name}
📧 *Email:* ${email}
🌍 *País:* ${country}
📱 *WhatsApp:* ${phone || "No proporcionado"}

💬 *Mensaje:*
${message}`

  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text,
      parse_mode: "Markdown",
    }),
  }).catch(() => {})
}

async function sendEmail(name: string, email: string, country: string, phone: string, message: string) {
  if (!process.env.RESEND_API_KEY) return

  await resend.emails.send({
    from: "SpaceCatWeb <onboarding@resend.dev>",
    to: "spacecatweb@gmail.com",
    subject: `Nuevo mensaje de ${name}`,
    html: `
      <h2>Nuevo mensaje de contacto</h2>
      <p><strong>Nombre:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>País:</strong> ${country}</p>
      <p><strong>WhatsApp:</strong> ${phone || "No proporcionado"}</p>
      <hr />
      <p><strong>Mensaje:</strong></p>
      <p>${message}</p>
    `,
    replyTo: email,
  }).catch(() => {})
}

async function saveMessage(name: string, email: string, country: string, phone: string, message: string) {
  await sql`
    INSERT INTO contact_messages (name, email, country, whatsapp, message)
    VALUES (${name}, ${email}, ${country}, ${phone || null}, ${message})
  `
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, country, whatsapp, message } = body

    if (!name || !email || !country || !message) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    await Promise.all([
      saveMessage(name, email, country, whatsapp, message),
      sendEmail(name, email, country, whatsapp, message),
      sendToTelegram(name, email, country, whatsapp, message),
    ])

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const messages = await sql`
      SELECT id, name, email, country, whatsapp, message, created_at
      FROM contact_messages
      ORDER BY created_at DESC
      LIMIT 50
    `
    return NextResponse.json(messages)
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
