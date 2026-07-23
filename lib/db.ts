import { neon, type NeonQueryFunction } from "@neondatabase/serverless"

let cached: NeonQueryFunction<false, false> | null = null

function getSql(): NeonQueryFunction<false, false> {
  if (cached) return cached
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error(
      "[db] DATABASE_URL is not configured. Set it in .env.local or your deployment environment.",
    )
  }
  cached = neon(url)
  return cached
}

const sql = new Proxy({} as NeonQueryFunction<false, false>, {
  get(_target, prop, receiver) {
    const target = getSql() as unknown as Record<PropertyKey, unknown>
    const value = Reflect.get(target, prop, receiver)
    return typeof value === "function" ? (value as (...a: unknown[]) => unknown).bind(target) : value
  },
})

export default sql as NeonQueryFunction<false, false>
