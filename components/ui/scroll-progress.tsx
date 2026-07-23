"use client"

import { useEffect, useRef } from "react"
import type { Lang } from "@/lib/lang"
import { useScrollPosition } from "@/hooks/useScrollPosition"

const SECTIONS = [
  "home",
  "payment",
  "about",
  "services",
  "portfolio",
  "pricing",
  "blog",
  "laguaira",
  "contact",
] as const

interface ScrollProgressProps {
  lang: Lang
}

export default function ScrollProgress({ lang }: ScrollProgressProps) {
  const fillRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)
  const markerRefs = useRef<Map<string, HTMLButtonElement>>(new Map())
  const activeRef = useRef<string>("")
  const labelRef = useRef<HTMLSpanElement>(null)
  const labels: Record<string, string> = {
    home: lang.nav_home,
    payment: lang.payment_title?.split(" ")[0] ?? "Payment",
    about: lang.nav_about,
    services: lang.nav_services,
    portfolio: lang.nav_portfolio,
    pricing: lang.nav_pricing,
    blog: lang.nav_blog,
    laguaira: lang.laguaira_nav,
    contact: lang.nav_contact,
  }

  useEffect(() => {
    const positionMarkers = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      if (docHeight <= 0) return
      SECTIONS.forEach((id) => {
        const el = document.getElementById(id)
        const marker = markerRefs.current.get(id)
        if (!el || !marker) return
        const top = el.getBoundingClientRect().top + window.scrollY
        const pct = Math.max(0, Math.min(100, (top / docHeight) * 100))
        marker.style.top = `${pct}%`
      })
    }

    positionMarkers()
    if (labelRef.current) labelRef.current.textContent = labels[SECTIONS[0]]

    const ro = new ResizeObserver(positionMarkers)
    ro.observe(document.body)
    window.addEventListener("resize", positionMarkers, { passive: true })

    return () => {
      ro.disconnect()
      window.removeEventListener("resize", positionMarkers)
    }
  }, [])

  useScrollPosition<{ progress: number; active: string }>((s) => {
    const docHeight = document.documentElement.scrollHeight - s.vh
    const progress = docHeight > 0 ? Math.min(1, Math.max(0, s.scrollY / docHeight)) : 0

    const probeY = s.scrollY + s.vh * 0.35
    let active: string = SECTIONS[0]
    for (const id of SECTIONS) {
      const el = document.getElementById(id)
      if (!el) continue
      const top = el.getBoundingClientRect().top + s.scrollY
      if (probeY >= top) active = id
    }

    if (fillRef.current) fillRef.current.style.transform = `scaleY(${progress})`
    if (dotRef.current) dotRef.current.style.top = `${progress * 100}%`

    if (active !== activeRef.current) {
      const prev = markerRefs.current.get(activeRef.current)
      const curr = markerRefs.current.get(active)
      if (prev) {
        prev.style.background = "rgba(255,255,255,0.3)"
        prev.style.transform = "translate(-50%, -50%) scale(1)"
        prev.style.boxShadow = ""
      }
      if (curr) {
        curr.style.background = "rgba(243,156,18,1)"
        curr.style.transform = "translate(-50%, -50%) scale(1.6)"
        curr.style.boxShadow = "0 0 6px rgba(243,156,18,0.8)"
      }
      if (labelRef.current) labelRef.current.textContent = labels[active] ?? ""
      activeRef.current = active
    }

    return { progress, active }
  })

  return (
    <div className="fixed right-3 sm:right-4 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-center select-none">
      <span
        ref={labelRef}
        className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] font-mono tracking-[0.2em] uppercase text-sc-accent whitespace-nowrap transition-opacity duration-300"
      />
      <div
        className="relative w-[2px] rounded-full bg-white/10 overflow-visible"
        style={{ height: "min(55vh, 360px)" }}
      >
        <div
          ref={fillRef}
          className="absolute inset-0 w-full bg-gradient-to-b from-sc-primary to-sc-accent origin-top rounded-full"
          style={{ transform: "scaleY(0)", willChange: "transform" }}
        />
        {SECTIONS.map((id) => (
          <button
            key={id}
            type="button"
            aria-label={labels[id]}
            onClick={() => {
              const el = document.getElementById(id)
              if (el) el.scrollIntoView({ behavior: "smooth" })
            }}
            ref={(el) => {
              if (el) markerRefs.current.set(id, el)
            }}
            className="absolute left-1/2 w-2.5 h-2.5 rounded-full cursor-pointer"
            style={{
              top: "0%",
              transform: "translate(-50%, -50%)",
              background: "rgba(255,255,255,0.3)",
              transition: "transform 0.2s ease",
            }}
          />
        ))}
        <div
          ref={dotRef}
          className="absolute left-1/2 w-2.5 h-2.5 rounded-full bg-sc-accent shadow-[0_0_10px_rgba(243,156,18,0.9)]"
          style={{ top: "0%", transform: "translate(-50%, -50%)", willChange: "top" }}
        />
      </div>
    </div>
  )
}
