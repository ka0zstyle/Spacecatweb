import type { ReactNode } from "react"
import { Suspense } from "react"
import { Poppins } from "next/font/google"
import Shell from "@/components/layout/Shell"
import "./globals.css"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  display: "swap",
  variable: "--font-poppins",
  preload: true,
  fallback: ["system-ui", "sans-serif"],
})

export const metadata = {
  metadataBase: new URL("https://spacecatweb.com"),
  title: {
    default: "SpaceCatWeb — Desarrollo Web & Soluciones Digitales",
    template: "%s — SpaceCatWeb",
  },
  description:
    "SpaceCatWeb ofrece desarrollo web profesional, optimización SEO, soluciones de comercio electrónico y marketing digital. Construyamos tu presencia online.",
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="es" className={`${poppins.variable} scroll-smooth overflow-x-hidden`}>
      <body className={`${poppins.className} antialiased`}>
        <Suspense fallback={null}>
          <Shell>{children}</Shell>
        </Suspense>
      </body>
    </html>
  )
}
