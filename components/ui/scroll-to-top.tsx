"use client"

import { useEffect, useState } from "react"
import { ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300)
    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={cn(
        "fixed bottom-6 right-6 z-50 flex items-center justify-center w-11 h-11 rounded-full",
        "bg-sc-primary text-white shadow-lg shadow-sc-primary/30",
        "hover:bg-sc-primary-light hover:shadow-sc-primary/50 hover:scale-110",
        "transition-[opacity,transform,background-color,box-shadow] duration-300 ease-out",
        visible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-4 pointer-events-none"
      )}
      aria-label="Scroll to top"
    >
      <ChevronUp size={20} />
    </button>
  )
}
