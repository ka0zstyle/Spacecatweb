"use client"

import { type ReactNode } from "react"

interface MainContentProps {
  children: ReactNode
}

export default function MainContent({ children }: MainContentProps) {
  return (
    <main className="min-h-screen relative" style={{ zIndex: 1 }}>
      {children}
    </main>
  )
}
