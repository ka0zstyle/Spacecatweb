"use client"

import { useEffect, useState } from "react"

export default function InitialLoader() {
  const [isHiding, setIsHiding] = useState(false)
  const [isHidden, setIsHidden] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsHiding(true)
      setTimeout(() => setIsHidden(true), 500)
    }, 1200)
    return () => clearTimeout(timer)
  }, [])

  if (isHidden) return null

  return (
    <div
      className={`fixed inset-0 z-[99999] flex items-center justify-center bg-sc-dark transition-opacity duration-500 ${
        isHiding ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="animate-loading-logo-pulse">
          <img
            src="/assets/images/SpaceCatWeb.webp"
            alt="SpaceCatWeb"
            className="h-10 w-auto"
          />
        </div>
        <div className="flex items-center gap-1 text-sc-muted text-sm">
          <span className="tracking-[0.2em]">Meeeoowww</span>
          <span className="animate-dot-1">.</span>
          <span className="animate-dot-2">.</span>
          <span className="animate-dot-3">.</span>
        </div>
      </div>
    </div>
  )
}
