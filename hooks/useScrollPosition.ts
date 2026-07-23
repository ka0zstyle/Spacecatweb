"use client"

import { useEffect, useRef, useState } from "react"

export type ScrollSnapshot = {
  scrollY: number
  vh: number
  vhRatio: number
  direction: "up" | "down"
}

const subs = new Set<(s: ScrollSnapshot) => void>()
let lastY = 0
let ticking = false
let installed = false

function emit() {
  const snap: ScrollSnapshot = {
    scrollY: window.scrollY,
    vh: window.innerHeight,
    vhRatio: window.scrollY / Math.max(1, window.innerHeight),
    direction:
      window.scrollY > lastY ? "down" : window.scrollY < lastY ? "up" : "down",
  }
  lastY = window.scrollY
  subs.forEach((fn) => fn(snap))
  ticking = false
}

function install() {
  if (installed || typeof window === "undefined") return
  installed = true
  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(emit)
    },
    { passive: true },
  )
  window.addEventListener("resize", emit, { passive: true })
}

export function useScrollPosition<T>(selector: (s: ScrollSnapshot) => T): T {
  const [value, setValue] = useState<T>(() =>
    selector({ scrollY: 0, vh: 0, vhRatio: 0, direction: "down" }),
  )
  const selRef = useRef(selector)
  selRef.current = selector

  useEffect(() => {
    install()
    const fn = (s: ScrollSnapshot) => {
      const v = selRef.current(s)
      setValue((prev) => (Object.is(prev, v) ? prev : v))
    }
    subs.add(fn)
    return () => {
      subs.delete(fn)
    }
  }, [])

  return value
}
