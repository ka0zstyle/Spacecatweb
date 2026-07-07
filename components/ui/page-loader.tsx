"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

export default function PageLoader() {
  const pathname = usePathname()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => setLoading(false), 400)
    return () => clearTimeout(timer)
  }, [pathname])

  if (!loading) return null

  return (
    <div className="fixed top-0 left-0 z-[99998] w-full h-0.5">
      <div className="h-full bg-sc-primary animate-loading-bar" />
    </div>
  )
}
