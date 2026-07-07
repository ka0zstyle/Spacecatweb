"use client"

import { useEffect, useRef } from "react"

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

export default function GlobalVideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const video = videoRef.current
    const overlay = overlayRef.current
    const wrap = wrapRef.current
    if (!video || !overlay || !wrap) return

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches

    if (prefersReducedMotion) {
      video.style.filter = "blur(20px) brightness(0.67) saturate(0.75)"
      overlay.style.backgroundColor = "rgba(0, 0, 0, 0.6)"
      return
    }

    video.style.filter = "blur(0px) brightness(1) saturate(1)"
    overlay.style.backgroundColor = "rgba(0, 0, 0, 0)"

    let currentBlur = 0
    let currentBrightness = 1
    let currentSaturation = 1
    let currentAlpha = 0
    let currentZoom = 1
    let currentRotation = 0
    const SMOOTH = 0.08

    let raf: number
    const tick = () => {
      const hero = document.getElementById("home")
      if (!hero) {
        raf = requestAnimationFrame(tick)
        return
      }

      const heroTop = hero.getBoundingClientRect().top
      const heroHeight = hero.offsetHeight
      const vh = window.innerHeight

      let progress = 0
      const scrollPastHero = -heroTop
      const transitionZone = Math.min(heroHeight * 0.5, vh * 0.5)

      if (scrollPastHero <= 0) {
        progress = 0
      } else if (scrollPastHero < transitionZone) {
        progress = scrollPastHero / transitionZone
      } else {
        progress = 1
      }

      const gameZoom = (window as any).__gameZoom ?? 1
      const gameRotation = (window as any).__gameRotation ?? 0

      const targetZoom = 1 + (gameZoom - 1)
      const targetRotation = gameRotation

      currentBlur = lerp(currentBlur, progress * 20, SMOOTH)
      currentBrightness = lerp(currentBrightness, 1 - progress * 0.33, SMOOTH)
      currentSaturation = lerp(currentSaturation, 1 - progress * 0.25, SMOOTH)
      currentAlpha = lerp(currentAlpha, progress * 0.6, SMOOTH)
      currentZoom = lerp(currentZoom, targetZoom, 0.03)
      currentRotation = lerp(currentRotation, targetRotation, 0.02)

      video.style.filter = `blur(${currentBlur.toFixed(2)}px) brightness(${currentBrightness.toFixed(3)}) saturate(${currentSaturation.toFixed(3)})`
      overlay.style.backgroundColor = `rgba(0, 0, 0, ${currentAlpha.toFixed(3)})`
      wrap.style.transform = `scale(${currentZoom.toFixed(3)}) rotate(${currentRotation.toFixed(3)}deg)`
      wrap.style.transformOrigin = "center center"

      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className="fixed inset-0 w-full h-full pointer-events-none overflow-hidden"
      style={{ zIndex: 0, willChange: "transform" }}
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ transform: "scale(1.15)" }}
      >
        <source src="/assets/images/space.mp4" type="video/mp4" />
      </video>

      <div
        ref={overlayRef}
        className="absolute inset-0 w-full h-full"
      />
    </div>
  )
}
