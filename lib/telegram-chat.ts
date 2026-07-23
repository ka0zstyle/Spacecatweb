function escapeMarkdown(text: string): string {
  return text.replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, "\\$&")
}

export async function sendTelegramChatNotification(
  sessionId: string,
  visitorName: string | null,
  content: string,
  botToken: string,
  chatId: string,
): Promise<void> {
  try {
    const shortId = sessionId.slice(0, 8)
    const name = escapeMarkdown(visitorName?.trim() || "Visitante")
    const preview = escapeMarkdown(content.length > 300 ? content.substring(0, 300) + "…" : content)
    const timestamp = new Date().toLocaleString("es-VE", {
      timeZone: "America/Caracas",
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
    })
    const text = `💬 *${name}*: ${preview}\n_${escapeMarkdown(timestamp)}_`
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "MarkdownV2",
        disable_web_page_preview: true,
      }),
    })
    if (!res.ok) {
      const errBody = await res.text().catch(() => "")
      console.error("[Telegram notify] Error:", res.status, errBody)
    }
  } catch (err) {
    console.error("[Telegram notify] Excepción:", err)
  }
}
