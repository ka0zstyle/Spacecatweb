import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const proto = request.headers.get("x-forwarded-proto")
  const isHttp = proto === "http" || (!proto && request.nextUrl.protocol === "http:")
  if (isHttp) {
    const url = request.nextUrl
    url.protocol = "https:"
    url.port = ""
    return NextResponse.redirect(url, 301)
  }
  return NextResponse.next()
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico).*)",
}
