import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const securityHeaders: Record<string, string> = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "X-DNS-Prefetch-Control": "off",
}

const csp = [
  "default-src 'self'",
  "img-src 'self' data: blob: https://res.cloudinary.com",
  "media-src 'self' blob:",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://api.telegram.org",
  "connect-src 'self' https://api.telegram.org https://*.neon.tech",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ")

export function proxy(request: NextRequest) {
  const isDev = process.env.NODE_ENV === "development"

  if (!isDev) {
    const proto = request.headers.get("x-forwarded-proto")
    if (proto === "http" || (!proto && request.nextUrl.protocol === "http:")) {
      const url = request.nextUrl.clone()
      url.protocol = "https:"
      url.port = ""
      return NextResponse.redirect(url, 301)
    }
  }

  const response = NextResponse.next()
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value)
  }
  response.headers.set("Content-Security-Policy", csp)
  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
