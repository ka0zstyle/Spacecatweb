const BASE = "https://spacecatweb.com"
const TOKEN = "8501433670:AAFbYz9RpsIsxFwNUo637hOxK6keow6ZdBk"
const CHAT_ID = "6866296183"

function escapeMarkdown(text) {
  return text.replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, "\\$&")
}

const sessionId = "30892223-8f02-4907-a5cd-a50a70bdab86"
const shortId = sessionId.slice(0, 8)
const name = escapeMarkdown("María García")
const preview = escapeMarkdown("Hola Johandri, estoy interesada en tus servicios de desarrollo web. ¿Tienes disponibilidad?")

// This is what the notify function does
const text = [
    `💬 *${name}*: ${preview}`,
    `_${new Date().toLocaleString("es-VE", { timeZone: "America/Caracas", hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" })}_`,
    `Responder: /r\\_${shortId} <mensaje>`,
].join("\n")

console.log("Text to send:")
console.log(text)
console.log("---")

const res = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text,
      parse_mode: "MarkdownV2",
      disable_web_page_preview: true,
    }),
  })

const data = await res.json()
console.log("Response:", JSON.stringify(data, null, 2))
