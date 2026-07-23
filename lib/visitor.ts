import { cookies } from "next/headers"
import { randomUUID } from "node:crypto"

const VISITOR_COOKIE = "sc_vid"
const ONE_YEAR = 60 * 60 * 24 * 365

function randomVisitorId(): string {
  try {
    return randomUUID()
  } catch {
    return `v-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  }
}

export async function getOrCreateVisitorId(): Promise<string> {
  const store = await cookies()
  const existing = store.get(VISITOR_COOKIE)?.value
  if (existing) return existing
  const id = randomVisitorId()
  store.set({
    name: VISITOR_COOKIE,
    value: id,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ONE_YEAR,
  })
  return id
}

export async function getVisitorId(): Promise<string | null> {
  const store = await cookies()
  return store.get(VISITOR_COOKIE)?.value ?? null
}
