const BASE = "https://spacecatweb.com"
const visitorId = crypto.randomUUID()

// Create session
const sessRes = await fetch(`${BASE}/api/chat/session`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    visitorId,
    visitorName: "María García",
    visitorEmail: "maria@test.com",
    visitorWhatsApp: "584241234567",
  }),
})
const sess = await sessRes.json()
console.log("Session:", sess.sessionId)

// Send Spanish message
const msgRes = await fetch(`${BASE}/api/chat/session/${sess.sessionId}/messages`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    content: "Hola Johandri, estoy interesada en tus servicios de desarrollo web. ¿Tienes disponibilidad?",
    visitorId,
  }),
})
const msg = await msgRes.json()
console.log("Status:", msgRes.status, "Response:", msg)
