import { NextRequest, NextResponse } from "next/server"
import sql from "@/lib/db"

const POLL_MS = 2500
const HEARTBEAT_MS = 15000

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(resolve, ms)
    signal.addEventListener(
      "abort",
      () => {
        clearTimeout(t)
        reject(new Error("aborted"))
      },
      { once: true }
    )
  })
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params
  const visitorId = request.nextUrl.searchParams.get("visitorId") ?? undefined

  const session = await sql`
    SELECT visitor_id FROM chat_sessions WHERE id = ${sessionId}
  `

  if (session.length === 0) {
    return NextResponse.json({ error: "Sesión no encontrada" }, { status: 404 })
  }

  if (session[0].visitor_id !== visitorId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  let lastSentCreatedAt: string | null = null

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const send = (
        data: {
          messages?: Array<{ id: string; role: string; content: string; createdAt: string }>
          status?: string
        },
        eventId?: string
      ) => {
        let out = ""
        if (eventId) out += `id: ${eventId}\n`
        out += `data: ${JSON.stringify(data)}\n\n`
        controller.enqueue(encoder.encode(out))
      }

      let lastHeartbeat = Date.now()
      let lastSentStatus: string | null = null

      try {
        while (!request.signal.aborted) {
          const [sessionSnapshot, messages] = await Promise.all([
            sql`SELECT status FROM chat_sessions WHERE id = ${sessionId}`,
            sql`
              SELECT id, role, content, created_at
              FROM chat_messages
              WHERE session_id = ${sessionId}
              ORDER BY created_at ASC
            `,
          ])

          const currentStatus = sessionSnapshot[0]?.status ?? "OPEN"

          const msgs = messages as Array<Record<string, unknown>>
          const newOnes = lastSentCreatedAt
            ? msgs.filter((m) => String(m.created_at) > lastSentCreatedAt!)
            : []

          if (newOnes.length > 0) {
            const payload = newOnes.map((m) => ({
              id: String(m.id),
              role: String(m.role),
              content: String(m.content),
              createdAt: String(m.created_at),
            }))
            send({ messages: payload, status: currentStatus }, String(newOnes[newOnes.length - 1].id))
            lastSentCreatedAt = String(newOnes[newOnes.length - 1].created_at)
            lastSentStatus = currentStatus
          } else if (lastSentCreatedAt === null && msgs.length > 0) {
            lastSentCreatedAt = String(msgs[msgs.length - 1].created_at)
          }

          if (currentStatus === "CLOSED" && lastSentStatus !== "CLOSED") {
            send({ status: "CLOSED" }, `status-${Date.now()}`)
            lastSentStatus = "CLOSED"
          }

          if (Date.now() - lastHeartbeat > HEARTBEAT_MS) {
            controller.enqueue(encoder.encode(": heartbeat\n\n"))
            lastHeartbeat = Date.now()
          }

          await sleep(POLL_MS, request.signal)
        }
      } catch (err) {
        if ((err as Error).message !== "aborted") {
          console.error("Chat stream:", err)
        }
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-store, no-cache, must-revalidate",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  })
}
