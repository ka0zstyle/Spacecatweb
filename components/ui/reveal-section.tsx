"use client"

import { useRef, useEffect, type ReactNode } from "react"
import { cn } from "@/lib/utils"

interface RevealSectionProps {
  children: ReactNode
  className?: string
  direction?: "up" | "left" | "right"
  delay?: 1 | 2 | 3 | 4
}

export default function RevealSection({
  children,
  className,
  direction = "up",
  delay,
}: RevealSectionProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-visible")
          observer.unobserve(el)
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={cn(
        {
          reveal: direction === "up",
          "reveal-left": direction === "left",
          "reveal-right": direction === "right",
        },
        delay && `reveal-delay-${delay}`,
        className
      )}
    >
      {children}
    </div>
  )
}
