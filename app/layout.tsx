import type { ReactNode } from "react"
import { Suspense } from "react"
import Shell from "@/components/layout/Shell"
import "./globals.css"

export default async function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="es" className="scroll-smooth overflow-x-hidden">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <Suspense fallback={null}>
          <Shell>{children}</Shell>
        </Suspense>
      </body>
    </html>
  )
}
