const BASE = "https://spacecatweb.com"
const visitorId = crypto.randomUUID()

// Create session
const sessRes = await fetch(`${BASE}/api/chat/session`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    visitorId,
    visitorName: "Debug Tester",
    visitorEmail: "debug@test.com",
    visitorWhatsApp: "999888777",
  }),
})
const sess = await sessRes.json()
console.log("Session:", sess)

// Send message
const msgRes = await fetch(`${BASE}/api/chat/session/${sess.sessionId}/messages`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    content: "Test message from debug script",
    visitorId,
  }),
})
const msg = await msgRes.json()
console.log("Message response:", msgRes.status, msg)
