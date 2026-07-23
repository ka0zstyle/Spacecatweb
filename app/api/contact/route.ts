import { NextResponse, type NextRequest } from "next/server"
import { Resend } from "resend"
import sql from "@/lib/db"

const resend = new Resend(process.env.RESEND_API_KEY)

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID
const ADMIN_TOKEN = process.env.ADMIN_TOKEN

const MAX_NAME = 100
const MAX_EMAIL = 254
const MAX_COUNTRY = 50
const MAX_PHONE = 20
const MAX_MESSAGE = 2000
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const OWN_DOMAIN = /@spacecatweb\.[a-z]{2,}$/i

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!),
  )
}

function isValidPayload(input: unknown): input is {
  name: string
  email: string
  country: string
  whatsapp?: string | null
  message: string
} {
  if (typeof input !== "object" || input === null) return false
  const v = input as Record<string, unknown>
  if (typeof v.name !== "string" || v.name.trim().length === 0 || v.name.length > MAX_NAME) return false
  if (typeof v.email !== "string" || v.email.length > MAX_EMAIL || !EMAIL_RE.test(v.email)) return false
  if (OWN_DOMAIN.test(v.email)) return false // prevent open relay
  if (typeof v.country !== "string" || v.country.trim().length === 0 || v.country.length > MAX_COUNTRY) return false
  if (v.whatsapp != null) {
    if (typeof v.whatsapp !== "string" || v.whatsapp.length > MAX_PHONE) return false
  }
  if (typeof v.message !== "string" || v.message.trim().length === 0 || v.message.length > MAX_MESSAGE) return false
  return true
}

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
    body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text, parse_mode: "Markdown" }),
  }).catch(() => {})
}

async function sendEmail(name: string, email: string, country: string, phone: string, message: string) {
  if (!process.env.RESEND_API_KEY) return
  const safeName = escapeHtml(name)
  const safeEmail = escapeHtml(email)
  const safeCountry = escapeHtml(country)
  const safePhone = escapeHtml(phone || "No proporcionado")
  const safeMessage = escapeHtml(message)
  await resend.emails.send({
    from: "SpaceCatWeb <no-reply@spacecatweb.com>",
    to: "spacecatweb@gmail.com",
    subject: `Nuevo mensaje de ${safeName}`,
    html: `<h2>Nuevo mensaje de contacto</h2>
<p><strong>Nombre:</strong> ${safeName}</p>
<p><strong>Email:</strong> ${safeEmail}</p>
<p><strong>País:</strong> ${safeCountry}</p>
<p><strong>WhatsApp:</strong> ${safePhone}</p>
<hr />
<p><strong>Mensaje:</strong></p>
<pre style="white-space:pre-wrap;font-family:inherit">${safeMessage}</pre>`,
    replyTo: email,
  }).catch(() => {})
}

async function saveMessage(name: string, email: string, country: string, phone: string | null, message: string) {
  await sql`
    INSERT INTO contact_messages (name, email, country, whatsapp, message)
    VALUES (${name}, ${email}, ${country}, ${phone}, ${message})
  `
}

export async function POST(request: NextRequest) {
  const json = await request.json().catch(() => null)
  if (!isValidPayload(json)) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 })
  }
  const name = json.name.trim()
  const email = json.email.trim()
  const country = json.country.trim()
  const phone = (json.whatsapp ?? "").trim() || null
  const message = json.message.trim()

  await Promise.allSettled([
    saveMessage(name, email, country, phone, message).catch((e) => console.error("[contact] DB save failed:", e)),
    sendEmail(name, email, country, phone ?? "", message),
    sendToTelegram(name, email, country, phone ?? "", message),
  ])

  return NextResponse.json({ success: true })
}

export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization")
  if (!ADMIN_TOKEN || auth !== `Bearer ${ADMIN_TOKEN}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const rows = await sql`
      SELECT id, name, email, country, whatsapp, created_at
      FROM contact_messages
      ORDER BY created_at DESC
      LIMIT 50
    `
    return NextResponse.json(rows)
  } catch (e) {
    console.error("[contact] list failed:", e)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
