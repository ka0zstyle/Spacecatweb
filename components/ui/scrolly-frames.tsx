"use client"

import {
  useRef,
  useEffect,
  useLayoutEffect,
  useState,
  Children,
  isValidElement,
  type ReactNode,
} from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

interface ScrollyFramesProps {
  children: ReactNode
  pinSpacing?: number
  startOffset?: number
  className?: string
  innerClassName?: string
  crossfade?: number
  showProgress?: boolean
  progressClassName?: string
}

export default function ScrollyFrames({
  children,
  pinSpacing = 1800,
  startOffset = 80,
  className,
  innerClassName,
  crossfade = 0.35,
  showProgress = true,
  progressClassName,
}: ScrollyFramesProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const framesRef = useRef<HTMLDivElement[]>([])
  const fillRef = useRef<HTMLDivElement>(null)
  const dotsRef = useRef<HTMLButtonElement[]>([])
  const [isMobile, setIsMobile] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const mq = window.matchMedia("(max-width: 767px)")
    const onChange = () => setIsMobile(mq.matches)
    onChange()
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])

  useLayoutEffect(() => {
    if (isMobile || !mounted) return
    const root = rootRef.current
    if (!root) return
    const frames = framesRef.current.filter(Boolean) as HTMLDivElement[]
    if (frames.length === 0) return

    void root.offsetHeight
    frames.forEach((f, i) => {
      f.style.opacity = i === 0 ? "1" : "0"
      f.style.visibility = i === 0 ? "visible" : "hidden"
      f.style.transform = i === 0 ? "none" : "translateY(24px) scale(0.96)"
    })
  }, [isMobile, mounted])

  useEffect(() => {
    if (isMobile || !mounted) return
    const root = rootRef.current
    if (!root) return
    const frames = framesRef.current.filter(Boolean) as HTMLDivElement[]
    if (frames.length === 0) return

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches

    if (prefersReducedMotion) {
      frames.forEach((f) => {
        f.style.opacity = "1"
        f.style.visibility = "visible"
        f.style.transform = "none"
      })
      return
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: `top top+=${startOffset}`,
          end: `+=${pinSpacing}`,
          pin: true,
          scrub: 0.5,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (fillRef.current) {
              fillRef.current.style.transform = `scaleX(${self.progress})`
            }
            const idx = Math.min(
              frames.length - 1,
              Math.floor(self.progress * frames.length * 0.9999)
            )
            dotsRef.current.forEach((d, i) => {
              if (!d) return
              d.style.background = i === idx
                ? "rgba(243,156,18,1)"
                : "rgba(255,255,255,0.25)"
              d.style.transform = i === idx ? "scale(1.6)" : "scale(1)"
            })
          },
        },
      })

      const seg = 1 / frames.length
      frames.forEach((frame, i) => {
        const start = i * seg
        const end = (i + 1) * seg
        const fadeInEnd = start + seg * crossfade
        const fadeOut = end - seg * crossfade
        const fadeOutEnd = end

        if (i > 0) {
          tl.to(
            frame,
            { opacity: 1, visibility: "visible", scale: 1, y: 0, duration: fadeInEnd - start, ease: "power2.out" },
            start
          )
        }
        if (i < frames.length - 1) {
          tl.to(
            frame,
            { opacity: 0, visibility: "hidden", scale: 0.96, y: -24, duration: fadeOutEnd - fadeOut, ease: "power2.in" },
            fadeOut
          )
        }
      })
    }, root)

    return () => ctx.revert()
  }, [pinSpacing, startOffset, crossfade, isMobile, mounted])

  const childrenArr = Children.toArray(children).filter(isValidElement)

  if (!mounted) {
    return null
  }

  if (isMobile) {
    return (
      <div className="relative min-h-auto">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col w-full">
            {childrenArr.map((child, i) => (
              <div
                key={i}
                className="relative w-full py-6 min-h-0 flex items-center"
              >
                <div className="w-full">{child}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div ref={rootRef} className={className}>
      <div className={`absolute inset-0 ${innerClassName ?? ""}`}>
        <div className="relative w-full h-full">
          {childrenArr.map((child, i) => (
            <div
              key={i}
              ref={(el) => {
                if (el) framesRef.current[i] = el
              }}
              className="scrolly-frame absolute inset-0 w-full h-full flex items-center justify-center"
              style={{ opacity: i === 0 ? 1 : 0, visibility: i === 0 ? "visible" : "hidden" }}
            >
              {child}
            </div>
          ))}
        </div>
      </div>

      {showProgress && childrenArr.length > 1 && (
        <div
          className={
            "absolute left-1/2 -translate-x-1/2 z-30 " +
            (progressClassName ?? "bottom-20")
          }
          aria-hidden="true"
        >
          <div className="relative flex items-center gap-3 px-4 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
            <div className="w-24 sm:w-32 h-[2px] rounded-full bg-white/10 overflow-hidden">
              <div
                ref={fillRef}
                className="h-full bg-gradient-to-r from-sc-primary to-sc-accent origin-left"
                style={{ transform: "scaleX(0)", willChange: "transform" }}
              />
            </div>
            {childrenArr.map((_, i) => (
              <button
                key={i}
                ref={(el) => {
                  if (el) dotsRef.current[i] = el
                }}
                className="w-2 h-2 rounded-full transition-all"
                style={{
                  background: i === 0 ? "rgba(243,156,18,1)" : "rgba(255,255,255,0.25)",
                  transform: i === 0 ? "scale(1.6)" : "scale(1)",
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
